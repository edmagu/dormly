import { Router } from "express";

const router = Router();

// ── Profile CRUD ─────────────────────────────────────────────────────

// GET /api/profiles/:userId
router.get("/:userId", (req, res) => {
  // TODO: return user profile (name, bio, avatar, role, preferences)
  res.status(501).json({ error: "Not implemented" });
});

// PUT /api/profiles/:userId
router.put("/:userId", (req, res) => {
  // TODO: update profile fields (auth required, must be own profile)
  res.status(501).json({ error: "Not implemented" });
});

// ── Lifestyle quiz (for roommate matching) ───────────────────────────

// POST /api/profiles/:userId/quiz
router.post("/:userId/quiz", (req, res) => {
  // TODO: save lifestyle quiz answers
  // body: { sleepSchedule, noiseLevel, cleanliness, guests, smoking, pets, ... }
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/profiles/:userId/quiz
router.get("/:userId/quiz", (req, res) => {
  // TODO: return saved quiz answers
  res.status(501).json({ error: "Not implemented" });
});

export default router;
