import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { requireAuth } from "./authMiddleware.js";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const PROFILES_FILE = path.join(DATA_DIR, "profiles.json");

function readProfiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PROFILES_FILE)) fs.writeFileSync(PROFILES_FILE, "[]");
  const raw = fs.readFileSync(PROFILES_FILE, "utf-8");
  return JSON.parse(raw || "[]");
}

function writeProfiles(list) {
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(list, null, 2));
}

//  Profile CRUD 

// GET /api/profiles/:userId
router.get("/:userId", (req, res) => {
  const profiles = readProfiles();
  const profile = profiles.find((p) => p.userId === req.params.userId);
  if (!profile) {
    return res.json({ userId: req.params.userId });
  }
  res.json(profile);
});

// PUT /api/profiles/:userId
router.put("/:userId", requireAuth, (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ error: "You can only update your own profile" });
  }

  const { bio, avatarUrl, phone, campus, preferences } = req.body || {};
  const profiles = readProfiles();
  const existing = profiles.find((p) => p.userId === req.params.userId);

  const updated = {
    ...(existing || {}),
    userId: req.params.userId,
    bio: bio ?? existing?.bio ?? "",
    avatarUrl: avatarUrl ?? existing?.avatarUrl ?? "",
    phone: phone ?? existing?.phone ?? "",
    campus: campus ?? existing?.campus ?? "",
    preferences: preferences ?? existing?.preferences ?? {},
    updatedAt: new Date().toISOString(),
  };

  if (!existing) profiles.push(updated);
  else {
    const idx = profiles.findIndex((p) => p.userId === req.params.userId);
    profiles[idx] = updated;
  }

  writeProfiles(profiles);
  res.json(updated);
});

//  Lifestyle quiz (for roommate matching) 

// POST /api/profiles/:userId/quiz
router.post("/:userId/quiz", requireAuth, (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({ error: "You can only update your own quiz" });
  }

  const profiles = readProfiles();
  const existing = profiles.find((p) => p.userId === req.params.userId) || { userId: req.params.userId };

  existing.quiz = { ...(existing.quiz || {}), ...(req.body || {}) };
  existing.updatedAt = new Date().toISOString();

  const idx = profiles.findIndex((p) => p.userId === req.params.userId);
  if (idx === -1) profiles.push(existing);
  else profiles[idx] = existing;

  writeProfiles(profiles);
  res.json(existing.quiz);
});

// GET /api/profiles/:userId/quiz
router.get("/:userId/quiz", (req, res) => {
  const profiles = readProfiles();
  const existing = profiles.find((p) => p.userId === req.params.userId);
  res.json(existing?.quiz || {});
});

export default router;
