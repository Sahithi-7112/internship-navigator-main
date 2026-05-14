import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const internshipPath = new URL("./models/Internship.js", import.meta.url).href;
const { default: Internship } = await import(internshipPath);

const checkDeadlines = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const internships = await Internship.find({}, 'role company lastDateToApply').limit(10);
    console.log('Sample internships with deadlines:');
    internships.forEach(i => {
      console.log(`${i.role} - ${i.company}: ${i.lastDateToApply}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
};

checkDeadlines();