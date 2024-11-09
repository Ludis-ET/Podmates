import { Message, User, ParseMode } from "node-telegram-bot-api";
import { bot } from "./bot";
import {
  addNewUser,
  checkUserExists,
  getPodcasters,
  getUserData,
} from "./utils";

interface BotUser extends User {
  phone_number: string;
}

export const handleStartCommand = async (msg: Message) => {
  const userId = msg.from?.id;
  const username = msg.from?.username;

  if (userId && username) {
    const welcomeMessage = `Welcome, ${username}! 🎉

**I’m here to help you discover the best Ethiopian Tech Community podcasts** 🎙️, where you'll get insights on tech, startups, and everything in between! 🇪🇹

**Let’s get started** 🚀 and explore the latest in Ethiopian tech podcasts. I’m excited to help you manage your profile and connect with the community! 👩‍💻👨‍💻

Tap below to begin your journey!`;

    const keyboard = {
      inline_keyboard: [
        [{ text: "🎧 Get Started", callback_data: "get_started" }],
      ],
    };

    await bot.sendPhoto(
      userId,
      "https://images.pexels.com/photos/270288/pexels-photo-270288.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      {
        caption: welcomeMessage,
        reply_markup: keyboard,
      }
    );
  }
};


export const handleCallbackQuery = async (query: any) => {
  const userId = query.from.id;
  const chatId = query.message?.chat.id;
  const action = query.data;
  const messageId = query.message?.message_id;

  if (chatId && messageId) {
    if (action === "get_started") {
      const userExists = await checkUserExists(userId);

      if (!userExists) {
        const message = `We need your phone number to complete your registration.`;
        const keyboard = {
          keyboard: [[{ text: "Share Phone Number", request_contact: true }]],
          one_time_keyboard: true,
          resize_keyboard: true,
        };
        await bot.sendMessage(userId, message, { reply_markup: keyboard });
      } else {
        const userData = await getUserData(userId);
        if (userData?.phone_number) {
          await bot.sendMessage(
            userId,
            `Welcome back! Your phone number is already registered.`
          );
          await main(userId, userData as BotUser);
        } else {
          const message = `We noticed you haven't shared your phone number yet. Please do so to complete your registration.`;
          const keyboard = {
            keyboard: [[{ text: "Share Phone Number", request_contact: true }]],
            one_time_keyboard: true,
            resize_keyboard: true,
          };
          await bot.sendMessage(userId, message, { reply_markup: keyboard });
        }
      }
    }

    await bot.deleteMessage(chatId, messageId);
    bot.answerCallbackQuery(query.id);
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
    await main(userId, userData as BotUser);
  }
};

export const main = async (chatId: number, userData: BotUser) => {
  const welcomeMessage = "heyyy";
  const keyboard = userData?.phone_number
    ? undefined
    : {
        inline_keyboard: [
          [{ text: "🎙️ Set Your Podcast", callback_data: "set_podcast" }],
          [{ text: "👀 View Podcasters", callback_data: "view_podcasters" }],
        ],
      };

  const message = await bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: "MarkdownV2" as ParseMode,
    reply_markup: keyboard,
  });
  return message;
};
