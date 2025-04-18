const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB with retry logic and event monitoring
 */
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  let isConnected = false;

  // Configure mongoose options
  const mongooseOptions = {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000
  };

  const connectWithRetry = async () => {
    try {
      if (isConnected) {
        console.log('MongoDB is already connected');
        return;
      }

      // Attempt to connect
      const conn = await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
      
      isConnected = true;
      console.log(`MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
      
      // Set up connection event listeners
      mongoose.connection.on('error', (err) => {
        console.error(`MongoDB connection error: ${err}`);
        isConnected = false;
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected, attempting to reconnect...');
        isConnected = false;
        setTimeout(connectWithRetry, 5000); // Try to reconnect after 5 seconds
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        isConnected = true;
      });
      
      // Handle application termination
      process.on('SIGINT', async () => {
        try {
          await mongoose.connection.close();
          console.log('MongoDB connection closed through app termination');
          process.exit(0);
        } catch (err) {
          console.error(`Error during MongoDB disconnection: ${err}`);
          process.exit(1);
        }
      });
      
    } catch (error) {
      isConnected = false;
      console.error(`MongoDB connection error: ${error.message}`);
      
      // Implement retry logic with exponential backoff
      if (retries < maxRetries) {
        retries++;
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`Retrying connection (${retries}/${maxRetries}) in ${delay/1000} seconds...`);
        setTimeout(connectWithRetry, delay);
      } else {
        console.error('Max connection retries reached, exiting application...');
        process.exit(1);
      }
    }
  };

  await connectWithRetry();
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`);
    throw error;
  }
};

/**
 * Check if MongoDB is connected
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  disconnectDB,
  isConnected
};