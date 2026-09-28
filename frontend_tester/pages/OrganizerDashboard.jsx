import { useState } from "react";
import {
  Rocket, Bell, ChevronDown, Users, FolderKanban, Gavel, Tag,
  Calendar, Clock, ArrowRight, Code2, BarChart3, Accessibility, Shield,
  Leaf, HeartPulse, BookOpen, Cpu, Activity, UserPlus, ClipboardCheck,
  UserCheck, AlertCircle, Home, LogOut
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

export default function OrganizerDashboard({ user, onNavigate, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUser = user || (localStorage.getItem("hackflow_user") ? JSON.parse(localStorage.getItem("hackflow_user")) : null);

  const handleLogout = () => {
    localStorage.removeItem("hackflow_user");
    if (onLogout) onLogout();
    if (onNavigate) onNavigate("HackFlow Home");
  };

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
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onNavigate && onNavigate("HackFlow Home")}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Rocket size={16} color="#0F1115" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>
              HackFlow
            </span>
          </div>

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
                {currentUser && currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "O"}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                {currentUser ? currentUser.name : "Organizer"}
              </span>
              <ChevronDown size={14} color="#9A96AC" />

              {menuOpen && (
                <div style={{
                  position: "absolute", top: 36, right: 0, background: "#171A21",
                  border: "1px solid #262A34", borderRadius: 10, padding: 6, minWidth: 160,
                  boxShadow: "0 12px 24px rgba(0,0,0,0.4)", zIndex: 10,
                }}>
                  <div
                    onClick={() => onNavigate && onNavigate("HackFlow Home")}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", fontSize: 13.5, color: "#C7C4D6", borderRadius: 6, cursor: "pointer" }}
                  >
                    <Home size={14} color="#7C5CFC" /> Home Page
                  </div>
                  <div
                    onClick={handleLogout}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", fontSize: 13.5, color: "#F87171", borderRadius: 6, cursor: "pointer" }}
                  >
                    <LogOut size={14} /> Log out
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Header summary */}
        <div className="hero-row" style={{ marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 13, color: "#5B5F6D", marginBottom: 4 }}>ORGANIZER DASHBOARD</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, margin: "0 0 6px" }}>
              Sample Hack 2026
            </h1>
            <div style={{ fontSize: 13.5, color: "#9A96AC", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={14} color="#7C5CFC" /> Feb 26 – Mar 1, 2026
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={14} color="#EAB308" /> Submissions close: Mar 1, 6:00 PM UTC
              </span>
              {currentUser && currentUser.orgId && (
                <span style={{ background: "rgba(124,92,252,0.15)", color: "#B8A9FD", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>
                  ID: {currentUser.orgId}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button style={{
              background: "#14161C", border: "1px solid #262A34", color: "#E8E6F0",
              padding: "10px 16px", borderRadius: 9, fontSize: 13.5, fontWeight: 500,
              cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}>
              Export results CSV
            </button>
            <button style={{
              background: "linear-gradient(135deg, #7C5CFC, #6344E7)", border: "none", color: "#FFFFFF",
              padding: "10px 18px", borderRadius: 9, fontSize: 13.5, fontWeight: 600,
              cursor: "pointer", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: 8,
            }}>
              Manage hackathon <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="stat-grid" style={{ marginBottom: 32 }}>
          <StatCard icon={Users} label="Total teams" value="40" sub="100% submitted" />
          <StatCard icon={FolderKanban} label="Projects" value="41" sub="1 multi-project team" />
          <StatCard icon={Gavel} label="Judges" value="30" sub="Across 8 tracks" />
          <StatCard icon={Tag} label="Tracks" value="8" sub="All tracks active" />
        </div>

        {/* Middle row: Tracks & Progress */}
        <div className="main-grid" style={{ marginBottom: 32 }}>
          {/* Tracks overview */}
          <Panel>
            <PanelHeading icon={Tag} title="Tracks overview (8)" />
            <p style={{ fontSize: 13, color: "#5B5F6D", margin: "6px 0 18px" }}>
              Projects submitted per track for Sample Hack 2026.
            </p>
            <div className="track-grid">
              {TRACKS.map((t) => (
                <div key={t.label} style={{
                  background: "#0F1115", border: "1px solid #1D2029", borderRadius: 10,
                  padding: "14px 12px", display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <t.icon size={18} color="#7C5CFC" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#E8E6F0", lineHeight: 1.3 }}>{t.label}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Scoring progress */}
          <Panel>
            <PanelHeading icon={Gavel} title="Scoring progress" />
            <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "16px 0 20px" }}>
              <RingStat percent={78} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
