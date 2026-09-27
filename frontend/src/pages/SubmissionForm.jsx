import { useState, useMemo, useRef } from "react";
import { Rocket, Github, UploadCloud, Check, ArrowRight, X } from "lucide-react";

const TRACKS = ["Hardware", "Sustainability", "Health & Safety", "Climate", "Accessibility", "Deep Tech"];

export default function SubmissionForm() {
  const [team, setTeam] = useState("");
  const [teammates, setTeammates] = useState("");
  const [projectName, setProjectName] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [repo, setRepo] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const step1Done = team.trim().length > 0;
  const step2Done = projectName.trim() && problem.trim() && solution.trim();
  const step3Done = repo.trim().length > 0 && file;

  const progress = useMemo(() => {
    const done = [step1Done, step2Done, step3Done].filter(Boolean).length;
    return Math.round((done / 3) * 100);
  }, [step1Done, step2Done, step3Done]);

  const handleFile = (f) => {
    if (!f) return;
    const okType = /\.(ppt|pptx)$/i.test(f.name);
    if (!okType) return;
    setFile(f);
  };

  const canSubmit = step1Done && step2Done && step3Done;

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#0F1115", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Inter, sans-serif" }}>
        <div style={{ maxWidth: 440, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Check size={26} color="#4ADE80" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, color: "#E8E6F0", margin: "0 0 12px", fontWeight: 600 }}>
            Submission received
          </h1>
          <p style={{ color: "#9A96AC", fontSize: 15, lineHeight: 1.6, margin: "0 0 28px" }}>
            {projectName || "Your project"} is in for review. Judges will reach out through the contact you registered with.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            style={{ background: "transparent", border: "1px solid #2A2E3A", color: "#9A96AC", padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
          >
            Back to form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0F1115", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        input, textarea {
          width: 100%;
          background: #14161C;
          border: 1px solid #262A34;
          border-radius: 8px;
          padding: 12px 14px;
          color: #E8E6F0;
          font-family: 'Inter', sans-serif;
          font-size: 14.5px;
          outline: none;
          transition: border-color 0.15s ease;
        }
        input::placeholder, textarea::placeholder { color: #5B5F6D; }
        input:focus, textarea:focus { border-color: #7C5CFC; }
        textarea { resize: vertical; min-height: 96px; line-height: 1.55; }
        .field-label {
          display: block;
          font-size: 13.5px;
          font-weight: 500;
          color: #C7C4D6;
          margin-bottom: 7px;
        }
        .section-wrap {
          border-top: 1px solid #1D2029;
          padding: 36px 0;
        }
        .section-wrap:first-of-type { border-top: none; padding-top: 8px; }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 640px) {
          .grid-2 { grid-template-columns: 1fr; }
          .track-pills { justify-content: flex-start !important; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1D2029", padding: "18px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Rocket size={16} color="#0F1115" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>
            SIH Build Track
          </span>
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: "#4ADE80", background: "rgba(74,222,128,0.1)", padding: "4px 10px", borderRadius: 20, fontWeight: 500 }}>
            Submissions open
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 100px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(26px, 5vw, 34px)", fontWeight: 600, margin: "0 0 10px", letterSpacing: "-0.015em" }}>
            Submit your project
          </h1>
          <p style={{ color: "#9A96AC", fontSize: 15, margin: 0, lineHeight: 1.5 }}>
            Deadline is <strong style={{ color: "#C7C4D6", fontWeight: 600 }}>Feb 12, 2027 · 11:59 PM</strong>. Save your GitHub link before you close the tab.
          </p>
        </div>

        {/* Progress tracker */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#5B5F6D", marginBottom: 8 }}>
            <span>Team</span>
            <span>Project</span>
            <span>Materials</span>
          </div>
          <div style={{ display: "flex", gap: 6, height: 4 }}>
            {[step1Done, step2Done, step3Done].map((done, i) => (
              <div key={i} style={{ flex: 1, borderRadius: 4, background: done ? "#7C5CFC" : "#1D2029", transition: "background 0.2s ease" }} />
            ))}
          </div>
        </div>

        {/* Section 1: Team */}
        <div className="section-wrap">
          <SectionHeading title="Team" note="Who's building this." />
          <div className="grid-2">
            <div>
              <label className="field-label">Your name</label>
              <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Shrijita Sen" />
            </div>
            <div>
              <label className="field-label">Teammates</label>
              <input value={teammates} onChange={(e) => setTeammates(e.target.value)} placeholder="Comma-separated names" />
            </div>
          </div>
        </div>

        {/* Section 2: Project */}
        <div className="section-wrap">
          <SectionHeading title="Project" note="What you're building and why." />

          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Project name</label>
            <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Sentinel — mmWave survivor detection" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Problem statement</label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value.slice(0, 1000))}
              placeholder="What real problem does this solve, and for whom?"
              style={{ minHeight: 84 }}
            />
            <div style={{ textAlign: "right", fontSize: 12, color: "#5B5F6D", marginTop: 4 }}>{problem.length}/1000</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Solution</label>
            <textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value.slice(0, 500))}
              placeholder="How does it work? What did you build in the time given?"
              style={{ minHeight: 120 }}
            />
            <div style={{ textAlign: "right", fontSize: 12, color: "#5B5F6D", marginTop: 4 }}>{solution.length}/500</div>
          </div>

          <div>
            <label className="field-label">Track</label>
            <div className="track-pills" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TRACKS.map((t) => (
                <TrackPill key={t} label={t} />
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Materials */}
        <div className="section-wrap">
          <SectionHeading title="Materials" note="Deck and repository judges will actually open." />

          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Presentation deck</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              style={{
                border: `1.5px dashed ${dragOver ? "#7C5CFC" : "#2A2E3A"}`,
                borderRadius: 10,
                padding: "24px 20px",
                textAlign: "center",
                cursor: "pointer",
                background: dragOver ? "rgba(124,92,252,0.05)" : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".ppt,.pptx"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {file ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <Check size={16} color="#4ADE80" />
                  <span style={{ fontSize: 14, color: "#C7C4D6" }}>{file.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}
                  >
                    <X size={14} color="#5B5F6D" />
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud size={22} color="#5B5F6D" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 14, color: "#9A96AC" }}>Drop your .ppt or .pptx here, or click to browse</div>
                  <div style={{ fontSize: 12, color: "#5B5F6D", marginTop: 4 }}>Max 10MB</div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="field-label">GitHub repository</label>
            <div style={{ display: "flex", alignItems: "center", background: "#14161C", border: "1px solid #262A34", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px", borderRight: "1px solid #262A34", height: 44, color: "#5B5F6D", fontSize: 14 }}>
                <Github size={15} />
                github.com/
              </div>
              <input
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="team/project-name"
                style={{ border: "none", borderRadius: 0 }}
              />
            </div>
            <div style={{ fontSize: 12.5, color: "#5B5F6D", marginTop: 6 }}>Make sure the repository is public before judging starts.</div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
          <button
            style={{ background: "transparent", border: "1px solid #262A34", color: "#9A96AC", padding: "12px 20px", borderRadius: 8, fontSize: 14.5, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
          >
            Save draft
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => canSubmit && setSubmitted(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: canSubmit ? "#7C5CFC" : "#262A34",
              color: canSubmit ? "#0F1115" : "#5B5F6D",
              border: "none",
              padding: "12px 22px",
              borderRadius: 8,
              fontSize: 14.5,
              fontWeight: 600,
              cursor: canSubmit ? "pointer" : "not-allowed",
              fontFamily: "Inter, sans-serif",
              transition: "background 0.15s ease",
            }}
          >
            Submit project
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title, note }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, margin: "0 0 4px", color: "#E8E6F0" }}>
        {title}
      </h2>
      <p style={{ fontSize: 13.5, color: "#5B5F6D", margin: 0 }}>{note}</p>
    </div>
  );
}

function TrackPill({ label }) {
  const [active, setActive] = useState(false);
  return (
    <button
      onClick={() => setActive((a) => !a)}
      style={{
        padding: "7px 14px",
        borderRadius: 20,
        border: `1px solid ${active ? "#7C5CFC" : "#262A34"}`,
        background: active ? "rgba(124,92,252,0.12)" : "transparent",
        color: active ? "#B8A9FD" : "#9A96AC",
        fontSize: 13.5,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}
