const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body
        ? {
            "Content-Type": "application/json",
          }
        : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.error
        ? data.error
        : `Request failed: ${response.status}`;

    const error = new Error(message);
    error.status = response.status;

    throw error;
  }

  return data;
}

/* -------------------------------------------------------
   NORMALIZERS
------------------------------------------------------- */

function normalizeJudge(judge) {
  if (!judge) return null;

  return {
    ...judge,
    tracks: Array.isArray(judge.tracks) ? judge.tracks : [],
  };
}

function normalizeProject(project) {
  if (!project) return project;

  return {
    ...project,

    team: project.team ?? project.team_id,

    track: project.track ?? project.track_id,

    repo_url:
      project.repo_url ??
      project.repository_url ??
      project.repoUrl ??
      "",
  };
}

function normalizeScore(score) {
  if (!score) return null;

  return {
    ...score,

    judge: score.judge ?? score.judge_id,

    project: score.project ?? score.project_id,

    criteria: score.criteria || {},

    comment: score.comment || "",
  };
}

/* -------------------------------------------------------
   AUTH
------------------------------------------------------- */

export async function login(email, password) {
  return request("/api/auth/login", {
    method: "POST",

    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function logout() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser() {
  const result = await request("/api/auth/me");

  return result.user;
}

/* -------------------------------------------------------
   EVENT
------------------------------------------------------- */

export async function getEvent() {
  return request("/api/events/evt_01");
}

export async function getTracks() {
  return request("/api/events/evt_01/tracks");
}

/* -------------------------------------------------------
   TEAMS
------------------------------------------------------- */

export async function getTeams() {
  return request("/api/teams");
}

export async function getTeam(teamId) {
  return request(`/api/teams/${teamId}`);
}

/* -------------------------------------------------------
   PROJECTS
------------------------------------------------------- */

export async function getProjects() {
  const projects = await request("/projects");

  return Array.isArray(projects)
    ? projects.map(normalizeProject)
    : [];
}

export async function getProject(projectId) {
  const project = await request(`/projects/${projectId}`);

  return normalizeProject(project);
}

/* -------------------------------------------------------
   JUDGE
------------------------------------------------------- */

export async function getJudge() {
  const judge = await request("/api/judge/me");

  return normalizeJudge(judge);
}

/*
 * IMPORTANT:
 * This endpoint only returns projects assigned to
 * the currently authenticated judge.
 */
export async function getJudgeProjects() {
  const projects = await request("/api/judge/projects");

  return Array.isArray(projects)
    ? projects.map(normalizeProject)
    : [];
}

/*
 * Get one project from the authenticated judge's
 * already-authorized project list.
 *
 * This is intentionally NOT:
 *
 * GET /projects/:projectId
 *
 * because we don't want the evaluation page to
 * accidentally bypass judge assignment isolation.
 */
export async function getJudgeProject(projectId) {
  const projects = await getJudgeProjects();

  const project = projects.find(
    (item) => item.id === projectId
  );

  if (!project) {
    const error = new Error(
      "Project not found or not assigned to you."
    );

    error.status = 404;

    throw error;
  }

  return project;
}

/* -------------------------------------------------------
   RUBRIC
------------------------------------------------------- */

export async function getRubric() {
  return request("/api/judge/rubric");
}

/* -------------------------------------------------------
   SCORES
------------------------------------------------------- */

export async function getMyScore(_judgeId, projectId) {
  try {
    const score = await request(
      `/api/judge/scores/${projectId}`
    );

    return normalizeScore(score);
  } catch (error) {
    /*
     * No score yet is a normal situation.
     *
     * The evaluation page should still load so the
     * judge can create the first score.
     */
    if (error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getMyScores() {
  const scores = await request("/api/judge/scores");

  return Array.isArray(scores)
    ? scores.map(normalizeScore)
    : [];
}

export async function saveScore({
  judgeId: _judgeId,
  projectId,
  criteria,
  comment,
}) {
  const result = await request("/api/judge/scores", {
    method: "POST",

    body: JSON.stringify({
      projectId,
      criteria,
      comment: comment || "",
    }),
  });

  return normalizeScore(result);
}

/* -------------------------------------------------------
   TRACK COMMENTS
------------------------------------------------------- */

export async function getTrackComments(trackId) {
  return request(
    `/api/judge/tracks/${trackId}/comments`
  );
}

export async function addTrackComment({
  judgeId: _judgeId,
  trackId,
  comment,
}) {
  return request(
    `/api/judge/tracks/${trackId}/comments`,
    {
      method: "POST",

      body: JSON.stringify({
        comment,
      }),
    }
  );
}

/* -------------------------------------------------------
   JUDGE DASHBOARD / PROGRESS
------------------------------------------------------- */

export async function getDashboardStats() {
  return request("/api/judge/progress");
}

/* -------------------------------------------------------
   CSV
------------------------------------------------------- */

export async function exportMyScoresCsv() {
  const scores = await getMyScores();

  const rows = [
    [
      "Project ID",
      "Judge ID",
      "Criteria",
      "Comment",
    ],
  ];

  scores.forEach((score) => {
    rows.push([
      score.project || "",
      score.judge || "",
      JSON.stringify(score.criteria || {}),
      score.comment || "",
    ]);
  });

  const csv = rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");

          return `"${text.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "my-scores.csv";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/* -------------------------------------------------------
   EXPORT
------------------------------------------------------- */

export { API };