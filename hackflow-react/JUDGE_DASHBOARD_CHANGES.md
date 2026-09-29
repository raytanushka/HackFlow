# JudgeDashboard changes

The backend now owns judge identity. Remove the hardcoded:

```js
const CURRENT_JUDGE_ID = "jdg_09";
```

Then change these calls:

```js
getJudge(CURRENT_JUDGE_ID)       -> getJudge()
getJudgeProjects(CURRENT_JUDGE_ID) -> getJudgeProjects()
getMyScores(CURRENT_JUDGE_ID)   -> getMyScores()
```

For comments:

```js
addTrackComment({
  judgeId: CURRENT_JUDGE_ID,
  trackId: activeTrack,
  comment: trackComment.trim(),
})
```

becomes:

```js
addTrackComment({
  trackId: activeTrack,
  comment: trackComment.trim(),
})
```

For export:

```js
exportMyScoresCsv(CURRENT_JUDGE_ID)
```

becomes:

```js
exportMyScoresCsv()
```

The service accepts the old extra judgeId argument too, so these changes are recommended but not strictly required.

## Login

Before opening `/judge/dashboard`, the user must authenticate through:

```js
await login(email, password);
```

The backend sets an HttpOnly `session` cookie. Do not store that cookie/token in localStorage.

Seeded judge credentials use password `password123`. Example judge:

```text
email: tomas.varga@example.org
password: password123
```

Other seeded judge emails are in fixtures.json.
