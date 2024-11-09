import { db } from "../firebase";

export const getPodcasters = async () => {
  try {
    const podcasterSnapshot = await db.collection("podcasters").get();
    const podcasters = podcasterSnapshot.docs.map((doc) => doc.data());
    return podcasters;
  } catch (error) {
    console.error("Error fetching podcasters:", error);
    return [];
  }
};
