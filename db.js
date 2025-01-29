const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI; // Store in .env
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;
async function connectToDatabase() {
  if (!db) {
    try {
      await client.connect();
      db = client.db("music_app"); // Connect to the correct DB
      console.log('Connected to MongoDB: music_app');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }
  return db;
}

module.exports = connectToDatabase;
