import { bot } from "./bot";
import { handleGetStarted, handleContact } from "./handlers";
import { handleCallbackQuery } from "./service";

bot.onText(/\/start/, handleGetStarted);

bot.on("contact", handleContact);

bot.on("callback_query", handleCallbackQuery);

process.once("SIGINT", () => bot.stopPolling());
process.once("SIGTERM", () => bot.stopPolling());

console.log("Bot is running...");
