import { Message, User } from "node-telegram-bot-api";
import { bot } from "./bot";
import {
  addNewUser,
  checkUserExists,
  getUserData,
  clearChatHistory,
  storeSentMessage,
} from "./utils";

interface BotUser extends User {
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

export const handleCallbackQuery = async (query: any) => {
  const userId = query.from.id;
  const chatId = query.message?.chat.id;
  const action = query.data;
  const messageId = query.message?.message_id;

  if (chatId) {
    const messagesToDelete: number[] = [];

    if (action === "get_started") {
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
    const m = await bot.sendMessage(
      userId,
      "Thank you for sharing your phone number! You are now successfully registered."
    );
    const userData = await getUserData(userId);
    await main(userId, userData as BotUser, [m.message_id, msg.message_id]);
  }
};

export const main = async (
  chatId: number,
  userData: BotUser,
  messagesToDelete: number[]
) => {
  try {
    await clearChatHistory(chatId, messagesToDelete);

    const welcomeMessage = `Welcome to the Ethiopian Tech Community! 🎉

I'm here to help you discover the best Ethiopian tech podcasts 🎙️. Get ready to explore, rate, and listen to amazing episodes from inspiring creators! 🚀🇪🇹

What’s next?
- Discover new podcasts 🎧
- Rate your favorite podcasts ⭐
- Listen to previous episodes 🔄`;

    const keyboard = undefined;

    const newMessage = await bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: keyboard,
    });
    return newMessage;
  } catch (error) {
    console.error("Error clearing chat history or sending message:", error);
  }
};
