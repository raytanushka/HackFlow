import React, { useState, useEffect } from "react";
import {
  Rocket, ArrowLeft, Search, RefreshCw, FolderKanban, Tag, Users,
  Calendar, ExternalLink, Code2, AlertCircle, Loader2, Filter, ChevronDown
} from "lucide-react";

export default function OrganizerProjects({ user, onNavigate, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("all");

  const currentUser = user || (localStorage.getItem("hackflow_user") ? JSON.parse(localStorage.getItem("hackflow_user")) : null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://localhost:8000/api/projects"
        : "/api/projects";

      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: expected a list of projects.");
      }

      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError(err.message || "Failed to load projects from the database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatSubmittedAt = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Derive unique tracks for filtering
  const trackList = Array.from(new Set(projects.map((p) => p.track_name).filter(Boolean))).sort();

  // Filter projects by search query and track
  const filteredProjects = projects.filter((p) => {
    const matchesTrack = selectedTrack === "all" || p.track_name === selectedTrack;
    if (!matchesTrack) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = (p.title || "").toLowerCase();
    const team = (p.team_name || "").toLowerCase();
    const track = (p.track_name || "").toLowerCase();
    const summary = (p.summary || "").toLowerCase();

    return title.includes(q) || team.includes(q) || track.includes(q) || summary.includes(q);
  });

  const handleBackToDashboard = () => {
    if (!onNavigate) return;
    if (currentUser?.role === "judge") {
      onNavigate("Judge Dashboard");
    } else if (currentUser?.role === "participant") {
      onNavigate("Participant Dashboard");
    } else {
      onNavigate("Organizer Dashboard");
    }
  };

  const navDashboardLabel = currentUser?.role === "judge"
    ? "Judge Dashboard"
    : currentUser?.role === "participant"
      ? "Participant Dashboard"
      : currentUser?.role === "organizer"
        ? "Organizer Dashboard"
        : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0F1115", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-size: 12.5px; color: #5B5F6D; font-weight: 500; padding: 0 16px 12px; }
        td { padding: 14px 16px; border-top: 1px solid #1D2029; font-size: 13.5px; }
        tbody tr:hover { background: rgba(124, 92, 252, 0.04); }
        .table-scroll { overflow-x: auto; }
        .table-scroll table { min-width: 800px; }
        .status-pill {
          display: inline-block; padding: 3px 10px; border-radius: 20px;
          background: rgba(74,222,128,0.12); color: #4ADE80; font-size: 12px; font-weight: 500;
        }
        .track-badge {
          display: inline-block; padding: 3px 9px; border-radius: 6px;
          background: rgba(124,92,252,0.12); color: #B8A9FD; font-size: 12px; font-weight: 500;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .desktop-nav { display: flex; }
        @media (max-width: 760px) {
          .desktop-nav { display: none; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1D2029", padding: "14px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onNavigate && onNavigate("HackFlow Home")}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Rocket size={16} color="#0F1115" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>
              HackFlow
            </span>
          </div>

          <div className="desktop-nav" style={{ gap: 26, flex: 1 }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate("HackFlow Home"); }}
              style={{ color: "#9A96AC", textDecoration: "none", fontSize: 14, fontWeight: 500 }}
            >
              Home
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate("Hackathons Listing"); }}
              style={{ color: "#9A96AC", textDecoration: "none", fontSize: 14, fontWeight: 500 }}
            >
              Hackathons
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); }}
              style={{
                color: "#B8A9FD",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                borderBottom: "2px solid #7C5CFC",
                paddingBottom: 16,
                marginBottom: -17,
              }}
            >
              Projects
            </a>
            {navDashboardLabel && (
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleBackToDashboard(); }}
                style={{ color: "#9A96AC", textDecoration: "none", fontSize: 14, fontWeight: 500 }}
              >
                {navDashboardLabel}
              </a>
            )}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={handleBackToDashboard}
              style={{
                background: "#14161C",
                border: "1px solid #262A34",
                color: "#C7C4D6",
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
                transition: "all 0.15s ease"
              }}
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 12.5, color: "#5B5F6D", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6 }}>
              {currentUser?.role === "judge"
                ? "JUDGE & EVALUATION • ALL PROJECTS"
                : currentUser?.role === "participant"
                  ? "PARTICIPANT PROJECT POOL • ALL PROJECTS"
                  : "ORGANIZER PORTAL • DATABASE PROJECTS"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, margin: 0 }}>
                All Projects
              </h1>
              {!loading && (
                <span style={{
                  background: "rgba(124,92,252,0.15)",
                  color: "#B8A9FD",
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600
                }}>
                  {projects.length} in database
                </span>
              )}
            </div>
            <p style={{ color: "#9A96AC", fontSize: 14, margin: "6px 0 0" }}>
              Comprehensive database listing of all fixture and participant submitted projects.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={fetchProjects}
              disabled={loading}
              title="Refresh project list from database"
              style={{
                background: "#14161C",
                border: "1px solid #262A34",
                color: "#E8E6F0",
                padding: "9px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
                transition: "all 0.15s ease"
              }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} color="#7C5CFC" />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{
          background: "#14161C",
          border: "1px solid #1D2029",
          borderRadius: 12,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 24
        }}>
          {/* Search field */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: "#0F1115",
            border: "1px solid #262A34",
            borderRadius: 8,
            padding: "8px 12px",
            flex: 1,
            minWidth: 260
          }}>
            <Search size={15} color="#5B5F6D" />
            <input
              type="text"
              placeholder="Search projects by name, team, track..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#E8E6F0",
                fontSize: 13.5,
                width: "100%",
                fontFamily: "Inter, sans-serif"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#5B5F6D",
                  cursor: "pointer",
                  fontSize: 12,
                  padding: 0
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Track selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#9A96AC", whiteSpace: "nowrap" }}>Track:</span>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              style={{
                background: "#0F1115",
                border: "1px solid #262A34",
                borderRadius: 8,
                color: "#E8E6F0",
                padding: "8px 12px",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="all">All Tracks ({projects.length})</option>
              {trackList.map((tr) => (
                <option key={tr} value={tr}>
                  {tr} ({projects.filter((p) => p.track_name === tr).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{
            background: "#14161C",
            border: "1px solid #1D2029",
            borderRadius: 14,
            padding: "60px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            color: "#9A96AC"
          }}>
            <Loader2 size={32} color="#7C5CFC" className="animate-spin" />
            <div style={{ fontSize: 14, fontWeight: 500 }}>Loading projects from database...</div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.25)",
            borderRadius: 14,
            padding: "36px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            textAlign: "center"
          }}>
            <AlertCircle size={32} color="#F87171" />
            <div style={{ fontSize: 16, fontWeight: 600, color: "#F87171" }}>Failed to load projects</div>
            <div style={{ fontSize: 13.5, color: "#9A96AC", maxWidth: 500 }}>
              {error}
            </div>
            <button
              onClick={fetchProjects}
              style={{
                marginTop: 8,
                background: "#7C5CFC",
                color: "#FFFFFF",
                border: "none",
                padding: "8px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state: Database has 0 projects */}
        {!loading && !error && projects.length === 0 && (
          <div style={{
            background: "#14161C",
            border: "1px solid #1D2029",
            borderRadius: 14,
            padding: "64px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            textAlign: "center"
          }}>
            <FolderKanban size={40} color="#5B5F6D" />
            <div style={{ fontSize: 17, fontWeight: 600, color: "#E8E6F0" }}>No projects found.</div>
            <p style={{ fontSize: 13.5, color: "#9A96AC", maxWidth: 440, margin: 0 }}>
              There are currently no projects recorded in the HackFlow database.
            </p>
          </div>
        )}

        {/* Filtered empty state: projects exist, but filter matched 0 */}
        {!loading && !error && projects.length > 0 && filteredProjects.length === 0 && (
          <div style={{
            background: "#14161C",
            border: "1px solid #1D2029",
            borderRadius: 14,
            padding: "48px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            textAlign: "center"
          }}>
            <Search size={32} color="#5B5F6D" />
            <div style={{ fontSize: 15, fontWeight: 600, color: "#E8E6F0" }}>No matching projects found</div>
            <p style={{ fontSize: 13, color: "#9A96AC", margin: 0 }}>
              No projects match "{searchQuery}". Try a different keyword or track filter.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedTrack("all"); }}
              style={{
                marginTop: 8,
                background: "transparent",
                border: "1px solid #262A34",
                color: "#B8A9FD",
                padding: "6px 14px",
                borderRadius: 7,
                fontSize: 12.5,
                cursor: "pointer"
              }}
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Projects table */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div style={{
            background: "#14161C",
            border: "1px solid #1D2029",
            borderRadius: 14,
            padding: "20px 0 8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
          }}>
            <div style={{ padding: "0 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#9A96AC" }}>
                Showing <strong style={{ color: "#E8E6F0" }}>{filteredProjects.length}</strong> of {projects.length} database projects
              </span>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Project name</th>
                    <th>Team</th>
                    <th>Track</th>
                    <th>Submitted at</th>
                    <th>Status</th>
                    <th>Links</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => (
                    <tr key={p.id || p.title}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#E8E6F0", fontSize: 14, marginBottom: 3 }}>
                          {p.title}
                        </div>
                        {p.summary && (
                          <div style={{
                            color: "#5B5F6D",
                            fontSize: 12,
                            maxWidth: 380,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }} title={p.summary}>
                            {p.summary}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ color: "#C7C4D6", fontWeight: 500 }}>
                          {p.team_name || "—"}
                        </span>
                      </td>
                      <td>
                        {p.track_name ? (
                          <span className="track-badge">{p.track_name}</span>
                        ) : (
                          <span style={{ color: "#5B5F6D" }}>—</span>
                        )}
                      </td>
                      <td style={{ color: "#9A96AC", whiteSpace: "nowrap" }}>
                        {formatSubmittedAt(p.submitted_at)}
                      </td>
                      <td>
                        <span className="status-pill">
                          {p.status || "Submitted"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          {p.repo_url && (
                            <a
                              href={p.repo_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Repository URL"
                              style={{ color: "#9A96AC", transition: "color 0.15s ease" }}
                              onMouseEnter={(e) => e.currentTarget.style.color = "#E8E6F0"}
                              onMouseLeave={(e) => e.currentTarget.style.color = "#9A96AC"}
                            >
                              <Code2 size={15} />
                            </a>
                          )}
                          {p.demo_url && (
                            <a
                              href={p.demo_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Demo URL"
                              style={{ color: "#9A96AC", transition: "color 0.15s ease" }}
                              onMouseEnter={(e) => e.currentTarget.style.color = "#B8A9FD"}
                              onMouseLeave={(e) => e.currentTarget.style.color = "#9A96AC"}
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}
                          {!p.repo_url && !p.demo_url && (
                            <span style={{ color: "#3A3E4D" }}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
