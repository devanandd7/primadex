import * as mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Increased to 10s for slow cold starts
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to avoid Vercel IPv6 issues
    };

    // Diagnostic logging (masked for security)
    const maskedUri = MONGODB_URI!.replace(/\/\/.*@/, "//***:***@");
    console.log(`Attempting connection to: ${maskedUri}`);

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose: any) => {
      console.log("MongoDB Connected Successfully");
      return mongoose;
    }).catch((err: any) => {
      console.error("MongoDB Connection Error Details:", {
        message: err.message,
        name: err.name,
        code: err.code,
        uri_prefix: MONGODB_URI?.substring(0, 15)
      });
      throw err;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default dbConnect;
