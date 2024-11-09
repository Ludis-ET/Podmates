import { bot } from "./bot";
import { db, storage } from "./firebase";

export const getUserPodcasts = async (userId: number) => {
  const snapshot = await db
    .collection("podcasts")
    .where("userId", "==", userId)
    .get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    ...doc.data(),
  }));
};

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

  const podcastData: any = {};
  for (const step of steps) {
    let userResponse;
    do {
      userResponse = await askUser(userId, step.message, step.type);
      if (step.validate && !step.validate(userResponse as string)) {
        await bot.sendMessage(userId, "Invalid input. Please try again.");
        userResponse = null;
      }
    } while (!userResponse);

    podcastData[step.key] =
      step.type === "photo"
        ? await uploadLogoToCloudinary(userResponse as string)
        : userResponse;
  }

  if (roomId) {
    await db.collection("podcasts").doc(roomId).update(podcastData);
    await bot.sendMessage(
      userId,
      "Your podcast has been updated successfully!"
    );
  } else {
    await storePodcastInfo(userId, podcastData);
    await bot.sendMessage(
      userId,
      "Your podcast has been successfully shared! Thank you!"
    );
  }

  await sharePodcasts(userId);
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

export const sharePodcasts = async (userId: number) => {
  const userPodcasts = await getUserPodcasts(userId);

  if (userPodcasts.length > 0) {
    const buttons = userPodcasts.map(({ name }) => ({
      text: name,
      callback_data: `manage_podcast_${name}`,
    }));
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
          ],
        },
      }
    );
  }
};

export const handlePodcastInfoCallback = async (query: any) => {
  if (query.data === "share_podcast_info") {
    await requestPodcastInfo(query.from.id);
  }
};

bot.on("callback_query", handlePodcastInfoCallback);

export const managePodcast = async (query: any) => {
  const userId = query.from.id;
  const podcastName = query.data.split("_")[1];
  const userPodcasts = await getUserPodcasts(userId);
  const podcast = userPodcasts.find(({ name }) => name === podcastName);

  if (podcast) {
    await bot.sendMessage(userId, `Managing the podcast: ${podcast.name}`);
  }
};

export const deletePodcastInfo = async (podcastId: string, logoUrl: string) => {
  try {
    const publicId = logoUrl.split("/").pop()?.split(".")[0];

    await db.collection("podcasts").doc(podcastId).delete();
    console.log(
      `Podcast with ID ${podcastId} deleted successfully from Firestore.`
    );

    if (publicId) {
      await storage.uploader.destroy(publicId);
      console.log(
        `Podcast logo with ID ${publicId} deleted successfully from Cloudinary.`
      );
    }
  } catch (error) {
    console.error("Error deleting podcast:", error);
  }
};
