import { User } from "node-telegram-bot-api";
import { bot } from "../bot";
import { addNewUser, checkUserExists, getUserData, clearChatHistory } from "../utils";
import { sharePodcasts } from "../podcast";

interface BotUser extends User {
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

export const handleSharePodcast = async (userId: number) => {
  sharePodcasts(userId);
};

export const handleDiscoverPodcasts = async (userId: number) => {
  // Add logic for discovering podcasts (if applicable)
};

export const handleBackHome = async (userId: number) => {
  const userData = await getUserData(userId);
  if (userData) {
    await main(userId, userData as BotUser, []);
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

    const welcomeMessage = `Heyyy ${userData?.first_name}! 🖐🏽

I’m here to help you discover the best Ethiopian tech podcasts 🎙️. Get ready to explore, rate, and listen to amazing episodes from inspiring creators! 🚀🇪🇹

What’s next?
- Discover new podcasts 🎧
- Rate your favorite podcasts ⭐
- Listen to previous episodes 🔄`;

    const keyboard = {
      inline_keyboard: [
        [{ text: "🎙️ Share a Podcast", callback_data: "share_podcast" }],
        [{ text: "🎧 Discover Podcasts", callback_data: "discover_podcasts" }],
        [{ text: "🏠 Back to Home", callback_data: "back_home" }],
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