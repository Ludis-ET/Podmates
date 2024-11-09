import { db } from "./firebase";
import { User } from "node-telegram-bot-api";

// Add new user to Firebase
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


// Check if user exists in Firebase
export const checkUserExists = async (userId: number) => {
  const userDoc = await db.collection("users").doc(String(userId)).get();
  return userDoc.exists;
};

// Get user data from Firebase
export const getUserData = async (userId: number) => {
  const userDoc = await db.collection("users").doc(String(userId)).get();
  return userDoc.data();
};

// Get podcasters list from Firebase
export const getPodcasters = async () => {
  const podcastersSnapshot = await db.collection("podcasters").get();
  return podcastersSnapshot.docs.map((doc) => doc.data());
};
