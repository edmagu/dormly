import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { requireAuth } from "./authMiddleware.js";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const CONVERSATIONS_FILE = path.join(DATA_DIR, "conversations.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

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

//  Conversations 

// GET /api/chat/conversations
// Returns conversations for the authenticated user with last message + unread count
router.get("/conversations", requireAuth, (req, res) => {
  const userId = req.user.id;

  const conversations = readJson(CONVERSATIONS_FILE, []);
  const messages = readJson(MESSAGES_FILE, []);

  const mine = conversations.filter(
    (c) => Array.isArray(c.participantIds) && c.participantIds.includes(userId)
  );

  const enriched = mine.map((c) => {
    const convMessages = messages.filter((m) => m.conversationId === c.id);
    convMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const lastMessage = convMessages[convMessages.length - 1] || null;
    const unreadCount = convMessages.filter(
      (m) => !Array.isArray(m.readBy) || !m.readBy.includes(userId)
    ).length;

    return {
      id: c.id,
      participantIds: c.participantIds,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            senderId: lastMessage.senderId,
            text: lastMessage.text,
            createdAt: lastMessage.createdAt,
          }
        : null,
      unreadCount,
    };
  });

  res.json(enriched);
});

// POST /api/chat/conversations
// body: { participantIds?: string[], targetUserId?: string }
router.post("/conversations", requireAuth, (req, res) => {
  const { participantIds = [], targetUserId } = req.body || {};
  const userId = req.user.id;

  let ids = Array.isArray(participantIds) ? participantIds.slice() : [];
  if (targetUserId) {
    ids = [userId, targetUserId];
  }

  if (!ids.includes(userId)) ids.push(userId);

  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length < 2) {
    return res.status(400).json({ error: "A conversation needs at least two participants" });
  }
  if (unique.length > 2) {
    return res.status(400).json({ error: "Only two-person conversations are supported for now" });
  }

  unique.sort();

  const conversations = readJson(CONVERSATIONS_FILE, []);

  const existing = conversations.find((c) => {
    const idsSorted = Array.isArray(c.participantIds) ? [...c.participantIds].sort() : [];
    if (idsSorted.length !== unique.length) return false;
    return idsSorted.every((id, idx) => id === unique[idx]);
  });

  if (existing) {
    return res.json(existing);
  }

  const now = new Date().toISOString();
  const conversation = {
    id: `c_${Date.now().toString(36)}`,
    participantIds: unique,
    createdAt: now,
    updatedAt: now,
  };

  conversations.push(conversation);
  writeJson(CONVERSATIONS_FILE, conversations);

  res.status(201).json(conversation);
});

//  Messages 

// GET /api/chat/conversations/:conversationId/messages
router.get("/conversations/:conversationId/messages", requireAuth, (req, res) => {
  const { before, limit } = req.query;
  const userId = req.user.id;

  const conversations = readJson(CONVERSATIONS_FILE, []);
  const messages = readJson(MESSAGES_FILE, []);

  const conversation = conversations.find((c) => c.id === req.params.conversationId);
  if (!conversation) return res.status(404).json({ error: "Conversation not found" });
  if (!conversation.participantIds.includes(userId)) {
    return res.status(403).json({ error: "You are not part of this conversation" });
  }

  let convMessages = messages.filter((m) => m.conversationId === conversation.id);
  convMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (before) {
    const beforeDate = new Date(before);
    if (!Number.isNaN(beforeDate.getTime())) {
      convMessages = convMessages.filter((m) => new Date(m.createdAt) < beforeDate);
    }
  }

  const limitNum = Math.min(Number(limit) || 50, 100);
  const sliced = convMessages.slice(-limitNum);

  res.json(sliced);
});

// POST /api/chat/conversations/:conversationId/messages
router.post("/conversations/:conversationId/messages", requireAuth, (req, res) => {
  const { text } = req.body || {};
  const userId = req.user.id;

  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: "text is required" });
  }

  const conversations = readJson(CONVERSATIONS_FILE, []);
  const messages = readJson(MESSAGES_FILE, []);

  const conversation = conversations.find((c) => c.id === req.params.conversationId);
  if (!conversation) return res.status(404).json({ error: "Conversation not found" });
  if (!conversation.participantIds.includes(userId)) {
    return res.status(403).json({ error: "You are not part of this conversation" });
  }

  const now = new Date().toISOString();
  const message = {
    id: `msg_${Date.now().toString(36)}`,
    conversationId: conversation.id,
    senderId: userId,
    text: String(text).trim(),
    createdAt: now,
    readBy: [userId],
  };

  messages.push(message);
  writeJson(MESSAGES_FILE, messages);

  const idx = conversations.findIndex((c) => c.id === conversation.id);
  if (idx !== -1) {
    conversations[idx] = { ...conversation, updatedAt: now };
    writeJson(CONVERSATIONS_FILE, conversations);
  }

  res.status(201).json(message);
});

//  Read receipts 

// POST /api/chat/conversations/:conversationId/read
router.post("/conversations/:conversationId/read", requireAuth, (req, res) => {
  const userId = req.user.id;

  const conversations = readJson(CONVERSATIONS_FILE, []);
  const messages = readJson(MESSAGES_FILE, []);

  const conversation = conversations.find((c) => c.id === req.params.conversationId);
  if (!conversation) return res.status(404).json({ error: "Conversation not found" });
  if (!conversation.participantIds.includes(userId)) {
    return res.status(403).json({ error: "You are not part of this conversation" });
  }

  let changed = false;
  for (const m of messages) {
    if (m.conversationId !== conversation.id) continue;
    if (!Array.isArray(m.readBy)) m.readBy = [];
    if (!m.readBy.includes(userId)) {
      m.readBy.push(userId);
      changed = true;
    }
  }

  if (changed) {
    writeJson(MESSAGES_FILE, messages);
  }

  res.status(204).end();
});

export default router;
