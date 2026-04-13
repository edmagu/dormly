import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { requireAuth } from "./authMiddleware.js";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PROFILES_FILE = path.join(DATA_DIR, "profiles.json");
const LIKES_FILE = path.join(DATA_DIR, "matchLikes.json");
const PASSES_FILE = path.join(DATA_DIR, "matchPasses.json");
const CONNECTIONS_FILE = path.join(DATA_DIR, "connections.json");

function ensureFile(filePath, fallback) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(fallback));
}

function readJson(filePath, fallback) {
  ensureFile(filePath, fallback);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw || JSON.stringify(fallback));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function computeCompatibilityScore(aQuiz = {}, bQuiz = {}) {
  const keys = new Set([...Object.keys(aQuiz || {}), ...Object.keys(bQuiz || {})]);
  let total = 0;
  let matches = 0;

  for (const key of keys) {
    const a = aQuiz[key];
    const b = bQuiz[key];
    if (a == null && b == null) continue;
    total += 1;
    if (a !== undefined && b !== undefined && a === b) {
      matches += 1;
    }
  }

  if (total === 0) return 0;
  return matches / total;
}

//  Get matches 

// GET /api/matching/recommendations
// Returns a ranked list of potential roommates for the authenticated student
router.get("/recommendations", requireAuth, (req, res) => {
  const { limit, offset } = req.query;
  const limitNum = Math.min(Number(limit) || 20, 50);
  const offsetNum = Number(offset) || 0;

  const users = readJson(USERS_FILE, []);
  const profiles = readJson(PROFILES_FILE, []);
  const likes = readJson(LIKES_FILE, []);
  const passes = readJson(PASSES_FILE, []);
  const connections = readJson(CONNECTIONS_FILE, []);

  const me = users.find((u) => u.id === req.user.id);
  if (!me) {
    return res.status(404).json({ error: "User not found" });
  }
  if (me.role !== "student") {
    return res.status(403).json({ error: "Matching is only available for students" });
  }

  const myProfile = profiles.find((p) => p.userId === me.id);
  const myQuiz = myProfile?.quiz || {};

  const excludedTargets = new Set();
  likes.forEach((l) => {
    if (l.userId === me.id) excludedTargets.add(l.targetUserId);
  });
  passes.forEach((p) => {
    if (p.userId === me.id) excludedTargets.add(p.targetUserId);
  });

  const candidates = users.filter(
    (u) =>
      u.id !== me.id &&
      u.role === "student" &&
      !excludedTargets.has(u.id)
  );

  const scored = candidates
    .map((candidate) => {
      const profile = profiles.find((p) => p.userId === candidate.id) || {};
      const quiz = profile.quiz || {};
      const score = computeCompatibilityScore(myQuiz, quiz);
      const isConnected = connections.some(
        (c) => Array.isArray(c.userIds) && c.userIds.includes(me.id) && c.userIds.includes(candidate.id)
      );

      return {
        userId: candidate.id,
        name: candidate.name,
        email: candidate.email,
        role: candidate.role,
        score: Math.round(score * 100),
        profile: {
          campus: profile.campus || "",
          preferences: profile.preferences || {},
          quiz,
        },
        isConnected,
      };
    })
    .sort((a, b) => b.score - a.score);

  const paged = scored.slice(offsetNum, offsetNum + limitNum);

  res.json({
    userId: me.id,
    results: paged,
    total: scored.length,
  });
});

//  Match actions 

// POST /api/matching/like
// body: { targetUserId }
router.post("/like", requireAuth, (req, res) => {
  const { targetUserId } = req.body || {};
  const userId = req.user.id;

  if (!targetUserId) {
    return res.status(400).json({ error: "targetUserId is required" });
  }
  if (targetUserId === userId) {
    return res.status(400).json({ error: "You cannot like yourself" });
  }

  const users = readJson(USERS_FILE, []);
  const target = users.find((u) => u.id === targetUserId);
  if (!target) return res.status(404).json({ error: "Target user not found" });

  const likes = readJson(LIKES_FILE, []);
  const connections = readJson(CONNECTIONS_FILE, []);

  let existing = likes.find((l) => l.userId === userId && l.targetUserId === targetUserId);
  if (!existing) {
    existing = {
      id: `like_${Date.now().toString(36)}`,
      userId,
      targetUserId,
      createdAt: new Date().toISOString(),
    };
    likes.push(existing);
    writeJson(LIKES_FILE, likes);
  }

  const mutual = likes.some((l) => l.userId === targetUserId && l.targetUserId === userId);

  let connection = connections.find(
    (c) => Array.isArray(c.userIds) && c.userIds.includes(userId) && c.userIds.includes(targetUserId)
  );

  if (mutual && !connection) {
    const userIds = [userId, targetUserId].sort();
    connection = {
      id: `conn_${Date.now().toString(36)}`,
      userIds,
      createdAt: new Date().toISOString(),
    };
    connections.push(connection);
    writeJson(CONNECTIONS_FILE, connections);
  }

  res.status(201).json({ liked: true, isMutual: mutual, connection: connection || null });
});

// POST /api/matching/pass
// body: { targetUserId }
router.post("/pass", requireAuth, (req, res) => {
  const { targetUserId } = req.body || {};
  const userId = req.user.id;

  if (!targetUserId) {
    return res.status(400).json({ error: "targetUserId is required" });
  }
  if (targetUserId === userId) {
    return res.status(400).json({ error: "You cannot pass on yourself" });
  }

  const users = readJson(USERS_FILE, []);
  const target = users.find((u) => u.id === targetUserId);
  if (!target) return res.status(404).json({ error: "Target user not found" });

  const likes = readJson(LIKES_FILE, []);
  const passes = readJson(PASSES_FILE, []);

  let existing = passes.find((p) => p.userId === userId && p.targetUserId === targetUserId);
  if (!existing) {
    existing = {
      id: `pass_${Date.now().toString(36)}`,
      userId,
      targetUserId,
      createdAt: new Date().toISOString(),
    };
    passes.push(existing);
  }

  // Remove any like in the same direction when user passes
  const filteredLikes = likes.filter(
    (l) => !(l.userId === userId && l.targetUserId === targetUserId)
  );

  writeJson(LIKES_FILE, filteredLikes);
  writeJson(PASSES_FILE, passes);

  res.status(201).json({ passed: true });
});

// GET /api/matching/connections
// Returns mutual matches for the authenticated user
router.get("/connections", requireAuth, (req, res) => {
  const userId = req.user.id;

  const users = readJson(USERS_FILE, []);
  const connections = readJson(CONNECTIONS_FILE, []);

  const mine = connections.filter(
    (c) => Array.isArray(c.userIds) && c.userIds.includes(userId)
  );

  const results = mine.map((c) => {
    const otherId = c.userIds.find((id) => id !== userId) || userId;
    const other = users.find((u) => u.id === otherId) || null;
    return {
      id: c.id,
      createdAt: c.createdAt,
      user: other
        ? { id: other.id, email: other.email, name: other.name, role: other.role }
        : null,
    };
  });

  res.json(results);
});

export default router;
