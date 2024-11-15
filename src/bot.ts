import TelegramBot from "node-telegram-bot-api";
import * as dotenv from "dotenv";

dotenv.config();

const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN;

if (!TELEGRAM_API_TOKEN) {
  throw new Error(
    "TELEGRAM_API_TOKEN is not defined."
  );
}

export const bot = new TelegramBot(TELEGRAM_API_TOKEN, { polling: true });

console.log("Telegram bot is running...");
