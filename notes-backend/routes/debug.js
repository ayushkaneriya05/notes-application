import express from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/whoami", authMiddleware, (req, res) => {
  const u = req.user;
  if (!u) return res.status(404).json({ error: "No user" });
  res.json({
    id: u._id,
    email: u.email,
    role: u.role,
    tenant: { slug: u.tenant?.slug, name: u.tenant?.name },
  });
});

export default router;
