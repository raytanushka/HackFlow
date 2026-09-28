import { useState, useEffect } from "react";
import {
  Zap, ArrowLeft, ArrowRight, Users, User, CreditCard, Mail, Building2,
  Code2, Lightbulb, Trophy, ChevronDown, Menu, X,
} from "lucide-react";

const NAV = ["Home", "Hackathons", "Projects", "About"];

const PERKS = [
  { icon: Zap, title: "Build your skills", note: "Work on real-world problems and learn from the best." },
  { icon: Users, title: "Meet like-minded people", note: "Collaborate, create and grow with amazing teammates." },
  { icon: Trophy, title: "Win exciting prizes", note: "Showcase your talent and get recognized." },
];

export default function ParticipantRegistration({
  onNavigate,
  eventId = "evt_smart_hack_2027",
  eventName,
  onRegistrationSuccess,
  user,
  redirectTo
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [dbEvent, setDbEvent] = useState(null);
  const [name, setName] = useState(user?.name || "");
  const [studentId, setStudentId] = useState(user?.studentId || "");
  const [email, setEmail] = useState(user?.email || "");
  const [college, setCollege] = useState(user?.college || "");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const isGenericDefault = eventName === "Smart Hack 2027" || eventName === "Sample Hack 2027";
  const displayEventName = (dbEvent && dbEvent.name)
    || (eventId === "evt_fintech" ? "FinTech Buildathon" : (eventId === "evt_01" ? "Sample Hack 2026" : null))
    || (!isGenericDefault && eventName ? eventName : null)
    || (eventId === "evt_fintech" ? "FinTech Buildathon" : (eventId === "evt_01" ? "Sample Hack 2026" : "FinTech Buildathon"));

  const canContinue = name.trim() && studentId.trim() && email.trim() && college.trim();

  const handleContinue = async () => {
    if (!canContinue || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/auth/register-participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          student_id: studentId.trim(),
          college: college.trim(),
          event_id: eventId
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        data = {};
      }

      if (!res.ok) {
        let msg = "Registration failed. Please check your information.";
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
        throw new Error(msg);
      }

      const participantData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        studentId: studentId.trim(),
        college: college.trim(),
        role: "participant",
        token: data.token,
        eventId: eventId,
        eventName: (data.event && data.event.name) || displayEventName
      };

      localStorage.setItem("hackflow_participant", JSON.stringify(participantData));
      localStorage.setItem("hackflow_user", JSON.stringify(participantData));
      localStorage.setItem("hackflow_token", data.token);

      if (onRegistrationSuccess) {
        onRegistrationSuccess(participantData);
      }
      setSubmitted(true);
      if (onNavigate) {
        onNavigate(redirectTo || "Submission Form", { eventId, name: (data.event && data.event.name) || displayEventName });
      }
    } catch (err) {
      const msg = typeof err === "string" ? err : (err?.message || "Failed to register participant.");
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Caveat:wght@600&display=swap');
        * { box-sizing: border-box; }
        input {
          width: 100%;
          background: #14161C;
          border: 1px solid #262A34;
          border-radius: 9px;
          padding: 13px 14px 13px 42px;
          color: #E8E6F0;
          font-family: 'Inter', sans-serif;
          font-size: 14.5px;
          outline: none;
          transition: border-color 0.15s ease;
        }
        input::placeholder { color: #5B5F6D; }
        input:focus { border-color: #7C5CFC; }
        .field-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #5B5F6D; pointer-events: none; }
        .split {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 48px;
          align-items: start;
        }
        @media (max-width: 940px) {
          .split { grid-template-columns: 1fr; gap: 44px; }
        }
        .desktop-nav { display: flex; }
        .mobile-toggle { display: none; }
        @media (max-width: 760px) {
          .desktop-nav { display: none; }
          .mobile-toggle { display: flex; }
        }
        .side-visual { display: block; }
        @media (max-width: 940px) {
          .side-visual { display: none; }
        }
      `}</style>

      {/* Nav */}
      <div style={{ borderBottom: "1px solid #1D2029" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }} onClick={() => onNavigate && onNavigate("HackFlow Home")}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={16} color="#0B0C10" strokeWidth={2.5} fill="#0B0C10" />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 17 }}>HackFlow</span>
          </div>

          <div className="desktop-nav" style={{ gap: 28, flex: 1 }}>
            {NAV.map((item) => (
              <a key={item} href="#" style={{ color: "#9A96AC", textDecoration: "none", fontSize: 14.5, fontWeight: 500 }}>
                {item}
              </a>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
            <div className="desktop-nav" style={{
              alignItems: "center", gap: 8, border: "1px solid #262A34", borderRadius: 9,
              padding: "8px 14px", cursor: "pointer",
            }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#262A34" }} />
              <span style={{ fontSize: 13.5, color: "#C7C4D6" }}>Demo User</span>
              <ChevronDown size={14} color="#5B5F6D" />
            </div>
            <button
              className="mobile-toggle"
              onClick={() => setNavOpen((n) => !n)}
              style={{ background: "none", border: "none", color: "#E8E6F0", cursor: "pointer", padding: 4 }}
            >
              {navOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {navOpen && (
          <div className="mobile-toggle" style={{ flexDirection: "column", padding: "0 24px 16px", gap: 4 }}>
            {NAV.map((item) => (
              <a key={item} href="#" style={{ color: "#C7C4D6", textDecoration: "none", fontSize: 15, padding: "10px 0", borderTop: "1px solid #1D2029" }}>
                {item}
              </a>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 80px" }}>
        <a href="#" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate("HackFlow Home"); }} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#B8A9FD", textDecoration: "none", fontSize: 14, fontWeight: 500, marginBottom: 24, cursor: "pointer" }}>
          <ArrowLeft size={15} /> Back to home
        </a>

        <div className="split">
          {/* Left: form */}
          <div>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(124,92,252,0.15)", border: "1px solid rgba(124,92,252,0.3)",
              color: "#B8A9FD", fontSize: 12.5, fontWeight: 600, padding: "6px 14px", borderRadius: 20, marginBottom: 20,
            }}>
              <Users size={13} /> Participant registration
            </span>

            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(30px, 5vw, 42px)",
              fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 14px", lineHeight: 1.08,
            }}>
              Join <span style={{ color: "#8A6EFC" }}>{displayEventName}</span>
            </h1>
            <p style={{ color: "#9A96AC", fontSize: 15.5, lineHeight: 1.6, margin: "0 0 32px", maxWidth: 480 }}>
              Be a part of innovative ideas, build with like-minded people, and turn your skills
              into real-world impact.
            </p>

            <div style={{ background: "#14161C", border: "1px solid #1D2029", borderRadius: 16, padding: "28px" }}>
              {submitted ? (
                <SuccessState name={name} onNavigate={onNavigate} eventId={eventId} eventName={displayEventName} />
              ) : (
                <>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, margin: "0 0 4px" }}>
                    Your details
                  </h2>
                  <p style={{ fontSize: 13.5, color: "#5B5F6D", margin: "0 0 24px" }}>
                    Fill in the information below to register as a participant.
                  </p>

                  <Field label="Full name" required>
                    <div style={{ position: "relative" }}>
                      <User size={16} className="field-icon" />
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
                    </div>
                  </Field>

                  <Field label="Student ID" required>
                    <div style={{ position: "relative" }}>
                      <CreditCard size={16} className="field-icon" />
                      <input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. 2027CS001" />
                    </div>
                  </Field>

                  <Field label="Email address" required>
                    <div style={{ position: "relative" }}>
                      <Mail size={16} className="field-icon" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
                    </div>
                  </Field>

                  <Field label="College name" required>
                    <div style={{ position: "relative" }}>
                      <Building2 size={16} className="field-icon" />
                      <input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="Enter your college name" />
                    </div>
                  </Field>

                  {error && (
                    <div style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      marginBottom: 16,
                      fontSize: 13,
                      color: "#FCA5A5"
                    }}>
                      {typeof error === "string" ? error : JSON.stringify(error)}
                    </div>
                  )}

                  <button
                    disabled={!canContinue || loading}
                    onClick={handleContinue}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      background: canContinue && !loading ? "linear-gradient(135deg, #8A6EFC, #6D4FE8)" : "#262A34",
                      color: canContinue && !loading ? "#FFFFFF" : "#5B5F6D",
                      border: "none", padding: "14px", borderRadius: 10, fontSize: 15, fontWeight: 600,
                      cursor: canContinue && !loading ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif", marginTop: 6,
                    }}
                  >
                    {loading ? "Registering..." : "Register & Continue"} <ArrowRight size={16} />
                  </button>

                  <div style={{ textAlign: "center", marginTop: 14, fontSize: 13.5, color: "#9A96AC" }}>
                    Already registered?{" "}
                    <span
                      onClick={() => onNavigate && onNavigate("Login", { role: "participant", redirectTo: redirectTo || "Submission Form", eventId, name: displayEventName })}
                      style={{ color: "#8A6EFC", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
                    >
                      Log in here
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: illustration + perks */}
          <div>
            <div className="side-visual">
              <HeroIllustration />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 8 }}>
              {PERKS.map((p) => (
                <div key={p.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(124,92,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <p.icon size={19} color="#B8A9FD" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#E8E6F0", marginBottom: 3 }}>{p.title}</div>
                    <div style={{ fontSize: 13.5, color: "#9A96AC", lineHeight: 1.5 }}>{p.note}</div>
                  </div>
                </div>
              ))}
            </div>

            <p style={{
              fontFamily: "'Caveat', cursive", fontSize: 24, color: "#9B87F5",
              margin: "32px 0 0", lineHeight: 1.3, transform: "rotate(-1deg)",
            }}>
              Good ideas start with people<br />who show up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13.5, fontWeight: 500, color: "#C7C4D6", marginBottom: 7 }}>
        {label} {required && <span style={{ color: "#F87171" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function SuccessState({ name, onNavigate, eventId, eventName }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 8px" }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", margin: "0 auto 20px",
        background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Trophy size={24} color="#4ADE80" />
      </div>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 21, fontWeight: 600, margin: "0 0 10px" }}>
        You're in, {name.split(" ")[0] || "builder"}
      </h2>
      <p style={{ color: "#9A96AC", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
        Your registration for {eventName || "the hackathon"} is confirmed. Proceed to hackathon details.
      </p>
      <button
        onClick={() => onNavigate && onNavigate("Hackathon Detail", { eventId, name: eventName })}
        style={{
          background: "linear-gradient(135deg, #8A6EFC, #6D4FE8)", color: "#FFF",
          border: "none", padding: "12px 20px", borderRadius: 8, fontSize: 14,
          fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8
        }}
      >
        Continue to {eventName || "Hackathon Detail"} <ArrowRight size={15} />
      </button>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div style={{ position: "relative", width: "100%", height: 260, marginBottom: 12 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "radial-gradient(ellipse at 55% 45%, rgba(124,92,252,0.16), transparent 65%)",
      }} />

      <div style={{ position: "absolute", top: 6, left: "6%" }}>
        <FloatChip icon={Code2} />
      </div>
      <div style={{ position: "absolute", top: 40, left: "42%" }}>
        <FloatChip icon={Lightbulb} />
      </div>
      <div style={{ position: "absolute", top: 60, right: "4%" }}>
        <FloatChip icon={Users} />
      </div>

      <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 260, height: 170 }}>
        <div style={{
          width: "100%", height: 144, borderRadius: "12px 12px 4px 4px",
          background: "linear-gradient(160deg, #1D2038, #12141C)",
          border: "1px solid #2E3245", padding: 16,
          display: "flex", flexDirection: "column", gap: 10, justifyContent: "center",
        }}>
          <Bar width="60%" />
          <Bar width="80%" />
          <Bar width="45%" />
        </div>
        <div style={{
          width: "116%", marginLeft: "-8%", height: 12,
          background: "linear-gradient(180deg, #262A42, #171A28)",
          borderRadius: "0 0 8px 8px",
        }} />
      </div>
    </div>
  );
}

function Bar({ width }) {
  return <div style={{ width, height: 8, borderRadius: 4, background: "rgba(124,92,252,0.5)" }} />;
}

function FloatChip({ icon: Icon }) {
  return (
    <div style={{
      width: 42, height: 42, borderRadius: 11,
      background: "#171A28", border: "1px solid #2E3245",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 10px 22px rgba(0,0,0,0.4)",
    }}>
      <Icon size={18} color="#8A93F5" />
    </div>
  );
}
