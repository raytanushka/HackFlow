import { useState } from "react";
import {
  Zap, Bell, ChevronDown, Code2, BarChart3, Accessibility, Shield, Leaf,
  HeartPulse, BookOpen, Cpu, Users, FolderKanban, Calendar, MapPin,
  FileText, GitBranch as Github, MessageSquare, MoreHorizontal, Download, ArrowRight,
  Send, Menu, X,
} from "lucide-react";

const NAV = ["Home", "Hackathons", "Projects", "Judge Dashboard"];

const TEAMS = {
  tm_01: { name: "NorthKiln", members: 3 }, tm_02: { name: "LoudQuarry", members: 2 },
  tm_03: { name: "StillTrail", members: 2 }, tm_04: { name: "SaltDrift", members: 1 },
  tm_05: { name: "AmberSwitch", members: 4 }, tm_06: { name: "CopperBeacon", members: 1 },
  tm_07: { name: "CopperLedger", members: 4 }, tm_08: { name: "GreenHours", members: 3 },
  tm_09: { name: "IronLedger", members: 3 }, tm_10: { name: "AmberOrbit", members: 2 },
  tm_11: { name: "OpenSignal", members: 2 }, tm_12: { name: "IronLoom", members: 4 },
  tm_13: { name: "HollowHours", members: 2 }, tm_14: { name: "StillMeadow", members: 4 },
  tm_15: { name: "WarmQuarry", members: 1 }, tm_16: { name: "OpenSignal", members: 4 },
  tm_17: { name: "SmallSignal", members: 1 }, tm_18: { name: "CopperMeadow", members: 1 },
  tm_19: { name: "PaperAnchor", members: 2 }, tm_20: { name: "HollowHarbour", members: 4 },
  tm_21: { name: "SaltThread", members: 4 }, tm_22: { name: "GreenFerry", members: 2 },
  tm_23: { name: "HollowOrbit", members: 1 }, tm_24: { name: "PaperLoom", members: 2 },
  tm_25: { name: "GreenDrift", members: 1 }, tm_26: { name: "SaltMeadow", members: 1 },
  tm_27: { name: "BrightSignal", members: 1 }, tm_28: { name: "BrightCompass", members: 4 },
  tm_29: { name: "SmallLedger", members: 2 }, tm_30: { name: "StillTrail", members: 1 },
  tm_31: { name: "GreenBeacon", members: 2 }, tm_32: { name: "DeepMeadow", members: 3 },
  tm_33: { name: "WarmTrail", members: 1 }, tm_34: { name: "AmberSwitch", members: 4 },
  tm_35: { name: "GlassDrift", members: 2 }, tm_36: { name: "HollowLoom", members: 1 },
  tm_37: { name: "SaltCompass", members: 3 }, tm_38: { name: "GreenLedger", members: 3 },
  tm_39: { name: "SlowCompass", members: 2 }, tm_40: { name: "StillTrail", members: 1 },
};

const TRACKS = [
  { id: "trk_01", label: "Developer tools", icon: Code2, focus: "Tooling and platforms that make builders faster — CLIs, SDKs, dev infrastructure." },
  { id: "trk_02", label: "Data and analytics", icon: BarChart3, focus: "Turning raw data into decisions — dashboards, pipelines, and analytics products." },
  { id: "trk_03", label: "Accessibility", icon: Accessibility, focus: "Making technology usable for everyone, regardless of ability or device." },
  { id: "trk_04", label: "Security", icon: Shield, focus: "Protecting systems and users — auth, threat detection, and safe defaults." },
  { id: "trk_05", label: "Climate", icon: Leaf, focus: "Solutions using tech to solve real-world problems, and reduce environmental impact." },
  { id: "trk_06", label: "Health", icon: HeartPulse, focus: "Better healthcare, accessibility and patient care through technology." },
  { id: "trk_07", label: "Education", icon: BookOpen, focus: "Reimagining how people learn, teach, and access knowledge." },
  { id: "trk_08", label: "Open hardware", icon: Cpu, focus: "Hardware-integrated builds — sensors, devices, and physical prototypes." },
];

const PROJECTS = [
  { id: "prj_01", team: "tm_01", track: "trk_04", title: "Glass Signal" },
  { id: "prj_02", team: "tm_02", track: "trk_03", title: "Small Meadow" },
  { id: "prj_03", team: "tm_03", track: "trk_03", title: "Deep Compass" },
  { id: "prj_04", team: "tm_04", track: "trk_07", title: "Green Switch" },
  { id: "prj_05", team: "tm_05", track: "trk_02", title: "North Compass" },
  { id: "prj_06", team: "tm_06", track: "trk_01", title: "Dry Compass" },
  { id: "prj_07", team: "tm_07", track: "trk_03", title: "Dry Harbour" },
  { id: "prj_08", team: "tm_08", track: "trk_04", title: "North Drift" },
  { id: "prj_09", team: "tm_09", track: "trk_06", title: "Hollow Signal" },
  { id: "prj_10", team: "tm_10", track: "trk_08", title: "Still Beacon" },
  { id: "prj_11", team: "tm_11", track: "trk_02", title: "Salt Ledger" },
  { id: "prj_12", team: "tm_12", track: "trk_07", title: "Open Beacon" },
  { id: "prj_13", team: "tm_13", track: "trk_05", title: "Quiet Anchor" },
  { id: "prj_14", team: "tm_14", track: "trk_07", title: "Green Lantern" },
  { id: "prj_15", team: "tm_15", track: "trk_04", title: "Copper Orbit" },
  { id: "prj_16", team: "tm_16", track: "trk_04", title: "Salt Kiln" },
  { id: "prj_17", team: "tm_17", track: "trk_06", title: "Small Loom" },
  { id: "prj_18", team: "tm_18", track: "trk_07", title: "Open Kiln" },
  { id: "prj_19", team: "tm_19", track: "trk_06", title: "Small Relay" },
  { id: "prj_20", team: "tm_20", track: "trk_08", title: "Paper Thread" },
  { id: "prj_21", team: "tm_21", track: "trk_02", title: "Copper Kiln" },
  { id: "prj_22", team: "tm_22", track: "trk_04", title: "Dry Bridge" },
  { id: "prj_23", team: "tm_23", track: "trk_08", title: "Slow Quarry" },
  { id: "prj_24", team: "tm_24", track: "trk_03", title: "Glass Beacon" },
  { id: "prj_25", team: "tm_25", track: "trk_02", title: "Dry Relay" },
  { id: "prj_26", team: "tm_26", track: "trk_05", title: "Amber Hours" },
  { id: "prj_27", team: "tm_27", track: "trk_08", title: "Flat Thread" },
  { id: "prj_28", team: "tm_28", track: "trk_02", title: "Flat Meadow" },
  { id: "prj_29", team: "tm_29", track: "trk_01", title: "Flat Relay" },
  { id: "prj_30", team: "tm_30", track: "trk_07", title: "Paper Harbour" },
  { id: "prj_31", team: "tm_31", track: "trk_01", title: "Salt Ferry" },
  { id: "prj_32", team: "tm_32", track: "trk_01", title: "Loud Ledger" },
  { id: "prj_33", team: "tm_33", track: "trk_01", title: "Slow Trail" },
  { id: "prj_34", team: "tm_34", track: "trk_08", title: "Iron Switch" },
  { id: "prj_35", team: "tm_35", track: "trk_05", title: "Warm Beacon" },
  { id: "prj_36", team: "tm_36", track: "trk_08", title: "Salt Drift" },
  { id: "prj_37", team: "tm_37", track: "trk_07", title: "Salt Loom" },
  { id: "prj_38", team: "tm_38", track: "trk_02", title: "Deep Beacon" },
  { id: "prj_39", team: "tm_39", track: "trk_03", title: "Paper Anchor" },
  { id: "prj_40", team: "tm_40", track: "trk_01", title: "Slow Loom" },
  { id: "prj_41", team: "tm_07", track: "trk_03", title: "Dry Harbour" },
];

const AVATAR_COLORS = ["#7C5CFC", "#3B82F6", "#22A45D", "#E879F9", "#EAB308", "#F87171", "#2DD4BF", "#F97316"];

export default function JudgeDashboard() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeTrack, setActiveTrack] = useState("trk_01");

  const track = TRACKS.find((t) => t.id === activeTrack);
  const trackProjects = PROJECTS.filter((p) => p.track === activeTrack);

  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .main-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
        @media (max-width: 1080px) { .main-grid { grid-template-columns: 1fr; } }
        .track-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        @media (max-width: 900px) { .track-grid { grid-template-columns: repeat(2, 1fr); } }
        .stats-row { display: flex; gap: 20px; flex-wrap: wrap; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-size: 12px; color: #5B5F6D; font-weight: 500; padding: 0 10px 10px 0; white-space: nowrap; }
        td { padding: 12px 10px 12px 0; border-top: 1px solid #1D2029; font-size: 13.5px; white-space: nowrap; }
        .table-scroll { overflow-x: auto; }
        .table-scroll table { min-width: 760px; }
        .status-pending { display: inline-block; padding: 3px 10px; border-radius: 20px; background: rgba(234,179,8,0.12); color: #EAB308; font-size: 12px; font-weight: 500; }
        .desktop-nav { display: flex; }
        .mobile-toggle { display: none; }
        @media (max-width: 780px) { .desktop-nav { display: none; } .mobile-toggle { display: flex; } }
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
      `}</style>

      {/* Top nav */}
      <div style={{ borderBottom: "1px solid #1D2029" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={16} color="#0B0C10" strokeWidth={2.5} fill="#0B0C10" />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16 }}>HackFlow</span>
          </div>

          <div className="desktop-nav" style={{ gap: 26, flex: 1 }}>
            {NAV.map((item) => (
              <a key={item} href="#" style={{
                color: item === "Judge Dashboard" ? "#B8A9FD" : "#9A96AC", textDecoration: "none", fontSize: 14, fontWeight: 500,
                borderBottom: item === "Judge Dashboard" ? "2px solid #7C5CFC" : "2px solid transparent",
                paddingBottom: 16, marginBottom: -17,
              }}>
                {item}
              </a>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <Bell size={18} color="#9A96AC" />
              <span style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: "#F87171", border: "1.5px solid #0B0C10" }} />
            </div>
            <div className="desktop-nav" style={{ alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(124,92,252,0.25)", border: "1px solid #7C5CFC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#B8A9FD" }}>
                JD
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>Dr. Alex Carter</div>
                <div style={{ fontSize: 11, color: "#5B5F6D", lineHeight: 1.2 }}>Judge</div>
              </div>
              <ChevronDown size={14} color="#5B5F6D" />
            </div>
            <button className="mobile-toggle" onClick={() => setNavOpen((n) => !n)} style={{ background: "none", border: "none", color: "#E8E6F0", cursor: "pointer" }}>
              {navOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {navOpen && (
          <div className="mobile-toggle" style={{ flexDirection: "column", padding: "0 24px 16px", gap: 4 }}>
            {NAV.map((item) => (
              <a key={item} href="#" style={{ color: item === "Judge Dashboard" ? "#B8A9FD" : "#C7C4D6", textDecoration: "none", fontSize: 15, padding: "10px 0", borderTop: "1px solid #1D2029" }}>
                {item}
              </a>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px 80px" }}>
        {/* Header */}
        <div className="header-row" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(124,92,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FolderKanban size={21} color="#B8A9FD" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(22px, 3.6vw, 28px)", fontWeight: 600, margin: "0 0 4px" }}>
                Judge <span style={{ color: "#8A6EFC" }}>Dashboard</span>
              </h1>
              <p style={{ color: "#9A96AC", fontSize: 14, margin: 0 }}>Review team submissions, score projects, and provide feedback.</p>
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "#14161C", border: "1px solid #1D2029", borderRadius: 12, padding: "12px 18px",
          }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(124,92,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Code2 size={16} color="#B8A9FD" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Sample Hack 2027</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#9A96AC", marginTop: 2 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} /> Mar 1 – Mar 3, 2027</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> Virtual event</span>
              </div>
            </div>
          </div>
        </div>

        <div className="main-grid">
          {/* Main column */}
          <div>
            {/* Tracks */}
            <Panel>
              <PanelHeading title="Tracks" />
              <div className="track-grid">
                {TRACKS.map((t) => {
                  const count = PROJECTS.filter((p) => p.track === t.id).length;
                  const active = t.id === activeTrack;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTrack(t.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                        borderRadius: 10, cursor: "pointer", textAlign: "left",
                        border: active ? "1px solid #7C5CFC" : "1px solid #262A34",
                        background: active ? "rgba(124,92,252,0.12)" : "#14161C",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(124,92,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <t.icon size={15} color="#B8A9FD" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#E8E6F0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.label}</div>
                        <div style={{ fontSize: 11, color: "#5B5F6D" }}>{count} teams</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Panel>

            {/* Track detail */}
            <Panel>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
                <div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>
                    {track.label} Track
                  </h2>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#9B87F5", marginBottom: 4 }}>Track focus</div>
                  <p style={{ fontSize: 13.5, color: "#9A96AC", lineHeight: 1.5, margin: 0, maxWidth: 480 }}>{track.focus}</p>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                  <StatMini label="Total teams" value={trackProjects.length} />
                  <StatMini label="Scored" value={0} color="#4ADE80" />
                  <StatMini label="Pending" value={trackProjects.length} color="#EAB308" />
                </div>
              </div>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Team name</th>
                      <th>Members</th>
                      <th>Submission</th>
                      <th>GitHub</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackProjects.map((p, i) => {
                      const team = TEAMS[p.team];
                      const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                      return (
                        <tr key={p.id}>
                          <td style={{ color: "#5B5F6D" }}>{i + 1}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <div style={{
                                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                                background: `${color}30`, color, fontSize: 11, fontWeight: 700,
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                {team.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: "#E8E6F0" }}>{p.title}</div>
                                <div style={{ fontSize: 11.5, color: "#5B5F6D" }}>{team.name}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: "#9A96AC" }}>{team.members}</td>
                          <td>
                            <a href="#" style={{ display: "flex", alignItems: "center", gap: 5, color: "#B8A9FD", textDecoration: "none", fontSize: 13 }}>
                              <FileText size={13} /> View PPT
                            </a>
                          </td>
                          <td>
                            <a href="#" style={{ display: "flex", alignItems: "center", gap: 5, color: "#B8A9FD", textDecoration: "none", fontSize: 13 }}>
                              <Github size={13} /> View repo
                            </a>
                          </td>
                          <td style={{ color: "#5B5F6D" }}>—</td>
                          <td><span className="status-pending">Pending</span></td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <button style={{
                                display: "flex", alignItems: "center", gap: 5,
                                background: "#7C5CFC", border: "none", color: "#FFFFFF",
                                padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500,
                                cursor: "pointer", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
                              }}>
                                <MessageSquare size={12} /> Comment
                              </button>
                              <button style={{ background: "none", border: "none", color: "#5B5F6D", cursor: "pointer", padding: 4 }}>
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Panel>
              <PanelHeading title="Overall progress" />
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <RingStat percent={0} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <LegendRow color="#4ADE80" label="Scored teams" value={0} />
                  <LegendRow color="#EAB308" label="Pending teams" value={PROJECTS.length} />
                  <LegendRow color="#5B5F6D" label="Total teams" value={PROJECTS.length} />
                </div>
              </div>
            </Panel>

            <button style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", background: "linear-gradient(135deg, #8A6EFC, #6D4FE8)",
              color: "#FFFFFF", border: "none", padding: "13px", borderRadius: 10,
              fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}>
              <Download size={15} /> Export CSV
            </button>

            <Panel>
              <PanelHeading title="Quick stats" />
              <div className="stats-row">
                <QuickStat icon={Users} value={TRACKS.length} label="Total tracks" />
                <QuickStat icon={Users} value={Object.keys(TEAMS).length} label="Total teams" />
                <QuickStat icon={FileText} value={PROJECTS.length} label="Total submissions" />
              </div>
            </Panel>

            <Panel>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <PanelHeading title="Judge comments" />
              </div>
              <textarea
                placeholder="Add a general note for the track..."
                style={{
                  width: "100%", minHeight: 76, background: "#0F1115", border: "1px solid #262A34",
                  borderRadius: 9, padding: "12px 14px", color: "#E8E6F0", fontFamily: "Inter, sans-serif",
                  fontSize: 13.5, outline: "none", resize: "vertical", marginBottom: 12,
                }}
              />
              <button style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "#7C5CFC", border: "none", color: "#FFFFFF",
                padding: "10px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}>
                <Send size={13} /> Post note
              </button>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ children }) {
  return (
    <div style={{ background: "#14161C", border: "1px solid #1D2029", borderRadius: 14, padding: "22px", marginBottom: 20 }}>
      {children}
    </div>
  );
}

function PanelHeading({ title }) {
  return <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>{title}</h2>;
}

function StatMini({ label, value, color = "#E8E6F0" }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "#5B5F6D", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
    </div>
  );
}

function QuickStat({ icon: Icon, value, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 90 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(124,92,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color="#B8A9FD" />
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
        <div style={{ fontSize: 11, color: "#5B5F6D" }}>{label}</div>
      </div>
    </div>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: "#C7C4D6" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#E8E6F0", marginLeft: "auto" }}>{value}</span>
    </div>
  );
}

function RingStat({ percent }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div style={{ position: "relative", width: 104, height: 104, flexShrink: 0 }}>
      <svg width="104" height="104" viewBox="0 0 104 104">
        <circle cx="52" cy="52" r={r} stroke="#1D2029" strokeWidth="10" fill="none" />
        <circle
          cx="52" cy="52" r={r} stroke="#7C5CFC" strokeWidth="10" fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 52 52)"
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 19, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{percent}%</span>
        <span style={{ fontSize: 9, color: "#5B5F6D" }}>Scoring</span>
      </div>
    </div>
  );
}
