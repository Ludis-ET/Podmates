import { bot } from "./bot";
import { db } from "./firebase";

interface SentMessage {
  chatId: number;
  messageId: number;
}

let sentMessages: SentMessage[] = [];
let userMessages: { userId: number; message: string }[] = [];

export const storeSentMessage = (chatId: number, messageId: number) => {
  sentMessages.push({ chatId, messageId });
};

export const storeUserMessage = (userId: number, message: string) => {
  userMessages.push({ userId, message });
};

export const getChatHistory = (chatId: number): SentMessage[] => {
  return sentMessages.filter((msg) => msg.chatId === chatId);
};

export const getUserMessages = (userId: number) => {
  return userMessages.filter((msg) => msg.userId === userId);
};

export const clearChatHistory = async (
  chatId: number,
  messagesToDelete: number[]
) => {
  const history = getChatHistory(chatId);
  for (const msg of history) {
    try {
      await bot.deleteMessage(chatId, msg.messageId);
    } catch (error) {
      console.error("Error deleting bot message:", error);
    }
  }
  sentMessages = sentMessages.filter((msg) => msg.chatId !== chatId);
  userMessages = userMessages.filter((msg) => msg.userId !== chatId);

  // Clear the messages passed in the messagesToDelete array
  for (const messageId of messagesToDelete) {
    try {
      await bot.deleteMessage(chatId, messageId);
    } catch (error) {
      console.error("Error deleting specific message:", error);
    }
  }
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