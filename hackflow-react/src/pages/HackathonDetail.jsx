import { useState } from "react";
import {
  Rocket, Calendar, Users, MapPin, ShieldCheck, Info, Check,
  Target, Trophy, ArrowRight, Lightbulb, FileText,
  Code2, BarChart3, Accessibility, Shield, Leaf, HeartPulse, BookOpen, Cpu,
} from "lucide-react";

const TRACKS = [
  { icon: Code2, label: "Developer Tools" },
  { icon: BarChart3, label: "Data and Analytics" },
  { icon: Accessibility, label: "Accessibility" },
  { icon: Shield, label: "Security" },
  { icon: Leaf, label: "Climate" },
  { icon: HeartPulse, label: "Health" },
  { icon: BookOpen, label: "Education" },
  { icon: Cpu, label: "Open Hardware" },
];

const DATES = [
  { label: "Registration Opens", date: "Feb 1, 2027" },
  { label: "Registration Closes", date: "Feb 20, 2027" },
  { label: "Hackathon Begins", date: "Mar 1, 2027 (9:00 AM)" },
  { label: "Submission Deadline", date: "Mar 3, 2027 (6:00 PM)" },
  { label: "Results Announcement", date: "Mar 5, 2027" },
];

export default function HackathonDetail() {
  const [joined, setJoined] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#0F1115", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .layout { grid-template-columns: 1fr; }
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 560px) {
          .info-grid { grid-template-columns: 1fr 1fr; }
        }
        .track-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        @media (max-width: 700px) {
          .track-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
      `}</style>

      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1D2029", padding: "18px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Rocket size={16} color="#0F1115" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>
            HackFlow
          </span>
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: "#4ADE80", background: "rgba(74,222,128,0.1)", padding: "4px 10px", borderRadius: 20, fontWeight: 500 }}>
            Live
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 24px 100px" }}>
        {/* Hero */}
        <div style={{
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          background: "linear-gradient(135deg, #1B1440 0%, #2A1D5C 45%, #171A21 100%)",
          border: "1px solid #2A2560",
          padding: "32px",
          marginBottom: 28,
        }}>
          <svg style={{ position: "absolute", right: -40, top: -20, opacity: 0.25 }} width="420" height="260" viewBox="0 0 420 260" fill="none">
            <path d="M0 200 Q 100 140 210 180 T 420 120" stroke="#9B87F5" strokeWidth="1.5" fill="none" />
            <path d="M0 240 Q 120 180 230 220 T 420 160" stroke="#9B87F5" strokeWidth="1" fill="none" />
          </svg>

          <div style={{ position: "relative", display: "flex", gap: 22, flexWrap: "wrap" }}>
            <div style={{
              width: 84, height: 84, borderRadius: 14, flexShrink: 0,
              background: "rgba(124,92,252,0.18)", border: "1px solid rgba(155,135,245,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Rocket size={34} color="#B8A9FD" strokeWidth={1.8} />
            </div>

            <div style={{ flex: 1, minWidth: 240 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "rgba(74,222,128,0.15)", color: "#4ADE80",
                fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 20, marginBottom: 12,
              }}>
                ● LIVE
              </span>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 4.5vw, 32px)", fontWeight: 600, margin: "0 0 8px", letterSpacing: "-0.015em" }}>
                Sample Hack 2027
              </h1>
              <p style={{ color: "#C7C4D6", fontSize: 15, margin: "0 0 18px", maxWidth: 480, lineHeight: 1.5 }}>
                Build hardware and software that gets deployed, not shelved — for real users, real constraints.
              </p>

              <div className="hero-meta">
                <MetaItem icon={Calendar} text="Mar 1, 2027 – Mar 3, 2027" />
                <MetaItem icon={Users} text="Team-based" />
                <MetaItem icon={MapPin} text="Virtual" />
              </div>
            </div>
          </div>
        </div>

        <div className="layout">
          {/* Main column */}
          <div>
            {/* Tracks */}
            <Panel>
              <PanelHeading icon={Users} title="Tracks" note="Choose from 8 tracks and build something meaningful." />
              <div className="track-grid">
                {TRACKS.map(({ icon: Icon, label }) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "12px 14px", borderRadius: 10,
                    border: "1px solid #262A34", background: "#14161C",
                  }}>
                    <Icon size={16} color="#B8A9FD" />
                    <span style={{ fontSize: 13.5, color: "#C7C4D6", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* About */}
            <Panel>
              <PanelHeading icon={FileText} title="About the Hackathon" />
              <p style={{ color: "#9A96AC", fontSize: 14.5, lineHeight: 1.7, margin: "0 0 22px" }}>
                Sample Hack 2027 is a 48-hour hackathon for students building hardware-integrated
                and social-impact solutions. We're looking for teams who can take a real problem —
                accessibility, safety, sustainability — from concept to a working prototype in one weekend.
              </p>

              <div className="info-grid" style={{ marginBottom: 28 }}>
                <InfoStat icon={Calendar} label="Duration" value="48 Hours" sub="Mar 1 – Mar 3, 2027" />
                <InfoStat icon={Users} label="Team Size" value="2–4 members" sub="recommended" />
                <InfoStat icon={MapPin} label="Mode" value="Virtual" sub="Online" />
              </div>

              <SubSection icon={Target} title="What We're Looking For" items={[
                "Innovative and practical solutions to real-world problems",
                "Technical implementation — prototype or working build",
                "Clear problem statement and solution approach",
                "Well-documented code and project repository",
              ]} />

              <SubSection icon={Trophy} title="Rewards & Recognition" items={[
                "Top projects receive prizes and certificates",
                "Recognition across all 8 tracks",
                "Feature on our platform and community channels",
              ]} />

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Calendar size={16} color="#B8A9FD" />
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: 0 }}>Important Dates</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingLeft: 2 }}>
                  {DATES.map((d, i) => (
                    <div key={d.label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#7C5CFC", marginTop: 6, flexShrink: 0 }} />
                      <div style={{ display: "flex", flex: 1, justifyContent: "space-between", flexWrap: "wrap", gap: 4, borderBottom: i < DATES.length - 1 ? "1px dashed #1D2029" : "none", paddingBottom: 10 }}>
                        <span style={{ fontSize: 14, color: "#C7C4D6" }}>{d.label}</span>
                        <span style={{ fontSize: 13.5, color: "#5B5F6D" }}>{d.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            {/* Questions footer */}
            <div style={{
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
              background: "linear-gradient(135deg, #1B1440, #1A1D2E)",
              border: "1px solid #2A2560", borderRadius: 12, padding: "18px 22px",
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(124,92,252,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Lightbulb size={18} color="#B8A9FD" />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 2 }}>Have questions?</div>
                <div style={{ fontSize: 13, color: "#9A96AC" }}>Check the FAQ or reach out to the event team.</div>
              </div>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "transparent", border: "1px solid #3A3560", color: "#B8A9FD",
                padding: "9px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 500,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}>
                View FAQ <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Panel>
              <PanelHeading icon={ShieldCheck} title="Eligibility" />
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)",
                borderRadius: 10, padding: "12px 14px", marginBottom: 16,
              }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#4ADE80", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <Check size={13} color="#0F1115" strokeWidth={3} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#E8E6F0" }}>You're eligible to join</div>
                  <div style={{ fontSize: 12.5, color: "#9A96AC", marginTop: 2 }}>You meet all the requirements for this hackathon.</div>
                </div>
              </div>

              <button
                onClick={() => setJoined(true)}
                disabled={joined}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: joined ? "#262A34" : "#7C5CFC", color: joined ? "#5B5F6D" : "#0F1115",
                  border: "none", padding: "13px", borderRadius: 9, fontSize: 14.5, fontWeight: 600,
                  cursor: joined ? "default" : "pointer", fontFamily: "Inter, sans-serif", marginBottom: 20,
                }}
              >
                {joined ? "You've joined" : "Join and confirm"}
                {!joined && <ArrowRight size={15} />}
              </button>

              <div style={{ borderTop: "1px solid #1D2029", paddingTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#9A96AC", marginBottom: 12 }}>Eligibility criteria</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <CriteriaLine text="Currently enrolled in a recognized institution, or a recent graduate" />
                  <CriteriaLine text="Open to individuals and teams" />
                  <CriteriaLine text="No prior participation restriction" />
                  <CriteriaLine text="Ensure your teammates also meet the criteria" info />
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeading icon={Info} title="Quick Info" />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <QuickRow label="Type" value="Online hackathon" />
                <QuickRow label="Tracks" value="8 tracks" />
                <QuickRow label="Team size" value="2–4 members" />
                <QuickRow label="Submission format" value="PPT + GitHub repo" />
                <QuickRow label="Languages" value="Any" />
                <QuickRow label="Eligibility" value="Open to all students" />
              </div>
            </Panel>

            <div style={{
              borderRadius: 12, padding: "18px 20px",
              background: "linear-gradient(135deg, #1B1440, #171A21)",
              border: "1px solid #2A2560",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 18 }}>✦</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Great ideas build a better tomorrow.</div>
                <div style={{ fontSize: 12.5, color: "#9A96AC" }}>We can't wait to see what you create.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ children }) {
  return (
    <div style={{
      background: "#14161C", border: "1px solid #1D2029", borderRadius: 14,
      padding: "24px", marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

function PanelHeading({ icon: Icon, title, note }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: note ? 18 : 16 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(124,92,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        <Icon size={15} color="#B8A9FD" />
      </div>
      <div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: 0 }}>{title}</h2>
        {note && <p style={{ fontSize: 13, color: "#5B5F6D", margin: "3px 0 0" }}>{note}</p>}
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, color: "#C7C4D6" }}>
      <Icon size={15} color="#9B87F5" />
      {text}
    </div>
  );
}

function InfoStat({ icon: Icon, label, value, sub }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Icon size={14} color="#5B5F6D" />
        <span style={{ fontSize: 12.5, color: "#5B5F6D" }}>{label}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#E8E6F0" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#5B5F6D" }}>{sub}</div>
    </div>
  );
}

function SubSection({ icon: Icon, title, items }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon size={16} color="#B8A9FD" />
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: 0 }}>{title}</h3>
      </div>
      <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map((item) => (
          <li key={item} style={{ fontSize: 14, color: "#9A96AC", lineHeight: 1.5 }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function CriteriaLine({ text, info }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      {info ? (
        <Info size={14} color="#7C5CFC" style={{ marginTop: 2, flexShrink: 0 }} />
      ) : (
        <Check size={14} color="#4ADE80" style={{ marginTop: 2, flexShrink: 0 }} />
      )}
      <span style={{ fontSize: 13, color: "#9A96AC", lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function QuickRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13.5 }}>
      <span style={{ color: "#5B5F6D" }}>{label}</span>
      <span style={{ color: "#C7C4D6", fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}
