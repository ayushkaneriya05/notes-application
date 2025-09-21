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
app.use(cors());

// Routes
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);
app.use("/tenants", tenantRoutes);
app.use("/debug", debugRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// DB + Server
const PORT = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
  })
  .catch((err) => console.error(err));
