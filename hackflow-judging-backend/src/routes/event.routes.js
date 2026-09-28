import express from "express";
import { db } from "../db/database.js";
const router = express.Router();
router.get("/", (_req, res) => res.json(db.prepare("SELECT * FROM events ORDER BY id").all()));
router.get("/:eventId", (req, res) => {
  const event = db.prepare("SELECT * FROM events WHERE id=?").get(req.params.eventId);
  if (!event) return res.status(404).json({ error: "Event not found" });
  event.tracks = db.prepare("SELECT * FROM tracks WHERE event_id=? ORDER BY id").all(event.id);
  res.json(event);
});
router.get("/:eventId/tracks", (req, res) => res.json(db.prepare("SELECT * FROM tracks WHERE event_id=? ORDER BY id").all(req.params.eventId)));
export default router;
