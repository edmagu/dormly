import { Router } from "express";

const router = Router();

// ── Get matches ──────────────────────────────────────────────────────

// GET /api/matching/recommendations?userId=...
router.get("/recommendations", (req, res) => {
  // TODO: run compatibility algorithm on quiz answers
  // Return ranked list of potential roommates with match %
  // query: userId, limit, offset
  res.status(501).json({ error: "Not implemented" });
});

// ── Match actions ────────────────────────────────────────────────────

// POST /api/matching/like
router.post("/like", (req, res) => {
  // TODO: record that current user likes target user
  // body: { userId, targetUserId }
  // Check for mutual like → create connection
  res.status(501).json({ error: "Not implemented" });
});

// POST /api/matching/pass
router.post("/pass", (req, res) => {
  // TODO: record pass, exclude from future recommendations
  // body: { userId, targetUserId }
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/matching/connections?userId=...
router.get("/connections", (req, res) => {
  // TODO: return mutual matches (both liked each other)
  res.status(501).json({ error: "Not implemented" });
});

export default router;
