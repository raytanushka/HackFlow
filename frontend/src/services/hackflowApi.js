const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

async function request(path, options = {}) {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("hackflow_token") : null;
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && (data?.detail || data?.error)
        ? (data.detail || data.error)
        : `Request failed: ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

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
    repo_url: project.repo_url ?? project.repository_url ?? project.repoUrl ?? "",
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

export async function login(email, id) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, id }),
  });
}

export async function logout() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser() {
  const result = await request("/api/auth/me");
  return result.user || result;
}

export async function getEvent(eventId = "evt_01") {
  return request(`/api/events/${eventId}`);
}

export async function getTracks(eventId = "evt_01") {
  try {
    return await request(`/api/events/${eventId}/tracks`);
  } catch (err) {
    try {
      const evt = await getEvent(eventId);
      return evt?.tracks || [];
    } catch {
      return [];
    }
  }
}

export async function getTeams() {
  try {
    return await request("/api/teams");
  } catch {
    return [];
  }
}


export async function getTeam(teamId) {
  return request(`/api/teams/${teamId}`);
}

export async function getProjects() {
  const projects = await request("/projects");
  return Array.isArray(projects) ? projects.map(normalizeProject) : [];
}

export async function getProject(projectId) {
  const project = await request(`/projects/${projectId}`);
  return normalizeProject(project);
}

export async function getJudge() {
  const judge = await request("/api/judge/me");
  return normalizeJudge(judge);
}

export async function getJudgeProjects() {
  const projects = await request("/api/judge/projects");
  return Array.isArray(projects) ? projects.map(normalizeProject) : [];
}

export async function getJudgeProject(projectId) {
  try {
    const project = await request(`/api/judge/projects/${projectId}`);
    return normalizeProject(project);
  } catch (err) {
    // Fallback to finding in judge projects list
    const projects = await getJudgeProjects();
    const found = projects.find((item) => item.id === projectId);
    if (!found) {
      const error = new Error("Project not found or not assigned to you.");
      error.status = 404;
      throw error;
    }
    return found;
  }
}

export async function getRubric() {
  return request("/api/judge/rubric");
}

export async function getMyScore(_judgeId, projectId) {
  try {
    const score = await request(`/api/judge/scores/${projectId}`);
    return normalizeScore(score);
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getMyScores() {
  const scores = await request("/api/judge/scores");
  return Array.isArray(scores) ? scores.map(normalizeScore) : [];
}

export async function saveScore({ judgeId: _judgeId, projectId, criteria, comment }) {
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

export async function getTrackComments(trackId) {
  return request(`/api/judge/tracks/${trackId}/comments`);
}

export async function addTrackComment({ judgeId: _judgeId, trackId, comment }) {
  return request(`/api/judge/tracks/${trackId}/comments`, {
    method: "POST",
    body: JSON.stringify({ comment }),
  });
}

export async function getDashboardStats() {
  return request("/api/judge/progress");
}

export async function exportMyScoresCsv() {
  const scores = await getMyScores();
  const rows = [["Project ID", "Judge ID", "Functionality", "Quality", "Innovation", "Raw Score", "Comment"]];

  scores.forEach((score) => {
    const crit = score.criteria || {};
    const func = crit.functionality ?? "";
    const qual = crit.quality ?? "";
    const innov = crit.innovation ?? "";
    const raw = score.raw_score ?? "";
    rows.push([
      score.project || score.project_id || "",
      score.judge || score.judge_id || "",
      func,
      qual,
      innov,
      raw,
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

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "my-scores.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
