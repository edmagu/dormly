import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { requireAuth } from "./authMiddleware.js";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function readUsers() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
  const raw = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(raw || "[]");
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

//  Registration 
// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body || {};

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "email, password, name and role are required" });
    }

    if (!["student", "landlord"].includes(role)) {
      return res.status(400).json({ error: "role must be 'student' or 'landlord'" });
    }

    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ error: "A user with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: `usr_${Date.now().toString(36)}`,
      email,
      name,
      role,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeUsers(users);

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register" });
  }
});

//  Login 
// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const users = readUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash || "");
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to login" });
  }
});

//  Current user 
// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  const users = readUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

//  Logout (stateless JWT) 
// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  // With stateless JWT there is nothing to invalidate server-side.
  res.status(204).end();
});

export default router;
