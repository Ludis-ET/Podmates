import { bot } from "../bot";
import { db, storage } from "../firebase";

export const getUserPodcasts = async (userId: number) => {
  const snapshot = await db
    .collection("podcasts")
    .where("userId", "==", userId)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    logo: doc.data().logo,
    description: doc.data().description,
    genre: doc.data().genre,
    episodesPerSeason: doc.data().episodesPerSeason,
  }));
};

export const storePodcastInfo = async (userId: number, podcastData: any) => {
  await db
    .collection("podcasts")
    .add({ userId, ...podcastData, createdAt: new Date() });
};

export const uploadLogoToCloudinary = async (photoFileId: string) => {
  const fileLink = await bot.getFileLink(photoFileId);
  const response = await fetch(fileLink);
  const buffer = await response.arrayBuffer();

  return new Promise((resolve, reject) => {
    storage.uploader
      .upload_stream({ folder: "podcast_logos" }, (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url);
      })
      .end(Buffer.from(buffer));
  });
};


export const askUserInput = async (
  userId: number,
  message: string,
  type: "text" | "photo"
): Promise<string | undefined> => {
  await bot.sendMessage(userId, message);
  return new Promise((resolve) => {
    bot.on(type === "photo" ? "photo" : "message", async (msg) => {
      if (msg.from?.id === userId) {
        resolve(type === "photo" ? msg.photo?.[0].file_id : msg.text);
      }
    });
  });
};