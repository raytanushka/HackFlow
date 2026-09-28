import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { db, initializeDatabase, nowIso } from "./database.js";

initializeDatabase();

const fixturePath = path.resolve(process.cwd(), "fixtures.json");
if (!fs.existsSync(fixturePath)) throw new Error(`fixtures.json not found at ${fixturePath}`);
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

db.exec("BEGIN");
try {
  db.exec(`
    DELETE FROM judge_comments;
    DELETE FROM audit_logs;
    DELETE FROM scores;
    DELETE FROM rubric_criteria;
    DELETE FROM rubrics;
    DELETE FROM judge_assignments;
    DELETE FROM sessions;
    DELETE FROM projects;
    DELETE FROM team_members;
    DELETE FROM teams;
    DELETE FROM tracks;
    DELETE FROM events;
    DELETE FROM users;
  `);

  const insertEvent = db.prepare(`
    INSERT INTO events (id, name, description, submissions_open, submissions_close, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertEvent.run(
    fixture.event.id,
    fixture.event.name,
    "DOGFOOD 2026 fixture event",
    null,
    fixture.event.submissions_close,
    "closed"
  );

  const insertTrack = db.prepare("INSERT INTO tracks (id, event_id, name) VALUES (?, ?, ?)");
  for (const track of fixture.tracks) insertTrack.run(track.id, fixture.event.id, track.name);

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const salt = randomBytes(16).toString("hex");
  const passwordHash = `pbkdf2$${salt}$${pbkdf2Sync("password123", salt, 120000, 32, "sha256").toString("hex")}`;
  for (const judge of fixture.judges) {
    insertUser.run(judge.id, judge.name, judge.email, passwordHash, "judge", nowIso());
  }

  insertUser.run("usr_organizer", "HackFlow Organizer", "organizer@example.org", passwordHash, "organizer", nowIso());
  insertUser.run("usr_participant", "HackFlow Participant", "participant@example.org", passwordHash, "participant", nowIso());

  const insertTeam = db.prepare("INSERT INTO teams (id, event_id, name) VALUES (?, ?, ?)");
  const insertMember = db.prepare("INSERT INTO team_members (team_id, email) VALUES (?, ?)");
  for (const team of fixture.teams) {
    insertTeam.run(team.id, fixture.event.id, team.name);
    for (const email of team.members || []) insertMember.run(team.id, email);
  }

  const insertProject = db.prepare(`
    INSERT INTO projects (id, team_id, track_id, title, summary, repo_url, submitted_at, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')
  `);
  for (const project of fixture.projects) {
    insertProject.run(
      project.id,
      project.team,
      project.track,
      project.title,
      project.summary || "",
      project.repo_url || "",
      project.submitted_at || null
    );
  }

  const insertAssignment = db.prepare(
    "INSERT OR IGNORE INTO judge_assignments (judge_id, track_id) VALUES (?, ?)"
  );
  for (const judge of fixture.judges) {
    for (const trackId of judge.tracks || []) insertAssignment.run(judge.id, trackId);
  }

  const rubricId = "rubric_default";
  db.prepare("INSERT INTO rubrics (id, event_id, name) VALUES (?, ?, ?)")
    .run(rubricId, fixture.event.id, "Default judging rubric");
  const insertCriterion = db.prepare(`
    INSERT INTO rubric_criteria (id, rubric_id, name, weight, max_score)
    VALUES (?, ?, ?, ?, 5)
  `);
  insertCriterion.run("functionality", rubricId, "Functionality", 40);
  insertCriterion.run("quality", rubricId, "Quality", 30);
  insertCriterion.run("innovation", rubricId, "Innovation", 30);

  const insertScore = db.prepare(`
    INSERT OR REPLACE INTO scores
      (judge_id, project_id, criteria_json, comment, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const score of fixture.scores) {
    const t = nowIso();
    insertScore.run(
      score.judge,
      score.project,
      JSON.stringify(score.criteria || {}),
      score.comment || "",
      t,
      t
    );
  }

  const sessions = [
    ["sess_organizer", "usr_organizer", "org_7f2a"],
    ["sess_judge_a", "jdg_09", "jdg_a_91bc"],
    ["sess_judge_b", "jdg_01", "jdg_b_44de"],
    ["sess_participant", "usr_participant", "prt_2e88"],
  ];
  const insertSession = db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  for (const [id, userId, token] of sessions) insertSession.run(id, userId, token, expires, nowIso());

  // Additional demo login sessions are generated deterministically from user ids.
  for (const judge of fixture.judges) {
    const token = `seed_${judge.id}_${crypto.createHash("sha256").update(judge.id).digest("hex").slice(0, 12)}`;
    insertSession.run(`sess_${judge.id}`, judge.id, token, expires, nowIso());
  }
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
}

console.log("seeded. test logins:");
console.log("  organizer    Cookie: session=org_7f2a");
console.log("  judge_a      Cookie: session=jdg_a_91bc");
console.log("  judge_b      Cookie: session=jdg_b_44de");
console.log("  participant  Cookie: session=prt_2e88");
console.log("  judge_a user  = jdg_09 (Sofia Duarte)");
console.log("  judge_b user  = jdg_01 (Tomas Varga)");
console.log("  password for normal login = password123");
