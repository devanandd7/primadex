import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI?.trim() || "";

const options = {
  tls: true,
  tlsAllowInvalidCertificates: true, // Vercel OpenSSL handshake workaround
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
};

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = new MongoClient(uri, options).connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Production: connect directly
  clientPromise = new MongoClient(uri, options).connect();
}

export default clientPromise;
