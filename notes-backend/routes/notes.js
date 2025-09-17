import express from "express";
import Note from "../models/Note.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Create
router.post("/", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const tenant = req.user.tenant;

  if (tenant.plan === "FREE") {
    const count = await Note.countDocuments({ tenant: tenant._id });
    if (count >= 3)
      return res
        .status(403)
        .json({ error: "Note limit reached. Upgrade to Pro." });
  }

  const note = await Note.create({
    title,
    content,
    tenant: tenant._id,
    createdBy: req.user._id,
  });

  res.json(note);
});

// Read all
router.get("/", authMiddleware, async (req, res) => {
  const notes = await Note.find({ tenant: req.user.tenant._id });
  res.json(notes);
});

// Read one
router.get("/:id", authMiddleware, async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    tenant: req.user.tenant._id,
  });
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

// Update
router.put("/:id", authMiddleware, async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, tenant: req.user.tenant._id },
    req.body,
    { new: true }
  );
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

// Delete
router.delete("/:id", authMiddleware, async (req, res) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    tenant: req.user.tenant._id,
  });
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json({ message: "Deleted" });
});

export default router;
