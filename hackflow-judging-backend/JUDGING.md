# HackFlow Judging Backend

## Judge assignment
Judges are assigned to tracks. A judge can only score projects belonging to an assigned track. The fixture's `judges[].tracks` values are loaded into `judge_assignments`.

## Rubric
The seeded demo rubric is:
- Functionality: 40%
- Quality: 30%
- Innovation: 30%

Each criterion is scored from 0 to 5. The weighted score is:

`5 * SUM((criterion_score / 5) * weight) / SUM(weights)`

The rubric is stored in SQLite and can be changed by organizer/admin APIs later without changing the score calculation code.

## Judge isolation
A judge's identity always comes from the authenticated session. `GET /api/judge/scores` ignores a requested peer identity unless it matches the authenticated judge; a mismatch returns `403`. Participants are rejected by role middleware with `403` and unauthenticated callers with `401`.

## Normalization
For the optional cross-judge normalization, each judge's raw project score distribution is converted using:

`normalized = clamp(2.5 + ((raw - judge_mean) / judge_standard_deviation) * 0.75, 0, 5)`

If a judge has zero standard deviation, their normalized score is 2.5. The project result reports both raw and normalized averages. This is deterministic and auditable; it does not expose peer judge scores through the judge API.

## Audit trail
Score creation/update, login/logout, judge assignment changes and organizer CSV exports are recorded in `audit_logs`.

## Fixture note
`fixtures.json` is input data, not the database schema. The seed process transforms it into relational SQLite tables. The fixture itself contains the event deadline, judge-track assignments, projects and existing scores.
