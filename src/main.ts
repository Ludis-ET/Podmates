import * as admin from "firebase-admin";

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(require("../firebase.json")),
});
const db = admin.firestore();

// Function to check if a user exists in Firestore
// This function checks if the user already exists in the Firestore database
export async function checkUserExists(userId: number): Promise<boolean> {
  const userRef = db.collection("users").doc(userId.toString());
  const userDoc = await userRef.get();
  return userDoc.exists;
}

// Function to add a new user to Firestore
// This function adds a new user to the Firestore database after they share their phone number
export async function addNewUser(
  userId: number,
  username: string,
  phoneNumber: string
) {
  await db.collection("users").doc(userId.toString()).set({
    username,
    phone_number: phoneNumber,
    status: "listener", // Default status
  });
}

// Function to retrieve a user's data
// This function fetches a user's data from Firestore
export async function getUserData(userId: number) {
  const userRef = db.collection("users").doc(userId.toString());
  const userDoc = await userRef.get();
  if (userDoc.exists) {
    return userDoc.data();
  } else {
    return null;
  }
}
