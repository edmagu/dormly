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
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");

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

//  Browse listings 

// GET /api/listings
router.get("/", (req, res) => {
  const listings = readJson(LISTINGS_FILE, []);

  // Basic filtering: ?ownerEmail=&minPrice=&maxPrice=&maxRenters=
  let results = listings;
  const { ownerEmail, minPrice, maxPrice, maxRenters } = req.query;

  if (ownerEmail) {
    results = results.filter((l) => l.ownerEmail === ownerEmail);
  }
  if (minPrice !== undefined) {
    const p = Number(minPrice);
    if (!Number.isNaN(p)) results = results.filter((l) => Number(l.price) >= p);
  }
  if (maxPrice !== undefined) {
    const p = Number(maxPrice);
    if (!Number.isNaN(p)) results = results.filter((l) => Number(l.price) <= p);
  }
  if (maxRenters !== undefined) {
    const m = Number(maxRenters);
    if (!Number.isNaN(m)) {
      results = results.filter((l) => !l.maxRenters || l.maxRenters <= m);
    }
  }

  res.json(results);
});

// GET /api/listings/:id
router.get("/:id", (req, res) => {
  const listings = readJson(LISTINGS_FILE, []);
  const listing = listings.find((l) => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  res.json(listing);
});

//  Landlord listing management 

// POST /api/listings (landlord only)
router.post("/", requireAuth, (req, res) => {
  const {
    title,
    description,
    price,
    address,
    ownerEmail,
    maxRenters,
    photos,
  } = req.body || {};

  if (!title || !price || !address || !ownerEmail) {
    return res.status(400).json({
      error: "title, price, address and ownerEmail are required",
    });
  }

  if (req.user.role !== "landlord") {
    return res.status(403).json({ error: "Only landlords can create listings" });
  }

  if (ownerEmail !== req.user.email) {
    return res.status(403).json({ error: "ownerEmail must match the authenticated landlord" });
  }

  const listings = readJson(LISTINGS_FILE, []);
  const id = `lst_${Date.now().toString(36)}`;
  const listing = {
    id,
    title,
    description: description || "",
    price,
    address,
    ownerEmail,
    maxRenters: typeof maxRenters === "number" ? maxRenters : null,
    photos: Array.isArray(photos) ? photos : typeof photos === "string" && photos ? [photos] : [],
    createdAt: new Date().toISOString(),
  };
  listings.push(listing);
  writeJson(LISTINGS_FILE, listings);

  res.status(201).json(listing);
});

//  Applications 

// POST /api/listings/:id/applications (student only)
router.post("/:id/applications", requireAuth, (req, res) => {
  const { applicantEmail, message } = req.body || {};
  if (!applicantEmail) {
    return res.status(400).json({ error: "applicantEmail is required" });
  }

  // If the caller is authenticated, prefer their email
  if (req.user?.email) {
    if (applicantEmail && applicantEmail !== req.user.email) {
      return res.status(403).json({ error: "You can only apply as yourself" });
    }
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Only students can apply to listings" });
    }
  }

  const listings = readJson(LISTINGS_FILE, []);
  const listing = listings.find((l) => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });

  const applications = readJson(APPLICATIONS_FILE, []);
  const id = `app_${Date.now().toString(36)}`;
  const application = {
    id,
    listingId: listing.id,
    applicantEmail,
    message: message || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  applications.push(application);
  writeJson(APPLICATIONS_FILE, applications);

  res.status(201).json(application);
});

// GET /api/listings/:id/applications
router.get("/:id/applications", (req, res) => {
  const applications = readJson(APPLICATIONS_FILE, []);
  const forListing = applications.filter((a) => a.listingId === req.params.id);
  res.json(forListing);
});

//  Reviews 

// POST /api/listings/:id/reviews (auth required)
router.post("/:id/reviews", requireAuth, (req, res) => {
  const { reviewerEmail, rating, comment } = req.body || {};
  if (!reviewerEmail || typeof rating !== "number") {
    return res.status(400).json({ error: "reviewerEmail and numeric rating are required" });
  }

  const listings = readJson(LISTINGS_FILE, []);
  const listing = listings.find((l) => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });

  const reviews = readJson(REVIEWS_FILE, []);
  const id = `rev_${Date.now().toString(36)}`;
  const review = {
    id,
    listingId: listing.id,
    reviewerEmail,
    rating,
    comment: comment || "",
    createdAt: new Date().toISOString(),
  };
  reviews.push(review);
  writeJson(REVIEWS_FILE, reviews);

  res.status(201).json(review);
});

// GET /api/listings/:id/reviews
router.get("/:id/reviews", (req, res) => {
  const reviews = readJson(REVIEWS_FILE, []);
  const forListing = reviews.filter((r) => r.listingId === req.params.id);
  res.json(forListing);
});

export default router;
