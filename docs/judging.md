# HackFlow Judging Engine

The HackFlow Judging Engine provides a defensible, auditable, and isolated evaluation pipeline for hackathons. It is fully integrated into HackFlow's unified FastAPI backend, PostgreSQL database, and React frontend.

---

## 1. Architecture

```text
       React Frontend (:3000)
                 │  (Cookie-based session / Authorization header)
                 ▼
       FastAPI Backend (:8000)
          ├── /api/judge/me
          ├── /api/judge/rubric
          ├── /api/judge/projects
          ├── /api/judge/scores
          ├── /api/judge/progress
          └── /api/judge/projects/{id}/result
                 │  (SQLAlchemy ORM)
                 ▼
       PostgreSQL Database (:5432)
          ├── users & sessions
          ├── tracks & judge_assignments
          ├── projects & teams
          ├── scores
          └── audit_logs
```

- **Single Backend Runtime**: Runs entirely on port 8000 as part of the core FastAPI service.
- **Single Database**: All judging data (scores, assignments, comments, audit logs) is stored in the primary PostgreSQL database.
- **Unified Authentication**: Uses HackFlow's existing session token system (`Session` model with cookie/Bearer token support).

---

## 2. Judge Assignment Strategy

- **Track-Based Assignment**: Judges are assigned to specific evaluation tracks (`judge_assignments` table).
- **Access Boundary**: A judge can only view details and submit scores for projects within their assigned tracks.
- **Defensibility**: Projects are routed to judges with domain specialization for that track (e.g. Security, Developer Tools, Accessibility).
- **Isolation Enforcement**: Requests for projects outside assigned tracks return `403 Forbidden`.

---

## 3. Rubric Scoring

The scoring rubric uses three weighted dimensions on a scale of 0 to 5:

| Criterion | Weight | Max Score | Description |
|:---|:---:|:---:|:---|
| **Functionality** | 40% | 5.0 | Completeness, working demo, error handling, reliability |
| **Quality** | 30% | 5.0 | Code quality, architecture, UX/UI craftsmanship |
| **Innovation** | 30% | 5.0 | Originality, problem-solving approach, uniqueness |

### Weighted Score Formula

$$\text{Raw Score} = \frac{\sum \left( \frac{\text{score}_c}{\text{max\_score}_c} \times \text{weight}_c \right)}{\sum \text{weight}_c} \times 5.0$$

For standard criteria ($W = 40 + 30 + 30 = 100$):
$$\text{Raw Score} = 0.40 \times F + 0.30 \times Q + 0.30 \times I$$

---

## 4. Score Normalization Algorithm

To eliminate harsh-grader versus lenient-grader variance across judges, HackFlow computes a standardized normalized score:

1. **Judge Baseline Statistics**:
   For each judge $j$, compute their personal mean $\mu_j$ and standard deviation $\sigma_j$ across all scores they submitted:
   $$\mu_j = \frac{1}{N_j} \sum_{k=1}^{N_j} s_{j,k}, \quad \sigma_j = \sqrt{\frac{1}{N_j} \sum_{k=1}^{N_j} (s_{j,k} - \mu_j)^2}$$

2. **Standardization & Scaling**:
   Center each score at $2.5$ and scale by $0.75 \sigma$:
   $$z = 2.5 + \left( \frac{s - \mu_j}{\sigma_j} \right) \times 0.75 \quad (\text{or } 2.5 \text{ if } \sigma_j = 0)$$

3. **Bounding**:
   $$\text{Normalized Score} = \text{clamp}(z, 0.0, 5.0)$$

4. **Aggregate Project Score**:
   The final project result includes both `raw_average` and `normalized_average` across all reviewing judges.

---

## 5. Security & Isolation

- **Judge Role Enforcement**: Endpoints under `/api/judge/*` enforce `require_judge`. Non-judges (e.g. participants) receive `403 Forbidden`.
- **Peer Score Isolation**:
  - `GET /api/judge/scores` returns only the authenticated judge's own scores.
  - When queried with a peer identifier (e.g. `GET /api/judge/scores?judge=judge_a`), if the requested judge does not match the authenticated session, the server rejects the request with `403 Forbidden`.
- **Participant Access Blocked**: Participants cannot view judging scores, ensuring blind evaluation during the event.

---

## 6. Audit Trail

Every scoring event and track-level comment creates an immutable entry in PostgreSQL `audit_logs`:

- `user_id`: Authenticated judge identifier (e.g. `jdg_08`)
- `action`: `score_upsert`, `score_update`, or `track_comment`
- `target_type`: `score` or `judge_comment`
- `target_id`: Identifies the affected resource (e.g. `jdg_08:prj_15`)
- `details`: JSON payload with criteria values or metadata
- `created_at`: UTC timestamp of the action

---

## 7. Organizer CSV Export

Organizers can export judging data via `GET /api/export.csv` (or `GET /api/events/{event_id}/export.csv`), yielding RFC 4180 compliant CSV output including:
- Event ID & Name
- Project ID & Title
- Team Name & Track
- Judge ID & Name
- Functionality, Quality, Innovation, Total Score, and Judge Comments
