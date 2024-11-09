import * as firebaseAdmin from "firebase-admin";
import * as dotenv from "dotenv";
import cloudinary from "cloudinary";

dotenv.config();


if (!firebaseAdmin.apps.length) {
  const serviceAccount = require("../firebase.json");
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
}

export const db = firebaseAdmin.firestore();


cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = cloudinary.v2;