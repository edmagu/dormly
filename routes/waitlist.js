import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();
const WAITLIST_FILE = path.join(__dirname, "..", "data", "waitlist.json");

// POST /api/waitlist — join the waitlist
router.post("/", (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required." });
  }
  if (!["student", "landowner"].includes(role)) {
    return res.status(400).json({ error: "Role must be 'student' or 'landowner'." });
  }

  const list = JSON.parse(fs.readFileSync(WAITLIST_FILE, "utf-8"));

  if (list.some((entry) => entry.email === email)) {
    return res.status(409).json({ error: "This email is already on the waitlist." });
  }

  list.push({ email, role, joinedAt: new Date().toISOString() });
  fs.writeFileSync(WAITLIST_FILE, JSON.stringify(list, null, 2));

  res.json({ message: "You're on the list! We'll reach out soon." });
});

// GET /api/waitlist — list entries (admin use)
router.get("/", (_req, res) => {
  const list = JSON.parse(fs.readFileSync(WAITLIST_FILE, "utf-8"));
  res.json(list);
});

export default router;
