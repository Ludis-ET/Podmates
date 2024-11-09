import { db } from "../firebase";

export const getUserPodcasts = async (userId: number) => {
  const snapshot = await db
    .collection("podcasts")
    .where("userId", "==", userId)
    .get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    ...doc.data(),
  }));
};
