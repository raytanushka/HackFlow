import express from "express";
import crypto from "node:crypto";
import { db, nowIso } from "../db/database.js";
import { requireAuth, requireRole, logAudit } from "../middleware/auth.js";
import {
  getRubric, getJudgeProjects, getJudgeScores, getMyScore,
  saveJudgeScore, getJudgeProgress, getProjectResults
} from "../services/judging.service.js";

const router = express.Router();
router.use(requireAuth, requireRole("judge"));

router.get("/me", requireRole("judge"), (req, res) => {
  try {
    const judge = db.prepare(`
      SELECT
        id,
        name,
        email,
        role
      FROM users
      WHERE id = ?
    `).get(req.user.id);

    if (!judge) {
      return res.status(404).json({
        error: "Judge not found",
      });
    }

    const tracks = db.prepare(`
      SELECT
        t.id,
        t.name
      FROM judge_assignments ja
      JOIN tracks t
        ON t.id = ja.track_id
      WHERE ja.judge_id = ?
      ORDER BY t.name
    `).all(req.user.id);

    res.json({
      ...judge,
      tracks,
    });
  } catch (error) {
    console.error("Failed to load judge:", error);

    res.status(500).json({
      error: "Failed to load judge",
    });
  }
});

router.get("/rubric", (_req, res) => res.json(getRubric()));

router.get("/projects", requireRole("judge"), (req, res) => {
  try {
    const projects = db.prepare(`
      SELECT
        p.id,
        p.title,
        p.summary,
        p.repo_url,
        p.submitted_at,
        p.status,
        p.team_id,
        p.track_id,
        t.name AS track_name,
        tm.name AS team_name
      FROM projects p
      JOIN tracks t
        ON t.id = p.track_id
      JOIN teams tm
        ON tm.id = p.team_id
      ORDER BY t.name, p.title
    `).all();

    res.json(projects);
  } catch (error) {
    console.error("Failed to load judge projects:", error);

    res.status(500).json({
      error: "Failed to load judge projects",
    });
  }
});

router.get(
  "/projects/:projectId",
  requireRole("judge"),
  (req, res) => {
    try {
      const project = db.prepare(`
        SELECT
          p.id,
          p.title,
          p.summary,
          p.repo_url,
          p.submitted_at,
          p.status,
          p.team_id,
          p.track_id,
          t.name AS track_name,
          tm.name AS team_name
        FROM projects p
        JOIN tracks t
          ON t.id = p.track_id
        JOIN teams tm
          ON tm.id = p.team_id
        JOIN judge_assignments ja
          ON ja.track_id = p.track_id
        WHERE p.id = ?
          AND ja.judge_id = ?
      `).get(
        req.params.projectId,
        req.user.id
      );

      if (!project) {
        return res.status(404).json({
          error: "Project not found or not assigned to this judge",
        });
      }

      const members = db.prepare(`
        SELECT u.email
        FROM team_members tm
        JOIN users u
          ON u.id = tm.user_id
        WHERE tm.team_id = ?
      `).all(project.team_id);

      res.json({
        ...project,
        team: {
          id: project.team_id,
          name: project.team_name,
          members: members.map((member) => member.email),
        },
        track: project.track_name,
        repoUrl: project.repo_url,
      });
    } catch (error) {
      console.error("Failed to load judge project:", error);

      res.status(500).json({
        error: "Failed to load project",
      });
    }
  }
);

router.get("/scores", (req, res) => {
  // Critical T2 isolation rule: identity comes from the authenticated session.
  // A judge cannot request another judge's scores by query parameter.
  if (req.query.judge && String(req.query.judge) !== req.user.id) {
    return res.status(403).json({ error: "Judges may only access their own scores" });
  }
  res.json(getJudgeScores(req.user.id));
});

router.get("/scores/:projectId", (req, res) => {
  const project = db.prepare("SELECT track_id FROM projects WHERE id=?").get(req.params.projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });
  const assigned = db.prepare("SELECT 1 FROM judge_assignments WHERE judge_id=? AND track_id=?").get(req.user.id, project.track_id);
  if (!assigned) return res.status(403).json({ error: "Project is not assigned to this judge" });
  const score = getMyScore(req.user.id, req.params.projectId);
  res.json(score);
});

router.post("/scores", (req, res) => {
  const { projectId, criteria, comment } = req.body || {};
  if (!projectId) return res.status(400).json({ error: "projectId is required" });
  try {
    const score = saveJudgeScore(req.user.id, projectId, criteria, comment, getRubric());
    logAudit(req, "score_upsert", "score", `${req.user.id}:${projectId}`, { projectId });
    res.json(score);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.put("/scores/:projectId", (req, res) => {
  const { criteria, comment } = req.body || {};
  try {
    const score = saveJudgeScore(req.user.id, req.params.projectId, criteria, comment, getRubric());
    logAudit(req, "score_update", "score", `${req.user.id}:${req.params.projectId}`, { projectId: req.params.projectId });
    res.json(score);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});


router.get("/tracks/:trackId/comments", (req, res) => {
  const assigned = db.prepare("SELECT 1 FROM judge_assignments WHERE judge_id=? AND track_id=?").get(req.user.id, req.params.trackId);
  if (!assigned) return res.status(403).json({ error: "Track is not assigned to this judge" });
  const comments = db.prepare(`SELECT id, judge_id, track_id, comment, created_at FROM judge_comments WHERE track_id=? ORDER BY created_at DESC`).all(req.params.trackId);
  res.json(comments);
});

router.post("/tracks/:trackId/comments", (req, res) => {
  const assigned = db.prepare("SELECT 1 FROM judge_assignments WHERE judge_id=? AND track_id=?").get(req.user.id, req.params.trackId);
  if (!assigned) return res.status(403).json({ error: "Track is not assigned to this judge" });
  const comment = String(req.body?.comment || "").trim();
  if (!comment) return res.status(400).json({ error: "comment is required" });
  const row = { id: crypto.randomUUID(), judge_id: req.user.id, track_id: req.params.trackId, comment, created_at: nowIso() };
  db.prepare("INSERT INTO judge_comments (id,judge_id,track_id,comment,created_at) VALUES (?,?,?,?,?)").run(row.id,row.judge_id,row.track_id,row.comment,row.created_at);
  logAudit(req, "track_comment", "judge_comment", row.id, { trackId: row.track_id });
  res.status(201).json(row);
});

router.get("/progress", (req, res) => res.json(getJudgeProgress(req.user.id)));

router.get("/projects/:projectId/result", (req, res) => {
  const project = db.prepare("SELECT track_id FROM projects WHERE id=?").get(req.params.projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });
  const assigned = db.prepare("SELECT 1 FROM judge_assignments WHERE judge_id=? AND track_id=?").get(req.user.id, project.track_id);
  if (!assigned) return res.status(403).json({ error: "Project is not assigned to this judge" });
  res.json(getProjectResults(req.params.projectId));
});

export default router;
