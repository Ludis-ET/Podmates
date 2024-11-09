import { bot } from "../bot";

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

  switch (action) {
    default:
      await handleInvalidAction();
      break;
  }

  if (messageId) {
    await bot.deleteMessage(chatId, messageId);
  }

  bot.answerCallbackQuery(query.id);
};
