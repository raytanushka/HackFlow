import { useState } from "react";
import {
  Rocket, Bell, ChevronDown, Users, FolderKanban, Gavel, Tag,
  Calendar, Clock, ArrowRight, Code2, BarChart3, Accessibility, Shield,
  Leaf, HeartPulse, BookOpen, Cpu, Activity, UserPlus, ClipboardCheck,
  UserCheck, AlertCircle,
} from "lucide-react";

const TRACKS = [
  { icon: Code2, label: "Developer tools" },
  { icon: BarChart3, label: "Data and analytics" },
  { icon: Accessibility, label: "Accessibility" },
  { icon: Shield, label: "Security" },
  { icon: Leaf, label: "Climate" },
  { icon: HeartPulse, label: "Health" },
  { icon: BookOpen, label: "Education" },
  { icon: Cpu, label: "Open hardware" },
];

const JUDGES = [
  { name: "Tomas Varga", done: 8, total: 8 },
  { name: "Wei Lindqvist", done: 9, total: 12 },
  { name: "Priya Nair", done: 7, total: 10 },
  { name: "Noor Haddad", done: 8, total: 8 },
];

const PROJECTS = [
  { name: "Glass Signal", team: "NorthKiln", track: "Security", submitted: "Feb 27, 4:08 AM" },
  { name: "Small Meadow", team: "LoudQuarry", track: "Accessibility", submitted: "Feb 27, 8:06 PM" },
  { name: "Deep Compass", team: "StillTrail", track: "Accessibility", submitted: "Feb 28, 4:58 PM" },
  { name: "Green Switch", team: "SaltDrift", track: "Education", submitted: "Feb 27, 5:00 PM" },
  { name: "North Compass", team: "AmberSwitch", track: "Data and analytics", submitted: "Feb 27, 4:40 AM" },
];

const ACTIVITY = [
  { icon: FolderKanban, color: "#7C5CFC", title: "New project submission", note: "Green Switch by SaltDrift (Education)", time: "Feb 27, 5:00 PM" },
  { icon: UserPlus, color: "#F97316", title: "Team registered", note: "AmberSwitch", time: "Feb 27, 4:12 PM" },
  { icon: UserCheck, color: "#3B82F6", title: "Judge assigned", note: "Priya Nair → Security, Climate", time: "Feb 27, 3:45 PM" },
  { icon: Users, color: "#4ADE80", title: "New team member", note: "lena2@example.org joined LoudQuarry", time: "Feb 27, 2:30 PM" },
  { icon: AlertCircle, color: "#EAB308", title: "Submission deadline upcoming", note: "1 day remaining", time: "Feb 28, 6:00 PM" },
];

export default function OrganizerDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#0F1115", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .stat-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr; }
        }
        .main-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 20px;
        }
        @media (max-width: 980px) {
          .main-grid { grid-template-columns: 1fr; }
        }
        .track-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        @media (max-width: 640px) {
          .track-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .hero-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-size: 12.5px; color: #5B5F6D; font-weight: 500; padding: 0 0 10px; }
        td { padding: 12px 0; border-top: 1px solid #1D2029; font-size: 13.5px; }
        .table-scroll { overflow-x: auto; }
        .table-scroll table { min-width: 560px; }
        .status-pill {
          display: inline-block; padding: 3px 10px; border-radius: 20px;
          background: rgba(74,222,128,0.12); color: #4ADE80; font-size: 12px; font-weight: 500;
        }
      `}</style>

      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1D2029", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Rocket size={16} color="#0F1115" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>
            HackFlow
          </span>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative" }}>
              <Bell size={18} color="#9A96AC" />
              <span style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: "#F87171", border: "1.5px solid #0F1115" }} />
            </div>
            <div
              onClick={() => setMenuOpen((m) => !m)}
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", position: "relative" }}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(124,92,252,0.25)", border: "1px solid #7C5CFC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 600, color: "#B8A9FD" }}>
                O
              </div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Organizer</span>
              <ChevronDown size={14} color="#9A96AC" />
              {menuOpen && (
                <div style={{
                  position: "absolute", top: 36, right: 0, background: "#171A21",
                  border: "1px solid #262A34", borderRadius: 10, padding: 6, minWidth: 140,
                  boxShadow: "0 12px 24px rgba(0,0,0,0.4)", zIndex: 10,
                }}>
                  <div style={{ padding: "8px 10px", fontSize: 13.5, color: "#C7C4D6", borderRadius: 6, cursor: "pointer" }}>Profile</div>
                  <div style={{ padding: "8px 10px", fontSize: 13.5, color: "#C7C4D6", borderRadius: 6, cursor: "pointer" }}>Settings</div>
                  <div style={{ padding: "8px 10px", fontSize: 13.5, color: "#F87171", borderRadius: 6, cursor: "pointer" }}>Log out</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Header + hero */}
        <div className="hero-row" style={{ marginBottom: 28 }}>
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#9B87F5", letterSpacing: "0.01em" }}>
              Organizer dashboard
            </span>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 600, margin: "6px 0 6px", letterSpacing: "-0.015em" }}>
              Welcome back, Organizer
            </h1>
            <p style={{ color: "#9A96AC", fontSize: 14.5, margin: 0 }}>Here's an overview of your hackathon event.</p>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            background: "linear-gradient(135deg, #1B1440, #2A1D5C)",
            border: "1px solid #2A2560", borderRadius: 14, padding: "16px 22px",
          }}>
            <div style={{ width: 46, height: 46, borderRadius: 11, background: "rgba(124,92,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Rocket size={20} color="#B8A9FD" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600 }}>Sample Hack 2027</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#4ADE80", background: "rgba(74,222,128,0.15)", padding: "2px 8px", borderRadius: 20 }}>● LIVE</span>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12.5, color: "#9A96AC" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={13} /> Mar 1 – Mar 3, 2027</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={13} /> Deadline Mar 1, 6:00 PM UTC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <StatCard icon={Users} label="Total teams" value="40" sub="40 teams registered" />
          <StatCard icon={FolderKanban} label="Total projects" value="41" sub="41 projects submitted" />
          <StatCard icon={Gavel} label="Total judges" value="30" sub="30 judges assigned" />
          <StatCard icon={Tag} label="Tracks" value="8" sub="8 active tracks" />
        </div>

        <div className="main-grid" style={{ marginBottom: 20 }}>
          {/* Event overview */}
          <Panel>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <PanelHeading icon={Calendar} title="Event overview" />
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "transparent", border: "1px solid #3A3560", color: "#B8A9FD",
                padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}>
                View hackathon details <ArrowRight size={13} />
              </button>
            </div>

            <div className="info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
              <MetaBlock label="Event name" value="Sample Hack 2027" />
              <MetaBlock label="Event ID" value="evt_01" />
              <MetaBlock label="Submission deadline" value="Mar 1, 2027 · 6:00 PM UTC" />
            </div>

            <p style={{ color: "#9A96AC", fontSize: 14, lineHeight: 1.65, margin: "0 0 22px" }}>
              Sample Hack 2027 is a 48-hour hackathon designed to bring together creative thinkers,
              problem solvers, and builders from around the world, tackling real-world challenges
              across 8 tracks.
            </p>

            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#C7C4D6", marginBottom: 12 }}>Tracks (8)</div>
            <div className="track-grid">
              {TRACKS.map(({ icon: Icon, label }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                  borderRadius: 9, border: "1px solid #262A34", background: "#14161C",
                }}>
                  <Icon size={14} color="#B8A9FD" />
                  <span style={{ fontSize: 12.5, color: "#C7C4D6", fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Judging progress */}
          <Panel>
            <PanelHeading icon={Gavel} title="Judging progress" />
            <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 24, flexWrap: "wrap" }}>
              <RingStat percent={78} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80" }} />
                  <span style={{ fontSize: 15, fontWeight: 600 }}>32</span>
                  <span style={{ fontSize: 12.5, color: "#9A96AC" }}>Projects with scores</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EAB308" }} />
                  <span style={{ fontSize: 15, fontWeight: 600 }}>9</span>
                  <span style={{ fontSize: 12.5, color: "#9A96AC" }}>Projects pending</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#C7C4D6", marginBottom: 14 }}>Judge progress</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {JUDGES.map((j) => {
                const pct = Math.round((j.done / j.total) * 100);
                return (
                  <div key={j.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: "#C7C4D6" }}>{j.name}</span>
                      <span style={{ color: "#5B5F6D" }}>{j.done} / {j.total}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 4, background: "#1D2029" }}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #7C5CFC, #B8A9FD)" }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#5B5F6D", width: 34, textAlign: "right" }}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "#B8A9FD", textDecoration: "none", marginTop: 16 }}>
              View all judges <ArrowRight size={13} />
            </a>
          </Panel>
        </div>

        <div className="main-grid">
          {/* Recent projects */}
          <Panel>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <PanelHeading icon={Users} title="Recent projects" />
              <a href="#" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#B8A9FD", textDecoration: "none" }}>
                View all <ArrowRight size={13} />
              </a>
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
                  </tr>
                </thead>
                <tbody>
                  {PROJECTS.map((p) => (
                    <tr key={p.name}>
                      <td style={{ fontWeight: 600, color: "#E8E6F0" }}>{p.name}</td>
                      <td style={{ color: "#9A96AC" }}>{p.team}</td>
                      <td style={{ color: "#9A96AC" }}>{p.track}</td>
                      <td style={{ color: "#9A96AC" }}>{p.submitted}</td>
                      <td><span className="status-pill">Submitted</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Recent activity */}
          <Panel>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <PanelHeading icon={Activity} title="Recent activity" />
              <a href="#" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#B8A9FD", textDecoration: "none" }}>
                View all <ArrowRight size={13} />
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: `${a.color}22`, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <a.icon size={15} color={a.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#E8E6F0" }}>{a.title}</div>
                    <div style={{ fontSize: 12.5, color: "#9A96AC", marginTop: 1 }}>{a.note}</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#5B5F6D", whiteSpace: "nowrap" }}>{a.time}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div style={{ background: "#14161C", border: "1px solid #1D2029", borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(124,92,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color="#B8A9FD" />
        </div>
        <span style={{ fontSize: 13, color: "#9A96AC" }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#4ADE80" }}>↑ {sub}</div>
    </div>
  );
}

function Panel({ children }) {
  return (
    <div style={{ background: "#14161C", border: "1px solid #1D2029", borderRadius: 14, padding: "24px" }}>
      {children}
    </div>
  );
}

function PanelHeading({ icon: Icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(124,92,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color="#B8A9FD" />
      </div>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: 0 }}>{title}</h2>
    </div>
  );
}

function MetaBlock({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#5B5F6D", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#E8E6F0" }}>{value}</div>
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
        <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{percent}%</span>
        <span style={{ fontSize: 9.5, color: "#5B5F6D" }}>Overall</span>
      </div>
    </div>
  );
}
