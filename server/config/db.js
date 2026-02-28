const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[DB] MongoDB Connected for Zero Trust Smart City');
  } catch (err) {
    console.error('[DB] Connection failure:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
