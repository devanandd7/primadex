import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import mongoose from "mongoose";
import { MongoClient } from "mongodb";

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      has_uri: !!process.env.MONGODB_URI,
      uri_length: process.env.MONGODB_URI?.length,
      uri_start: process.env.MONGODB_URI?.substring(0, 15),
    },
    mongoose: { status: "pending" },
    mongodb_driver: { status: "pending" }
  };

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    return NextResponse.json({ error: "MONGODB_URI is missing" }, { status: 500 });
  }

  // Test 1: Mongoose (Aggressive)
  try {
    const start = Date.now();
    await mongoose.connect(MONGODB_URI, { 
      serverSelectionTimeoutMS: 5000,
      family: 4,
      tlsAllowInvalidCertificates: true, // Bypass certificate validation for testing
    });
    results.mongoose = {
      status: "success",
      duration: `${Date.now() - start}ms`,
      readyState: mongoose.connection.readyState
    };
    await mongoose.disconnect();
  } catch (err: any) {
    results.mongoose = {
      status: "error",
      message: err.message,
      name: err.name
    };
  }

  // Test 2: Native MongoDB Driver (Aggressive)
  try {
    const start = Date.now();
    const client = new MongoClient(MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      connectTimeoutMS: 5000
    });
    await client.connect();
    results.mongodb_driver = {
      status: "success",
      duration: `${Date.now() - start}ms`
    };
    await client.close();
  } catch (err: any) {
    results.mongodb_driver = {
      status: "error",
      message: err.message,
      name: err.name
    };
  }

  return NextResponse.json(results);
}
