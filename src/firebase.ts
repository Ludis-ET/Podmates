import * as firebaseAdmin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config();

// Firebase initialization
if (!firebaseAdmin.apps.length) {
  const serviceAccount = require("../firebase.json");
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
}

export const db = firebaseAdmin.firestore();
