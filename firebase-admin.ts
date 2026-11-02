import { App, cert } from "firebase-admin/app";
import { getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
 
let serviceKey: any;

if (process.env.FIREBASE_SERVICE_KEY) {
  try {
    serviceKey = JSON.parse(process.env.FIREBASE_SERVICE_KEY);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_KEY:", error);
  }
} else {
  try {
    // Fallback for local development if service_key.json exists
    serviceKey = require("./service_key.json");
  } catch (e) {
    // If not found (e.g. build step without credentials), initialize with default or empty
    console.warn("service_key.json not found and FIREBASE_SERVICE_KEY not provided.");
  }
}

let app: App;

if (getApps().length === 0) {
  app = initializeApp({
    credential: serviceKey ? cert(serviceKey) : undefined,
  });
} else {
  app = getApp();
}

const adminDB = getFirestore(app);

export { app as adminApp, adminDB };