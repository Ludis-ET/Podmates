import { bot } from "../bot";
import { db, storage } from "../firebase";
import { getUserPodcasts } from "../utils";

export const sharePodcasts = async (userId: number) => {
  const userPodcasts: {
    id: string;
    name: string;
    logo: string;
    description: string;
    genre: string;
    episodesPerSeason: number;
  }[] = await getUserPodcasts(userId);

  const homeButton = { text: "🏠 Home", callback_data: "home" };

  if (userPodcasts.length > 0) {
    const podcastListButtons = userPodcasts.map((podcast) => [
      { text: `🎙️ ${podcast.name}`, callback_data: `view_${podcast.id}` },
    ]);

    await bot.sendMessage(
      userId,
      "📚 *Your Podcasts:*\n\nSelect a podcast to view details or manage:",
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [...podcastListButtons, [homeButton]],
        },
      }
    );

    bot.on("callback_query", async (query) => {
      if (query.from.id !== userId) return;

      const data = query.data || "";
      if (query.message) {
        await bot.deleteMessage(userId, query.message.message_id);
      }

      if (data.startsWith("view_")) {
        const podcastId = data.split("_")[1];
        const selectedPodcast = userPodcasts.find((p) => p.id === podcastId);

        if (selectedPodcast) {
          await bot.sendPhoto(userId, selectedPodcast.logo, {
            caption: `🎙️ ${selectedPodcast.name}\n\n📝 ${selectedPodcast.description}\n📚 Genre: ${selectedPodcast.genre}\n🔢 Episodes/Season: ${selectedPodcast.episodesPerSeason}`,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "✏️ Edit",
                    callback_data: `edit_${selectedPodcast.id}`,
                  },
                  {
                    text: "🗑️ Delete",
                    callback_data: `delete_${selectedPodcast.id}`,
                  },
                ],
                [homeButton],
              ],
            },
          });
        }
      } else if (data === "home") {
        await sharePodcasts(userId);
      }
    });
  } else {
    await bot.sendMessage(
      userId,
      "🚀 It looks like you haven't added any podcasts yet.\n\nWould you like to share one?",
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
