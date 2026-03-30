
require('dotenv').config({ path: 'C:\\Users\\HP\\OneDrive\\Desktop\\codeforge\\backend\\.env' });
const mongoose = require('mongoose');
const Course = require('./models/Course');
const { seedData } = require('./data/seed');

async function runSeed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.log('Deleting existing courses...');
    await Course.deleteMany({});

    console.log('Inserting seed data...');
    await Course.insertMany(seedData);

    console.log('✅ Database seeded successfully!');
    console.log(`✅ Inserted ${seedData.length} courses`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

runSeed(); 