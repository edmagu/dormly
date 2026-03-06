import { Router } from "express";

const router = Router();

// ── Verification ─────────────────────────────────────────────────────

// POST /api/landlords/verify
router.post("/verify", (req, res) => {
  // TODO: submit verification request
  // body: { userId, documentType, documentUrl }
  // Kick off background check flow
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/landlords/:userId/status
router.get("/:userId/status", (req, res) => {
  // TODO: return verification status (pending | verified | rejected)
  res.status(501).json({ error: "Not implemented" });
});

// ── Landlord dashboard ───────────────────────────────────────────────

// GET /api/landlords/:userId/listings
router.get("/:userId/listings", (req, res) => {
  // TODO: return all listings owned by this landlord
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/landlords/:userId/stats
router.get("/:userId/stats", (req, res) => {
  // TODO: return dashboard stats (views, saves, inquiries)
  res.status(501).json({ error: "Not implemented" });
});

export default router;
