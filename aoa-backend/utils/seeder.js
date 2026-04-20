require("dotenv").config();
const mongoose = require("mongoose");
const Topic = require("../models/Topic");
const connectDB = require("../db");
const topics = require("../data/knowledge_base.json");

const seedDB = async () => {
  await connectDB();
  await Topic.deleteMany({});
  console.log("🗑️  Cleared existing topics");
  await Topic.insertMany(topics);
  console.log(`✅ Inserted ${topics.length} topics successfully`);
  mongoose.connection.close();
  console.log("🔒 Database connection closed");
};

seedDB();