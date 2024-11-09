import * as admin from "firebase-admin";
import { db } from "../firebase";

admin.initializeApp({
  credential: admin.credential.cert(require("../../firebase.json")),
});

export async function checkUserExists(userId: number): Promise<boolean> {
  const userRef = db.collection("users").doc(userId.toString());
  const userDoc = await userRef.get();
  return userDoc.exists;
}

export async function addNewUser(
  userId: number,
  username: string,
  phoneNumber: string
) {
  await db.collection("users").doc(userId.toString()).set({
    username,
    phone_number: phoneNumber,
    status: "listener",
  });
}

export async function getUserData(userId: number) {
  const userRef = db.collection("users").doc(userId.toString());
  const userDoc = await userRef.get();
  if (userDoc.exists) {
    return userDoc.data();
  } else {
    return null;
  }
}
