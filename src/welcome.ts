import {
  KeyboardButton,
  ReplyKeyboardMarkup,
  Message,
  User,
} from "node-telegram-bot-api";
import * as dotenv from "dotenv";
import * as firebaseAdmin from "firebase-admin";

import { addNewUser, checkUserExists, getUserData } from "./utils";
import { main } from "./scripts";
import { bot } from "./bot";

dotenv.config();

// Firebase initialization
if (!firebaseAdmin.apps.length) {
  const serviceAccount = require("../firebase.json");
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
}

export const db = firebaseAdmin.firestore();

/**
 * Handles the /start command to initiate user registration and welcome message.
 * Checks if the user is already registered; if not, prompts for phone number.
 */
bot.onText(/\/start/, async (msg: Message) => {
  const userId = msg.from?.id;
  const username = msg.from?.username;

  if (userId && username) {
    const userExists = await checkUserExists(userId);

    if (!userExists) {
      const quote = `"Success is not the key to happiness. Happiness is the key to success." - Albert Schweitzer`;
      const welcomeMessage = `Welcome, ${username}!\n\n${quote}`;

      const keyboard: ReplyKeyboardMarkup = {
        keyboard: [
          [
            {
              text: "Share Phone Number",
              request_contact: true,
            } as KeyboardButton,
          ],
        ],
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
        if (userData) {
          await main(userId, userData as User); 
        } else {
          await bot.sendMessage(
            userId,
            "❌ Oops! Something went wrong while fetching your data."
          );
        }
      } else {
        const message = `Welcome back, ${username}!\n\nWe noticed you haven't shared your phone number yet. Please do so to complete your registration.`;

        const keyboard: ReplyKeyboardMarkup = {
          keyboard: [
            [
              {
                text: "Share Phone Number",
                request_contact: true,
              } as KeyboardButton,
            ],
          ],
          one_time_keyboard: true,
          resize_keyboard: true,
        };

        await bot.sendMessage(userId, message, { reply_markup: keyboard });
      }
    }
  }
});



/**
 * Handles phone number sharing to complete user registration.
 * Adds the user's phone number to the database and confirms registration.
 */
bot.on("contact", async (msg) => {
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
});



// Handle stopping the bot on termination signals
process.once("SIGINT", () => bot.stopPolling());
process.once("SIGTERM", () => bot.stopPolling());

console.log("Bot is running...");
