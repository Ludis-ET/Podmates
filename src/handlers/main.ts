import { bot } from "../bot";
import { clearChatHistory, getUserData } from "../utils";
import { BotUser } from "./welcome";


export const handleBackHome = async (userId: number) => {
  const userData = await getUserData(userId);
  if (userData) {
    await main(userId, userData as BotUser, []);
  }
};

export const main = async (
  chatId: number,
  userData: BotUser,
  messagesToDelete: number[]
) => {
  try {
    await clearChatHistory(chatId, messagesToDelete);

    const welcomeMessage = `Heyyy ${userData?.username}! 🖐🏽

I’m here to help you discover the best Ethiopian tech podcasts 🎙️. Get ready to explore, rate, and listen to amazing episodes from inspiring creators! 🚀🇪🇹

What’s next?
- Discover new podcasts 🎧
- Rate your favorite podcasts ⭐
- Listen to previous episodes 🔄`;

    const keyboard = {
      inline_keyboard: [
        [{ text: "🎙️ Share a Podcast", callback_data: "share_podcast" }],
        [{ text: "🎧 Discover Podcasts", callback_data: "discover_podcasts" }],
      ],
    };

    const newMessage = await bot.sendPhoto(
      chatId,
      "https://images.pexels.com/photos/7586662/pexels-photo-7586662.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      {
        caption: welcomeMessage,
        reply_markup: keyboard,
      }
    );

    return newMessage;
  } catch (error) {
    console.error("Error clearing chat history or sending message:", error);
  }
};
