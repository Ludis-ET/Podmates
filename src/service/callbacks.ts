import { bot } from "../bot";
import { handleGetStarted, handleBackHome, sharePodcasts } from "../handlers";
import { clearChatHistory } from "../utils";

export const CALLBACK_ACTIONS = {
  GET_STARTED: "get_started",
  SHARE_PODCAST: "share_podcast",
  DISCOVER_PODCASTS: "discover_podcasts",
  HOME: "home",
  MANAGE_PODCAST: "manage_podcast",
  SHARE_PODCAST_INFO: "share_podcast_info",
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
  const messagesToDelete: number[] = [];

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

    default:
      await handleInvalidAction();
      break;
  }

  if (messageId) {
    await bot.deleteMessage(chatId, messageId);
  }

  bot.answerCallbackQuery(query.id);
};
