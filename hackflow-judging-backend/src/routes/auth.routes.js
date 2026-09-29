import express from "express";
import { pbkdf2Sync, timingSafeEqual } from "node:crypto";
import crypto from "node:crypto";
import { db, audit, nowIso } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";
import { config } from "../config/config.js";

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, id } = req.body || {};

  const normalizedEmail = String(email || "").trim().toLowerCase();
  const judgeId = String(id || "").trim();

  console.log("LOGIN EMAIL:", normalizedEmail);
  console.log("LOGIN ID:", judgeId);

  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(normalizedEmail);

  console.log("LOGIN USER:", {
    id: user?.id,
    name: user?.name,
    email: user?.email,
    role: user?.role,
  });

  if (!user) {
    console.log("❌ USER NOT FOUND");
    return res.status(401).json({
      error: "Invalid email or judge ID",
    });
  }

  console.log("DATABASE USER ID:", user.id);
  console.log("ENTERED JUDGE ID:", judgeId);

  if (user.id !== judgeId) {
    console.log("❌ JUDGE ID DOES NOT MATCH");
    return res.status(401).json({
      error: "Invalid email or judge ID",
    });
  }

  if (user.role !== "judge") {
    console.log("❌ USER IS NOT A JUDGE");
    return res.status(403).json({
      error: "This account is not a judge account",
    });
  }

  console.log("✅ JUDGE AUTHENTICATED:", user.name);

  const token = crypto.randomBytes(24).toString("hex");

  const expires = new Date(
    Date.now() + config.sessionTtlDays * 86400000
  ).toISOString();

  db.prepare(`
    INSERT INTO sessions (
      id,
      user_id,
      token,
      expires_at,
      created_at
    )
    VALUES (?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    user.id,
    token,
    expires,
    nowIso()
  );

  res.setHeader(
    "Set-Cookie",
    `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${config.sessionTtlDays * 86400}`
  );

  audit(user.id, "login", "session", token);

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

router.post("/logout", requireAuth, (req, res) => {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(req.user.sessionToken);
  audit(req.user.id, "logout", "session", req.user.sessionToken);
  res.setHeader(
  "Set-Cookie",
  "session=; Path=/; HttpOnly; SameSite=None; Max-Age=0"
);
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

export default router;
