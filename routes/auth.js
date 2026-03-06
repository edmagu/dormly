import { Router } from "express";

const router = Router();

// ── Registration ─────────────────────────────────────────────────────
// POST /api/auth/register
router.post("/register", (req, res) => {
  // TODO: validate body { email, password, name, role }
  // TODO: hash password, store user, return token
  res.status(501).json({ error: "Not implemented" });
});

// ── Login ────────────────────────────────────────────────────────────
// POST /api/auth/login
router.post("/login", (req, res) => {
  // TODO: verify credentials, return JWT
  res.status(501).json({ error: "Not implemented" });
});

// ── Current user ─────────────────────────────────────────────────────
// GET /api/auth/me
router.get("/me", (req, res) => {
  // TODO: verify token from Authorization header, return user profile
  res.status(501).json({ error: "Not implemented" });
});

// ── Logout (optional, token-based) ──────────────────────────────────
// POST /api/auth/logout
router.post("/logout", (req, res) => {
  // TODO: invalidate token / clear cookie
  res.status(501).json({ error: "Not implemented" });
});

export default router;
