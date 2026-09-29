import express from "express";
import { db } from "../db/database.js";

const router = express.Router();

// Get all teams
// Get all teams
router.get("/", (_req, res) => {
  try {
    const teams = db.prepare(`
      SELECT
        t.id,
        t.name,
        t.event_id,
        COUNT(tm.email) AS member_count
      FROM teams t
      LEFT JOIN team_members tm
        ON tm.team_id = t.id
      GROUP BY t.id, t.name, t.event_id
      ORDER BY t.name
    `).all();

    const getMembers = db.prepare(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role
      FROM team_members tm
      JOIN users u
        ON u.email = tm.email
      WHERE tm.team_id = ?
      ORDER BY u.name
    `);

    const teamsWithMembers = teams.map((team) => ({
      ...team,
      members: getMembers.all(team.id),
    }));

    res.json(teamsWithMembers);
  } catch (error) {
    console.error("Failed to load teams:", error);
    res.status(500).json({
      error: "Failed to load teams",
    });
  }
});

// Get one team with members
router.get("/:teamId", (req, res) => {
  try {
    const team = db.prepare(`
      SELECT
        t.id,
        t.name,
        t.event_id,
        COUNT(tm.email) AS member_count
      FROM teams t
      LEFT JOIN team_members tm
        ON tm.team_id = t.id
      WHERE t.id = ?
      GROUP BY t.id, t.name, t.event_id
    `).get(req.params.teamId);

    if (!team) {
      return res.status(404).json({
        error: "Team not found",
      });
    }

    const members = db.prepare(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role
      FROM team_members tm
      JOIN users u
        ON u.email = tm.email
      WHERE tm.team_id = ?
      ORDER BY u.name
    `).all(req.params.teamId);

    res.json({
      ...team,
      members,
    });
  } catch (error) {
    console.error("Failed to load team:", error);

    res.status(500).json({
      error: "Failed to load team",
    });
  }
});

export default router;