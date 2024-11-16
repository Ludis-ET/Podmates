import { bot } from "../bot";
import {
  askUserInput,
  storePodcastInfo,
  uploadLogoToCloudinary,
} from "../utils";
import { sharePodcasts } from "./sharePodcast";

export const addPodcast = async (userId: number) => {
  const podcastData: { [key: string]: any } = {};

  const fields = [
    {
      key: "name",
      message: "🎙️ What is the name of your podcast?",
      type: "text",
    },
    {
      key: "logo",
      message: "🖼️ Please upload your podcast logo (image):",
      type: "photo",
    },
    {
      key: "description",
      message: "📝 Provide a brief description of your podcast:",
      type: "text",
    },
    {
      key: "genre",
      message:
        "📚 What genre does your podcast belong to (e.g., Tech, Health)?",
      type: "text",
    },
    {
      key: "episodesPerSeason",
      message: "🔢 How many episodes does each season have?",
      type: "text",
    },
  ];

  for (const field of fields) {
    const userResponse = await askUserInput(
      userId,
      field.message,
      field.type as "text" | "photo"
    );

    if (field.type === "photo") {
      podcastData[field.key] = await uploadLogoToCloudinary(
        userResponse as string
      );
    } else {
      podcastData[field.key] = userResponse;
    }
  }

  await storePodcastInfo(userId, podcastData);

  await bot.sendMessage(
    userId,
    `✅ Your podcast "${podcastData.name}" has been added successfully! 🎉`
  );
  await sharePodcasts(userId);
};
