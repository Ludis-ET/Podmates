import { bot } from "./bot";
import { db } from "./firebase";
import {
  getUserPodcasts,
  storePodcastInfo,
  deletePodcastInfo,
  uploadLogoToCloudinary,
  requestPodcastInfo,
} from "./podcast";

export const managePodcast = async (query: any) => {
  const userId = query.from.id;
  const podcastName = query.data.split("_")[1];
  const userPodcasts = await getUserPodcasts(userId);
  const podcast = userPodcasts.find(({ name }) => name === podcastName);

  if (podcast) {
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "✏️ Edit Podcast",
            callback_data: `edit_podcast_${podcastName}`,
          },
        ],
        [
          {
            text: "🗑️ Delete Podcast",
            callback_data: `delete_podcast_${podcastName}`,
          },
        ],
      ],
    };

    await bot.sendMessage(userId, `Managing the podcast: ${podcast.name}`, {
      reply_markup: keyboard,
    });
  }
};

export const handlePodcastManagementAction = async (query: any) => {
  const userId = query.from.id;
  const action = query.data.split("_")[0];
  const podcastName = query.data.split("_")[1];

  if (action === "edit") {
    await handleEditPodcast(userId, podcastName);
  } else if (action === "delete") {
    await handleDeletePodcast(userId, podcastName);
  }
};

const handleEditPodcast = async (userId: number, podcastName: string) => {
  const userPodcasts = await getUserPodcasts(userId);
  const podcast = userPodcasts.find(({ name }) => name === podcastName);

  if (podcast) {
    await bot.sendMessage(
      userId,
      `You are about to edit the podcast: ${podcast.name}`
    );
    await requestPodcastInfo(userId, podcast.id);
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

const handleDeletePodcast = async (userId: number, podcastName: string) => {
  const userPodcasts = await getUserPodcasts(userId);
  const podcast = userPodcasts.find(({ name }) => name === podcastName);

  if (podcast) {
    const podcastDoc = await db.collection("podcasts").doc(podcast.id).get();
    const podcastData = podcastDoc.data();

    if (podcastData) {
      await deletePodcastInfo(podcast.id, podcastData.logo);
      await bot.sendMessage(
        userId,
        `The podcast "${podcast.name}" has been deleted successfully.`
      );
    } else {
      await bot.sendMessage(
        userId,
        `Error: Podcast "${podcast.name}" not found in Firestore.`
      );
    }
  } else {
    await bot.sendMessage(
      userId,
      `Error: Podcast "${podcastName}" not found in your list.`
    );
  }
};

bot.on("callback_query", handlePodcastManagementAction);
