import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) {
  if (process.env.NODE_ENV === "production") {
    console.warn('Warning: MONGODB_URI is missing. Database features will fail.');
  }
}

const uri = process.env.MONGODB_URI?.trim() || "";
const isValidScheme = uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");

const options = {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  family: 4, 
  tls: true,
  minPoolSize: 0,
  maxPoolSize: 10,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    if (!isValidScheme) {
      console.error("[MongoDB] Invalid or missing MONGODB_URI scheme in development.");
      globalWithMongo._mongoClientPromise = Promise.reject(new Error("Invalid MONGODB_URI scheme"));
    } else {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    if (!isValidScheme) {
      // In build/production without valid URI, return a promise that only rejects when awaited
      console.warn("[MongoDB] Invalid or missing MONGODB_URI scheme. Connection will be skipped.");
      globalWithMongo._mongoClientPromise = Promise.resolve(null as any); 
    } else {
      console.log("[MongoDB] Initializing new production client connection...");
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect()
        .then(c => {
          console.log("[MongoDB] Production connection established successfully.");
          return c;
        })
        .catch(err => {
          console.error("[MongoDB] Production connection failed:", err.message);
          throw err;
        });
    }
  }
  clientPromise = globalWithMongo._mongoClientPromise;
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
