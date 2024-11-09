import { Telegraf } from "telegraf";
import { KeyboardButton, ReplyKeyboardMarkup } from "telegraf/types";
import * as firebaseAdmin from "firebase-admin";
import * as dotenv from "dotenv";

import { addNewUser, checkUserExists, getUserData } from "./utils/auth";
import { main } from "./scripts/main";

dotenv.config();

const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN!;

if (firebaseAdmin.apps.length === 0) {
  const serviceAccount = require("../firebase.json");
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
} else {
  firebaseAdmin.app();
}

const db = firebaseAdmin.firestore();
const bot = new Telegraf(TELEGRAM_API_TOKEN);

// /start command handler
bot.start(async (ctx) => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;

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

      // Ask for phone number if user is not registered
      await ctx.replyWithPhoto(
        {
          url: "https://images.pexels.com/photos/270288/pexels-photo-270288.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        },
        {
          caption: welcomeMessage,
          reply_markup: keyboard,
        }
      );
    } else {
      const userData = await getUserData(userId);

      if (userData?.phone_number) {
        await ctx.reply(
          `Welcome back, ${username}! Your phone number is already registered.`
        );

        // Call the main function to show user data and proceed
        await main(ctx, userData);
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

        await ctx.reply(message, { reply_markup: keyboard });
      }
    }
  }
});

// Handle phone number sharing
bot.on("contact", async (ctx) => {
  const userId = ctx.from?.id;
  const phoneNumber = ctx.message?.contact?.phone_number;
  const username = ctx.from?.username;

  if (userId && phoneNumber && username) {
    await addNewUser(userId, username, phoneNumber);

    await ctx.reply(
      "Thank you for sharing your phone number! You are now successfully registered."
    );

    const userData = await getUserData(userId);
    await main(ctx, userData); // Call main function to continue the flow after registration
  }
});

// Start the bot
bot
  .launch()
  .then(() => {
    console.log("Bot is running...");
  })
  .catch((err) => {
    console.error("Error launching bot:", err);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
