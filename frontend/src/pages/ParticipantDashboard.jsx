import { useState, useMemo } from "react";
import {
  Code2, Bell, ChevronDown, ChevronRight, Search, ThumbsUp, FileText, Github,
  Users, LayoutGrid, BarChart3, Accessibility, Shield, Leaf, HeartPulse,
  BookOpen, Cpu, Calendar, MapPin, Rocket, CheckCircle2, ArrowRight,
} from "lucide-react";

const TRACKS = [
  { id: "trk_01", label: "Developer tools", icon: Code2, color: "#818CF8", bg: "rgba(129,140,248,0.14)" },
  { id: "trk_02", label: "Data and analytics", icon: BarChart3, color: "#60A5FA", bg: "rgba(96,165,250,0.14)" },
  { id: "trk_03", label: "Accessibility", icon: Accessibility, color: "#34D399", bg: "rgba(52,211,153,0.14)" },
  { id: "trk_04", label: "Security", icon: Shield, color: "#A78BFA", bg: "rgba(167,139,250,0.14)" },
  { id: "trk_05", label: "Climate", icon: Leaf, color: "#4ADE80", bg: "rgba(74,222,128,0.14)" },
  { id: "trk_06", label: "Health", icon: HeartPulse, color: "#F472B6", bg: "rgba(244,114,182,0.14)" },
  { id: "trk_07", label: "Education", icon: BookOpen, color: "#FBBF24", bg: "rgba(251,191,36,0.14)" },
  { id: "trk_08", label: "Open hardware", icon: Cpu, color: "#22D3EE", bg: "rgba(34,211,238,0.14)" },
];

const TRACK_BY_ID = Object.fromEntries(TRACKS.map((t) => [t.id, t]));

const BLURBS = {
  trk_01: "Tooling that helps developers build, test and ship faster.",
  trk_02: "Turns raw data into clear, decision-ready insight.",
  trk_03: "Makes technology usable for people of every ability.",
  trk_04: "Detects and prevents threats before they cause harm.",
  trk_05: "Helps people and communities cut their climate impact.",
  trk_06: "Improves health outcomes through accessible technology.",
  trk_07: "Makes learning more engaging, effective and inclusive.",
  trk_08: "Open, reproducible hardware anyone can build on.",
};

const TEAMS = [
  ["tm_01", "NorthKiln"], ["tm_02", "LoudQuarry"], ["tm_03", "StillTrail"], ["tm_04", "SaltDrift"],
  ["tm_05", "AmberSwitch"], ["tm_06", "CopperBeacon"], ["tm_07", "CopperLedger"], ["tm_08", "GreenHours"],
  ["tm_09", "IronLedger"], ["tm_10", "AmberOrbit"], ["tm_11", "OpenSignal"], ["tm_12", "IronLoom"],
  ["tm_13", "HollowHours"], ["tm_14", "StillMeadow"], ["tm_15", "WarmQuarry"], ["tm_16", "OpenSignal"],
  ["tm_17", "SmallSignal"], ["tm_18", "CopperMeadow"], ["tm_19", "PaperAnchor"], ["tm_20", "HollowHarbour"],
  ["tm_21", "SaltThread"], ["tm_22", "GreenFerry"], ["tm_23", "HollowOrbit"], ["tm_24", "PaperLoom"],
  ["tm_25", "GreenDrift"], ["tm_26", "SaltMeadow"], ["tm_27", "BrightSignal"], ["tm_28", "BrightCompass"],
  ["tm_29", "SmallLedger"], ["tm_30", "StillTrail"], ["tm_31", "GreenBeacon"], ["tm_32", "DeepMeadow"],
  ["tm_33", "WarmTrail"], ["tm_34", "AmberSwitch"], ["tm_35", "GlassDrift"], ["tm_36", "HollowLoom"],
  ["tm_37", "SaltCompass"], ["tm_38", "GreenLedger"], ["tm_39", "SlowCompass"], ["tm_40", "StillTrail"],
];
const TEAM_NAME = Object.fromEntries(TEAMS);

// [id, team, track, title, submitted_at]
const PROJECTS = [
  ["prj_01", "tm_01", "trk_04", "Glass Signal", "2026-02-27T04:08"],
  ["prj_02", "tm_02", "trk_03", "Small Meadow", "2026-02-27T20:06"],
  ["prj_03", "tm_03", "trk_03", "Deep Compass", "2026-02-28T16:58"],
  ["prj_04", "tm_04", "trk_07", "Green Switch", "2026-02-27T17:00"],
  ["prj_05", "tm_05", "trk_02", "North Compass", "2026-02-27T04:40"],
  ["prj_06", "tm_06", "trk_01", "Dry Compass", "2026-03-01T10:24"],
  ["prj_07", "tm_07", "trk_03", "Dry Harbour", "2026-03-01T04:29"],
  ["prj_08", "tm_08", "trk_04", "North Drift", "2026-03-01T01:09"],
  ["prj_09", "tm_09", "trk_06", "Hollow Signal", "2026-03-01T15:47"],
  ["prj_10", "tm_10", "trk_08", "Still Beacon", "2026-03-01T05:44"],
  ["prj_11", "tm_11", "trk_02", "Salt Ledger", "2026-02-28T13:14"],
  ["prj_12", "tm_12", "trk_07", "Open Beacon", "2026-02-28T09:46"],
  ["prj_13", "tm_13", "trk_05", "Quiet Anchor", "2026-03-01T14:20"],
  ["prj_14", "tm_14", "trk_07", "Green Lantern", "2026-02-27T10:21"],
  ["prj_15", "tm_15", "trk_04", "Copper Orbit", "2026-03-01T08:30"],
  ["prj_16", "tm_16", "trk_04", "Salt Kiln", "2026-02-28T14:00"],
  ["prj_17", "tm_17", "trk_06", "Small Loom", "2026-03-01T09:09"],
  ["prj_18", "tm_18", "trk_07", "Open Kiln", "2026-03-01T15:30"],
  ["prj_19", "tm_19", "trk_06", "Small Relay", "2026-02-27T09:30"],
  ["prj_20", "tm_20", "trk_08", "Paper Thread", "2026-02-27T05:18"],
  ["prj_21", "tm_21", "trk_02", "Copper Kiln", "2026-02-28T01:03"],
  ["prj_22", "tm_22", "trk_04", "Dry Bridge", "2026-03-01T07:47"],
  ["prj_23", "tm_23", "trk_08", "Slow Quarry", "2026-03-01T10:30"],
  ["prj_24", "tm_24", "trk_03", "Glass Beacon", "2026-02-28T17:09"],
  ["prj_25", "tm_25", "trk_02", "Dry Relay", "2026-02-28T22:36"],
  ["prj_26", "tm_26", "trk_05", "Amber Hours", "2026-02-27T03:56"],
  ["prj_27", "tm_27", "trk_08", "Flat Thread", "2026-02-28T10:34"],
  ["prj_28", "tm_28", "trk_02", "Flat Meadow", "2026-03-01T10:22"],
  ["prj_29", "tm_29", "trk_01", "Flat Relay", "2026-02-28T20:34"],
  ["prj_30", "tm_30", "trk_07", "Paper Harbour", "2026-03-01T13:45"],
  ["prj_31", "tm_31", "trk_01", "Salt Ferry", "2026-03-01T05:43"],
  ["prj_32", "tm_32", "trk_01", "Loud Ledger", "2026-03-01T14:58"],
  ["prj_33", "tm_33", "trk_01", "Slow Trail", "2026-02-27T20:51"],
  ["prj_34", "tm_34", "trk_08", "Iron Switch", "2026-02-28T01:13"],
  ["prj_35", "tm_35", "trk_05", "Warm Beacon", "2026-02-27T09:33"],
  ["prj_36", "tm_36", "trk_08", "Salt Drift", "2026-02-27T01:20"],
  ["prj_37", "tm_37", "trk_07", "Salt Loom", "2026-02-27T21:42"],
  ["prj_38", "tm_38", "trk_02", "Deep Beacon", "2026-02-27T03:39"],
  ["prj_39", "tm_39", "trk_03", "Paper Anchor", "2026-02-26T23:30"],
  ["prj_40", "tm_40", "trk_01", "Slow Loom", "2026-02-28T15:26"],
  ["prj_41", "tm_07", "trk_03", "Dry Harbour", "2026-03-01T17:57"],
].map(([id, team, track, title, submittedAt]) => {
  const n = parseInt(id.split("_")[1], 10);
  return {
    id, team, track, title, submittedAt,
    teamName: TEAM_NAME[team],
    summary: BLURBS[track],
    baseVotes: 12 + ((n * 17) % 31), // demo vote counts
  };
});

const MY_TEAM = "tm_01";
const MY_TEAM_NAME = TEAM_NAME[MY_TEAM];

export default function ParticipantDashboard() {
  const [activeTrack, setActiveTrack] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("votes");
  const [voted, setVoted] = useState({});

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = PROJECTS.filter((p) => {
      if (activeTrack !== "all" && p.track !== activeTrack) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.teamName.toLowerCase().includes(q) ||
        p.id.includes(q) ||
        TRACK_BY_ID[p.track].label.toLowerCase().includes(q)
      );
    }).map((p) => ({ ...p, votes: p.baseVotes + (voted[p.id] ? 1 : 0) }));

    const sorters = {
      votes: (a, b) => b.votes - a.votes || a.id.localeCompare(b.id),
      newest: (a, b) => b.submittedAt.localeCompare(a.submittedAt),
      name: (a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id),
    };
    return list.sort(sorters[sort]);
  }, [activeTrack, query, sort, voted]);

  const toggleVote = (id) => setVoted((v) => ({ ...v, [id]: !v[id] }));

  return (
    <div style={{ minHeight: "100vh", background: "#0F1115", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .top-grid { display: grid; grid-template-columns: 1fr minmax(0, 520px); gap: 20px; align-items: stretch; }
        @media (max-width: 1000px) { .top-grid { grid-template-columns: 1fr; } }
        .projects-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 1240px) { .projects-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 900px) { .projects-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 580px) { .projects-grid { grid-template-columns: 1fr; } }
        .pill-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: thin; scrollbar-color: #2A2E3A transparent; }
        .pill-row::-webkit-scrollbar { height: 6px; }
        .pill-row::-webkit-scrollbar-thumb { background: #2A2E3A; border-radius: 4px; }
        .toolbar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        .toolbar-search { position: relative; flex: 1; min-width: 180px; max-width: 300px; }
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
        .link-btn { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; color: #9A96AC; text-decoration: none; }
        .link-btn:hover { color: #B8A9FD; }
        .card { transition: border-color 0.15s ease, transform 0.15s ease; }
        .card:hover { border-color: #3A3560; transform: translateY(-2px); }
        .hide-sm { }
        @media (max-width: 560px) { .hide-sm { display: none; } }
        .banner-row { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
      `}</style>

      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1D2029", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Code2 size={16} color="#0F1115" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 17 }}>HackFlow</span>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative", display: "flex" }}>
              <Bell size={18} color="#9A96AC" />
              <span style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: "#F87171", border: "1.5px solid #0F1115" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(124,92,252,0.25)", border: "1px solid #7C5CFC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 600, color: "#B8A9FD" }}>
                P
              </div>
              <span className="hide-sm" style={{ fontSize: 14, fontWeight: 500 }}>Participant</span>
              <ChevronDown size={14} color="#9A96AC" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Welcome + hackathon card */}
        <div className="top-grid" style={{ marginBottom: 22 }}>
          <div style={{ alignSelf: "center" }}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 600, margin: "0 0 8px", letterSpacing: "-0.015em" }}>
              Hello, Participant!
            </h1>
            <p style={{ color: "#9A96AC", fontSize: 14.5, lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
              Welcome to Sample Hack 2027. Explore other teams' projects, give your vote and support innovative ideas.
            </p>
          </div>

          <div style={{
            display: "flex", alignItems: "stretch", flexWrap: "wrap",
            background: "linear-gradient(135deg, #1B1440, #171A21)", border: "1px solid #2A2560", borderRadius: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", flex: "1 1 260px" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(124,92,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Rocket size={24} color="#B8A9FD" />
              </div>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "#4ADE80", background: "rgba(74,222,128,0.15)", padding: "2px 8px", borderRadius: 20 }}>● LIVE</span>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, margin: "6px 0 5px" }}>Sample Hack 2027</div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#9A96AC" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={12} /> Mar 1 – Mar 3, 2027</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={12} /> Virtual</span>
                </div>
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", flex: "0 1 auto",
              borderLeft: "1px solid #2A2560", minWidth: 170,
            }}>
              <div>
                <div style={{ fontSize: 12, color: "#9A96AC", marginBottom: 5 }}>Your team</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14.5, fontWeight: 600 }}>
                  <Users size={15} color="#B8A9FD" /> {MY_TEAM_NAME}
                </div>
              </div>
              <ChevronRight size={16} color="#5B5F6D" style={{ marginLeft: "auto" }} />
            </div>
          </div>
        </div>

        {/* Thank-you banner */}
        <div style={{
          background: "linear-gradient(120deg, #1B1440 0%, #241A5E 50%, #171A21 100%)",
          border: "1px solid #2A2560", borderRadius: 14, padding: "26px 28px", marginBottom: 22,
        }}>
          <div className="banner-row">
            <div style={{
              width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
              border: "3px solid #7C5CFC", display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(124,92,252,0.12)",
            }}>
              <CheckCircle2 size={30} color="#B8A9FD" />
            </div>
            <div style={{ flex: "1 1 280px" }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 600, margin: "0 0 6px" }}>
                Thank you for submitting your project!
              </h2>
              <p style={{ color: "#9A96AC", fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
                Your project has been successfully submitted. Now you can browse other teams' projects, explore their ideas and cast your vote.
              </p>
            </div>
            <button style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, #8A6EFC, #6D4FE8)", color: "#FFFFFF", border: "none",
              padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
            }}>
              View my submission <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Browse by track */}
        <div style={{ background: "#14161C", border: "1px solid #1D2029", borderRadius: 14, padding: "20px 22px", marginBottom: 30 }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, margin: "0 0 16px" }}>Browse by track</h3>
          <div className="pill-row">
            <TrackPill
              active={activeTrack === "all"}
              onClick={() => setActiveTrack("all")}
              icon={LayoutGrid}
              label="All tracks"
            />
            {TRACKS.map((t) => (
              <TrackPill
                key={t.id}
                active={activeTrack === t.id}
                onClick={() => setActiveTrack(t.id)}
                icon={t.icon}
                label={t.label}
              />
            ))}
          </div>
        </div>

        {/* Projects header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, margin: 0 }}>
            {activeTrack === "all" ? "All projects" : TRACK_BY_ID[activeTrack].label} ({visible.length})
          </h3>
          <div className="toolbar">
            <div className="toolbar-search">
              <input
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, teams, IDs..."
              />
              <Search size={15} color="#5B5F6D" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="votes">Sort by: Highest votes</option>
              <option value="newest">Sort by: Newest</option>
              <option value="name">Sort by: Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#5B5F6D", fontSize: 14.5, border: "1px dashed #262A34", borderRadius: 14 }}>
            No projects match your search. Try a different keyword or track.
          </div>
        ) : (
          <div className="projects-grid">
            {visible.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                isOwn={p.team === MY_TEAM}
                hasVoted={!!voted[p.id]}
                onVote={() => toggleVote(p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TrackPill({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        padding: "10px 18px", borderRadius: 30, cursor: "pointer",
        border: active ? "1px solid #7C5CFC" : "1px solid #2A2560",
        background: active ? "linear-gradient(135deg, #8A6EFC, #6D4FE8)" : "transparent",
        color: active ? "#FFFFFF" : "#C7C4D6",
        fontSize: 13.5, fontWeight: 500, fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
      }}
    >
      <Icon size={15} /> {label}
    </button>
  );
}

function ProjectCard({ project, isOwn, hasVoted, onVote }) {
  const track = TRACK_BY_ID[project.track];
  const Icon = track.icon;
  return (
    <div className="card" style={{
      background: "#14161C", border: "1px solid #1D2029", borderRadius: 14, padding: "18px",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 11, flexShrink: 0,
          background: track.bg, border: `1px solid ${track.color}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={21} color={track.color} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#E8E6F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {project.title}
            </div>
            <span style={{ fontSize: 10.5, color: "#5B5F6D", fontFamily: "ui-monospace, monospace", flexShrink: 0 }}>{project.id}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#5B5F6D", margin: "3px 0 8px" }}>
            <Users size={12} color="#4ADE80" /> {project.teamName}
          </div>
          <span style={{
            display: "inline-block", fontSize: 11, fontWeight: 500, padding: "3px 10px",
            borderRadius: 20, background: track.bg, color: track.color,
          }}>
            {track.label}
          </span>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "#9A96AC", lineHeight: 1.55, margin: "0 0 14px", flex: 1 }}>{project.summary}</p>

      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        <a href="#" onClick={(e) => e.preventDefault()} className="link-btn"><FileText size={13} /> View PPT</a>
        <a href="#" onClick={(e) => e.preventDefault()} className="link-btn"><Github size={13} /> GitHub</a>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <button
          onClick={onVote}
          disabled={isOwn}
          title={isOwn ? "You can't vote for your own team" : undefined}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            fontFamily: "Inter, sans-serif", border: "none",
            cursor: isOwn ? "not-allowed" : "pointer",
            background: isOwn ? "#1D2029" : hasVoted ? "linear-gradient(135deg, #8A6EFC, #6D4FE8)" : "rgba(124,92,252,0.18)",
            color: isOwn ? "#5B5F6D" : hasVoted ? "#FFFFFF" : "#B8A9FD",
          }}
        >
          <ThumbsUp size={14} fill={hasVoted ? "#FFFFFF" : "none"} />
          {isOwn ? "Your project" : hasVoted ? "Voted" : "Vote"}
        </button>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#9A96AC" }}>
          <Users size={13} /> {project.votes} votes
        </span>
      </div>
    </div>
  );
}
