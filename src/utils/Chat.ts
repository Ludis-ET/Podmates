import { bot } from "../bot";

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

  for (const messageId of messagesToDelete) {
    try {
      await bot.deleteMessage(chatId, messageId);
    } catch (error) {
      console.error("Error deleting specific message:", error);
    }
  }
};
