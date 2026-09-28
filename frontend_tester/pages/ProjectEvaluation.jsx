import { useState, useMemo } from "react";
import {
  Code2, Bell, ChevronDown, ArrowLeft, ExternalLink, GitBranch as Github, FileText,
  Lightbulb, Terminal, Brain, Target, MonitorPlay, Users, Star,
  MessageSquare, Send, Shield, Minus, Plus, Trophy,
} from "lucide-react";

// Pulled from the submitted project data
const PROJECT = {
  id: "prj_01",
  title: "Glass Signal",
  team: { id: "tm_01", name: "NorthKiln", members: ["priya1@example.org", "member1_1@example.org", "member1_2@example.org"] },
  track: "Security",
  summary: "One line of what it does.",
  repoUrl: "https://example.org/repo/01",
  submittedAt: "Feb 27, 2026 · 4:08 AM",
};

const CRITERIA = [
  { key: "innovation", icon: Lightbulb, title: "Innovation & Creativity", note: "Uniqueness of idea, originality, and problem-solving approach.", weight: 18, default: 8 },
  { key: "technical", icon: Terminal, title: "Technical Implementation", note: "Code quality, use of technologies, and overall functionality.", weight: 16, default: 7 },
  { key: "ai", icon: Brain, title: "Use of AI / ML", note: "Effective use of AI/ML models, data handling, and accuracy.", weight: 18, default: 8 },
  { key: "impact", icon: Target, title: "Impact & Relevance", note: "Real-world applicability, user value, and potential impact.", weight: 16, default: 7 },
  { key: "presentation", icon: MonitorPlay, title: "Presentation & Demo", note: "Clarity, structure, storytelling, and demo effectiveness.", weight: 16, default: 8 },
  { key: "teamwork", icon: Users, title: "Teamwork & Execution", note: "Collaboration, roles, and overall execution quality.", weight: 16, default: 8 },
];

function verdict(avg) {
  if (avg >= 8.5) return { label: "Excellent", color: "#4ADE80" };
  if (avg >= 7) return { label: "Strong", color: "#7C5CFC" };
  if (avg >= 5) return { label: "Fair", color: "#EAB308" };
  return { label: "Needs work", color: "#F87171" };
}

export default function ProjectEvaluation() {
  const [scores, setScores] = useState(Object.fromEntries(CRITERIA.map((c) => [c.key, c.default])));
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const avg = useMemo(() => {
    const total = CRITERIA.reduce((sum, c) => sum + scores[c.key], 0);
    return total / CRITERIA.length;
  }, [scores]);

  const setScore = (key, delta) => {
    setScores((s) => ({ ...s, [key]: Math.min(10, Math.max(0, s[key] + delta)) }));
  };

  const v = verdict(avg);
  const sumStr = CRITERIA.map((c) => scores[c.key]).join(" + ");

  return (
    <div style={{ minHeight: "100vh", background: "#0F1115", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
        @media (max-width: 1020px) { .layout { grid-template-columns: 1fr; } }
        .head-row { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; }
        .crit-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 16px 18px; }
        .crit-info { display: flex; gap: 12px; flex: 1; min-width: 220px; }
        .crit-control { display: flex; align-items: center; gap: 10px; margin-left: auto; }
        textarea {
          width: 100%; min-height: 90px; background: #0F1115; border: 1px solid #262A34;
          border-radius: 9px; padding: 12px 14px; color: #E8E6F0; font-family: 'Inter', sans-serif;
          font-size: 13.5px; outline: none; resize: vertical;
        }
        textarea:focus { border-color: #7C5CFC; }
      `}</style>

      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1D2029", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Code2 size={16} color="#0F1115" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16 }}>HackFlow</span>
          </div>
          <div style={{ display: "flex", gap: 22, flex: 1 }}>
            <span style={{ fontSize: 14, color: "#9A96AC" }}>Home</span>
            <span style={{ fontSize: 14, color: "#9A96AC" }}>Hackathons</span>
            <span style={{ fontSize: 14, color: "#9A96AC" }}>Projects</span>
            <span style={{ fontSize: 14, color: "#B8A9FD", fontWeight: 500, borderBottom: "2px solid #7C5CFC", paddingBottom: 16, marginBottom: -17 }}>Judge Dashboard</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <Bell size={18} color="#9A96AC" />
              <span style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: "#F87171", border: "1.5px solid #0F1115" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(124,92,252,0.25)", border: "1px solid #7C5CFC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 600, color: "#B8A9FD" }}>
                JD
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.2 }}>Dr. Alex Carter</div>
                <div style={{ fontSize: 11, color: "#5B5F6D", lineHeight: 1.2 }}>Judge</div>
              </div>
              <ChevronDown size={14} color="#5B5F6D" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px 24px 80px" }}>
        <a href="#" onClick={(e) => e.preventDefault()} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#B8A9FD", textDecoration: "none", fontSize: 14, fontWeight: 500, marginBottom: 20 }}>
          <ArrowLeft size={15} /> Back to teams
        </a>

        {/* Project header */}
        <div className="head-row" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 18 }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: "linear-gradient(135deg, #4C3BCF, #7C5CFC)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Shield size={26} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 600, margin: 0 }}>{PROJECT.title}</h1>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#B8A9FD", background: "rgba(124,92,252,0.15)", padding: "3px 10px", borderRadius: 20 }}>{PROJECT.id}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#4ADE80", background: "rgba(74,222,128,0.12)", padding: "3px 10px", borderRadius: 20 }}>Scored</span>
              </div>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9A96AC" }}>
                  <Shield size={13} /> {PROJECT.track} Track
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9A96AC" }}>
                  <Users size={13} /> Team {PROJECT.team.name} · {PROJECT.team.members.length} members
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: "#9A96AC", margin: 0, maxWidth: 460, lineHeight: 1.55 }}>{PROJECT.summary}</p>
            </div>
          </div>

          <div style={{ background: "#14161C", border: "1px solid #1D2029", borderRadius: 14, padding: "16px 20px", minWidth: 240 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 12 }}>Quick links</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <QuickLink icon={Github} label="GitHub repo" href={PROJECT.repoUrl} />
              <QuickLink icon={FileText} label="Submission notes" href={PROJECT.repoUrl} />
            </div>
          </div>
        </div>

        <div className="layout">
          {/* Main column */}
          <div>
            <Panel>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, margin: "0 0 4px" }}>Evaluation criteria</h2>
              <p style={{ fontSize: 13.5, color: "#9A96AC", margin: "0 0 4px" }}>Rate the team on each parameter below. Each parameter is out of 10.</p>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {CRITERIA.map((c, i) => (
                  <div key={c.key} className="crit-row" style={{ borderTop: i === 0 ? "none" : "1px solid #1D2029" }}>
                    <div className="crit-info">
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(124,92,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <c.icon size={16} color="#B8A9FD" />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#E8E6F0", marginBottom: 2 }}>{c.title}</div>
                        <div style={{ fontSize: 12.5, color: "#5B5F6D" }}>{c.note}</div>
                      </div>
                    </div>
                    <div className="crit-control">
                      <ScoreStepper value={scores[c.key]} onDec={() => setScore(c.key, -1)} onInc={() => setScore(c.key, 1)} />
                      <div style={{ textAlign: "right", minWidth: 62 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{scores[c.key]} / 10</div>
                        <div style={{ fontSize: 11, color: "#5B5F6D" }}>({c.weight}%)</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14,
                background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.3)",
                borderRadius: 12, padding: "16px 20px", marginTop: 18,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(124,92,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Star size={16} color="#B8A9FD" fill="#B8A9FD" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Average score</div>
                    <div style={{ fontSize: 12, color: "#5B5F6D" }}>({sumStr}) / {CRITERIA.length}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#8A6EFC" }}>
                    {avg.toFixed(1)}<span style={{ fontSize: 15, color: "#5B5F6D", fontWeight: 500 }}> / 10</span>
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, padding: "5px 12px", borderRadius: 20, background: `${v.color}22`, color: v.color }}>
                    {v.label}
                  </span>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeading icon={MessageSquare} title="Judge comments" />
              {submitted ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#4ADE80", fontSize: 14, fontWeight: 500 }}>
                  <Trophy size={16} /> Review submitted for {PROJECT.title}.
                </div>
              ) : (
                <>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 500))}
                    placeholder="Share feedback on what stood out and what could improve..."
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <span style={{ fontSize: 12, color: "#5B5F6D" }}>{comment.length}/500</span>
                    <button
                      onClick={() => setSubmitted(true)}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        background: "linear-gradient(135deg, #8A6EFC, #6D4FE8)", color: "#FFFFFF",
                        border: "none", padding: "10px 20px", borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                        cursor: "pointer", fontFamily: "Inter, sans-serif",
                      }}
                    >
                      <Send size={13} /> Submit review
                    </button>
                  </div>
                </>
              )}
            </Panel>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Panel>
              <PanelHeading icon={Users} title="Team summary" />
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.25)",
                borderRadius: 10, padding: "12px 14px", marginBottom: 16,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #4C3BCF, #7C5CFC)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Shield size={18} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{PROJECT.team.name}</div>
                  <div style={{ fontSize: 11.5, color: "#9A96AC" }}>{PROJECT.track} Track</div>
                </div>
                <span style={{ marginLeft: "auto", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#8A6EFC" }}>
                  {avg.toFixed(1)}
                </span>
              </div>

              <InfoRow label="Track" value={PROJECT.track} />
              <InfoRow label="Total members" value={PROJECT.team.members.length} />
              <InfoRow label="Status" value="Scored" valueColor="#4ADE80" />
              <InfoRow label="Submitted on" value={PROJECT.submittedAt} last />
            </Panel>

            <Panel>
              <PanelHeading icon={Github} title="Project links" />
              <a href={PROJECT.repoUrl} onClick={(e) => e.preventDefault()} style={{
                display: "flex", alignItems: "center", gap: 10, textDecoration: "none",
                border: "1px solid #262A34", borderRadius: 10, padding: "10px 12px",
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#1D2029", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Github size={16} color="#B8A9FD" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E6F0" }}>Project repository</div>
                  <div style={{ fontSize: 11.5, color: "#5B5F6D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{PROJECT.repoUrl}</div>
                </div>
                <ExternalLink size={13} color="#5B5F6D" style={{ marginLeft: "auto", flexShrink: 0 }} />
              </a>
            </Panel>

            <Panel>
              <PanelHeading icon={Users} title="Team members" />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {PROJECT.team.members.map((m) => (
                  <div key={m} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%", background: "rgba(124,92,252,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#B8A9FD", flexShrink: 0,
                    }}>
                      {m[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, color: "#C7C4D6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreStepper({ value, onDec, onInc }) {
  return (
    <div style={{ display: "flex", alignItems: "center", border: "1px solid #262A34", borderRadius: 8, overflow: "hidden" }}>
      <button onClick={onDec} style={{ width: 30, height: 30, background: "#14161C", border: "none", color: "#9A96AC", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Minus size={13} />
      </button>
      <div style={{ width: 34, textAlign: "center", fontSize: 13.5, fontWeight: 600, color: "#E8E6F0" }}>{value}</div>
      <button onClick={onInc} style={{ width: 30, height: 30, background: "#14161C", border: "none", color: "#9A96AC", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Plus size={13} />
      </button>
    </div>
  );
}

function QuickLink({ icon: Icon, label, href }) {
  return (
    <a href={href} onClick={(e) => e.preventDefault()} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#B8A9FD", fontSize: 13.5, fontWeight: 500 }}>
      <Icon size={14} /> {label} <ExternalLink size={12} style={{ marginLeft: "auto" }} />
    </a>
  );
}

function Panel({ children }) {
  return (
    <div style={{ background: "#14161C", border: "1px solid #1D2029", borderRadius: 14, padding: "22px", marginBottom: 20 }}>
      {children}
    </div>
  );
}

function PanelHeading({ icon: Icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(124,92,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={14} color="#B8A9FD" />
      </div>
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15.5, fontWeight: 600, margin: 0 }}>{title}</h3>
    </div>
  );
}

function InfoRow({ label, value, valueColor, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: last ? "none" : "1px solid #1D2029" }}>
      <span style={{ fontSize: 13, color: "#5B5F6D" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: valueColor || "#E8E6F0" }}>{value}</span>
    </div>
  );
}
