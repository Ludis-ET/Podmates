import { Message, User } from "node-telegram-bot-api";
import { bot } from "../bot";
import {
  addNewUser,
  checkUserExists,
  getUserData,
  clearChatHistory,
} from "../utils";
import { main } from "./main";

export interface BotUser extends User {
  phone_number: string;
}

export const generateWelcomeMessage = (username: string) => {
  return `Hey ${username}! 🎉

Welcome to the Ethiopian Tech Community! 🎙️

I'm here to help you discover the best tech podcasts, listen to previous episodes, and explore the latest ones. 🚀🇪🇹

What’s next?
- Discover new podcasts 🎧
- Rate your favorite podcasts ⭐
- Listen to previous episodes 🔄

Tap below to get started!`;
};

export const handleStartCommand = async (msg: Message) => {
  const userId = msg.from?.id;
  const username = msg.from?.username;

  if (userId && username) {
    const welcomeMessage = generateWelcomeMessage(username);

    const keyboard = {
      inline_keyboard: [
        [{ text: "🎧 Get Started", callback_data: "get_started" }],
      ],
    };

    try {
      await bot.sendPhoto(
        userId,
        "https://images.pexels.com/photos/270288/pexels-photo-270288.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        {
          caption: welcomeMessage,
          reply_markup: keyboard,
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
};

export const handleGetStarted = async (
  userId: number,
  messagesToDelete: number[]
) => {
  const userExists = await checkUserExists(userId);

  if (!userExists) {
    const message = `We need your phone number to complete your registration.`;
    const keyboard = {
      keyboard: [[{ text: "Share Phone Number", request_contact: true }]],
      one_time_keyboard: true,
      resize_keyboard: true,
    };
    const sentMessage = await bot.sendMessage(userId, message, {
      reply_markup: keyboard,
    });
    messagesToDelete.push(sentMessage.message_id);
  } else {
    const userData = await getUserData(userId);
    if (userData?.phone_number) {
      await bot.sendMessage(
        userId,
        "Thank you! You are now successfully registered.",
        {
          reply_markup: { remove_keyboard: true },
        }
      );

      await main(userId, userData as BotUser, messagesToDelete);
    } else {
      const message = `We noticed you haven't shared your phone number yet. Please do so to complete your registration.`;
      const keyboard = {
        keyboard: [[{ text: "Share Phone Number", request_contact: true }]],
        one_time_keyboard: true,
        resize_keyboard: true,
      };
      const sentMessage = await bot.sendMessage(userId, message, {
        reply_markup: keyboard,
      });
      messagesToDelete.push(sentMessage.message_id);
    }
  }
};


export const handleContact = async (msg: any) => {
  const userId = msg.from?.id;
  const phoneNumber = msg.contact?.phone_number;
  const username = msg.from?.username;

  if (userId && phoneNumber && username) {
    await addNewUser(userId, username, phoneNumber);
    const m = await bot.sendMessage(
      userId,
      "Thank you for sharing your phone number! You are now successfully registered."
    );
    const userData = await getUserData(userId);
    await main(userId, userData as BotUser, [m.message_id, msg.message_id]);
  }
};
