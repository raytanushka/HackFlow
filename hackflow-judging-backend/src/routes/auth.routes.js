import express from "express";
import { pbkdf2Sync, timingSafeEqual } from "node:crypto";
import crypto from "node:crypto";
import { db, audit, nowIso } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";
import { config } from "../config/config.js";

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(String(email || "").toLowerCase());
  const [scheme, salt, storedHex] = String(user?.password_hash || "").split("$");
  let validPassword = false;
  if (scheme === "pbkdf2" && salt && storedHex) {
    const derived = pbkdf2Sync(String(password || ""), salt, 120000, 32, "sha256");
    const stored = Buffer.from(storedHex, "hex");
    validPassword = stored.length === derived.length && timingSafeEqual(stored, derived);
  }
  if (!user || !validPassword) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = crypto.randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + config.sessionTtlDays * 86400000).toISOString();
  db.prepare("INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(crypto.randomUUID(), user.id, token, expires, nowIso());
  res.setHeader(
  "Set-Cookie",
  `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${config.sessionTtlDays * 86400}`
);
  audit(user.id, "login", "session", token);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post("/logout", requireAuth, (req, res) => {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(req.user.sessionToken);
  audit(req.user.id, "logout", "session", req.user.sessionToken);
  res.setHeader(
  "Set-Cookie",
  "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
);
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

export default router;
