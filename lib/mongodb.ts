import * as mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI?.trim() || "";

if (!MONGODB_URI && process.env.NODE_ENV === "production") {
  console.warn("Warning: MONGODB_URI is not defined. Database connection will fail at runtime.");
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
  const timestamp = new Date().toISOString();
  
  if (cached?.conn) {
    // Check if the connection is still open (1 = connected)
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    }
    console.log(`[${timestamp}] [NEW_CODE_V3] Connection exists but state is ${mongoose.connection.readyState}. Resetting...`);
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000, 
      connectTimeoutMS: 15000,
    };

    const maskedUri = MONGODB_URI!.replace(/\/\/.*@/, "//***:***@");
    console.log(`[${timestamp}] [NEW_CODE_V3] Connecting to: ${maskedUri}`);

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose: any) => {
      console.log(`[${timestamp}] [NEW_CODE_V3] MongoDB Connected Successfully`);
      return mongoose;
    }).catch((err: any) => {
      console.error(`[${timestamp}] [NEW_CODE_V3] MongoDB Error:`, {
        message: err.message,
        reason: err.reason?.type || "unknown",
        code: err.code
      });
      cached!.promise = null; // Important: Clear promise so we can retry
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
