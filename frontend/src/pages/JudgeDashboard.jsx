import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Zap,
  Bell,
  ChevronDown,
  Code2,
  BarChart3,
  Accessibility,
  Shield,
  Leaf,
  HeartPulse,
  BookOpen,
  Cpu,
  Users,
  FolderKanban,
  Calendar,
  MapPin,
  FileText,
  ExternalLink,
  MessageSquare,
  Download,
  Send,
  Menu,
  X,
  MoreHorizontal,
  LogOut,
} from "lucide-react";

import {
  getEvent,
  getTracks,
  getTeams,
  getJudge,
  getJudgeProjects,
  getMyScores,
  getRubric,
  saveScore,
  addTrackComment,
  exportMyScoresCsv,
} from "../services/hackflowApi";

const NAV = [
  "Home",
  "Hackathons",
  "Projects",
  "Judge Dashboard",
];

const TRACK_ICONS = {
  trk_01: Code2,
  trk_02: BarChart3,
  trk_03: Accessibility,
  trk_04: Shield,
  trk_05: Leaf,
  trk_06: HeartPulse,
  trk_07: BookOpen,
  trk_08: Cpu,
};

const AVATAR_COLORS = [
  "#7C5CFC",
  "#3B82F6",
  "#22A45D",
  "#E879F9",
  "#EAB308",
  "#F87171",
  "#2DD4BF",
  "#F97316",
];

export default function JudgeDashboard({ user, onNavigate, onLogout }) {
  const navigate = (path) => {
    if (path.startsWith("/judge/projects/")) {
      const pid = path.replace("/judge/projects/", "");
      if (onNavigate) onNavigate("Project Evaluation", { projectId: pid });
      else window.location.href = path;
    } else if (path === "/judge/dashboard") {
      if (onNavigate) onNavigate("Judge Dashboard");
      else window.location.href = path;
    } else if (path === "/hackathons") {
      if (onNavigate) onNavigate("Hackathons Listing");
      else window.location.href = path;
    } else if (path === "/projects") {
      if (onNavigate) onNavigate("Organizer Projects");
      else window.location.href = path;
    } else if (path === "/") {
      if (onNavigate) onNavigate("HackFlow Home");
      else window.location.href = path;
    } else if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };
  const [event, setEvent] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [judge, setJudge] = useState(null);
  const [projects, setProjects] = useState([]);
  const [scores, setScores] = useState([]);
  const [rubric, setRubric] = useState(null);
  const [activeTrack, setActiveTrack] = useState("trk_01");
  const [selectedProject, setSelectedProject] = useState(null);
  const [judgeTracks, setJudgeTracks] = useState([]);

  const [trackComment, setTrackComment] = useState("");
  const [commentStatus, setCommentStatus] = useState("");

  const [navOpen, setNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        eventData,
        tracksData,
        teamsData,
        judgeData,
        projectsData,
        scoresData,
        rubricData,
      ] = await Promise.all([
        getEvent().catch(() => ({ id: "evt_01", name: "HackFlow Hackathon", tracks: [] })),
        getTracks().catch(() => []),
        getTeams().catch(() => []),
        getJudge(),
        getJudgeProjects(),
        getMyScores().catch(() => []),
        getRubric().catch(() => null),
      ]);

      setEvent(eventData);
      setTracks(tracksData);
      setTeams(teamsData);

      // Normalize tracks from tracks endpoint or event detail
      const allTracks = Array.isArray(tracksData) && tracksData.length > 0
        ? tracksData
        : Array.isArray(eventData?.tracks) && eventData.tracks.length > 0
          ? eventData.tracks
          : [];

      // Judge assigned tracks
      const assignedJudgeTracks = Array.isArray(judgeData?.tracks) && judgeData.tracks.length > 0
        ? judgeData.tracks
        : allTracks;

      const normalizedJudge = {
        ...judgeData,
        tracks: assignedJudgeTracks,
      };

      setJudge(normalizedJudge);
      setJudgeTracks(allTracks);

      if (assignedJudgeTracks.length > 0) {
        setActiveTrack(assignedJudgeTracks[0].id);
      } else if (allTracks.length > 0) {
        setActiveTrack(allTracks[0].id);
      } else {
        setActiveTrack("");
      }

      setProjects(projectsData || []);
      setScores(scoresData || []);
      setRubric(rubricData);
    } catch (err) {
      console.error("Judge dashboard loading error:", err);
      setError(
        err?.message ||
        "Failed to load Judge Dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);


  const scoreMap = useMemo(() => {
    return new Map(
      scores.map((score) => [
        score.project ?? score.project_id,
        score,
      ])
    );
  }, [scores]);

const assignedTracks = useMemo(() => {
  const trackList = Array.isArray(tracks)
    ? tracks
    : Array.isArray(tracks?.tracks)
      ? tracks.tracks
      : [];

  const assignedIds = new Set(
    (judge?.tracks || []).map((track) =>
      typeof track === "string" ? track : track.id
    )
  );

  return trackList.filter((track) =>
    assignedIds.has(track.id)
  );
}, [tracks, judge]);

  const trackProjects = useMemo(() => {
  if (!activeTrack) {
    return [];
  }

  console.log("ACTIVE TRACK:", activeTrack);
  console.log("ALL PROJECTS:", projects);

  const filtered = projects.filter(
    (project) =>
      (project.track ?? project.track_id) === activeTrack
  );

  console.log("PROJECTS FOR ACTIVE TRACK:", filtered);

  return filtered;
}, [projects, activeTrack]);

  const scoredCount = useMemo(() => {
    return projects.filter((project) =>
      scoreMap.has(project.id)
    ).length;
  }, [projects, scoreMap]);

  const pendingCount = projects.length - scoredCount;

  const progress =
    projects.length === 0
      ? 0
      : Math.round(
          (scoredCount / projects.length) * 100
        );

  const currentTrackScoredCount = useMemo(() => {
    return trackProjects.filter((project) =>
      scoreMap.has(project.id)
    ).length;
  }, [trackProjects, scoreMap]);

  const currentTrackPendingCount =
    trackProjects.length - currentTrackScoredCount;

const trackList = Array.isArray(tracks)
  ? tracks
  : Array.isArray(tracks?.tracks)
    ? tracks.tracks
    : [];

const currentTrack =
  trackList.find((track) => track.id === activeTrack) || null;

  async function handlePostComment() {
    if (!trackComment.trim() || !activeTrack) {
      return;
    }

    try {
      await addTrackComment({
        trackId: activeTrack,
        comment: trackComment.trim(),
      });

      setTrackComment("");
      setCommentStatus("Posted");

      setTimeout(() => {
        setCommentStatus("");
      }, 2000);
    } catch (err) {
      console.error("Failed to post comment:", err);
      setCommentStatus("Failed");

      setTimeout(() => {
        setCommentStatus("");
      }, 2000);
    }
  }

  async function handleExport() {
    try {
      await exportMyScoresCsv();
    } catch (err) {
      console.error("Failed to export scores:", err);
      setError(err.message || "Failed to export scores");
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0B0C10",
          color: "#E8E6F0",
          display: "grid",
          placeItems: "center",
          fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        }}
      >
        Loading judge dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0B0C10",
          color: "#E8E6F0",
          display: "grid",
          placeItems: "center",
          padding: 24,
          fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            width: "min(500px, 100%)",
            background: "#14161C",
            border: "1px solid #2A2E39",
            borderRadius: 14,
            padding: 24,
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Unable to load Judge Dashboard
          </h2>

          <p
            style={{
              color: "#9A96AC",
              lineHeight: 1.5,
            }}
          >
            {error}
          </p>

          <p
            style={{
              color: "#5B5F6D",
              fontSize: 13,
            }}
          >
            Please ensure you are authenticated with an authorized judge account on port 8000.
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              onClick={() => {
                if (onLogout) onLogout();
                if (onNavigate) onNavigate("Judge Registration");
                else navigate("/judge/register");
              }}
              style={{
                background: "linear-gradient(135deg, #8A6EFC, #6D4FE8)",
                border: "none",
                color: "#FFFFFF",
                padding: "10px 18px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13.5
              }}
            >
              Log in as Judge
            </button>
            <button
              onClick={() => loadDashboard()}
              style={{
                background: "#1B1E28",
                border: "1px solid #2E3245",
                color: "#E8E6F0",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 13.5
              }}
            >
              Retry
            </button>
            <button
              onClick={() => onNavigate ? onNavigate("HackFlow Home") : navigate("/")}
              style={{
                background: "#14161C",
                border: "1px solid #2A2E39",
                color: "#9A96AC",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 13.5
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0C10",
        color: "#E8E6F0",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #0B0C10;
        }

        .main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 20px;
          align-items: start;
        }

        .track-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .stats-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .desktop-nav {
          display: flex;
        }

        .mobile-toggle {
          display: none;
        }

        .table-scroll {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        th {
          text-align: left;
          font-size: 12px;
          color: #5B5F6D;
          font-weight: 500;
          padding: 0 10px 10px 0;
          white-space: nowrap;
        }

        td {
          padding: 12px 10px 12px 0;
          border-top: 1px solid #1D2029;
          font-size: 13.5px;
          white-space: nowrap;
        }

        .status-pending,
        .status-scored {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-pending {
          background: rgba(234, 179, 8, 0.12);
          color: #EAB308;
        }

        .status-scored {
          background: rgba(74, 222, 128, 0.12);
          color: #4ADE80;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.72);
          display: grid;
          place-items: center;
          padding: 20px;
          z-index: 1000;
        }

        .score-modal {
          width: min(520px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: #14161C;
          border: 1px solid #2A2E39;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
        }

        @media (max-width: 1080px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .track-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 780px) {
          .desktop-nav {
            display: none;
          }

          .mobile-toggle {
            display: flex;
          }
        }

        @media (max-width: 560px) {
          .track-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ================= TOP NAV ================= */}

      <div
        style={{
          borderBottom: "1px solid #1D2029",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          <div
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: "#7C5CFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap
                size={16}
                color="#0B0C10"
                strokeWidth={2.5}
                fill="#0B0C10"
              />
            </div>

            <span
              style={{
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              HackFlow
            </span>
          </div>

          <div
            className="desktop-nav"
            style={{
              gap: 26,
              flex: 1,
            }}
          >
            {NAV.map((item) => (
              <a
                key={item}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (item === "Home") navigate("/");
                  else if (item === "Hackathons") navigate("/hackathons");
                  else if (item === "Projects") navigate("/projects");
                  else if (item === "Judge Dashboard") navigate("/judge/dashboard");
                }}
                style={{
                  color:
                    item === "Judge Dashboard"
                      ? "#B8A9FD"
                      : "#9A96AC",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  borderBottom:
                    item === "Judge Dashboard"
                      ? "2px solid #7C5CFC"
                      : "2px solid transparent",
                  paddingBottom: 16,
                  marginBottom: -17,
                }}
              >
                {item}
              </a>
            ))}
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ position: "relative" }}>
              <Bell size={18} color="#9A96AC" />

              <span
                style={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#F87171",
                  border: "1.5px solid #0B0C10",
                }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <div
                className="desktop-nav"
                onClick={() => setUserMenuOpen((m) => !m)}
                style={{
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 8,
                  background: userMenuOpen ? "rgba(124,92,252,0.12)" : "transparent",
                  transition: "background 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "rgba(124,92,252,0.25)",
                    border: "1px solid #7C5CFC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#B8A9FD",
                  }}
                >
                  {getInitials(judge?.name)}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      lineHeight: 1.2,
                    }}
                  >
                    {judge?.name || "Judge"}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#5B5F6D",
                      lineHeight: 1.2,
                    }}
                  >
                    Judge
                  </div>
                </div>

                <ChevronDown
                  size={14}
                  color="#5B5F6D"
                />
              </div>

              {userMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: 42,
                    right: 0,
                    background: "#171A21",
                    border: "1px solid #262A34",
                    borderRadius: 10,
                    padding: 6,
                    minWidth: 180,
                    boxShadow: "0 12px 24px rgba(0,0,0,0.5)",
                    zIndex: 100,
                  }}
                >
                  <div style={{ padding: "8px 10px", borderBottom: "1px solid #202430", marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E6F0" }}>{judge?.name || user?.name || "Judge"}</div>
                    <div style={{ fontSize: 11.5, color: "#9A96AC", overflow: "hidden", textOverflow: "ellipsis" }}>{judge?.email || user?.email || ""}</div>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(false);
                      navigate("/judge/dashboard");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      fontSize: 13.5,
                      color: "#C7C4D6",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    <FolderKanban size={14} color="#7C5CFC" /> Judge Dashboard
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      fontSize: 13.5,
                      color: "#F87171",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    <LogOut size={14} /> Log out
                  </div>
                </div>
              )}
            </div>

            <button
              className="mobile-toggle"
              onClick={() => setNavOpen((value) => !value)}
              style={{
                background: "none",
                border: "none",
                color: "#E8E6F0",
                cursor: "pointer",
              }}
            >
              {navOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>
        </div>

        {navOpen && (
          <div
            className="mobile-toggle"
            style={{
              flexDirection: "column",
              padding: "0 24px 16px",
              gap: 4,
            }}
          >
            {NAV.map((item) => (
              <a
                key={item}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (item === "Home") navigate("/");
                  else if (item === "Hackathons") navigate("/hackathons");
                  else if (item === "Projects") navigate("/projects");
                  else if (item === "Judge Dashboard") navigate("/judge/dashboard");
                }}
                style={{
                  color:
                    item === "Judge Dashboard"
                      ? "#B8A9FD"
                      : "#C7C4D6",
                  textDecoration: "none",
                  fontSize: 15,
                  padding: "10px 0",
                  borderTop: "1px solid #1D2029",
                }}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ================= MAIN CONTENT ================= */}

      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "28px 24px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "rgba(124,92,252,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FolderKanban
                size={21}
                color="#B8A9FD"
              />
            </div>

            <div>
              <h1
                style={{
                  fontSize: "clamp(22px, 3.6vw, 28px)",
                  fontWeight: 600,
                  margin: "0 0 4px",
                }}
              >
                Judge{" "}
                <span style={{ color: "#8A6EFC" }}>
                  Dashboard
                </span>
              </h1>

              <p
                style={{
                  color: "#9A96AC",
                  fontSize: 14,
                  margin: 0,
                }}
              >
                Review team submissions, score projects,
                and provide feedback.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "#14161C",
              border: "1px solid #1D2029",
              borderRadius: 12,
              padding: "12px 18px",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(124,92,252,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Code2
                size={16}
                color="#B8A9FD"
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {event?.name || "HackFlow Event"}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  fontSize: 12,
                  color: "#9A96AC",
                  marginTop: 2,
                }}
              >
                {event?.start_date && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Calendar size={11} />
                    {formatDate(event.start_date)}
                  </span>
                )}

                {event?.location && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <MapPin size={11} />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="main-grid">
          {/* ================= LEFT COLUMN ================= */}

          <div>
            <Panel>
              <PanelHeading title="Assigned Tracks" />

              {assignedTracks.length === 0 ? (
                <div
                  style={{
                    color: "#9A96AC",
                    fontSize: 14,
                  }}
                >
                  No tracks assigned to this judge.
                </div>
              ) : (
<div className="track-grid">
  {judgeTracks.map((track) => {
    const trackId =
      typeof track === "string"
        ? track
        : track?.id;

    if (!trackId) return null;

    const Icon =
      TRACK_ICONS[trackId] || Code2;

    const trackName =
      typeof track === "string"
        ? tracks.find((t) => t.id === track)?.name || track
        : track?.name || "Unknown Track";

    const trackProjects = projects.filter(
      (project) =>
        (project.track ?? project.track_id) === trackId
    );

    const trackProjectCount =
      trackProjects.length;

    const scored = trackProjects.filter(
      (project) => scoreMap.has(project.id)
    ).length;

    const active =
      trackId === activeTrack;

    return (
      <button
        key={trackId}
        onClick={() => setActiveTrack(trackId)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          borderRadius: 10,
          cursor: "pointer",
          textAlign: "left",
          border: active
            ? "1px solid #7C5CFC"
            : "1px solid #262A34",
          background: active
            ? "rgba(124,92,252,0.12)"
            : "#14161C",
          color: "#E8E6F0",
          width: "100%",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "rgba(124,92,252,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon
            size={15}
            color="#B8A9FD"
          />
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {trackName}
          </div>

          <div
            style={{
              fontSize: 11,
              color: "#5B5F6D",
            }}
          >
            {scored}/{trackProjectCount} scored
          </div>
        </div>
      </button>
    );
  })}
</div>

              )}
            </Panel>

            <Panel>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 14,
                  marginBottom: 18,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      margin: "0 0 8px",
                    }}
                  >
                    {currentTrack?.name || "Track"}
                  </h2>

                  {currentTrack?.description && (
                    <>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#9B87F5",
                          marginBottom: 4,
                        }}
                      >
                        Track focus
                      </div>

                      <p
                        style={{
                          fontSize: 13.5,
                          color: "#9A96AC",
                          lineHeight: 1.5,
                          margin: 0,
                          maxWidth: 480,
                        }}
                      >
                        {currentTrack.description}
                      </p>
                    </>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 20,
                  }}
                >
                  <StatMini
                    label="Total"
                    value={trackProjects.length}
                  />

                  <StatMini
                    label="Scored"
                    value={currentTrackScoredCount}
                    color="#4ADE80"
                  />

                  <StatMini
                    label="Pending"
                    value={currentTrackPendingCount}
                    color="#EAB308"
                  />
                </div>
              </div>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Project</th>
                      <th>Members</th>
                      <th>Repository</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Review</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {trackProjects.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign: "center",
                            color: "#5B5F6D",
                            padding: 30,
                          }}
                        >
                          No submissions in this track.
                        </td>
                      </tr>
                    ) : (
                      trackProjects.map(
                        (project, index) => {
                          
                          const team = teams.find(
                            (item) =>
                              item.id ===
                              (project.team ??
                                project.team_id)
                          );

                          const score = scoreMap.get(
                            project.id
                          );

                          const scored = Boolean(score);

                          const color =
                            AVATAR_COLORS[
                              index %
                                AVATAR_COLORS.length
                            ];

                          const memberCount = Number(
  team?.member_count || 0
);

                          return (
                            <tr key={project.id}>
  <td
    style={{
      color: "#5B5F6D",
    }}
  >
    {index + 1}
  </td>

  <td>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          flexShrink: 0,
          background: `${color}30`,
          color,
          fontSize: 11,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {getInitials(team?.name)}
      </div>

      <div>
        <div
          onClick={() =>
            navigate(`/judge/projects/${project.id}`)
          }
          style={{
            fontWeight: 600,
            color: "#E8E6F0",
            cursor: "pointer",
          }}
        >
          {project.title}
        </div>

        <div
          style={{
            fontSize: 11.5,
            color: "#5B5F6D",
          }}
        >
          {team?.name || "Unknown team"}
        </div>
      </div>
    </div>
  </td>

  <td
    style={{
      color: "#9A96AC",
    }}
  >
    {memberCount}
  </td>

  <td>
    {project.repo_url ? (
      <a
        href={project.repo_url}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          color: "#B8A9FD",
          textDecoration: "none",
          fontSize: 13,
        }}
      >
        <ExternalLink size={13} />
        View repo
      </a>
    ) : (
      <span
        style={{
          color: "#5B5F6D",
        }}
      >
        Not provided
      </span>
    )}
  </td>

  <td>
    {scored
      ? `${calculateWeightedScore(
          score.criteria,
          rubric
        ).toFixed(2)} / 5`
      : "—"}
  </td>

  <td>
    <span
      className={
        scored
          ? "status-scored"
          : "status-pending"
      }
    >
      {scored ? "Scored" : "Pending"}
    </span>
  </td>
      <td>
  {score?.comment ? (
    <div
      style={{
        maxWidth: 260,
        color: "#C7C4D6",
        fontSize: 12.5,
        lineHeight: 1.45,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 6,
        }}
      >
        <MessageSquare
          size={13}
          color="#9B87F5"
          style={{ marginTop: 2, flexShrink: 0 }}
        />

        <span>{score.comment}</span>
      </div>
    </div>
  ) : (
    <span
      style={{
        color: "#5B5F6D",
        fontSize: 12,
      }}
    >
      No review
    </span>
  )}
</td>
  <td>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <button
        onClick={() =>
          navigate(`/judge/projects/${project.id}`)
        }
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "#7C5CFC",
          border: "none",
          color: "#FFFFFF",
          padding: "6px 12px",
          borderRadius: 7,
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <MessageSquare size={12} />

        {scored ? "Edit score" : "Score"}
      </button>

      <button
        style={{
          background: "none",
          border: "none",
          color: "#5B5F6D",
          cursor: "pointer",
          padding: 4,
        }}
      >
        <MoreHorizontal size={16} />
      </button>
    </div>
  </td>
</tr>
                          );
                        }
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          {/* ================= RIGHT COLUMN ================= */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <Panel>
              <PanelHeading title="Overall progress" />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  flexWrap: "wrap",
                }}
              >
                <RingStat percent={progress} />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <LegendRow
                    color="#4ADE80"
                    label="Scored projects"
                    value={scoredCount}
                  />

                  <LegendRow
                    color="#EAB308"
                    label="Pending projects"
                    value={pendingCount}
                  />

                  <LegendRow
                    color="#5B5F6D"
                    label="Total projects"
                    value={projects.length}
                  />
                </div>
              </div>
            </Panel>

            <button
              onClick={handleExport}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                background: "#14161C",
                border: "1px solid #2A2E39",
                color: "#E8E6F0",
                padding: "11px 16px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Download size={15} />
              Export My Scores CSV
            </button>

            <Panel>
              <PanelHeading title="Quick stats" />

              <div className="stats-row">
                <QuickStat
                  icon={BookOpen}
                  value={assignedTracks.length}
                  label="Assigned tracks"
                />

                <QuickStat
                  icon={Users}
                  value={teams.length}
                  label="Teams"
                />

                <QuickStat
                  icon={FileText}
                  value={projects.length}
                  label="Submissions"
                />
              </div>
            </Panel>

            <Panel>
              <PanelHeading title="Judge comments" />

              <textarea
                value={trackComment}
                onChange={(event) =>
                  setTrackComment(event.target.value)
                }
                placeholder="Add a general note for the selected track..."
                rows={5}
                style={{
                  width: "100%",
                  resize: "vertical",
                  background: "#0B0C10",
                  border: "1px solid #2A2E39",
                  borderRadius: 9,
                  color: "#E8E6F0",
                  padding: 12,
                  fontFamily: "inherit",
                  fontSize: 13,
                  outline: "none",
                }}
              />

              <button
                onClick={handlePostComment}
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background: "#7C5CFC",
                  border: "none",
                  color: "#FFFFFF",
                  padding: "10px 16px",
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Send size={13} />
                Post note
              </button>

              {commentStatus && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color:
                      commentStatus === "Posted"
                        ? "#4ADE80"
                        : "#F87171",
                  }}
                >
                  {commentStatus}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>

      {/* ================= SCORE MODAL ================= */}

      {selectedProject && (
        <ScoreModal
          project={selectedProject}
          existingScore={scoreMap.get(
            selectedProject.id
          )}
          rubric={rubric}
          onClose={() =>
            setSelectedProject(null)
          }
          onSaved={(score) => {
            setScores((previous) => {
              const projectId =
                score.project ?? score.project_id;

              const withoutOld = previous.filter(
                (item) =>
                  (item.project ?? item.project_id) !==
                  projectId
              );

              return [...withoutOld, score];
            });
          }}
        />
      )}
    </div>
  );
}

/* =====================================================
   SCORE MODAL
===================================================== */

function ScoreModal({
  project,
  existingScore,
  onClose,
  rubric,
  onSaved,
}) {
  const [criteria, setCriteria] = useState({});
  const weightedScore = calculateWeightedScore(criteria, rubric);
useEffect(() => {
  if (!rubric?.criteria) return;

  const initialCriteria = {};

  rubric.criteria.forEach((criterion) => {
    initialCriteria[criterion.id] =
      existingScore?.criteria?.[criterion.id] ?? 3;
  });

  setCriteria(initialCriteria);
}, [rubric, existingScore]);

  const [comment, setComment] = useState(
    existingScore?.comment || ""
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSave() {
    try {
      setSaving(true);
      setSaveError("");

      const score = await saveScore({
        projectId: project.id,
        criteria,
        comment,
      });

      onSaved(score);
      onClose();
    } catch (error) {
      console.error("Failed to save score:", error);
      setSaveError(
        error.message || "Failed to save score"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="score-modal">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color: "#9B87F5",
                marginBottom: 5,
              }}
            >
              {existingScore
                ? "Edit existing score"
                : "New project score"}
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 20,
              }}
            >
              {project.title}
            </h2>
          </div>
          <div className="rounded-xl border p-4">
  <div className="text-sm text-gray-500">
    Weighted Score
  </div>

  <div className="text-3xl font-bold">
    {weightedScore.toFixed(2)}
    <span className="text-base font-normal text-gray-500">
      / 5
    </span>
  </div>
</div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#9A96AC",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

       {rubric?.criteria?.map((criterion) => (
  <div key={criterion.id} className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="font-medium">
        {criterion.name}
      </label>

      <span className="text-sm text-gray-500">
        Weight: {criterion.weight}%
      </span>
    </div>

    <ScoreInput
      label=""
      value={criteria[criterion.id] ?? 3}
      maxScore={criterion.max_score}
      onChange={(value) =>
        setCriteria((prev) => ({
          ...prev,
          [criterion.id]: value,
        }))
      }
    />
  </div>
))}

        <div style={{ marginTop: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Feedback
          </label>

          <textarea
            value={comment}
            onChange={(event) =>
              setComment(event.target.value)
            }
            placeholder="Feedback for the project..."
            rows={5}
            style={{
              width: "100%",
              resize: "vertical",
              background: "#0B0C10",
              border: "1px solid #2A2E39",
              borderRadius: 9,
              color: "#E8E6F0",
              padding: 12,
              fontFamily: "inherit",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        {saveError && (
          <div
            style={{
              marginTop: 12,
              color: "#F87171",
              fontSize: 12,
            }}
          >
            {saveError}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 20,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #2A2E39",
              color: "#C7C4D6",
              padding: "9px 15px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: "#7C5CFC",
              border: "none",
              color: "#FFFFFF",
              padding: "9px 15px",
              borderRadius: 8,
              cursor: saving
                ? "not-allowed"
                : "pointer",
              opacity: saving ? 0.7 : 1,
              fontWeight: 600,
            }}
          >
            {saving
              ? "Saving..."
              : existingScore
              ? "Update score"
              : "Save score"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   SCORE INPUT
===================================================== */

function ScoreInput({
  label,
  value,
  onChange,
  maxScore = 5,
}) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="font-medium">
          {label}
        </div>
      )}

      <div className="flex gap-2">
        {Array.from({ length: maxScore }, (_, index) => {
          const score = index + 1;

          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={`h-10 w-10 rounded-lg border ${
                value === score
                  ? "bg-black text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {score}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =====================================================
   UI COMPONENTS
===================================================== */

function Panel({ children }) {
  return (
    <div
      style={{
        background: "#14161C",
        border: "1px solid #1D2029",
        borderRadius: 14,
        padding: "22px",
        marginBottom: 20,
      }}
    >
      {children}
    </div>
  );
}

function PanelHeading({ title }) {
  return (
    <h2
      style={{
        fontSize: 16,
        fontWeight: 600,
        margin: "0 0 16px",
      }}
    >
      {title}
    </h2>
  );
}

function StatMini({
  label,
  value,
  color = "#E8E6F0",
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11.5,
          color: "#5B5F6D",
          marginBottom: 3,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flex: 1,
        minWidth: 90,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: "rgba(124,92,252,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon
          size={15}
          color="#B8A9FD"
        />
      </div>

      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {value}
        </div>

        <div
          style={{
            fontSize: 11,
            color: "#5B5F6D",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function LegendRow({
  color,
  label,
  value,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />

      <span
        style={{
          fontSize: 13,
          color: "#C7C4D6",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#E8E6F0",
          marginLeft: "auto",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function RingStat({ percent }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference -
    (percent / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: 104,
        height: 104,
        flexShrink: 0,
      }}
    >
      <svg
        width="104"
        height="104"
        viewBox="0 0 104 104"
      >
        <circle
          cx="52"
          cy="52"
          r={radius}
          stroke="#1D2029"
          strokeWidth="10"
          fill="none"
        />

        <circle
          cx="52"
          cy="52"
          r={radius}
          stroke="#7C5CFC"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 52 52)"
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 19,
            fontWeight: 700,
          }}
        >
          {percent}%
        </span>

        <span
          style={{
            fontSize: 9,
            color: "#5B5F6D",
          }}
        >
          Scoring
        </span>
      </div>
    </div>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function calculateWeightedScore(criteria, rubric) {
  if (!rubric?.criteria?.length) return 0;

  let weightedTotal = 0;
  let totalWeight = 0;

  rubric.criteria.forEach((criterion) => {
    const score = Number(criteria[criterion.id] ?? 0);
    const weight = Number(criterion.weight ?? 0);
    const maxScore = Number(criterion.max_score ?? 5);

    if (maxScore <= 0) return;

    weightedTotal += (score / maxScore) * weight;
    totalWeight += weight;
  });

  if (totalWeight === 0) return 0;

  return (weightedTotal / totalWeight) * 5;
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);

  if (!parts.length || !parts[0]) {
    return "JD";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function formatDate(date) {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString();
}