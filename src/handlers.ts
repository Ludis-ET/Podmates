import { Message, User, ParseMode } from "node-telegram-bot-api";
import { bot } from "./bot";
import {
  addNewUser,
  checkUserExists,
  getPodcasters,
  getUserData,
} from "./utils";

export const handleStartCommand = async (msg: Message) => {
  const userId = msg.from?.id;
  const username = msg.from?.username;

  if (userId && username) {
    const userExists = await checkUserExists(userId);

    if (!userExists) {
      const quote = `"Success is not the key to happiness. Happiness is the key to success." - Albert Schweitzer`;
      const welcomeMessage = `Welcome, ${username}!\n\n${quote}`;
      const keyboard = {
        keyboard: [[{ text: "Share Phone Number", request_contact: true }]],
        one_time_keyboard: true,
        resize_keyboard: true,
      };
      await bot.sendPhoto(
        userId,
        "https://images.pexels.com/photos/270288/pexels-photo-270288.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        {
          caption: welcomeMessage,
          reply_markup: keyboard,
        }
      );
    } else {
      const userData = await getUserData(userId);
      if (userData?.phone_number) {
        await bot.sendMessage(
          userId,
          `Welcome back, ${username}! Your phone number is already registered.`
        );
        await main(userId, userData as User);
      } else {
        const message = `Welcome back, ${username}!\n\nWe noticed you haven't shared your phone number yet. Please do so to complete your registration.`;
        const keyboard = {
          keyboard: [[{ text: "Share Phone Number", request_contact: true }]],
          one_time_keyboard: true,
          resize_keyboard: true,
        };
        await bot.sendMessage(userId, message, { reply_markup: keyboard });
      }
    }
  }
};

export const handleContact = async (msg: any) => {
  const userId = msg.from?.id;
  const phoneNumber = msg.contact?.phone_number;
  const username = msg.from?.username;

  if (userId && phoneNumber && username) {
    await addNewUser(userId, username, phoneNumber);
    await bot.sendMessage(
      userId,
      "Thank you for sharing your phone number! You are now successfully registered."
    );
    const userData = await getUserData(userId);
    await main(userId, userData as User);
  }
};

export const main = async (chatId: number, userData: User) => {
  const welcomeMessage = "heyyy";
  const message = await bot.sendPhoto(
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
  return message.message_id;
};

export const handleCallbackQuery = async (query: any) => {
  const userId = query.from.id;
  const chatId = query.message?.chat.id;
  const action = query.data;

  if (chatId) {
    // Delete the current message before sending the new one
    await bot.deleteMessage(chatId, query.message?.message_id!);

    // Send a new message based on the action clicked
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
    }

    bot.answerCallbackQuery(query.id);
  }
};
