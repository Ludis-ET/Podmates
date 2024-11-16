import { bot } from "../bot";
import { db } from "../firebase";
import {
  handleGetStarted,
  handleBackHome,
  sharePodcasts,
  addPodcast,
} from "../handlers";
import { clearChatHistory, getUserPodcasts } from "../utils";

export const CALLBACK_ACTIONS = {
  GET_STARTED: "get_started",
  SHARE_PODCAST: "share_podcast",
  DISCOVER_PODCASTS: "discover_podcasts",
  HOME: "home",
  MANAGE_PODCAST: "manage_podcast",
  SHARE_PODCAST_INFO: "share_podcast_info",
  EDIT_PODCAST: "edit_podcast",
  DELETE_PODCAST: "delete_podcast",
};

export const handleCallbackQuery = async (query: any) => {
  const userId = query.from.id;
  const action = query.data;
  const chatId = query.message?.chat.id;
  const messageId = query.message?.message_id;

  if (!chatId) return;

  const handleInvalidAction = async () => {
    await bot.sendMessage(userId, "Invalid action! Please try again.");
  };

  try {
    switch (true) {
      case action.startsWith("view_"): {
        const podcastId = action.slice(5);
        await handleViewPodcast(userId, podcastId);
        break;
      }

      case action === CALLBACK_ACTIONS.GET_STARTED: {
        await clearChatHistory(chatId, []);
        await handleGetStarted(userId, []);
        break;
      }

      case action === CALLBACK_ACTIONS.HOME: {
        await clearChatHistory(chatId, []);
        await handleBackHome(userId);
        break;
      }

      case action === CALLBACK_ACTIONS.SHARE_PODCAST: {
        await sharePodcasts(userId);
        break;
      }

      case action === CALLBACK_ACTIONS.EDIT_PODCAST: {
        await addPodcast(userId);
        break;
      }

      case action === CALLBACK_ACTIONS.DELETE_PODCAST: {
        const roomId = query.message?.text?.match(/roomId:\s*(\S+)/)?.[1];
        if (roomId) {
          await db.collection("podcasts").doc(roomId).delete();
          await bot.sendMessage(userId, "Your podcast has been deleted.");
        } else {
          await bot.sendMessage(userId, "Podcast not found. Please try again.");
        }
        break;
      }

      default: {
        await handleInvalidAction();
      }
    }

    if (messageId) {
      await bot.deleteMessage(chatId, messageId).catch((err) => {
        console.error(
          "Failed to delete message:",
          err.response?.body?.description
        );
      });
    }

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("Error handling callback query:", error);
    await bot.sendMessage(
      userId,
      "An error occurred while processing your request."
    );
  }
};

const handleViewPodcast = async (userId: number, podcastId: string) => {
  const userPodcasts = await getUserPodcasts(userId);
  const selectedPodcast = userPodcasts.find((p) => p.id === podcastId);

  if (selectedPodcast) {
    await bot.sendPhoto(userId, selectedPodcast.logo, {
      caption: `🎙️ ${selectedPodcast.name}\n\n📝 ${selectedPodcast.description}\n📚 Genre: ${selectedPodcast.genre}\n🔢 Episodes/Season: ${selectedPodcast.episodesPerSeason}`,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✏️ Edit", callback_data: `edit_${selectedPodcast.id}` },
            {
              text: "🗑️ Delete",
              callback_data: `delete_${selectedPodcast.id}`,
            },
          ],
          [{ text: "🏠 Home", callback_data: CALLBACK_ACTIONS.HOME }],
        ],
      },
    });
  } else {
    await bot.sendMessage(userId, "Podcast not found. Please try again.");
  }
};
