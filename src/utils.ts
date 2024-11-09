import { bot } from "./bot";
import { db } from "./firebase";


interface SentMessage {
  chatId: number;
  messageId: number;
}

let sentMessages: SentMessage[] = [];

export const storeSentMessage = (chatId: number, messageId: number) => {
  sentMessages.push({ chatId, messageId });
};

export const getChatHistory = (chatId: number): SentMessage[] => {
  return sentMessages.filter((msg) => msg.chatId === chatId);
};

export const clearChatHistory = async (chatId: number) => {
  const history = getChatHistory(chatId);
  for (const msg of history) {
    try {
      await bot.deleteMessage(chatId, msg.messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }
  sentMessages = sentMessages.filter((msg) => msg.chatId !== chatId);
};


export const addNewUser = async (
  userId: number,
  username: string,
  phoneNumber: string
) => {
  await db.collection("users").doc(String(userId)).set({
    username,
    phone_number: phoneNumber,
  });
};


export const checkUserExists = async (userId: number) => {
  const userDoc = await db.collection("users").doc(String(userId)).get();
  return userDoc.exists;
};


export const getUserData = async (userId: number) => {
  const userDoc = await db.collection("users").doc(String(userId)).get();
  return userDoc.data();
};


export const getPodcasters = async () => {
  const podcastersSnapshot = await db.collection("podcasters").get();
  return podcastersSnapshot.docs.map((doc) => doc.data());
};
