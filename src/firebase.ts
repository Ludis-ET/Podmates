import * as firebaseAdmin from "firebase-admin";

if (firebaseAdmin.apps.length === 0) {
  const serviceAccount = require("../firebase.json");
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
} else {
  firebaseAdmin.app();
}

const db = firebaseAdmin.firestore();

export { db };
