import { Context } from "telegraf";
import { ParseMode } from "telegraf/typings/core/types/typegram";
import { User } from "telegraf/types";

import { getUserData, getPodcasters } from "../utils";
import { bot } from "../welcome";

export const main = async (ctx: Context, userData: User) => {
  const welcomeMessage = `
    *Welcome back, ${userData.username}!* 🙌

    _Here are the exciting things you can do:_
    
    - 🗓️ Set up your podcast
    - 🎙️ View other podcasters and collaborate
    - 📈 Track your podcast stats
    - 🚀 Go live and interact with your audience!

    Choose an option to get started! 🔥
  `;

  const formattedMessage = {
    caption: welcomeMessage,
    parse_mode: "MarkdownV2" as ParseMode,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🎙️ Set Your Podcast",
            callback_data: "set_podcast",
          },
        ],
        [
          {
            text: "👀 View Podcasters",
            callback_data: "view_podcasters",
          },
        ],
      ],
    },
  };

  await ctx.replyWithPhoto(
    {
      url: "https://images.pexels.com/photos/1054713/pexels-photo-1054713.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    formattedMessage
  );
};

console.log(bot);
// Handle button clicks
bot.on("callback_query", async (ctx) => {
  const userId = ctx.from?.id;
  const action = (ctx.callbackQuery as any).data;

  // loading message
  await ctx.reply("⏳ Please wait... fetching data...");

  if (action === "set_podcast") {
    setTimeout(async () => {
      const userData = await getUserData(userId);

      if (userData) {
        await ctx.reply(
          `🔧 Now, let's set up your podcast, ${ctx.from?.username}!`
        );
      } else {
        await ctx.reply(
          "❌ Oops! Something went wrong while fetching your data."
        );
      }
    }, 2000);
  }

  if (action === "view_podcasters") {
    setTimeout(async () => {
      const podcasters = await getPodcasters();

      if (podcasters && podcasters.length > 0) {
        const podcasterNames = podcasters
          .map((p: any) => p.username)
          .join("\n");
        await ctx.reply(
          `Here are some podcasters you can check out: \n${podcasterNames}`
        );
      } else {
        await ctx.reply("❌ No podcasters found. Please try again later.");
      }
    }, 2000);
  }

  ctx.answerCbQuery();
});
