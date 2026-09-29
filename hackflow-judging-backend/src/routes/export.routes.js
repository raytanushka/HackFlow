import express from "express";
import { db } from "../db/database.js";
import { requireAuth, requireRole, logAudit } from "../middleware/auth.js";
import { getRubric, calculateWeightedScore } from "../services/judging.service.js";

const router = express.Router();
router.get("/", requireAuth, requireRole("organizer", "admin"), (req, res) => {
  const rubric = getRubric();
  const scores = db.prepare(`
    SELECT s.judge_id, j.name AS judge_name, s.project_id, p.title AS project_title,
           tm.name AS team_name, tr.name AS track_name, s.criteria_json, s.comment, s.updated_at
    FROM scores s
    JOIN users j ON j.id=s.judge_id
    JOIN projects p ON p.id=s.project_id
    JOIN teams tm ON tm.id=p.team_id
    JOIN tracks tr ON tr.id=p.track_id
    ORDER BY p.id, j.name
  `).all();
  const header = ["Project","Team","Track","Judge","Functionality","Quality","Innovation","Raw Score","Comment","Updated At"];
  const rows = scores.map(s => {
    const c = JSON.parse(s.criteria_json);
    return [s.project_title, s.team_name, s.track_name, s.judge_name, c.functionality ?? "", c.quality ?? "", c.innovation ?? "", calculateWeightedScore(c, rubric), s.comment || "", s.updated_at];
  });
  const csv = [header, ...rows].map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  logAudit(req, "csv_export", "scores", null, { rows: rows.length });
  res.status(200).type("text/csv").set("Content-Disposition", 'attachment; filename="hackflow-judging-results.csv"').send(csv);
});
export default router;
