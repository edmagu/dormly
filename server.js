/**
 * Dormly — Express API server
 * Single-file server with in-memory data (swap each store for a real DB later).
 * All routes match the fetch() calls in App.jsx.
 */

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const app         = express();
const PORT        = process.env.PORT || 3002;
const JWT_SECRET  = process.env.JWT_SECRET || "dormly-dev-secret-change-in-prod";

// ─── Persistence helpers ──────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readStore(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return []; }
}

function writeStore(name, data) {
  fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2));
}

function nextId(arr) {
  return arr.length === 0 ? 1 : Math.max(...arr.map(r => Number(r.id) || 0)) + 1;
}

// ─── Auth middleware ──────────────────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// WAITLIST  /api/waitlist
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/waitlist", (req, res) => {
  res.json(readStore("waitlist"));
});

app.post("/api/waitlist", (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ error: "email and role are required" });

  const list = readStore("waitlist");
  if (list.find(e => e.email === email)) {
    return res.status(409).json({ error: "You're already on the waitlist!" });
  }
  const entry = { id: nextId(list), email, role, createdAt: new Date().toISOString() };
  list.push(entry);
  writeStore("waitlist", list);
  res.status(201).json({ message: "You're on the waitlist — we'll be in touch!", entry });
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH  /api/auth
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ error: "email, password, and role are required" });

  const users = readStore("users");
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = { id: nextId(users), email, name: name || "", role, passwordHash: hash, createdAt: new Date().toISOString() };
  users.push(user);
  writeStore("users", users);

  const { passwordHash: _, ...safeUser } = user;
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ user: safeUser, token });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });

  const users = readStore("users");
  const user  = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: "No account found with that email." });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Incorrect password." });

  const { passwordHash: _, ...safeUser } = user;
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ user: safeUser, token });
});

app.get("/api/auth/me", auth, (req, res) => {
  const users   = readStore("users");
  const user    = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

// ─────────────────────────────────────────────────────────────────────────────
// LISTINGS  /api/listings
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/listings", (req, res) => {
  res.json(readStore("listings"));
});

app.get("/api/listings/:id", (req, res) => {
  const listing = readStore("listings").find(l => String(l.id) === req.params.id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  res.json(listing);
});

app.post("/api/listings", auth, (req, res) => {
  if (req.user.role !== "landlord") return res.status(403).json({ error: "Only landlords can create listings" });
  const { title, price, address, description, maxRenters, photos, ownerEmail } = req.body;
  if (!title || !price || !address) return res.status(400).json({ error: "title, price, and address are required" });

  const listings = readStore("listings");
  const listing  = {
    id: nextId(listings),
    title, price: Number(price), address,
    description: description || "",
    maxRenters:  maxRenters  ? Number(maxRenters) : null,
    photos:      Array.isArray(photos) ? photos : [],
    ownerEmail:  ownerEmail  || req.user.email,
    createdAt:   new Date().toISOString(),
  };
  listings.push(listing);
  writeStore("listings", listings);
  res.status(201).json(listing);
});

app.put("/api/listings/:id", auth, (req, res) => {
  const listings = readStore("listings");
  const idx      = listings.findIndex(l => String(l.id) === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Listing not found" });
  if (listings[idx].ownerEmail !== req.user.email && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  listings[idx] = { ...listings[idx], ...req.body, id: listings[idx].id };
  writeStore("listings", listings);
  res.json(listings[idx]);
});

app.delete("/api/listings/:id", auth, (req, res) => {
  let listings = readStore("listings");
  const listing = listings.find(l => String(l.id) === req.params.id);
  if (!listing) return res.status(404).json({ error: "Not found" });
  if (listing.ownerEmail !== req.user.email && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  listings = listings.filter(l => String(l.id) !== req.params.id);
  writeStore("listings", listings);
  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// MATCHING  /api/matching
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/matching/apply   — student applies to a listing
app.post("/api/matching/apply", auth, (req, res) => {
  const { listingId, message, applicantEmail } = req.body;
  if (!listingId) return res.status(400).json({ error: "listingId is required" });

  const applications = readStore("applications");
  const existing     = applications.find(a => a.listingId === Number(listingId) && a.applicantEmail === (applicantEmail || req.user.email));
  if (existing) return res.status(409).json({ error: "You have already applied to this listing." });

  const app_entry = {
    id:             nextId(applications),
    listingId:      Number(listingId),
    applicantEmail: applicantEmail || req.user.email,
    message:        message || "",
    status:         "pending",
    createdAt:      new Date().toISOString(),
  };
  applications.push(app_entry);
  writeStore("applications", applications);
  res.status(201).json(app_entry);
});

// GET /api/matching/applicants/:listingId   — landlord views applicants
app.get("/api/matching/applicants/:listingId", auth, (req, res) => {
  const applications = readStore("applications");
  const result = applications.filter(a => String(a.listingId) === req.params.listingId);
  res.json(result);
});

// GET /api/matching/applications/:email   — student views their applications
app.get("/api/matching/applications/:email", auth, (req, res) => {
  const applications = readStore("applications");
  res.json(applications.filter(a => a.applicantEmail === req.params.email));
});

// ─────────────────────────────────────────────────────────────────────────────
// PROFILES  /api/profiles
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/profiles/:email", (req, res) => {
  const profiles = readStore("profiles");
  const profile  = profiles.find(p => p.email === req.params.email);
  res.json(profile || {});
});

app.put("/api/profiles/:email", auth, (req, res) => {
  if (req.user.email !== req.params.email) return res.status(403).json({ error: "Forbidden" });
  const profiles = readStore("profiles");
  const idx      = profiles.findIndex(p => p.email === req.params.email);
  const updated  = { email: req.params.email, ...req.body, updatedAt: new Date().toISOString() };
  if (idx === -1) profiles.push(updated);
  else            profiles[idx] = updated;
  writeStore("profiles", profiles);
  res.json(updated);
});

// ─────────────────────────────────────────────────────────────────────────────
// LANDLORDS  /api/landlords
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/landlords", auth, (req, res) => {
  const users = readStore("users");
  res.json(users.filter(u => u.role === "landlord").map(({ passwordHash: _, ...u }) => u));
});

// ─────────────────────────────────────────────────────────────────────────────
// CHAT  /api/chat
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/chat/:roomId", auth, (req, res) => {
  const messages = readStore("messages");
  res.json(messages.filter(m => m.roomId === req.params.roomId));
});

app.post("/api/chat/:roomId", auth, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });
  const messages = readStore("messages");
  const msg = {
    id:        nextId(messages),
    roomId:    req.params.roomId,
    sender:    req.user.email,
    text,
    createdAt: new Date().toISOString(),
  };
  messages.push(msg);
  writeStore("messages", messages);
  res.status(201).json(msg);
});

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION STATIC SERVING
// ─────────────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.listen(PORT, () => {
  console.log(`\n  🏠  Dormly API running → http://localhost:${PORT}\n`);
});