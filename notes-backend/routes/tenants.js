import express from "express";
import bcrypt from "bcryptjs";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// Upgrade plan (Admin only, must belong to the same tenant)
router.post(
  "/:slug/upgrade",
  authMiddleware,
  requireRole("ADMIN"),
  async (req, res) => {
    const slug = String(req.params.slug).toLowerCase();

    // Ensure the acting admin belongs to the same tenant
    if (!req.user?.tenant || req.user.tenant.slug.toLowerCase() !== slug) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const tenant = await Tenant.findOne({ slug });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    tenant.plan = "PRO";
    await tenant.save();
    res.json({
      message: "Upgraded to Pro",
      tenant: { slug: tenant.slug, plan: tenant.plan.toLowerCase() },
    });
  }
);

// Invite user (Admin only, invites into their own tenant)
router.post(
  "/invite",
  authMiddleware,
  requireRole("ADMIN"),
  async (req, res) => {
    const { email, role, name } = req.body || {};

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required" });
    }

    const tenant = req.user.tenant;
    const hashed = await bcrypt.hash("password", 10);

    try {
      // console.log(
      //   `invite attempt by ${req.user?.email} for tenant ${
      //     tenant?.slug
      //   } payload=${JSON.stringify({ email, role, name })}`
      // );
      const newUser = await User.create({
        name: name || undefined,
        email,
        password: hashed,
        role: String(role).toUpperCase() === "ADMIN" ? "ADMIN" : "MEMBER",
        tenant: tenant._id,
      });

      res.json({
        message: "User invited",
        user: {
          name: newUser.name || newUser.email,
          email: newUser.email,
          role: newUser.role.toLowerCase(),
        },
      });
    } catch (err) {
      console.error("invite error", err);
      if (err?.code === 11000) {
        return res.status(409).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Failed to invite user" });
    }
  }
);
export default router;
