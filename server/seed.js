require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    const users = [
      { username: 'admin', password: 'password123', role: 'Admin' },
      { username: 'operator', password: 'password123', role: 'TrafficOperator' },
      { username: 'authority', password: 'password123', role: 'EmergencyAuthority' },
      { username: 'analyst', password: 'password123', role: 'SecurityAnalyst' }
    ];

    for (const userData of users) {
      const existing = await User.findOne({ username: userData.username });
      if (!existing) {
        const user = new User(userData);
        await user.save();
        console.log(`User ${userData.username} created`);
      } else {
        console.log(`User ${userData.username} already exists`);
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
};

connectDB().then(() => seedUsers());
