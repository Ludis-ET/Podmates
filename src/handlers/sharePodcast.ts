import { bot } from "../bot";
import { getUserPodcasts } from "../utils";

export const sharePodcasts = async (userId: number) => {
  const userPodcasts = await getUserPodcasts(userId);

  const homeButton = { text: "🏠 Home", callback_data: "home" };

  if (userPodcasts.length > 0) {
    for (const podcast of userPodcasts) {
      const caption = `
🎙️ ${podcast.name}

📜 Description:  
${truncate(podcast.description, 900)}

📚 Genre: ${podcast.genre}
🔢 Episodes/Season: ${podcast.episodesPerSeason}


 ID: ${podcast.id} 

> If you'd like to edit or delete, use the buttons below.
`;

      const maxLength = 1024;
      const finalCaption =
        caption.length > maxLength
          ? `${caption.slice(0, maxLength)}...`
          : caption;

      await bot.sendPhoto(userId, podcast.logo, {
        caption: finalCaption.trim(),
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✏️ Edit", callback_data: `edit_${podcast.id}` },
              { text: "🗑️ Delete", callback_data: `delete_${podcast.id}` },
            ],
            [homeButton],
          ],
        },
      });
    }
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

const truncate = (text: string, maxLength: number) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
