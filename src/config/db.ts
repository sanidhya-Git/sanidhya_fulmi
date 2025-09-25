import mongoose from 'mongoose';
import logger from '../logger';

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bingoDB';
  mongoose.set('strictQuery', false);
  try {
    await mongoose.connect(uri);
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection error', err);
    process.exit(1);
  }
}
