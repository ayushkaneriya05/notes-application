const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });

  const user = await User.findOne({ email }).populate("tenantId");
  if (!user) return res.status(401).json({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const payload = {
    sub: user._id.toString(),
    tid: user.tenantId._id.toString(),
    role: user.role,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "8h",
  });
  res.json({ token });
});

module.exports = router;
