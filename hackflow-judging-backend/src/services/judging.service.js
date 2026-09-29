import { db, nowIso } from "../db/database.js";
import crypto from "node:crypto";

export function getRubric(eventId = "evt_01") {
  const rubric = db.prepare("SELECT id, event_id, name FROM rubrics WHERE event_id = ?").get(eventId);
  if (!rubric) return null;
  rubric.criteria = db.prepare(`
    SELECT id, name, weight, max_score
    FROM rubric_criteria WHERE rubric_id = ? ORDER BY rowid
  `).all(rubric.id);
  return rubric;
}

export function validateCriteria(criteria, rubric) {
  if (!criteria || typeof criteria !== "object" || Array.isArray(criteria)) {
    return "criteria must be an object";
  }
  const ids = new Set(rubric.criteria.map(c => c.id));
  for (const criterion of rubric.criteria) {
    if (!(criterion.id in criteria)) return `Missing criterion: ${criterion.id}`;
    const value = Number(criteria[criterion.id]);
    if (!Number.isFinite(value) || value < 0 || value > Number(criterion.max_score)) {
      return `${criterion.id} must be between 0 and ${criterion.max_score}`;
    }
  }
  for (const key of Object.keys(criteria)) {
    if (!ids.has(key)) return `Unknown criterion: ${key}`;
  }
  return null;
}

export function calculateWeightedScore(criteria, rubric) {
  const totalWeight = rubric.criteria.reduce((sum, c) => sum + Number(c.weight), 0);
  if (totalWeight <= 0) throw new Error("Rubric weights must total more than zero");
  const weighted = rubric.criteria.reduce((sum, c) => {
    return sum + (Number(criteria[c.id]) / Number(c.max_score)) * Number(c.weight);
  }, 0);
  return Number(((weighted / totalWeight) * 5).toFixed(4));
}

export function getJudgeProjects(judgeId) {
  return db.prepare(`
    SELECT p.*, t.name AS track_name, tm.name AS team_name
    FROM projects p
    JOIN tracks t ON t.id = p.track_id
    JOIN teams tm ON tm.id = p.team_id
    JOIN judge_assignments ja ON ja.track_id = p.track_id
    WHERE ja.judge_id = ?
    ORDER BY p.submitted_at, p.id
  `).all(judgeId);
}

export function getJudgeScores(judgeId) {
  return db.prepare(`
    SELECT s.id, s.judge_id, s.project_id, s.criteria_json, s.comment,
           s.created_at, s.updated_at, p.title AS project_title
    FROM scores s JOIN projects p ON p.id = s.project_id
    WHERE s.judge_id = ? ORDER BY s.updated_at DESC
  `).all(judgeId).map(row => ({
    ...row,
    criteria: JSON.parse(row.criteria_json),
    criteria_json: undefined,
  }));
}

export function getMyScore(judgeId, projectId) {
  const row = db.prepare(`
    SELECT s.id, s.judge_id, s.project_id, s.criteria_json, s.comment,
           s.created_at, s.updated_at
    FROM scores s WHERE s.judge_id = ? AND s.project_id = ?
  `).get(judgeId, projectId);
  if (!row) return null;
  return { ...row, criteria: JSON.parse(row.criteria_json), criteria_json: undefined };
}

export function canJudgeProject(judgeId, projectId) {
  return Boolean(db.prepare(`
    SELECT 1 FROM projects p
    JOIN judge_assignments ja ON ja.track_id = p.track_id
    WHERE p.id = ? AND ja.judge_id = ?
  `).get(projectId, judgeId));
}

export function saveJudgeScore(judgeId, projectId, criteria, comment, rubric) {
  const error = validateCriteria(criteria, rubric);
  if (error) throw Object.assign(new Error(error), { status: 400 });
  if (!canJudgeProject(judgeId, projectId)) {
    throw Object.assign(new Error("Project is not assigned to this judge"), { status: 403 });
  }
  const existing = db.prepare("SELECT id, created_at FROM scores WHERE judge_id = ? AND project_id = ?")
    .get(judgeId, projectId);
  const timestamp = nowIso();
  if (existing) {
    db.prepare(`UPDATE scores SET criteria_json = ?, comment = ?, updated_at = ? WHERE id = ?`)
      .run(JSON.stringify(criteria), comment || "", timestamp, existing.id);
  } else {
    db.prepare(`INSERT INTO scores (judge_id, project_id, criteria_json, comment, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run(judgeId, projectId, JSON.stringify(criteria), comment || "", timestamp, timestamp);
  }
  return getMyScore(judgeId, projectId);
}

export function getJudgeProgress(judgeId) {
  const total = db.prepare(`
    SELECT COUNT(*) AS count FROM projects p
    JOIN judge_assignments ja ON ja.track_id = p.track_id
    WHERE ja.judge_id = ?
  `).get(judgeId).count;
  const scored = db.prepare(`
    SELECT COUNT(*) AS count FROM scores s
    JOIN projects p ON p.id = s.project_id
    JOIN judge_assignments ja ON ja.track_id = p.track_id AND ja.judge_id = s.judge_id
    WHERE s.judge_id = ?
  `).get(judgeId).count;
  return { total, scored, pending: Math.max(0, total - scored), percent: total ? Number((scored / total * 100).toFixed(2)) : 0 };
}

export function getAllJudgeProgress() {
  return db.prepare(`
    SELECT u.id, u.name,
      (SELECT COUNT(*) FROM projects p JOIN judge_assignments ja ON ja.track_id=p.track_id WHERE ja.judge_id=u.id) AS total,
      (SELECT COUNT(*) FROM scores s WHERE s.judge_id=u.id) AS scored
    FROM users u WHERE u.role='judge' ORDER BY u.name
  `).all().map(row => ({ ...row, pending: Math.max(0, row.total - row.scored), percent: row.total ? Number((row.scored / row.total * 100).toFixed(2)) : 0 }));
}

export function getProjectResults(projectId) {
  const rubric = getRubric();
  const rows = db.prepare("SELECT judge_id, criteria_json, comment, updated_at FROM scores WHERE project_id = ?").all(projectId);
  const scores = rows.map(row => {
    const criteria = JSON.parse(row.criteria_json);
    return { judge_id: row.judge_id, criteria, comment: row.comment, raw_score: calculateWeightedScore(criteria, rubric), updated_at: row.updated_at };
  });
  if (!scores.length) return { project_id: projectId, judge_count: 0, raw_average: null, normalized_average: null, scores: [] };
  const rawAverage = scores.reduce((s, x) => s + x.raw_score, 0) / scores.length;
  const byJudge = new Map();
  for (const score of scores) {
    const all = db.prepare("SELECT criteria_json FROM scores WHERE judge_id = ?").all(score.judge_id)
      .map(r => calculateWeightedScore(JSON.parse(r.criteria_json), rubric));
    const mean = all.reduce((s, x) => s + x, 0) / all.length;
    const variance = all.reduce((s, x) => s + (x - mean) ** 2, 0) / all.length;
    const sd = Math.sqrt(variance);
    byJudge.set(score.judge_id, { mean, sd });
  }
  // Normalization: each judge's score is centered at 2.5 and scaled by 0.75 SD,
  // then clipped to the 0..5 rubric range. This is intentionally documented and deterministic.
  const normalized = scores.map(score => {
    const stats = byJudge.get(score.judge_id);
    const value = stats.sd === 0 ? 2.5 : 2.5 + ((score.raw_score - stats.mean) / stats.sd) * 0.75;
    return { ...score, normalized_score: Number(Math.max(0, Math.min(5, value)).toFixed(4)) };
  });
  const normalizedAverage = normalized.reduce((s, x) => s + x.normalized_score, 0) / normalized.length;
  return {
    project_id: projectId,
    judge_count: scores.length,
    raw_average: Number(rawAverage.toFixed(4)),
    normalized_average: Number(normalizedAverage.toFixed(4)),
    scores: normalized,
  };
}
