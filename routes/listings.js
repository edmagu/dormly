import { Router } from "express";

const router = Router();

// ── Browse listings ──────────────────────────────────────────────────

// GET /api/listings
router.get("/", (req, res) => {
  // TODO: return paginated listings
  // query: page, limit, minPrice, maxPrice, beds, lat, lng, radius
  res.status(501).json({ error: "Not implemented" });
});

// GET /api/listings/:id
router.get("/:id", (req, res) => {
  // TODO: return single listing with full details
  res.status(501).json({ error: "Not implemented" });
});

// ── Landlord listing management ──────────────────────────────────────

// POST /api/listings
router.post("/", (req, res) => {
  // TODO: create listing (landlord auth required)
  // body: { title, description, price, address, lat, lng, beds, baths, photos, amenities }
  res.status(501).json({ error: "Not implemented" });
});

// PUT /api/listings/:id
router.put("/:id", (req, res) => {
  // TODO: update listing (owner auth required)
  res.status(501).json({ error: "Not implemented" });
});

// DELETE /api/listings/:id
router.delete("/:id", (req, res) => {
  // TODO: remove listing (owner auth required)
  res.status(501).json({ error: "Not implemented" });
});

// ── Commute scoring ─────────────────────────────────────────────────

// GET /api/listings/:id/commute?campusLat=...&campusLng=...
router.get("/:id/commute", (req, res) => {
  // TODO: compute walk / bike / bus / drive times from listing to campus
  // Return { walk: min, bike: min, bus: min, drive: min, score: 0-100 }
  res.status(501).json({ error: "Not implemented" });
});

// ── Saved / favourites ───────────────────────────────────────────────

// POST /api/listings/:id/save
router.post("/:id/save", (req, res) => {
  // TODO: add listing to user's saved list
  res.status(501).json({ error: "Not implemented" });
});

// DELETE /api/listings/:id/save
router.delete("/:id/save", (req, res) => {
  // TODO: remove listing from saved list
  res.status(501).json({ error: "Not implemented" });
});

export default router;
