import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Code2, Bell, ChevronDown, ChevronRight, Search, ThumbsUp, FileText, GitBranch,
  Users, LayoutGrid, BarChart3, Accessibility, Shield, Leaf, HeartPulse,
  BookOpen, Cpu, Calendar, MapPin, Rocket, CheckCircle2, ArrowRight,
  ExternalLink, MessageSquare, Send, X, AlertCircle, RefreshCw, Check
} from "lucide-react";

const TRACK_CONFIGS = [
  { id: "trk_01", key: "developer tools", label: "Developer tools", icon: Code2, color: "#818CF8", bg: "rgba(129,140,248,0.14)" },
  { id: "trk_02", key: "data and analytics", label: "Data and analytics", icon: BarChart3, color: "#60A5FA", bg: "rgba(96,165,250,0.14)" },
  { id: "trk_03", key: "accessibility", label: "Accessibility", icon: Accessibility, color: "#34D399", bg: "rgba(52,211,153,0.14)" },
  { id: "trk_04", key: "security", label: "Security", icon: Shield, color: "#A78BFA", bg: "rgba(167,139,250,0.14)" },
  { id: "trk_05", key: "climate", label: "Climate", icon: Leaf, color: "#4ADE80", bg: "rgba(74,222,128,0.14)" },
  { id: "trk_06", key: "health", label: "Health", icon: HeartPulse, color: "#F472B6", bg: "rgba(244,114,182,0.14)" },
  { id: "trk_07", key: "education", label: "Education", icon: BookOpen, color: "#FBBF24", bg: "rgba(251,191,36,0.14)" },
  { id: "trk_08", key: "open hardware", label: "Open hardware", icon: Cpu, color: "#22D3EE", bg: "rgba(34,211,238,0.14)" },
];

const TRACK_MAP = Object.fromEntries(TRACK_CONFIGS.map((t) => [t.id, t]));

function resolveTrackMeta(trackId, trackName) {
  if (trackId && TRACK_MAP[trackId]) return TRACK_MAP[trackId];
  if (trackName) {
    const match = TRACK_CONFIGS.find(
      (t) => trackName.toLowerCase().includes(t.key) || t.label.toLowerCase() === trackName.toLowerCase()
    );
    if (match) return match;
  }
  return {
    id: trackId || "trk_gen",
    label: trackName || "General",
    icon: Code2,
    color: "#818CF8",
    bg: "rgba(129,140,248,0.14)"
  };
}

export default function ParticipantDashboard({
  user,
  onNavigate,
  onLogout,
  eventId: initialEventId
}) {
  const [currentUser, setCurrentUser] = useState(() => {
    if (user) return user;
    try {
      const saved = localStorage.getItem("hackflow_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [participantStatus, setParticipantStatus] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [votedMap, setVotedMap] = useState({});
  const [toast, setToast] = useState(null);

  // Filters & sorting
  const [activeTrack, setActiveTrack] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("ballot");

  // Selected project for details modal
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetailsLoading, setProjectDetailsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem("hackflow_token") || (currentUser && currentUser.token) || "";
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch Participant Status from backend
  const fetchStatus = useCallback(async (targetEventId) => {
    setLoading(true);
    setError("");
    try {
      const token = getAuthToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const evtParam = targetEventId ? `?event_id=${encodeURIComponent(targetEventId)}` : "";
      const res = await fetch(`http://localhost:8000/api/participant/status${evtParam}`, {
        method: "GET",
        headers,
        credentials: "include"
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Please log in to view your participant dashboard.");
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to load participant dashboard data.");
      }

      const data = await res.json();
      setParticipantStatus(data);
      if (data.user) {
        setCurrentUser((prev) => ({ ...prev, ...data.user }));
      }

      // Initialize votedMap from database truth
      const vMap = {};
      if (Array.isArray(data.voted_project_ids)) {
        data.voted_project_ids.forEach((pid) => {
          vMap[pid] = true;
        });
      }
      setVotedMap(vMap);

      return data;
    } catch (err) {
      setError(err.message || "Failed to connect to backend server.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.token]);

  // 2. Fetch Projects for current event with randomized ballot ordering
  const fetchProjects = useCallback(async (eventObj, userObj) => {
    if (!eventObj || !eventObj.id) return;
    setProjectsLoading(true);
    try {
      const token = getAuthToken();
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const seed = userObj?.id || currentUser?.id || "ballot_seed";
      const url = `http://localhost:8000/api/projects?event_id=${encodeURIComponent(eventObj.id)}&seed=${encodeURIComponent(seed)}`;
      const res = await fetch(url, { headers, credentials: "include" });

      if (res.ok) {
        const data = await res.json();
        setProjects(data);

        // Sync voted state
        const vMap = { ...votedMap };
        data.forEach((p) => {
          if (p.has_voted) vMap[p.id] = true;
        });
        setVotedMap(vMap);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setProjectsLoading(false);
    }
  }, [currentUser?.id, votedMap]);

  useEffect(() => {
    fetchStatus(initialEventId).then((status) => {
      if (status && status.event) {
        fetchProjects(status.event, status.user);
      }
    });
  }, [initialEventId]);

  // 3. Voting Action
  const handleVoteToggle = async (project, e) => {
    if (e) e.stopPropagation();
    const isCurrentlyVoted = !!votedMap[project.id];
    const isOwn = isProjectOwn(project);

    if (isOwn) {
      showToast("You cannot vote for your own project.", "error");
      return;
    }

    const token = getAuthToken();
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      if (isCurrentlyVoted) {
        // Retract vote
        const res = await fetch(`http://localhost:8000/api/projects/${project.id}/vote`, {
          method: "DELETE",
          headers,
          credentials: "include"
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.detail || "Failed to remove vote.");
        }
        setVotedMap((prev) => ({ ...prev, [project.id]: false }));
        showToast(`Vote retracted for "${project.title}".`, "info");
      } else {
        // Cast vote
        const res = await fetch(`http://localhost:8000/api/projects/${project.id}/vote`, {
          method: "POST",
          headers,
          credentials: "include"
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.detail || "Failed to cast vote.");
        }
        setVotedMap((prev) => ({ ...prev, [project.id]: true }));
        showToast(`Vote recorded for "${project.title}"!`, "success");
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // 4. Open Project Details Modal & Fetch Comments
  const handleOpenProjectDetails = async (projectId) => {
    setProjectDetailsLoading(true);
    setSelectedProject(null);
    setComments([]);
    setNewComment("");

    try {
      const token = getAuthToken();
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Fetch project details
      const pRes = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
        headers,
        credentials: "include"
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        setSelectedProject(pData);
      } else {
        // Fallback to local item
        const fallback = projects.find((p) => p.id === projectId);
        if (fallback) setSelectedProject(fallback);
      }

      // Fetch comments
      const cRes = await fetch(`http://localhost:8000/api/projects/${projectId}/comments`);
      if (cRes.ok) {
        const cData = await cRes.json();
        setComments(cData);
      }
    } catch (err) {
      console.error("Error opening project details:", err);
    } finally {
      setProjectDetailsLoading(false);
    }
  };

  // 5. Post a new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedProject) return;

    setCommentSubmitting(true);
    try {
      const token = getAuthToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8000/api/projects/${selectedProject.id}/comments`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to post comment.");
      }

      const commentObj = await res.json();
      setComments((prev) => [...prev, commentObj]);
      setNewComment("");
      showToast("Comment posted!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Helper: check if a project is participant's own
  const isProjectOwn = (project) => {
    if (!project) return false;
    if (participantStatus?.submission && participantStatus.submission.id === project.id) return true;
    if (participantStatus?.team && project.team_id === participantStatus.team.id) return true;
    if (project.is_own) return true;
    return false;
  };

  // Filter & sort visible projects
  const visibleProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = projects.filter((p) => {
      // Track filter
      if (activeTrack !== "all") {
        const trackMeta = resolveTrackMeta(p.track_id, p.track_name);
        const activeMeta = TRACK_CONFIGS.find((t) => t.id === activeTrack);
        if (activeMeta && trackMeta.key !== activeMeta.key && p.track_id !== activeTrack) {
          return false;
        }
      }
      // Search query
      if (!q) return true;
      const titleMatch = (p.title || "").toLowerCase().includes(q);
      const teamMatch = (p.team_name || "").toLowerCase().includes(q);
      const idMatch = (p.id || "").toLowerCase().includes(q);
      const trackMatch = (p.track_name || "").toLowerCase().includes(q);
      return titleMatch || teamMatch || idMatch || trackMatch;
    });

    const list = [...filtered];
    if (sortOption === "newest") {
      list.sort((a, b) => (b.submitted_at || "").localeCompare(a.submitted_at || ""));
    } else if (sortOption === "name") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortOption === "votes" && participantStatus?.event?.voting_status === "closed") {
      list.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
    }
    // "ballot" maintains the server-provided deterministic randomized ordering!
    return list;
  }, [projects, activeTrack, searchQuery, sortOption, participantStatus?.event?.voting_status]);

  const currentEvent = participantStatus?.event || {
    id: "evt_01",
    name: "Sample Hack 2026",
    voting_status: "open",
    is_submissions_open: false,
    submissions_close: "2026-03-01T18:00:00"
  };

  const participantTeamName = participantStatus?.team?.name || "No team assigned";
  const submissionStatus = participantStatus?.submission_status || "submissions_closed";
  const userSubmission = participantStatus?.submission;

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0F1115", display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#E8E6F0"
      }}>
        <div style={{ textAlign: "center" }}>
          <RefreshCw size={36} color="#7C5CFC" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 16, color: "#9A96AC", fontSize: 15 }}>Loading Participant Dashboard...</p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0F1115", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .top-grid { display: grid; grid-template-columns: 1fr minmax(0, 540px); gap: 20px; align-items: stretch; }
        @media (max-width: 1000px) { .top-grid { grid-template-columns: 1fr; } }
        .projects-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 1240px) { .projects-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 900px) { .projects-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 580px) { .projects-grid { grid-template-columns: 1fr; } }
        .pill-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: thin; scrollbar-color: #2A2E3A transparent; }
        .pill-row::-webkit-scrollbar { height: 6px; }
        .pill-row::-webkit-scrollbar-thumb { background: #2A2E3A; border-radius: 4px; }
        .toolbar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        .toolbar-search { position: relative; flex: 1; min-width: 180px; max-width: 320px; }
        @media (max-width: 700px) { .toolbar-search { max-width: none; } }
        .search-input {
          width: 100%; background: #14161C; border: 1px solid #262A34; border-radius: 9px;
          padding: 10px 38px 10px 14px; color: #E8E6F0; font-family: 'Inter', sans-serif; font-size: 13.5px; outline: none;
        }
        .search-input::placeholder { color: #5B5F6D; }
        .search-input:focus { border-color: #7C5CFC; }
        .sort-select {
          background: #14161C; border: 1px solid #262A34; border-radius: 9px; color: #C7C4D6;
          padding: 10px 12px; font-family: 'Inter', sans-serif; font-size: 13.5px; outline: none; cursor: pointer;
        }
        .sort-select:focus { border-color: #7C5CFC; }
        .link-btn { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; color: #9A96AC; text-decoration: none; cursor: pointer; }
        .link-btn:hover { color: #B8A9FD; }
        .card { transition: border-color 0.15s ease, transform 0.15s ease; cursor: pointer; }
        .card:hover { border-color: #3A3560; transform: translateY(-2px); }
        .hide-sm { }
        @media (max-width: 560px) { .hide-sm { display: none; } }
        .banner-row { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Floating Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === "error" ? "#7F1D1D" : toast.type === "info" ? "#1E293B" : "#14532D",
          border: `1px solid ${toast.type === "error" ? "#EF4444" : toast.type === "info" ? "#38BDF8" : "#22C55E"}`,
          color: "#FFFFFF", padding: "12px 20px", borderRadius: 10,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 10,
          fontSize: 14, fontWeight: 500, animation: "fadeIn 0.2s ease"
        }}>
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <div style={{ borderBottom: "1px solid #1D2029", padding: "16px 24px", background: "#0F1115", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div
            onClick={() => onNavigate && onNavigate("HackFlow Home")}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Code2 size={16} color="#0F1115" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18 }}>HackFlow</span>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative", display: "flex", cursor: "pointer" }}>
              <Bell size={18} color="#9A96AC" />
              <span style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: "#F87171", border: "1.5px solid #0F1115" }} />
            </div>

            {/* User Dropdown */}
            <div style={{ position: "relative" }}>
              <div
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: "rgba(124,92,252,0.25)",
                  border: "1px solid #7C5CFC", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 600, color: "#B8A9FD"
                }}>
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "P"}
                </div>
                <span className="hide-sm" style={{ fontSize: 14, fontWeight: 500 }}>
                  {currentUser?.name || "Participant"}
                </span>
                <ChevronDown size={14} color="#9A96AC" />
              </div>

              {userMenuOpen && (
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 10, width: 220,
                  background: "#161922", border: "1px solid #262A34", borderRadius: 10,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)", padding: 8, zIndex: 200
                }}>
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid #202430", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E6F0" }}>{currentUser?.name}</div>
                    <div style={{ fontSize: 11.5, color: "#9A96AC", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser?.email}</div>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); onNavigate && onNavigate("Hackathons Listing"); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                      background: "transparent", border: "none", color: "#C7C4D6", fontSize: 13,
                      borderRadius: 6, cursor: "pointer", textAlign: "left"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#202430")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Rocket size={14} /> Browse Hackathons
                  </button>
                  <button
                    onClick={() => { setUserMenuOpen(false); onLogout && onLogout(); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                      background: "transparent", border: "none", color: "#F87171", fontSize: 13,
                      borderRadius: 6, cursor: "pointer", textAlign: "left"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#202430")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px 80px" }}>
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: 12, padding: "14px 18px", color: "#FCA5A5", fontSize: 14,
            marginBottom: 20, display: "flex", alignItems: "center", gap: 10
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Welcome + Dynamic Current Hackathon Card */}
        <div className="top-grid" style={{ marginBottom: 24 }}>
          <div style={{ alignSelf: "center" }}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.015em" }}>
              Hello, {currentUser?.name ? currentUser.name.split(" ")[0] : "Participant"}!
            </h1>
            <p style={{ color: "#9A96AC", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 16px", maxWidth: 520 }}>
              Welcome to {currentEvent.name}. Explore other teams' projects, cast your community ballot, and collaborate with creators.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              <button
                onClick={() => onNavigate && onNavigate("Hackathons Listing")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(124, 92, 252, 0.15)",
                  border: "1px solid rgba(124, 92, 252, 0.35)",
                  color: "#B8A9FD",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124, 92, 252, 0.25)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(124, 92, 252, 0.15)")}
              >
                <Rocket size={15} /> Browse Hackathons
              </button>
            </div>
          </div>

          {/* Clickable Event Card */}
          <div
            onClick={() => onNavigate && onNavigate("Hackathon Detail", { eventId: currentEvent.id, name: currentEvent.name })}
            title="Click to view event details"
            style={{
              display: "flex", alignItems: "stretch", flexWrap: "wrap",
              background: "linear-gradient(135deg, #1B1440, #171A21)", border: "1px solid #2A2560", borderRadius: 14,
              cursor: "pointer", transition: "border-color 0.15s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7C5CFC"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2560"; e.currentTarget.style.transform = "none"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", flex: "1 1 260px" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(124,92,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Rocket size={24} color="#B8A9FD" />
              </div>
              <div>
                {currentEvent.voting_status === "open" ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#C084FC", background: "rgba(192,132,252,0.18)", padding: "3px 9px", borderRadius: 20 }}>
                    ● VOTING OPEN
                  </span>
                ) : currentEvent.is_submissions_open ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#4ADE80", background: "rgba(74,222,128,0.18)", padding: "3px 9px", borderRadius: 20 }}>
                    ● SUBMISSIONS OPEN
                  </span>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#9A96AC", background: "rgba(154,150,172,0.18)", padding: "3px 9px", borderRadius: 20 }}>
                    ● SUBMISSIONS CLOSED
                  </span>
                )}
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, margin: "6px 0 5px" }}>
                  {currentEvent.name}
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#9A96AC" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Calendar size={12} />
                    {currentEvent.submissions_close ? new Date(currentEvent.submissions_close).toLocaleDateString() : "Active Hackathon"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={12} /> Virtual
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: "18px 20px", flex: "0 1 auto",
              borderLeft: "1px solid #2A2560", minWidth: 170,
            }}>
              <div>
                <div style={{ fontSize: 12, color: "#9A96AC", marginBottom: 5 }}>Your team</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14.5, fontWeight: 600 }}>
                  <Users size={15} color="#B8A9FD" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                    {participantTeamName}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} color="#5B5F6D" style={{ marginLeft: "auto" }} />
            </div>
          </div>
        </div>

        {/* 2. DYNAMIC SUBMISSION BANNER (Based on DB source of truth) */}
        {submissionStatus === "submitted" && (
          <div style={{
            background: "linear-gradient(120deg, #1B1440 0%, #241A5E 50%, #171A21 100%)",
            border: "1px solid #2A2560", borderRadius: 14, padding: "26px 28px", marginBottom: 28,
          }}>
            <div className="banner-row">
              <div style={{
                width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
                border: "3px solid #7C5CFC", display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(124,92,252,0.12)",
              }}>
                <CheckCircle2 size={30} color="#B8A9FD" />
              </div>
              <div style={{ flex: "1 1 280px" }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 600, margin: "0 0 6px" }}>
                  Thank you for submitting your project!
                </h2>
                <p style={{ color: "#9A96AC", fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 540 }}>
                  Your project <strong style={{ color: "#E8E6F0" }}>"{userSubmission?.title}"</strong> has been successfully submitted. You can now browse other teams' projects and participate in community voting.
                </p>
              </div>
              <button
                onClick={() => userSubmission?.id && handleOpenProjectDetails(userSubmission.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "linear-gradient(135deg, #8A6EFC, #6D4FE8)", color: "#FFFFFF", border: "none",
                  padding: "12px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
                }}
              >
                View my submission <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {submissionStatus === "not_submitted_open" && (
          <div style={{
            background: "linear-gradient(120deg, #16243A 0%, #1A2E44 50%, #171A21 100%)",
            border: "1px solid #1E3A5F", borderRadius: 14, padding: "26px 28px", marginBottom: 28,
          }}>
            <div className="banner-row">
              <div style={{
                width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
                border: "3px solid #38BDF8", display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(56,189,248,0.12)",
              }}>
                <Rocket size={28} color="#38BDF8" />
              </div>
              <div style={{ flex: "1 1 280px" }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 600, margin: "0 0 6px", color: "#F0F9FF" }}>
                  Ready to submit your project?
                </h2>
                <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 540 }}>
                  You haven't submitted a project yet. Complete your submission before the deadline to be eligible for prizes and community voting.
                </p>
              </div>
              <button
                onClick={() => onNavigate && onNavigate("Submission Form", { eventId: currentEvent.id, name: currentEvent.name })}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "linear-gradient(135deg, #0EA5E9, #0284C7)", color: "#FFFFFF", border: "none",
                  padding: "12px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
                }}
              >
                Submit your project <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {submissionStatus === "submissions_closed" && (
          <div style={{
            background: "linear-gradient(120deg, #1E1B2E 0%, #1F1D2B 50%, #171A21 100%)",
            border: "1px solid #2D273D", borderRadius: 14, padding: "24px 28px", marginBottom: 28,
          }}>
            <div className="banner-row">
              <div style={{
                width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
                border: "2px solid #9A96AC", display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(154,150,172,0.1)",
              }}>
                <Calendar size={24} color="#9A96AC" />
              </div>
              <div style={{ flex: "1 1 280px" }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(19px, 2.5vw, 22px)", fontWeight: 600, margin: "0 0 6px" }}>
                  Submissions are closed
                </h2>
                <p style={{ color: "#9A96AC", fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
                  The submission deadline for this hackathon has passed. You can still browse all submitted projects, explore ideas, and participate in community voting.
                </p>
              </div>
              <div style={{
                fontSize: 12.5, fontWeight: 500, color: "#B8A9FD", background: "rgba(124,92,252,0.12)",
                padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(124,92,252,0.25)"
              }}>
                {currentEvent.voting_status === "open" ? "Voting is Active" : "Voting Window Inactive"}
              </div>
            </div>
          </div>
        )}

        {/* 3. Browse by track */}
        <div style={{ background: "#14161C", border: "1px solid #1D2029", borderRadius: 14, padding: "20px 22px", marginBottom: 28 }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: "0 0 16px" }}>
            Browse by track
          </h3>
          <div className="pill-row">
            <button
              onClick={() => setActiveTrack("all")}
              style={{
                display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
                padding: "9px 18px", borderRadius: 30, cursor: "pointer",
                border: activeTrack === "all" ? "1px solid #7C5CFC" : "1px solid #2A2560",
                background: activeTrack === "all" ? "linear-gradient(135deg, #8A6EFC, #6D4FE8)" : "transparent",
                color: activeTrack === "all" ? "#FFFFFF" : "#C7C4D6",
                fontSize: 13.5, fontWeight: 500, fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
              }}
            >
              <LayoutGrid size={15} /> All tracks
            </button>
            {TRACK_CONFIGS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTrack(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
                  padding: "9px 18px", borderRadius: 30, cursor: "pointer",
                  border: activeTrack === t.id ? "1px solid #7C5CFC" : "1px solid #2A2560",
                  background: activeTrack === t.id ? "linear-gradient(135deg, #8A6EFC, #6D4FE8)" : "transparent",
                  color: activeTrack === t.id ? "#FFFFFF" : "#C7C4D6",
                  fontSize: 13.5, fontWeight: 500, fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
                }}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Projects Header & Discovery */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
          <div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, margin: "0 0 4px" }}>
              {activeTrack === "all" ? "All projects" : (TRACK_CONFIGS.find(t => t.id === activeTrack)?.label || "Track projects")} ({visibleProjects.length})
            </h3>
            <p style={{ color: "#9A96AC", fontSize: 13, margin: 0 }}>
              {currentEvent.voting_status === "open"
                ? "Community voting is active. Projects appear in randomized ballot order."
                : currentEvent.voting_status === "upcoming"
                ? "Voting will open soon. Explore submissions in the meantime."
                : "Community voting has concluded."}
            </p>
          </div>

          <div className="toolbar">
            <div className="toolbar-search">
              <input
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, teams, IDs..."
              />
              <Search size={15} color="#5B5F6D" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            <select
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="ballot">Ballot order (Randomized)</option>
              <option value="newest">Sort by: Newest</option>
              <option value="name">Sort by: Name (A–Z)</option>
              {currentEvent.voting_status === "closed" && (
                <option value="votes">Sort by: Highest votes</option>
              )}
            </select>
          </div>
        </div>

        {/* 5. Projects Grid */}
        {projectsLoading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9A96AC" }}>
            <RefreshCw size={28} color="#7C5CFC" style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            <p>Loading projects...</p>
          </div>
        ) : visibleProjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#5B5F6D", fontSize: 14.5, border: "1px dashed #262A34", borderRadius: 14 }}>
            No projects match your filter. Try a different track or search term.
          </div>
        ) : (
          <div className="projects-grid">
            {visibleProjects.map((p) => {
              const trackMeta = resolveTrackMeta(p.track_id, p.track_name);
              const TrackIcon = trackMeta.icon;
              const isOwn = isProjectOwn(p);
              const hasVoted = !!votedMap[p.id];
              const isVotingOpen = currentEvent.voting_status === "open";

              return (
                <div
                  key={p.id}
                  className="card"
                  onClick={() => handleOpenProjectDetails(p.id)}
                  style={{
                    background: "#14161C", border: "1px solid #1D2029", borderRadius: 14, padding: "18px",
                    display: "flex", flexDirection: "column", position: "relative"
                  }}
                >
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 11, flexShrink: 0,
                      background: trackMeta.bg, border: `1px solid ${trackMeta.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <TrackIcon size={20} color={trackMeta.color} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#E8E6F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.title}
                        </div>
                        <span style={{ fontSize: 10.5, color: "#5B5F6D", fontFamily: "ui-monospace, monospace", flexShrink: 0 }}>
                          {p.id}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#5B5F6D", margin: "3px 0 8px" }}>
                        <Users size={12} color="#4ADE80" /> {p.team_name || "Team"}
                      </div>
                      <span style={{
                        display: "inline-block", fontSize: 11, fontWeight: 500, padding: "2px 9px",
                        borderRadius: 20, background: trackMeta.bg, color: trackMeta.color,
                      }}>
                        {trackMeta.label}
                      </span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: 13, color: "#9A96AC", lineHeight: 1.55, margin: "0 0 14px", flex: 1,
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden"
                  }}>
                    {p.summary || "No description provided."}
                  </p>

                  <div style={{ display: "flex", gap: 16, marginBottom: 14 }} onClick={(e) => e.stopPropagation()}>
                    {p.demo_url && (
                      <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="link-btn">
                        <FileText size={13} /> Demo <ExternalLink size={11} />
                      </a>
                    )}
                    {p.repo_url && (
                      <a href={p.repo_url} target="_blank" rel="noopener noreferrer" className="link-btn">
                        <GitBranch size={13} /> GitHub <ExternalLink size={11} />
                      </a>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto" }}>
                    <button
                      onClick={(e) => handleVoteToggle(p, e)}
                      disabled={isOwn || !isVotingOpen}
                      title={
                        isOwn
                          ? "You cannot vote for your own project"
                          : !isVotingOpen
                          ? "Voting is not currently active"
                          : hasVoted
                          ? "Click to remove your vote"
                          : "Click to vote for this project"
                      }
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                        fontFamily: "Inter, sans-serif", border: "none",
                        cursor: (isOwn || !isVotingOpen) ? "not-allowed" : "pointer",
                        background: isOwn
                          ? "#1D2029"
                          : hasVoted
                          ? "linear-gradient(135deg, #8A6EFC, #6D4FE8)"
                          : "rgba(124,92,252,0.18)",
                        color: isOwn ? "#5B5F6D" : hasVoted ? "#FFFFFF" : "#B8A9FD",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <ThumbsUp size={14} fill={hasVoted ? "#FFFFFF" : "none"} />
                      {isOwn ? "Your project" : hasVoted ? "Voted" : "Vote"}
                    </button>

                    {/* VOTE TOTALS / RESULTS ARE AUTHORITATIVELY HIDDEN DURING VOTING WINDOW! */}
                    {isVotingOpen ? (
                      <span style={{ fontSize: 11.5, color: "#8A6EFC", background: "rgba(138,110,252,0.1)", padding: "3px 8px", borderRadius: 6 }}>
                        Ballot active
                      </span>
                    ) : currentEvent.voting_status === "closed" && p.vote_count !== null ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#9A96AC" }}>
                        <Users size={13} /> {p.vote_count} votes
                      </span>
                    ) : (
                      <span style={{ fontSize: 11.5, color: "#5B5F6D" }}>
                        Voting closed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. PROJECT DETAILS & COMMENTS MODAL */}
      {selectedProject && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            background: "#14161C", border: "1px solid #262A34", borderRadius: 16,
            maxWidth: 720, width: "100%", maxHeight: "90vh", overflowY: "auto",
            padding: "28px 30px", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.6)"
          }}>
            <button
              onClick={() => setSelectedProject(null)}
              style={{
                position: "absolute", top: 20, right: 20, background: "#1E222D", border: "none",
                color: "#9A96AC", width: 32, height: 32, borderRadius: 8, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{
                  fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                  background: resolveTrackMeta(selectedProject.track_id, selectedProject.track_name).bg,
                  color: resolveTrackMeta(selectedProject.track_id, selectedProject.track_name).color
                }}>
                  {selectedProject.track_name || "Track"}
                </span>
                <span style={{ fontSize: 12, color: "#5B5F6D", fontFamily: "ui-monospace, monospace" }}>
                  {selectedProject.id}
                </span>
              </div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>
                {selectedProject.title}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#4ADE80" }}>
                <Users size={14} /> Team {selectedProject.team_name || "Unknown"}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 22, background: "#0E1015", border: "1px solid #1D2029", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#9A96AC", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Project Summary
              </div>
              <p style={{ color: "#E8E6F0", fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
                {selectedProject.summary || "No description provided."}
              </p>
            </div>

            {/* Links */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              {selectedProject.repo_url && (
                <a
                  href={selectedProject.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 7, background: "#1C202A",
                    padding: "8px 14px", borderRadius: 8, color: "#B8A9FD", fontSize: 13, textDecoration: "none"
                  }}
                >
                  <GitBranch size={14} /> GitHub Repository <ExternalLink size={12} />
                </a>
              )}
              {selectedProject.demo_url && (
                <a
                  href={selectedProject.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 7, background: "#1C202A",
                    padding: "8px 14px", borderRadius: 8, color: "#38BDF8", fontSize: 13, textDecoration: "none"
                  }}
                >
                  <FileText size={14} /> Live Demo / Pitch Deck <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Voting Bar in Modal */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#181B24", border: "1px solid #262A34", borderRadius: 10,
              padding: "14px 18px", marginBottom: 26
            }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>Community Voting</div>
                <div style={{ fontSize: 12, color: "#9A96AC" }}>
                  {currentEvent.voting_status === "open"
                    ? "Voting is currently open. Click to vote or change ballot."
                    : currentEvent.voting_status === "upcoming"
                    ? "Voting window is not open yet."
                    : "Voting has closed for this event."}
                </div>
              </div>

              <button
                onClick={(e) => handleVoteToggle(selectedProject, e)}
                disabled={isProjectOwn(selectedProject) || currentEvent.voting_status !== "open"}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "9px 18px", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
                  border: "none", cursor: (isProjectOwn(selectedProject) || currentEvent.voting_status !== "open") ? "not-allowed" : "pointer",
                  background: isProjectOwn(selectedProject)
                    ? "#1D2029"
                    : votedMap[selectedProject.id]
                    ? "linear-gradient(135deg, #8A6EFC, #6D4FE8)"
                    : "rgba(124,92,252,0.18)",
                  color: isProjectOwn(selectedProject) ? "#5B5F6D" : votedMap[selectedProject.id] ? "#FFFFFF" : "#B8A9FD",
                }}
              >
                <ThumbsUp size={15} fill={votedMap[selectedProject.id] ? "#FFFFFF" : "none"} />
                {isProjectOwn(selectedProject) ? "Your project" : votedMap[selectedProject.id] ? "Voted" : "Vote"}
              </button>
            </div>

            {/* Comments Section (T3 Requirement) */}
            <div style={{ borderTop: "1px solid #1D2029", paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <MessageSquare size={17} color="#7C5CFC" />
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: 0 }}>
                  Project Comments ({comments.length})
                </h3>
              </div>

              {/* Comment submission form */}
              <form onSubmit={handleCommentSubmit} style={{ marginBottom: 20 }}>
                <div style={{ position: "relative" }}>
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write constructive feedback, ask questions, or share thoughts..."
                    maxLength={1000}
                    style={{
                      width: "100%", background: "#0E1015", border: "1px solid #262A34",
                      borderRadius: 10, padding: "12px 14px", color: "#E8E6F0",
                      fontSize: 13.5, fontFamily: "Inter, sans-serif", resize: "vertical", outline: "none"
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <button
                      type="submit"
                      disabled={commentSubmitting || !newComment.trim()}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "#7C5CFC", color: "#FFFFFF", border: "none",
                        padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: (commentSubmitting || !newComment.trim()) ? "not-allowed" : "pointer",
                        opacity: (commentSubmitting || !newComment.trim()) ? 0.6 : 1
                      }}
                    >
                      <Send size={13} /> {commentSubmitting ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </form>

              {/* Comments list */}
              {comments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#5B5F6D", fontSize: 13 }}>
                  No comments yet. Be the first to share your thoughts on this project!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: "#0E1015", border: "1px solid #1D2029", borderRadius: 8,
                        padding: "12px 14px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#C7C4D6" }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(124,92,252,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#B8A9FD" }}>
                            {c.author_name ? c.author_name.charAt(0).toUpperCase() : "P"}
                          </div>
                          <span>{c.author_name}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "#5B5F6D" }}>
                          {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                        </span>
                      </div>
                      <p style={{ color: "#E8E6F0", fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
