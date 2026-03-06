import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3002;
const DATA_DIR = path.join(__dirname, "data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json");

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(WAITLIST_FILE)) fs.writeFileSync(WAITLIST_FILE, "[]");

app.use(express.json());

// ── Waitlist endpoint ────────────────────────────────────────────────
app.post("/api/waitlist", (req, res) => {
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

// ── Health check ─────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── In production, serve the built frontend ──────────────────────────
if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.listen(PORT, () => {
  console.log(`Dormly API running → http://localhost:${PORT}`);
});
