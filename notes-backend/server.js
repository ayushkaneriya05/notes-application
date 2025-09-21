import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/notes.js";
import tenantRoutes from "./routes/tenants.js";
import debugRoutes from "./routes/debug.js";

dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: "https://notes-application-frontend-seven.vercel.app",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);
app.use("/tenants", tenantRoutes);
app.use("/debug", debugRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected for Vercel");
  })
  .catch((err) => console.error(err));

export default app;
