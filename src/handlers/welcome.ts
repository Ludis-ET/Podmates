import { User } from "node-telegram-bot-api";
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
