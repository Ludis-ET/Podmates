import { bot } from "./bot";
import { handleStartCommand, handleContact } from "./handlers";
import { handleCallbackQuery } from "./main";

// Listen for /start command
bot.onText(/\/start/, handleStartCommand);

// Listen for contact sharing
bot.on("contact", handleContact);

// Listen for callback queries
bot.on("callback_query", handleCallbackQuery);

// Handle stopping the bot on termination signals
process.once("SIGINT", () => bot.stopPolling());
process.once("SIGTERM", () => bot.stopPolling());

console.log("Bot is running...");
