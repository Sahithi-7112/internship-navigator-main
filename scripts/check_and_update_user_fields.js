import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB", process.env.MONGO_URI);

    const update = await User.updateOne(
      { email: "sahithigogula@gmail.com" },
      { $set: { rollNo: "", department: "" } }
    );
    console.log("Update result:", update);

    const user = await User.findOne({ email: "sahithigogula@gmail.com" }).lean();
    console.log("User document after update:", user);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
};

run();
