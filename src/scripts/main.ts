import TelegramBot, { ParseMode, User } from "node-telegram-bot-api";
import { getPodcasters, getUserData } from "../utils";
import { bot } from "../bot";

/**
 * Main function to display the welcome message and options for a returning user.
 * Allows users to set up their podcast, view other podcasters, track stats, or go live.
 */
export const main = async (chatId: number, userData: User) => {
  const welcomeMessage = `
    *Welcome back, ${userData.username}\\!* 🙌

    _Here are the exciting things you can do:_
    
    - 🗓️ Set up your podcast
    - 🎙️ View other podcasters and collaborate
    - 📈 Track your podcast stats
    - 🚀 Go live and interact with your audience\\!

    Choose an option to get started\\! 🔥
`;

  await bot.sendPhoto(
    chatId,
    "https://images.pexels.com/photos/1054713/pexels-photo-1054713.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    {
      caption: welcomeMessage,
      parse_mode: "MarkdownV2" as ParseMode,
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎙️ Set Your Podcast", callback_data: "set_podcast" }],
          [{ text: "👀 View Podcasters", callback_data: "view_podcasters" }],
        ],
      },
    }
  );
};

/**
 * Handles callback queries for bot actions such as setting up a podcast or viewing podcasters.
 * Provides feedback messages and manages the data-fetching processes for each action.
 */
bot.on("callback_query", async (query) => {
  const userId = query.from.id;
  const chatId = query.message?.chat.id;
  const action = query.data;

  // Send loading message to indicate data fetching process
  if (chatId) {
    await bot.sendMessage(chatId, "⏳ Please wait... fetching data...");
  }

  if (action === "set_podcast") {
    setTimeout(async () => {
      const userData = await getUserData(userId);

      if (userData && chatId) {
        await bot.sendMessage(
          chatId,
          `🔧 Now, let's set up your podcast, ${query.from.username}!`
        );
      } else if (chatId) {
        await bot.sendMessage(
          chatId,
          "❌ Oops! Something went wrong while fetching your data."
        );
      }
    }, 2000);
  }

  if (action === "view_podcasters") {
    setTimeout(async () => {
      const podcasters = await getPodcasters();

      if (podcasters && podcasters.length > 0 && chatId) {
        const podcasterNames = podcasters
          .map((p: any) => p.username)
          .join("\n");
        await bot.sendMessage(
          chatId,
          `Here are some podcasters you can check out: \n${podcasterNames}`
        );
      } else if (chatId) {
        await bot.sendMessage(
          chatId,
          "❌ No podcasters found. Please try again later."
        );
      }
    }, 2000);
  }

  // Acknowledge the callback query
  bot.answerCallbackQuery(query.id);
});
