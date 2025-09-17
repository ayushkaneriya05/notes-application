const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const Tenant = require("../models/Tenant");
const User = require("../models/User");

// Upgrade endpoint - POST /tenants/:slug/upgrade (admin only)
router.post("/:slug/upgrade", auth, requireAdmin, async (req, res) => {
  try {
    const { slug } = req.params;
    const tenant = await Tenant.findOne({ slug });
    if (!tenant) return res.status(404).json({ error: "tenant not found" });

    // ensure admin belongs to same tenant
    if (req.user.tenantId.toString() !== tenant._id.toString())
      return res.status(403).json({ error: "not allowed" });

    tenant.plan = "pro";
    await tenant.save();
    res.json({ ok: true, plan: "pro" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
