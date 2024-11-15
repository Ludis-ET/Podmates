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
  const homeButton = { text: "🏠 Home", callback_data: "home" };

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

export const addPodcast = async (userId: number) => {
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

  let podcastData: any = {};
  for (const step of steps) {
    let userResponse;
    do {
      userResponse = await askUser(userId, step.message, step.type);

      if (step.validate && !step.validate(userResponse)) {
        await bot.sendMessage(userId, "Invalid input. Please try again.");
        userResponse = null;
      }
    } while (!userResponse);

    podcastData[step.key] =
      step.type === "photo"
        ? await uploadLogoToCloudinary(userResponse)
        : userResponse;
  }

  await storePodcastInfo(userId, podcastData);
  await bot.sendMessage(
    userId,
    "Your podcast has been successfully shared! Thank you!"
  );
  await sharePodcasts(userId);
};

export const editPodcast = async (userId: number, roomId: string) => {
  const podcastDoc = await db.collection("podcasts").doc(roomId).get();
  const data = podcastDoc.data();
  if (!data) {
    await bot.sendMessage(userId, "Podcast not found.");
    return;
  }

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

  for (const step of steps) {
    let isSkipped = false;

    await bot.sendMessage(
      userId,
      `Current value: ${data[step.key] ?? "Not set"}. You can skip this step.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Skip", callback_data: `skip_${step.key}` }],
          ],
        },
      }
    );

    const callbackResponse = await new Promise<void>((resolve) => {
      const callbackHandler = (query: any) => {
        if (query.data === `skip_${step.key}` && query.from.id === userId) {
          isSkipped = true;
          bot.removeListener("callback_query", callbackHandler);
          bot.answerCallbackQuery(query.id, { text: "Skipped!" });
          resolve();
        }
      };

      bot.on("callback_query", callbackHandler);
    });

    if (isSkipped) continue;

    let userResponse;
    do {
      userResponse = await askUser(userId, step.message, step.type);

      if (step.validate && userResponse && !step.validate(userResponse)) {
        await bot.sendMessage(userId, "Invalid input. Please try again.");
        userResponse = null;
      }
    } while (!isSkipped && !userResponse);

    data[step.key] =
      step.type === "photo"
        ? await uploadLogoToCloudinary(userResponse as string)
        : userResponse;
  }

  await db.collection("podcasts").doc(roomId).update(data);
  await bot.sendMessage(userId, "Podcast updated successfully!");
  await sharePodcasts(userId);
};

export const deletePodcast = async (userId: number, roomId: string) => {
  await db.collection("podcasts").doc(roomId).delete();
  await bot.sendMessage(userId, "Podcast deleted successfully!");
  await sharePodcasts(userId);
};
