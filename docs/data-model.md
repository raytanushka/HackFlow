# HackFlow Data Model

HackFlow uses a normalized PostgreSQL relational database schema.

---

## Entity Relationship Overview

```text
               ┌──────────┐
               │  events  │
               └────┬─────┘
                    │ 1:N
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ tracks  │ │  teams  │ │ rubrics │
   └────┬────┘ └────┬────┘ └─────────┘
        │           │
        ├───────────┼───────────┐
        ▼           ▼           ▼
 ┌──────────────┐┌─────────┐┌──────────────┐
 │judge_assign  ││ projects││ team_members │
 └──────────────┘└────┬────┘└──────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
    ┌─────────┐               ┌─────────┐
    │ scores  │               │  votes  │
    └─────────┘               └─────────┘
```

---

## Tables

### `users`
- `id` (VARCHAR PK): e.g. `usr_organizer`, `jdg_08`, `prt_xxx`
- `name` (VARCHAR): User's full name
- `email` (VARCHAR UNIQUE): User's email address
- `role` (VARCHAR): `organizer`, `participant`, `judge`, `admin`
- `org_id` (VARCHAR NULL): Organizer ID if applicable

### `sessions`
- `token` (VARCHAR PK): Bearer / Cookie session token
- `user_id` (VARCHAR): References `users.id`
- `role` (VARCHAR): Session role cache

### `tracks`
- `id` (VARCHAR PK): Track ID (e.g. `trk_01`)
- `event_id` (VARCHAR): References `events.id`
- `name` (VARCHAR): Track display name

### `judge_assignments`
- `judge_id` (VARCHAR PK): References `users.id`
- `track_id` (VARCHAR PK): References `tracks.id`

### `projects`
- `id` (VARCHAR PK): Project ID (e.g. `prj_01`)
- `event_id` (VARCHAR): References `events.id`
- `team_id` (VARCHAR): References `teams.id`
- `track_id` (VARCHAR): References `tracks.id`
- `title` (VARCHAR): Project title
- `summary` (TEXT): One-line summary
- `repo_url` (VARCHAR NULL): Repository link
- `demo_url` (VARCHAR NULL): Demo link
- `submitted_at` (TIMESTAMP): Submission timestamp

### `scores`
- `id` (INTEGER PK AUTOINCREMENT)
- `judge_id` (VARCHAR): References `users.id`
- `project_id` (VARCHAR): References `projects.id`
- `functionality` (INTEGER): 0–5 score
- `quality` (INTEGER): 0–5 score
- `innovation` (INTEGER): 0–5 score
- `comment` (TEXT NULL): Judge commentary
- `created_at` (TIMESTAMP): Creation time
- `updated_at` (TIMESTAMP): Last updated time

### `judge_comments`
- `id` (VARCHAR PK): UUID
- `judge_id` (VARCHAR): References `users.id`
- `track_id` (VARCHAR): References `tracks.id`
- `comment` (TEXT): Track-level commentary
- `created_at` (TIMESTAMP): Creation time

### `audit_logs`
- `id` (INTEGER PK AUTOINCREMENT)
- `user_id` (VARCHAR NULL): Actor user ID
- `action` (VARCHAR): `score_upsert`, `score_update`, `vote_cast`, `track_comment`, etc.
- `target_type` (VARCHAR): `score`, `project`, `judge_comment`, etc.
- `target_id` (VARCHAR): Identifier of affected entity
- `details` (TEXT NULL): Contextual details / JSON payload
- `created_at` (TIMESTAMP): Event timestamp
