# Frontend Integration

Keep the existing `src/services/hackflowApi.js` function names. Replace its fixture/localStorage implementation with `fetch()` calls to this backend.

Set:

```env
VITE_API_BASE_URL=http://localhost:8787
```

## Judge calls

```text
getJudge()              GET /api/judge/me
getTracks()             GET /api/events/evt_01/tracks
getJudgeProjects()      GET /api/judge/projects
getRubric()             GET /api/judge/rubric
getMyScores()           GET /api/judge/scores
getMyScore(id)          GET /api/judge/scores/:projectId
saveScore()             POST /api/judge/scores
addTrackComment()       POST /api/judge/tracks/:trackId/comments
getDashboardStats()     GET /api/judge/progress
exportMyScoresCsv()     GET /api/judge/scores (or build a browser CSV from returned own scores)
```

All judge requests must send credentials:

```js
fetch(`${API}/api/judge/projects`, { credentials: "include" })
```

For score writes:

```js
fetch(`${API}/api/judge/scores`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ projectId, criteria, comment })
})
```

Do not send a judge ID as an authorization mechanism. The backend determines the judge from the session.
