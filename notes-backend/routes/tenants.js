import express from "express";
import Tenant from "../models/Tenant.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// Upgrade plan
router.post(
  "/:slug/upgrade",
  authMiddleware,
  requireRole("ADMIN"),
  async (req, res) => {
    const tenant = await Tenant.findOne({ slug: req.params.slug });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    tenant.plan = "PRO";
    await tenant.save();
    res.json({
      message: "Upgraded to Pro",
      tenant: { slug: tenant.slug, plan: tenant.plan.toLowerCase() },
    });
  }
);
router.post(
  "/invite",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const { email, role } = req.body;
    const tenant = req.user.tenant;
    console.log(tenant);
    const hashed = await bcrypt.hash("password", 10);
    const newUser = await User.create({
      email,
      password: hashed,
      role: role.toUpperCase(),
      tenant: tenant._id,
    });

    res.json({
      message: "User invited",
      user: { email: newUser.email, role: newUser.role.toLowerCase() },
    });
  }
);
export default router;
