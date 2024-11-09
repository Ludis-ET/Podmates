import { db } from "../firebase";

export const addNewUser = async (
  userId: number,
  username: string,
  phoneNumber: string
) => {
  await db.collection("users").doc(String(userId)).set({
    username,
    phone_number: phoneNumber,
  });
};

export const checkUserExists = async (userId: number) => {
  const userDoc = await db.collection("users").doc(String(userId)).get();
  return userDoc.exists;
};

export const getUserData = async (userId: number) => {
  const userDoc = await db.collection("users").doc(String(userId)).get();
  return userDoc.data();
};

export const getPodcasters = async () => {
  const podcastersSnapshot = await db.collection("podcasters").get();
  return podcastersSnapshot.docs.map((doc) => doc.data());
};
