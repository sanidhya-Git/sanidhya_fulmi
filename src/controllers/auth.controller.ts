// 📄 src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

import User from "../models/User";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env";

/**
 * 🛡️ Register Admin
 */
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // ✅ Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    // ✅ Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: "Email already exists" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create admin
    const admin = await User.create({
      name,
      email,
      password: hashedPassword, // ✅ Fixed field name
      role: "admin",
      isAdmin: true,
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err: any) {
    console.error("registerAdmin error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 👤 Register Normal User
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword, // ✅ Fixed
      role: "user",
      isAdmin: false,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("registerUser error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 🔐 Login (Admin or User)
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // ✅ Compare with hashed password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    // ✅ Safe JWT secret
    const secret = (JWT_SECRET || process.env.JWT_SECRET) as Secret;
    if (!secret) {
      return res.status(500).json({ success: false, error: "JWT secret not configured" });
    }

   const signOptions: jwt.SignOptions = {
  expiresIn: (JWT_EXPIRES_IN || "1d") as jwt.SignOptions["expiresIn"],
};


    const token = jwt.sign(
      { userId: user._id, role: user.role, isAdmin: user.role === "admin" },
      secret,
      signOptions
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        accessToken: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: user.role === "admin",
        },
      },
    });
  } catch (err: any) {
    console.error("login error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
