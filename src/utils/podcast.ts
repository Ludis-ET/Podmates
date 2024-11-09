import { db } from "../firebase";

export const getPodcasters = async () => {
  const podcastersSnapshot = await db.collection("podcasters").get();
  return podcastersSnapshot.docs.map((doc) => doc.data());
};
