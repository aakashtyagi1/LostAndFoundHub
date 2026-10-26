import express from "express";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { generateToken, authenticate } from "../middleware/auth.js";
import { memoryStore } from "../config/memoryStore.js";

const router = express.Router();

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

// Mock store for password reset OTPs in memory
const resetOtps = new Map();

// POST /api/auth/register (or /signup)
router.post(["/register", "/signup"], async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (isDbReady()) {
      try {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: "An account with this email already exists. Please log in.",
          });
        }

        const role = normalizedEmail === "admin@lostfound.com" ? "admin" : "user";
        const user = new User({
          name: name.trim(),
          email: normalizedEmail,
          password,
          phone: phone || "",
          role,
        });

        await user.save();

        const userData = user.toJSON();
        const token = generateToken(userData);

        return res.status(201).json({
          success: true,
          message: "Account created successfully!",
          token,
          user: userData,
        });
      } catch (dbErr) {
        console.warn("Register DB error, using memory store:", dbErr.message);
      }
    }

    // High performance fallback from memory store
    const existing = memoryStore.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    const role = normalizedEmail === "admin@lostfound.com" ? "admin" : "user";
    const user = memoryStore.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone || "",
      role,
    });

    const { password: _, ...userData } = user;
    const token = generateToken(userData);

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create account.",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Master administrator shortcut for college presentation
    if (normalizedEmail === "admin@lostfound.com" && password === "admin123") {
      const adminData = {
        name: "Campus Administrator",
        email: normalizedEmail,
        role: "admin",
        id: "admin-master",
      };
      const token = generateToken(adminData);

      return res.json({
        success: true,
        message: "Admin login successful!",
        token,
        user: adminData,
      });
    }

    if (isDbReady()) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user) {
          const isMatch = await user.comparePassword(password);
          if (isMatch) {
            const userData = user.toJSON();
            const token = generateToken(userData);
            return res.json({
              success: true,
              message: "Login successful!",
              token,
              user: userData,
            });
          }
        }
      } catch (dbErr) {
        console.warn("Login DB error, checking memory store:", dbErr.message);
      }
    }

    // Check memory store
    const memUser = memoryStore.findUserByEmail(normalizedEmail);
    if (memUser && memUser.password === password) {
      const { password: _, ...userData } = memUser;
      const token = generateToken(userData);
      return res.json({
        success: true,
        message: "Login successful!",
        token,
        user: userData,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password. Please check your credentials.",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to log in.",
    });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    resetOtps.set(normalizedEmail, { otp, expires: Date.now() + 15 * 60 * 1000 });

    console.log(`[PASSWORD RESET] OTP for ${normalizedEmail}: ${otp}`);

    return res.json({
      success: true,
      message: `Password reset instructions and verification code sent to ${normalizedEmail}.`,
      demoOtp: otp,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const stored = resetOtps.get(normalizedEmail);

    if (!stored || stored.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP code." });
    }

    if (Date.now() > stored.expires) {
      resetOtps.delete(normalizedEmail);
      return res.status(400).json({ success: false, message: "OTP code has expired. Request a new one." });
    }

    if (isDbReady()) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user) {
          user.password = password;
          await user.save();
        }
      } catch (dbErr) {
        // Fall back to memory
      }
    }

    const memUser = memoryStore.findUserByEmail(normalizedEmail);
    if (memUser) {
      memUser.password = password;
    }

    resetOtps.delete(normalizedEmail);

    return res.json({
      success: true,
      message: "Password has been successfully reset! You can now log in.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
