import fs from "fs";

// 1. First, load the environment
const envContent = fs.readFileSync(".env.local", "utf8");
envContent.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    process.env[key] = value;
  }
});

async function runTest() {
  // 2. Dynamically import everything AFTER env is set
  const { MongoDBAdapter } = await import("@auth/mongodb-adapter");
  const { default: clientPromise } = await import("../lib/mongodb-client.ts");

  console.log("--- Testing NextAuth MongoDB Adapter Locally (Dynamic Import) ---");
  
  try {
    const client = await clientPromise;
    if (!client) {
        console.error("❌ MONGODB_URI is still missing or invalid in process.env");
        return;
    }

    const adapter = MongoDBAdapter(clientPromise);
    console.log("✅ Adapter initialized.");

    console.log("Fetching test user...");
    const user = await adapter.getUserByEmail("devanandutkarsh7@gmail.com");
    
    if (user) {
      console.log("✅ Success! Adapter found user:", user.name);
    } else {
      console.log("ℹ️ Adapter connected but user not found.");
    }

    if (client && typeof client.close === 'function') await client.close();

  } catch (error) {
    console.error("❌ Adapter Test Failed:", error.message);
  }
}

runTest();
