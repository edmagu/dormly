import { Router } from "express";

const router = Router();

// ── Conversations ────────────────────────────────────────────────────

// GET /api/chat/conversations?userId=...
router.get("/conversations", (req, res) => {
  // TODO: return list of conversations for user (with last message preview)
  res.status(501).json({ error: "Not implemented" });
});

// POST /api/chat/conversations
router.post("/conversations", (req, res) => {
  // TODO: start a new conversation between two users
  // body: { participantIds: [userId1, userId2] }
  res.status(501).json({ error: "Not implemented" });
});

// ── Messages ─────────────────────────────────────────────────────────

// GET /api/chat/conversations/:conversationId/messages
router.get("/conversations/:conversationId/messages", (req, res) => {
  // TODO: return paginated messages for a conversation
  // query: before (cursor), limit
  res.status(501).json({ error: "Not implemented" });
});

// POST /api/chat/conversations/:conversationId/messages
router.post("/conversations/:conversationId/messages", (req, res) => {
  // TODO: send a message
  // body: { senderId, text }
  // Later: integrate WebSocket push for real-time delivery
  res.status(501).json({ error: "Not implemented" });
});

// ── Read receipts ────────────────────────────────────────────────────

// POST /api/chat/conversations/:conversationId/read
router.post("/conversations/:conversationId/read", (req, res) => {
  // TODO: mark conversation as read for userId
  res.status(501).json({ error: "Not implemented" });
});

export default router;
