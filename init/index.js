const mongoose = require("mongoose");
const initData = require("../data/foodData.js");
const FoodItem = require("../models/items.js");

main()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Connection error:", err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/shuddhify");
}

const initDB = async () => {
  try {
    await FoodItem.deleteMany({});
    await FoodItem.insertMany(initData.data);
    console.log("🍽️ Database Initialized with Food Data!");
  } catch (err) {
    console.error("Error initializing DB:", err);
  } finally {
    mongoose.connection.close();
    console.log("🔒 Connection Closed");
  }
};

initDB();
