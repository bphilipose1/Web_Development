const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;
async function connectToDatabase() {
  if (!db) {
    try {
      await client.connect();
      db = client.db(); //uses database from URI
      console.log('Connected to MongoDB Atlas');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1); //stop app if DB fails
    }
  }
  return db;
}

module.exports = connectToDatabase;
