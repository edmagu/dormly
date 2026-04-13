import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { requireAuth } from "./authMiddleware.js";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const LISTINGS_FILE = path.join(DATA_DIR, "listings.json");
const APPLICATIONS_FILE = path.join(DATA_DIR, "applications.json");

function readJson(filePath, fallback) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(fallback));
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw || JSON.stringify(fallback));
}

// Landlord dashboard  (userId is landlord email)

// GET /api/landlords/:userId/listings
router.get("/:userId/listings", requireAuth, (req, res) => {
  if (req.user.email !== req.params.userId) {
    return res.status(403).json({ error: "You can only view your own listings" });
  }

  const listings = readJson(LISTINGS_FILE, []);
  const mine = listings.filter((l) => l.ownerEmail === req.params.userId);
  res.json(mine);
});

// GET /api/landlords/:userId/applicants
router.get("/:userId/applicants", requireAuth, (req, res) => {
  if (req.user.email !== req.params.userId) {
    return res.status(403).json({ error: "You can only view your own applicants" });
  }

  const listings = readJson(LISTINGS_FILE, []);
  const applications = readJson(APPLICATIONS_FILE, []);
  const mine = listings.filter((l) => l.ownerEmail === req.params.userId).map((l) => l.id);
  const applicants = applications.filter((a) => mine.includes(a.listingId));
  res.json(applicants);
});

export default router;
