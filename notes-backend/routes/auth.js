import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

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
      name: user.name,
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

// Change password (authenticated)
router.post("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword)
    return res
      .status(400)
      .json({ error: "currentPassword and newPassword are required" });
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
      return res.status(400).json({ error: "Invalid current password" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed" });
  } catch (err) {
    console.error("change-password error", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;
