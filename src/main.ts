import { bot } from "./bot";
import { getPodcasters, getUserData } from "./utils";
import { ParseMode, User } from "node-telegram-bot-api";

// Main function to display the welcome message
export const main = async (chatId: number, userData: User) => {
  const welcomeMessage = "heyyy";
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

// Callback query handler
export const handleCallbackQuery = async (query: any) => {
  const userId = query.from.id;
  const chatId = query.message?.chat.id;
  const action = query.data;

  if (chatId) {
    await bot.sendMessage(chatId, "⏳ Please wait... fetching data...");
  }

  if (action === "set_podcast") {
    const userData = await getUserData(userId);
    if (userData && chatId) {
      await bot.sendMessage(
        chatId,
        `🔧 Now, let's set up your podcast, ${query.from.username}!`
      );
    }
  }

  if (action === "view_podcasters") {
    const podcasters = await getPodcasters();
    if (podcasters && podcasters.length > 0 && chatId) {
      const podcasterNames = podcasters.map((p: any) => p.username).join("\n");
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
  }

  bot.answerCallbackQuery(query.id);
};
