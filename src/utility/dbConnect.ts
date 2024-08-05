import mongoose from 'mongoose';

const dbConnect = async (): Promise<void> => {
  try {
    if (mongoose.connections[0].readyState) {
      // console.log('Already connected.');
      return;
    }

    const connectionOptions: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      dbName: 'SCHL_PORTAL',
    };

    await mongoose.connect(process.env?.MONGODB_URI || '', connectionOptions);
    // console.log("Connected to Mongo Successfully!");
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export default dbConnect;
