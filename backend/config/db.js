import mongoose from "mongoose";
import { seedDatabase } from "./seed.js";

let mongoServer = null;

// Disable command buffering so queries fail immediately or fall back if DB is disconnected
mongoose.set("bufferCommands", false);

export const connectDB = async () => {
  // If already connected in a warm serverless container, reuse connection
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;

  // Option 1: Explicit MONGODB_URI provided in environment (e.g. MongoDB Atlas)
  if (uri) {
    try {
      console.log("Connecting to MongoDB via MONGODB_URI...");
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log("MongoDB Connected successfully to remote/configured instance!");
      await seedDatabase();
      return;
    } catch (err) {
      console.warn("Could not connect to MONGODB_URI:", err.message);
      console.log("Active in-memory store will serve requests seamlessly.");
      return;
    }
  }

  // If deployed on Vercel without MONGODB_URI
  if (process.env.VERCEL) {
    console.log("Running on Vercel: Using high-performance in-memory fallback store.");
    return;
  }

  // Option 2: Try local MongoDB daemon on localhost:27017
  try {
    const localUri = "mongodb://127.0.0.1:27017/lostandfound";
    console.log("Attempting local MongoDB connection at " + localUri + "...");
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log("MongoDB Connected successfully to local service!");
    await seedDatabase();
    return;
  } catch (err) {
    console.log("Local MongoDB service not running. Starting embedded in-memory MongoDB...");
  }

  // Option 3: Automatic zero-config embedded MongoMemoryServer (local development only)
  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    mongoServer = await MongoMemoryServer.create({
      instance: { dbName: "lostandfound" },
    });
    const memoryUri = mongoServer.getUri();
    await mongoose.connect(memoryUri);
    console.log("Embedded In-Memory MongoDB running and connected!");
    console.log("Notice: For persistent data across restarts, set MONGODB_URI in backend/.env");
    await seedDatabase();
  } catch (err) {
    console.error("Critical MongoDB connection failure:", err.message);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (err) {
    console.error("Error closing MongoDB:", err);
  }
};
