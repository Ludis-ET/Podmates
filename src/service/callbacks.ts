import { bot } from "../bot";
import { db } from "../firebase";
import {
  handleGetStarted,
  handleBackHome,
  sharePodcasts,
  requestPodcastInfo,
} from "../handlers";
import { clearChatHistory } from "../utils";

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
  const roomId = query.message?.text?.match(/roomId:\s*(\S+)/)?.[1];

  if (!chatId) return;
  const handleInvalidAction = async () => {
    await bot.sendMessage(userId, "Invalid action! Please try again.");
  };
  const messagesToDelete: number[] = [];

  if (action.startsWith("manage_podcast_")) {
    const podcastId = action.slice(15); 
    console.log(podcastId);
    await requestPodcastInfo(userId, podcastId);
  } else if (action.startsWith("skip_") && action.slice(5)){
    return
  }
  
  else {
    switch (action) {
      case CALLBACK_ACTIONS.GET_STARTED:
        await clearChatHistory(chatId, messagesToDelete);
        await handleGetStarted(userId, messagesToDelete);
        break;

      case CALLBACK_ACTIONS.HOME:
        await clearChatHistory(chatId, messagesToDelete);
        await handleBackHome(userId);
        break;

      case CALLBACK_ACTIONS.SHARE_PODCAST:
        await clearChatHistory(chatId, messagesToDelete);
        await sharePodcasts(userId);
        break;

      case CALLBACK_ACTIONS.EDIT_PODCAST:
        await requestPodcastInfo(userId, roomId);
        break;

      case CALLBACK_ACTIONS.DELETE_PODCAST:
        await db.collection("podcasts").doc(roomId).delete();
        await bot.sendMessage(userId, "Your podcast has been deleted.");
        break;

      default:
        await handleInvalidAction();
        break;
    }
  }

  if (messageId) {
    await bot.deleteMessage(chatId, messageId);
  }

  bot.answerCallbackQuery(query.id);
};

