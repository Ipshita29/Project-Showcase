import mongoose, { ConnectOptions } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
type Mongoose = typeof mongoose;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extend NodeJS global type declaration
declare global {
  var mongooseConnection: MongooseConnection | undefined;
}

let cached = global.mongooseConnection || { conn: null, promise: null };

global.mongooseConnection = cached;

async function dbConnect() {
  if (cached.conn) {
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    } else {
      console.log('Existing connection is broken, reconnecting...');
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const opts: ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 1000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connection successful!');
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      
      if (error.message && error.message.includes('bad auth')) {
        throw new Error('MongoDB authentication failed. Please check your username and password in the MONGODB_URI');
      } else if (error.message && error.message.includes('ENOTFOUND')) {
        throw new Error('MongoDB host not found. Please check your connection string');
      } else if (error.message && error.message.includes('timed out')) {
        throw new Error('MongoDB connection timed out. Please check your network or MongoDB Atlas status');
      }
      
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error('MongoDB connection error in dbConnect:', error);
    throw error;
  }
}

// Helper function to get the database client directly for operations that need it
export async function getDbClient() {
  await dbConnect();
  return mongoose.connection.getClient();
}

// Helper function to get a specific DB collection
export async function getCollection(collectionName: string) {
  await dbConnect();
  const client = mongoose.connection.getClient();
  const db = client.db();
  return db.collection(collectionName);
}

export default dbConnect;
