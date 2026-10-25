import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "lostandfound_jwt_secret_mca_project_2026";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Support hardcoded admin token
    if (decoded.email === "admin@lostfound.com") {
      req.user = {
        id: "admin",
        name: "Administrator",
        email: "admin@lostfound.com",
        role: "admin",
      };
      return next();
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      // User might be the admin
      if (decoded.role === "admin") {
        req.user = decoded;
        return next();
      }
      return res.status(401).json({ success: false, message: "User not found or token expired" });
    }

    req.user = user.toJSON();
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.email === "admin@lostfound.com") {
        req.user = {
          id: "admin",
          name: "Administrator",
          email: "admin@lostfound.com",
          role: "admin",
        };
      } else {
        const user = await User.findById(decoded.id);
        if (user) req.user = user.toJSON();
      }
    }
  } catch (err) {
    // Ignore invalid optional token
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin privileges required" });
  }
  next();
};
