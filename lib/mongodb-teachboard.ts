import { MongoClient } from "mongodb";

const uri = process.env.TEACHBOARD_MONGODB_URL?.trim();

const options = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
};

let teachboardClientPromise: Promise<MongoClient> | null = null;

export async function getTeachBoardClient() {
  if (!uri) {
    throw new Error("TEACHBOARD_MONGODB_URL is missing");
  }

  if (process.env.NODE_ENV === "development") {
    let globalWithMongo = global as typeof globalThis & {
      _teachboardClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._teachboardClientPromise) {
      console.log("[DB-Factory] 🌐 Connecting to TeachBoard Cluster...");
      globalWithMongo._teachboardClientPromise = new MongoClient(uri, options).connect();
    }
    return globalWithMongo._teachboardClientPromise;
  }

  if (!teachboardClientPromise) {
    teachboardClientPromise = new MongoClient(uri, options).connect();
  }
  return teachboardClientPromise;
}
