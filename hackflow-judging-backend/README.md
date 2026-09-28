# HackFlow Judging Backend

Offline-first Express + SQLite backend for the judge/judging portion of HackFlow.

## Run locally

```powershell
npm install
npm run seed
npm start
```

Server: `http://localhost:8787`

Seeded acceptance headers:

```text
organizer    Cookie: session=org_7f2a
judge_a      Cookie: session=jdg_a_91bc
judge_b      Cookie: session=jdg_b_44de
participant  Cookie: session=prt_2e88
```

Normal login also works with the seeded user emails and password `password123`.

## Main judge API

```text
GET  /api/judge/me
GET  /api/judge/rubric
GET  /api/judge/projects
GET  /api/judge/scores
GET  /api/judge/scores/:projectId
POST /api/judge/scores
PUT  /api/judge/scores/:projectId
GET  /api/judge/progress
GET  /api/judge/projects/:projectId/result
```

## Organizer API

```text
GET  /api/organizer/dashboard
GET  /api/organizer/progress
GET  /api/organizer/judges
POST /api/organizer/judges/:judgeId/assign
DELETE /api/organizer/judges/:judgeId/assign/:trackId
GET  /api/organizer/audit
GET  /api/export.csv/
```

## DOGFOOD acceptance

The backend implements the seven acceptance behaviors relevant to T1/T2: public gallery, fixture project visibility, closed submission rejection, judge-own-score access, peer-score rejection, participant blocking and organizer CSV export.

The route and authentication values are recorded in `.dogfood.toml`.
