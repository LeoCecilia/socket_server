import mongoose from "mongoose";

if (!process.env.MONGO_URI) {
  throw new Error("Please add your MONGO_URI to .env.local");
}

const MONGO_URI: string = process.env.MONGO_URI;
console.log("____MONGO___URI", MONGO_URI, process.env.NODE_ENV);
/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let globalWithMongoose = global as typeof globalThis & {
  mongoose: any;
};

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  // console.log("cached.conn", cached.conn);
  console.log("connection");
  return cached.conn;
}

export default dbConnect;
