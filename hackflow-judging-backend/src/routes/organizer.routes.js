import express from "express";
import { db } from "../db/database.js";
import { requireAuth, requireRole, logAudit } from "../middleware/auth.js";
import { getAllJudgeProgress, getRubric, getProjectResults } from "../services/judging.service.js";

const router = express.Router();
router.use(requireAuth, requireRole("organizer", "admin"));

router.get("/dashboard", (_req, res) => {
  const event = db.prepare("SELECT * FROM events ORDER BY id LIMIT 1").get();
  const judges = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role='judge'").get().count;
  const projects = db.prepare("SELECT COUNT(*) AS count FROM projects").get().count;
  const scores = db.prepare("SELECT COUNT(*) AS count FROM scores").get().count;
  res.json({ event, judges, projects, scores, progress: getAllJudgeProgress(), rubric: getRubric(event?.id) });
});

router.get("/progress", (_req, res) => res.json(getAllJudgeProgress()));


router.post("/judges/invite", (req, res) => {
  const { name, email, tracks = [] } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: "name and email are required" });
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.prepare("SELECT id, name, email, role FROM users WHERE email=?").get(normalizedEmail);
  const judgeId = existing?.id || `jdg_${Date.now()}`;
  if (existing && existing.role !== "judge") return res.status(409).json({ error: "Email belongs to a non-judge user" });
  if (!existing) {
    db.prepare(`INSERT INTO users (id,name,email,password_hash,role,created_at) VALUES (?,?,?,?,?,?)`)
      .run(judgeId, name, normalizedEmail, null, "judge", new Date().toISOString());
  }
  for (const trackId of tracks) {
    if (db.prepare("SELECT id FROM tracks WHERE id=?").get(trackId)) {
      db.prepare("INSERT OR IGNORE INTO judge_assignments (judge_id,track_id) VALUES (?,?)").run(judgeId, trackId);
    }
  }
  logAudit(req, "judge_invite", "user", judgeId, { email: normalizedEmail, tracks });
  res.status(existing ? 200 : 201).json({ id: judgeId, name, email: normalizedEmail, role: "judge", tracks });
});

router.put("/rubric", (req, res) => {
  const { criteria } = req.body || {};
  if (!Array.isArray(criteria) || !criteria.length) return res.status(400).json({ error: "criteria array is required" });
  const total = criteria.reduce((sum, c) => sum + Number(c.weight), 0);
  if (!Number.isFinite(total) || total <= 0) return res.status(400).json({ error: "Rubric weights must total more than zero" });
  const rubric = db.prepare("SELECT id FROM rubrics ORDER BY rowid LIMIT 1").get();
  if (!rubric) return res.status(404).json({ error: "Rubric not found" });
  const update = db.prepare("UPDATE rubric_criteria SET name=?, weight=?, max_score=? WHERE id=? AND rubric_id=?");
  for (const c of criteria) update.run(c.name || c.id, Number(c.weight), Number(c.maxScore || 5), c.id, rubric.id);
  logAudit(req, "rubric_update", "rubric", rubric.id, { criteria });
  res.json(getRubric());
});

router.get("/results", (_req, res) => {
  const rows = db.prepare("SELECT id,title FROM projects ORDER BY id").all();
  res.json(rows.map(p => ({ project: p, result: getProjectResults(p.id) })));
});

router.get("/judges", (_req, res) => {
  const judges = db.prepare(`
    SELECT u.id, u.name, u.email,
      GROUP_CONCAT(t.name, ', ') AS tracks
    FROM users u
    LEFT JOIN judge_assignments ja ON ja.judge_id=u.id
    LEFT JOIN tracks t ON t.id=ja.track_id
    WHERE u.role='judge'
    GROUP BY u.id ORDER BY u.name
  `).all();
  res.json(judges);
});

router.post("/judges/:judgeId/assign", (req, res) => {
  const { trackId } = req.body || {};
  const judge = db.prepare("SELECT id FROM users WHERE id=? AND role='judge'").get(req.params.judgeId);
  const track = db.prepare("SELECT id FROM tracks WHERE id=?").get(trackId);
  if (!judge || !track) return res.status(404).json({ error: "Judge or track not found" });
  db.prepare("INSERT OR IGNORE INTO judge_assignments (judge_id, track_id) VALUES (?, ?)").run(judge.id, track.id);
  logAudit(req, "judge_assign", "judge_assignment", `${judge.id}:${track.id}`, { judgeId: judge.id, trackId: track.id });
  res.json({ ok: true, judgeId: judge.id, trackId: track.id });
});

router.delete("/judges/:judgeId/assign/:trackId", (req, res) => {
  db.prepare("DELETE FROM judge_assignments WHERE judge_id=? AND track_id=?").run(req.params.judgeId, req.params.trackId);
  logAudit(req, "judge_unassign", "judge_assignment", `${req.params.judgeId}:${req.params.trackId}`);
  res.json({ ok: true });
});

router.get("/audit", (_req, res) => {
  const rows = db.prepare(`
    SELECT a.*, u.name AS user_name, u.role AS user_role
    FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id
    ORDER BY a.id DESC LIMIT 500
  `).all();
  res.json(rows.map(row => ({ ...row, metadata: JSON.parse(row.metadata_json || "{}") })));
});

export default router;
