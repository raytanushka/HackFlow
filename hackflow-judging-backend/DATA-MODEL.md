# Judging Data Model

- `users`: role-bearing accounts.
- `sessions`: server-side session tokens used by the acceptance checker and normal login.
- `events`, `tracks`: event structure.
- `teams`, `team_members`, `projects`: submitted work.
- `judge_assignments`: judge-to-track isolation boundary.
- `rubrics`, `rubric_criteria`: organizer-controlled scoring configuration.
- `scores`: one score per judge/project, with criteria stored as JSON so rubric changes do not require schema changes.
- `audit_logs`: immutable operational history for judging actions.

The fixture's `scores` array is imported into `scores`; missing fixture score entries remain missing and therefore appear as pending work for the relevant judge.
