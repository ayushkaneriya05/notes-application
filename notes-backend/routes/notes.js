const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Tenant = require("../models/Tenant");
const Note = require("../models/Note");

// Create a note
router.post("/", auth, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ error: "tenant not found" });

    if (tenant.plan === "free") {
      const count = await Note.countDocuments({ tenantId });
      if (count >= 3)
        return res.status(403).json({ error: "Free plan note limit reached" });
    }

    const { title, content } = req.body;
    if (!title) return res.status(400).json({ error: "title required" });

    const note = await Note.create({
      title,
      content: content || "",
      tenantId,
      ownerId: req.user.id,
    });
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// List notes
router.get("/", auth, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const notes = await Note.find({ tenantId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// Get note by id
router.get("/:id", auth, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const note = await Note.findOne({ _id: req.params.id, tenantId });
    if (!note) return res.status(404).json({ error: "note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

// Update note
router.put("/:id", auth, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      { $set: { title, content, updatedAt: Date.now() } },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: "note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

/// Delete note
router.delete("/:id", auth, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const note = await Note.findOneAndDelete({ _id: req.params.id, tenantId });
    if (!note) return res.status(404).json({ error: "note not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
