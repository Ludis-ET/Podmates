import { bot } from "../bot";
import { db } from "../firebase";
import { askUserInput, uploadLogoToCloudinary } from "../utils";
import { sharePodcasts } from "./sharePodcast";

export const editPodcast = async (userId: number, roomId: string) => {
  const podcastDoc = await db.collection("podcasts").doc(roomId).get();
  const data = podcastDoc.data();

  if (!data) {
    await bot.sendMessage(userId, "Podcast not found.");
    return;
  }

  const sections = [
    {
      key: "name",
      message: "🎙️ Enter the new name of your podcast:",
      type: "text",
    },
    {
      key: "logo",
      message: "🖼️ Upload the new podcast logo (image):",
      type: "photo",
    },
    {
      key: "description",
      message: "📝 Provide a new description for your podcast:",
      type: "text",
    },
    {
      key: "genre",
      message: "📚 Specify the new genre (e.g., Tech, Business):",
      type: "text",
    },
    {
      key: "episodesPerSeason",
      message: "🔢 Enter the new number of episodes per season:",
      type: "text",
    },
  ];

  const buttons = sections.map((section) => [
    {
      text: `✏️ Edit ${capitalize(section.key)}: ${
        data[section.key] ?? "Not set"
      }`,
      callback_data: `edit_${section.key}`,
    },
  ]);
  buttons.push([{ text: "🏠 Back to Home", callback_data: "home" }]);

  await bot.sendMessage(
    userId,
    "📋 *Edit Podcast Details:*\n\nChoose a section to edit:",
    {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons },
    }
  );

  bot.on("callback_query", async (query) => {
    if (query.from.id !== userId) return;

    const sectionKey = query.data?.split("_")[1];
    const section = sections.find((s) => s.key === sectionKey);
    if (query.message) {
      await bot.deleteMessage(userId, query.message.message_id);
    }
    if (section) {
      const userResponse = await askUserInput(
        userId,
        section.message,
        section.type as "text" | "photo"
      );

      if (section.type === "photo") {
        data[section.key] = await uploadLogoToCloudinary(
          userResponse as string
        );
      } else {
        data[section.key] = userResponse;
      }

      await db
        .collection("podcasts")
        .doc(roomId)
        .update({
          [section.key]: data[section.key],
        });

      await bot.sendMessage(
        userId,
        `✅ ${capitalize(section.key)} updated successfully!`
      );
      await sharePodcasts(userId);
    } else if (query.data === "home") {
      await sharePodcasts(userId);
    }
  });
};

export const deletePodcast = async (userId: number, roomId: string) => {
  await db.collection("podcasts").doc(roomId).delete();
  await bot.sendMessage(userId, "Podcast deleted successfully!");
  await sharePodcasts(userId);
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
