import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { config } from "../config/config.js";


fs.mkdirSync(path.dirname(config.databaseFile), { recursive: true });

export const db = new DatabaseSync(config.databaseFile);
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      role TEXT NOT NULL CHECK (role IN ('visitor','participant','judge','organizer','admin')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      submissions_open TEXT,
      submissions_close TEXT,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS team_members (
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      PRIMARY KEY (team_id, email)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id),
      track_id TEXT NOT NULL REFERENCES tracks(id),
      title TEXT NOT NULL,
      summary TEXT DEFAULT '',
      repo_url TEXT DEFAULT '',
      submitted_at TEXT,
      status TEXT DEFAULT 'submitted'
    );

    CREATE TABLE IF NOT EXISTS judge_assignments (
      judge_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
      PRIMARY KEY (judge_id, track_id)
    );

    CREATE TABLE IF NOT EXISTS rubrics (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rubric_criteria (
      id TEXT PRIMARY KEY,
      rubric_id TEXT NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      weight REAL NOT NULL,
      max_score REAL NOT NULL DEFAULT 5
    );

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      judge_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      criteria_json TEXT NOT NULL,
      comment TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(judge_id, project_id)
    );

    CREATE TABLE IF NOT EXISTS judge_comments (
      id TEXT PRIMARY KEY,
      judge_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      resource_id TEXT,
      metadata_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_scores_judge ON scores(judge_id);
    CREATE INDEX IF NOT EXISTS idx_scores_project ON scores(project_id);
    CREATE INDEX IF NOT EXISTS idx_projects_track ON projects(track_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_judge ON judge_assignments(judge_id);
    CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
  `);
}

export function nowIso() {
  return new Date().toISOString();
}

export function audit(userId, action, resource, resourceId = null, metadata = {}) {
  db.prepare(`
    INSERT INTO audit_logs (user_id, action, resource, resource_id, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, action, resource, resourceId, JSON.stringify(metadata), nowIso());
}
