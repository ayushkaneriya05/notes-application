import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Ensure your MONGO_URI includes the database name: mongodb+srv://.../notesdb
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "notesdb", // force db name if not in URI
    });

    // Ping the database
    await mongoose.connection.db.admin().command({ ping: 1 });

    console.log("✅ MongoDB connected to notesdb");
  } catch (err) {
    console.error("❌ DB Connection failed", err);
    process.exit(1);
  }
};
