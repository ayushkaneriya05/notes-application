export const requireRole = (role) => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(403).json({ error: "Forbidden: no user" });
    }
    const userRole = String(req.user.role || "").toUpperCase();
    const needed = String(role || "").toUpperCase();
    if (userRole !== needed) {
      console.warn(
        `role check failed: user=${
          req.user.email || req.user._id
        } role=${userRole} required=${needed}`
      );
      return res.status(403).json({ error: `Forbidden: requires ${needed}` });
    }
    next();
  } catch (err) {
    console.error("requireRole error", err);
    return res.status(500).json({ error: "Server error" });
  }
};
