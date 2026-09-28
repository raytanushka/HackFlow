import express from "express";
import { db } from "../db/database.js";
import crypto from "node:crypto";
import { optionalAuth, requireAuth, requireRole, logAudit } from "../middleware/auth.js";

const router = express.Router();

router.get("/", (_req, res) => {
  const projects = db.prepare(`
    SELECT p.id, p.team_id AS team, p.track_id AS track, p.title, p.summary, p.repo_url, p.submitted_at,
           tm.name AS team_name, tr.name AS track_name
    FROM projects p JOIN teams tm ON tm.id=p.team_id JOIN tracks tr ON tr.id=p.track_id
    ORDER BY p.id
  `).all();
  res.json(projects);
});

router.get("/:projectId", (_req, res) => {
  const project = db.prepare(`
    SELECT p.*, tm.name AS team_name, tr.name AS track_name
    FROM projects p JOIN teams tm ON tm.id=p.team_id JOIN tracks tr ON tr.id=p.track_id
    WHERE p.id=?
  `).get(_req.params.projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

router.post("/new", optionalAuth, requireAuth, requireRole("participant", "organizer", "admin"), (req, res) => {
  const event = db.prepare("SELECT * FROM events ORDER BY id LIMIT 1").get();
  if (event?.submissions_close && new Date() >= new Date(event.submissions_close)) {
    return res.status(403).json({ error: "Submissions are closed" });
  }
  const { id, teamId, trackId, title, summary, repoUrl } = req.body || {};
  if (!teamId || !trackId || !title) return res.status(400).json({ error: "teamId, trackId and title are required" });
  const projectId = id || `prj_${Date.now()}`;
  db.prepare(`INSERT INTO projects (id, team_id, track_id, title, summary, repo_url, submitted_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')`).run(projectId, teamId, trackId, title, summary || "", repoUrl || "", new Date().toISOString());
  logAudit(req, "project_create", "project", projectId);
  res.status(201).json(db.prepare("SELECT * FROM projects WHERE id=?").get(projectId));
});

export default router;
