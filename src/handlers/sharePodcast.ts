import { bot } from "../bot";
import { db, storage } from "../firebase";
import { getUserPodcasts } from "../utils";

export const storePodcastInfo = async (userId: number, podcastData: any) => {
  await db
    .collection("podcasts")
    .add({ userId, ...podcastData, createdAt: new Date() });
};

export const uploadLogoToCloudinary = async (photoFileId: string) => {
  const fileLink = await bot.getFileLink(photoFileId);
  const response = await fetch(fileLink);
  const buffer = await response.arrayBuffer();

  return new Promise((resolve, reject) => {
    storage.uploader
      .upload_stream({ folder: "podcast_logos" }, (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url);
      })
      .end(Buffer.from(buffer));
  });
};

export const sharePodcasts = async (userId: number) => {
  const userPodcasts = await getUserPodcasts(userId);

  const homeButton = {
    text: "🏠 Home",
    callback_data: "home",
  };

  if (userPodcasts.length > 0) {
    const buttons = userPodcasts.map(({ name, id }) => ({
      text: name,
      callback_data: `manage_podcast_${id}`,
    }));
    buttons.push(homeButton);

    await bot.sendMessage(userId, "Select a podcast to manage:", {
      reply_markup: { inline_keyboard: [buttons] },
    });
  } else {
    await bot.sendMessage(
      userId,
      "Let’s get started! Provide details for your new podcast:",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎙️ Share Podcast Info",
                callback_data: "share_podcast_info",
              },
            ],
            [homeButton],
          ],
        },
      }
    );
  }
};

const askUser = (userId: number, message: string, type = "text") => {
  return new Promise<string>((resolve) => {
    bot.sendMessage(userId, message);

    const handleResponse = (msg: any) => {
      if (msg.from.id === userId) {
        if (type === "photo" && msg.photo) {
          bot.removeListener("message", handleResponse);
          resolve(msg.photo[msg.photo.length - 1].file_id);
        } else if (type === "text" && msg.text) {
          bot.removeListener("message", handleResponse);
          resolve(msg.text);
        }
      }
    };

    bot.on("message", handleResponse);
  });
};


export const requestPodcastInfo = async (userId: number, roomId?: string) => {
  const steps = [
    {
      message: "Please enter the name of your podcast:",
      key: "name",
      validate: (input: string) => input.trim() !== "",
    },
    {
      message: "Please upload your podcast logo (image).",
      key: "logo",
      type: "photo",
    },
    {
      message: "Provide a brief description of your podcast:",
      key: "description",
      validate: (input: string) => input.trim().length > 10,
    },
    {
      message: "Specify the genre (e.g., Tech, Business):",
      key: "genre",
      validate: (input: string) => input.trim() !== "",
    },
    {
      message: "How many episodes are there in each season?",
      key: "episodesPerSeason",
      validate: (input: string) => !isNaN(Number(input)) && Number(input) > 0,
    },
  ];

  // Fetch existing podcast data if editing an existing podcast
  let podcastData: any = {};
  if (roomId) {
    const podcastDoc = await db.collection("podcasts").doc(roomId).get();
    const data = podcastDoc.data();
    if (!data) {
      await bot.sendMessage(userId, "Podcast not found.");
      return;
    }
    podcastData = data; // Store the current podcast data to compare and update

    const podcastInfoMessage = `Here is the current information for your podcast:
      Name: ${data.name}
      Description: ${data.description}
      Genre: ${data.genre}
      Episodes per Season: ${data.episodesPerSeason}`;

    await bot.sendPhoto(userId, data.logo);
    await bot.sendMessage(userId, podcastInfoMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Edit Podcast", callback_data: "edit_podcast" },
            { text: "Delete Podcast", callback_data: "delete_podcast" },
            { text: "Home", callback_data: "home" },
          ],
        ],
      },
    });
    return;
  }

  // Collecting podcast info if it's a new podcast
  for (const step of steps) {
    let userResponse;
    const skipButton = {
      text: "Skip (Don't Change)",
      callback_data: `skip_${step.key}`,
    };
    const cancelButton = {
      text: "Cancel",
      callback_data: "cancel_edit",
    };

    do {
      const keyboard = {
        inline_keyboard: [
          [{ text: "Skip (Don't Change)", callback_data: `skip_${step.key}` }],
          [{ text: "Cancel", callback_data: "cancel_edit" }],
        ],
      };

      userResponse = await askUser(userId, step.message, step.type);

      if (userResponse === "cancel_edit") {
        // Cancel the operation, discard changes
        await bot.sendMessage(
          userId,
          "Operation canceled. No changes were made."
        );
        return;
      }

      if (step.validate && !step.validate(userResponse as string)) {
        await bot.sendMessage(userId, "Invalid input. Please try again.");
        userResponse = null;
      } else if (userResponse !== "skip") {
        // Save the valid input only if it's not a skip
        podcastData[step.key] =
          step.type === "photo"
            ? await uploadLogoToCloudinary(userResponse as string)
            : userResponse;
      }

      await bot.sendMessage(userId, "Press 'Skip' to keep the current value.", {
        reply_markup: keyboard,
      });
    } while (!userResponse);
  }

  // If editing an existing podcast, update only the changed fields
  if (roomId) {
    await db.collection("podcasts").doc(roomId).update(podcastData);
    await bot.sendMessage(
      userId,
      "Your podcast has been updated successfully!"
    );
  } else {
    // If adding a new podcast, store the data in Firestore
    await storePodcastInfo(userId, podcastData);
    await bot.sendMessage(
      userId,
      "Your podcast has been successfully shared! Thank you!"
    );
  }

  await sharePodcasts(userId);
};
