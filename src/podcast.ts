// import { bot } from "./bot";
// import { db, storage } from "./firebase";


// export const managePodcast = async (query: any) => {
//   const userId = query.from.id;
//   const podcastName = query.data.split("_")[1];
//   const userPodcasts = await getUserPodcasts(userId);
//   const podcast = userPodcasts.find(({ name }) => name === podcastName);

//   if (podcast) {
//     const buttons = [
//       {
//         text: "✏️ Edit Podcast Info",
//         callback_data: `edit_podcast_${podcast.id}`,
//       },
//       {
//         text: "🗑️ Delete Podcast",
//         callback_data: `delete_podcast_${podcast.id}`,
//       },
//     ];
//     await bot.sendMessage(userId, `Managing podcast: ${podcast.name}`, {
//       reply_markup: { inline_keyboard: [buttons] },
//     });
//   }
// };

// export const deletePodcastInfo = async (podcastId: string, logoUrl: string) => {
//   try {
//     const publicId = logoUrl.split("/").pop()?.split(".")[0];

//     await db.collection("podcasts").doc(podcastId).delete();
//     console.log(
//       `Podcast with ID ${podcastId} deleted successfully from Firestore.`
//     );

//     if (publicId) {
//       await storage.uploader.destroy(publicId);
//       console.log(
//         `Podcast logo with ID ${publicId} deleted successfully from Cloudinary.`
//       );
//     }
//   } catch (error) {
//     console.error("Error deleting podcast:", error);
//   }
// };

// export const handleCallbackQuery = async (query: any) => {
//   const [action, podcastId] = query.data.split("_");
//   const userId = query.from.id;

//   if (action === "edit_podcast") {
//     await requestPodcastInfo(userId, podcastId); // Update podcast info
//   }

//   if (action === "delete_podcast") {
//     const podcast = await db.collection("podcasts").doc(podcastId).get();
//     const logoUrl = podcast.data()?.logo || "";
//     await deletePodcastInfo(podcastId, logoUrl);
//     await bot.sendMessage(userId, "Podcast deleted successfully!");
//   }
// };

// bot.on("callback_query", handleCallbackQuery);
