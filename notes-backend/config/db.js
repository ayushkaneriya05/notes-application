import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.db.notesdb().command({ ping: 1 });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ DB Connection failed", err);
    process.exit(1);
  }
};
