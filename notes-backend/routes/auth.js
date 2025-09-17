import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate("tenant");
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role.toLowerCase(), // normalize for frontend
      tenant: {
        slug: user.tenant.slug,
        name: user.tenant.name,
        plan: user.tenant.plan.toLowerCase(),
      },
    },
  });
});

export default router;
