import { MongoClient } from "mongodb";
import fs from "fs";

// Simple .env.local parser
function loadEnv() {
  try {
    const envContent = fs.readFileSync(".env.local", "utf8");
    const lines = envContent.split("\n");
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  } catch (e) {
    console.warn("Could not read .env.local");
  }
}

async function testConnection() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error("MONGODB_URI missing");
    process.exit(1);
  }

  console.log("Testing connection to:", uri.replace(/\/\/.*@/, "//***:***@"));

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log("✅ Success! Local machine can connect to production DB.");
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log("Collections found:", collections.length);
    for (const c of collections.slice(0, 5)) {
        console.log(" -", c.name);
    }
  } catch (error) {
    console.error("❌ Failed to connect locally:", error.message);
  } finally {
    await client.close();
  }
}

testConnection();
