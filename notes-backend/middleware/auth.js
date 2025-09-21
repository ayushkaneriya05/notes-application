import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.warn("authMiddleware: missing authorization header");
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.warn("authMiddleware: malformed authorization header", authHeader);
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate("tenant");
    if (!req.user) {
      console.warn("authMiddleware: user not found for id", decoded.id);
      return res.status(401).json({ error: "Invalid token" });
    }
    next();
  } catch (err) {
    console.error("authMiddleware error", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};
