import { bot } from "../bot";
import { getUserPodcasts } from "../podcast";

export const sharePodcasts = async (userId: number) => {
  const userPodcasts = await getUserPodcasts(userId);

  const homeButton = {
    text: "🏠 Home",
    callback_data: "home",
  };

  if (userPodcasts.length > 0) {
    const buttons = userPodcasts.map(({ name }) => ({
      text: name,
      callback_data: `manage_podcast_${name}`,
    }));

    buttons.push(homeButton);

    await bot.sendMessage(userId, "Select a podcast to manage:", {
      reply_markup: { inline_keyboard: [buttons] },
    });
  } else {
    await bot.sendMessage(
      userId,
      "Let’s get started! Provide details for your new podcast:",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎙️ Share Podcast Info",
                callback_data: "share_podcast_info",
              },
            ],
            [homeButton],
          ],
        },
      }
    );
  }
};

export const handleDiscoverPodcasts = async (userId: number) => {
  // Add logic for discovering podcasts (if applicable)
};
