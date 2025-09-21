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

// --- UNIVERSAL CONFIGURATION ---

// This CORS setup allows requests from your local machine AND your deployed frontend.
const allowedOrigins = [
  "http://localhost:5173",
  "https://notes-application-frontend-seven.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
};
app.use(cors(corsOptions));

// Routes
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);
app.use("/tenants", tenantRoutes);
app.use("/debug", debugRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Connect to DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => console.error("❌ DB Connection failed", err));

// --- Environment-Specific Logic ---

// If NOT running on Vercel, start a local server.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running for local development on http://localhost:${PORT}`
    );
  });
}

// Export the app for Vercel's serverless environment.
export default app;
