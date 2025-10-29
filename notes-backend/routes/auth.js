import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import { authMiddleware } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Register (create user within an existing tenant)
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    body("tenantSlug").notEmpty().withMessage("tenantSlug required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ error: "validation", details: errors.array() });

    const { name, email, password, tenantSlug } = req.body || {};

    try {
      const tenant = await Tenant.findOne({
        slug: String(tenantSlug).toLowerCase(),
      });
      if (!tenant) return res.status(400).json({ error: "Invalid tenant" });

      const existing = await User.findOne({ email });
      if (existing)
        return res.status(409).json({ error: "Email already exists" });

      const hashed = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name: name || undefined,
        email,
        password: hashed,
        role: "MEMBER",
        tenant: tenant._id,
      });

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.json({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role.toLowerCase(),
          tenant: {
            slug: tenant.slug,
            name: tenant.name,
            plan: tenant.plan.toLowerCase(),
          },
        },
      });
    } catch (err) {
      console.error("register error", err);
      res.status(500).json({ error: "Failed to register" });
    }
  }
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ error: "validation", details: errors.array() });

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
  }
);

// Me - get current user profile
router.get("/me", authMiddleware, (req, res) => {
  const u = req.user;
  if (!u) return res.status(404).json({ error: "No user" });
  res.json({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role.toLowerCase(),
    tenant: {
      slug: u.tenant?.slug,
      name: u.tenant?.name,
      plan: u.tenant?.plan?.toLowerCase(),
    },
  });
});

// Change password (authenticated)
router.post(
  "/change-password",
  authMiddleware,
  [
    body("currentPassword").notEmpty().withMessage("currentPassword required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("newPassword min 6 chars"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ error: "validation", details: errors.array() });

    const { currentPassword, newPassword } = req.body || {};
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
  }
);

export default router;
