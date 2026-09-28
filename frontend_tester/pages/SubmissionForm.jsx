import React, { useState, useMemo, useRef, useEffect } from "react";
import { Rocket, GitBranch, UploadCloud, Check, ArrowRight, X, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

const TRACKS = ["Developer tools", "Data and analytics", "Accessibility", "Security", "Climate", "Health", "Education", "Open hardware"];

export default function SubmissionForm({ onNavigate, eventId = "evt_smart_hack_2027", name, user }) {
  const [team, setTeam] = useState(user ? user.name || "" : "");
  const [teammates, setTeammates] = useState("");
  const [projectName, setProjectName] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [repo, setRepo] = useState("");
  const [file, setFile] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(TRACKS[0]);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [dbEvent, setDbEvent] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (eventId) {
      fetch(`http://localhost:8000/api/events/${eventId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setDbEvent(data);
        })
        .catch(() => {});
    }
  }, [eventId]);

  const isClosed = dbEvent ? !dbEvent.is_open : eventId === "evt_01";
  const isGenericDefault = name === "Smart Hack 2027" || name === "Sample Hack 2027";
  const eventName = (dbEvent && dbEvent.name)
    || (eventId === "evt_fintech" ? "FinTech Buildathon" : (eventId === "evt_01" ? "Sample Hack 2026" : null))
    || (!isGenericDefault && name ? name : null)
    || (eventId === "evt_fintech" ? "FinTech Buildathon" : (eventId === "evt_01" ? "Sample Hack 2026" : "FinTech Buildathon"));
  const deadlineText = isClosed ? "Mar 1, 2026 · 6:00 PM (Closed)" : (eventId === "evt_fintech" ? "Oct 12, 2027 · 6:00 PM" : "Mar 3, 2027 · 6:00 PM");
  const isParticipant = Boolean(user && (user.role === "participant" || user.role === "organizer"));

  const step1Done = team.trim().length > 0;
  const step2Done = projectName.trim() && problem.trim() && solution.trim();
  const step3Done = repo.trim().length > 0;

  const progress = useMemo(() => {
    const done = [step1Done, step2Done, step3Done].filter(Boolean).length;
    return Math.round((done / 3) * 100);
  }, [step1Done, step2Done, step3Done]);

  const handleFile = (f) => {
    if (!f) return;
    const okType = /\.(ppt|pptx|pdf)$/i.test(f.name);
    if (!okType) return;
    setFile(f);
  };

  const canSubmit = step1Done && step2Done && step3Done;

  const handleFinalSubmit = async () => {
    if (!isParticipant && !isClosed) {
      if (onNavigate) {
        onNavigate("Login", { role: "participant", eventId, name: eventName, redirectTo: "Submission Form" });
      }
      return;
    }

    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setServerError("");

    const payload = {
      title: projectName.trim(),
      problem: problem.trim(),
      solution: solution.trim(),
      summary: `${problem.trim()} — ${solution.trim()}`,
      track: selectedTrack,
      team_name: team.trim(),
      teammates: teammates.trim(),
      repo_url: repo.trim().startsWith("http") ? repo.trim() : `https://github.com/${repo.trim()}`,
      demo_url: file ? file.name : null
    };

    const token = localStorage.getItem("hackflow_token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/events/${eventId}/projects`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload)
      });
      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        data = {};
      }

      if (!res.ok) {
        let msg = "Submission was rejected by the server.";
        if (typeof data.detail === "string" && data.detail.trim()) {
          msg = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          msg = data.detail
            .map((d) => (typeof d === "string" ? d : d.msg || JSON.stringify(d)))
            .join("; ");
        } else if (typeof data.message === "string" && data.message.trim()) {
          msg = data.message;
        } else if (data.detail && typeof data.detail === "object") {
          msg = data.detail.msg || JSON.stringify(data.detail);
        }
        setServerError(msg);
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setServerError("Network error communicating with HackFlow server.");
    } finally {
      setSubmitting(false);
    }
  };

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
            <strong>{projectName || "Your project"}</strong> has been successfully submitted to <strong>{eventName}</strong> and recorded in the database!
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => onNavigate && onNavigate("HackFlow Home")}
              style={{ background: "#7C5CFC", border: "none", color: "#0F1115", fontWeight: 600, padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
            >
              Back to Home
            </button>
            <button
              onClick={() => setSubmitted(false)}
              style={{ background: "transparent", border: "1px solid #2A2E3A", color: "#9A96AC", padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
            >
              Edit Form
            </button>
          </div>
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
            {eventName}
          </span>
          <span style={{
            marginLeft: 12, fontSize: 12.5,
            color: isClosed ? "#F87171" : "#4ADE80",
            background: isClosed ? "rgba(248,113,113,0.1)" : "rgba(74,222,128,0.1)",
            padding: "4px 10px", borderRadius: 20, fontWeight: 500
          }}>
            {isClosed ? "Submissions Closed" : "Submissions Open"}
          </span>

          <button
            onClick={() => onNavigate && onNavigate("Hackathon Detail", { eventId })}
            style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "#9A96AC", cursor: "pointer", fontSize: 13.5
            }}
          >
            ← Back to Hackathon
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 100px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(26px, 5vw, 34px)", fontWeight: 600, margin: "0 0 10px", letterSpacing: "-0.015em" }}>
            Submit your project
          </h1>
          <p style={{ color: "#9A96AC", fontSize: 15, margin: 0, lineHeight: 1.5 }}>
            Submitting to <strong style={{ color: "#E8E6F0" }}>{eventName}</strong>. Deadline: <strong style={{ color: isClosed ? "#F87171" : "#C7C4D6", fontWeight: 600 }}>{deadlineText}</strong>.
          </p>
        </div>

        {serverError && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            background: "rgba(248, 113, 113, 0.1)",
            border: "1px solid rgba(248, 113, 113, 0.4)",
            borderRadius: 10, padding: "16px", marginBottom: 28,
            color: "#F87171", fontSize: 14, lineHeight: 1.5
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Submission Rejected:</strong> {typeof serverError === "string" ? serverError : JSON.stringify(serverError)}
            </div>
          </div>
        )}

        {isClosed && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(248, 113, 113, 0.08)",
            border: "1px solid rgba(248, 113, 113, 0.3)",
            borderRadius: 12, padding: "16px 20px", marginBottom: 28
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F87171", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertCircle size={20} color="#0F1115" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#FCA5A5" }}>Submissions Closed</div>
              <div style={{ fontSize: 13, color: "#C7C4D6", marginTop: 2 }}>The submission deadline for {eventName} was {deadlineText}. New submissions to this event are closed.</div>
            </div>
          </div>
        )}

        {!isParticipant && !isClosed && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 14,
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: 12, padding: "16px 20px", marginBottom: 28
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertCircle size={20} color="#0F1115" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#FDE68A" }}>Participant Login Required</div>
                <div style={{ fontSize: 13, color: "#C7C4D6", marginTop: 2 }}>You must be signed in as a participant before you can submit a project to this hackathon.</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("Participant Registration", { eventId, redirectTo: "Submission Form" })}
              style={{
                background: "#7C5CFC", color: "#0F1115", border: "none",
                padding: "10px 18px", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6
              }}
            >
              Sign in as Participant <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Progress tracker */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#5B5F6D", marginBottom: 8 }}>
            <span>Team ({step1Done ? "Done" : "Required"})</span>
            <span>Project ({step2Done ? "Done" : "Required"})</span>
            <span>Materials ({step3Done ? "Done" : "Required"})</span>
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
              <label className="field-label">Team / Leader Name *</label>
              <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="e.g. Alex Rivera" />
            </div>
            <div>
              <label className="field-label">Teammates (optional)</label>
              <input value={teammates} onChange={(e) => setTeammates(e.target.value)} placeholder="Comma-separated names (e.g. Sarah, David)" />
            </div>
          </div>
        </div>

        {/* Section 2: Project */}
        <div className="section-wrap">
          <SectionHeading title="Project" note="What you're building and why." />

          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Project name *</label>
            <input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Sentinel — mmWave survivor detection" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Problem statement *</label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value.slice(0, 1000))}
              placeholder="What real problem does this solve, and for whom?"
              style={{ minHeight: 84 }}
            />
            <div style={{ textAlign: "right", fontSize: 12, color: "#5B5F6D", marginTop: 4 }}>{problem.length}/1000</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Solution *</label>
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
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTrack(t)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 20,
                    border: `1px solid ${selectedTrack === t ? "#7C5CFC" : "#262A34"}`,
                    background: selectedTrack === t ? "rgba(124,92,252,0.18)" : "transparent",
                    color: selectedTrack === t ? "#B8A9FD" : "#9A96AC",
                    fontSize: 13.5,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    transition: "all 0.15s ease",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Materials */}
        <div className="section-wrap">
          <SectionHeading title="Materials" note="Deck and repository judges will actually open." />

          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Presentation deck (optional)</label>
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
                accept=".ppt,.pptx,.pdf"
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
                  <div style={{ fontSize: 14, color: "#9A96AC" }}>Drop your .ppt, .pptx, or .pdf here, or click to browse</div>
                  <div style={{ fontSize: 12, color: "#5B5F6D", marginTop: 4 }}>Max 10MB</div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="field-label">GitHub repository *</label>
            <div style={{ display: "flex", alignItems: "center", background: "#14161C", border: "1px solid #262A34", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px", borderRight: "1px solid #262A34", height: 44, color: "#5B5F6D", fontSize: 14 }}>
                <GitBranch size={15} />
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
            type="button"
            onClick={() => onNavigate && onNavigate("Hackathon Detail", { eventId })}
            style={{ background: "transparent", border: "1px solid #262A34", color: "#9A96AC", padding: "12px 20px", borderRadius: 8, fontSize: 14.5, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={(!canSubmit && isParticipant) || submitting}
            onClick={() => {
              if (!isParticipant && !isClosed) {
                if (onNavigate) onNavigate("Participant Registration", { eventId, redirectTo: "Submission Form" });
                return;
              }
              handleFinalSubmit();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: !isParticipant && !isClosed
                ? "linear-gradient(135deg, #7C5CFC, #6366F1)"
                : (canSubmit && !submitting ? "#7C5CFC" : "#262A34"),
              color: !isParticipant && !isClosed
                ? "#FFFFFF"
                : (canSubmit && !submitting ? "#0F1115" : "#5B5F6D"),
              border: "none",
              padding: "12px 22px",
              borderRadius: 8,
              fontSize: 14.5,
              fontWeight: 600,
              cursor: (!isParticipant && !isClosed) || (canSubmit && !submitting) ? "pointer" : "not-allowed",
              fontFamily: "Inter, sans-serif",
              transition: "background 0.15s ease",
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Submitting...
              </>
            ) : !isParticipant && !isClosed ? (
              <>
                Log in as Participant to Submit
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                Submit project
                <ArrowRight size={16} />
              </>
            )}
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
