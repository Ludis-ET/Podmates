import { Message, User } from "node-telegram-bot-api";
import { bot } from "./bot";
import { addNewUser, checkUserExists, getUserData } from "./utils";
import { main } from "./main";

// Handle the /start command
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

// Handle contact sharing for registration
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
