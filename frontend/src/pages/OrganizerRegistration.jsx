import { useState, useEffect } from "react";
import {
  Rocket, Zap, Users, Trophy, ArrowRight, HelpCircle,
  User, Mail, CreditCard, Calendar, UserCircle, Code2, ArrowLeft
} from "lucide-react";

function useWindowWidth() {
  const [width, setWidth] = useState(1200);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

export default function OrganizerRegistration({ onRegistrationSuccess, onNavigate, user }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orgId, setOrgId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const width = useWindowWidth();

  useEffect(() => {
    const saved = localStorage.getItem("hackflow_user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.name) setName(u.name);
        if (u.email) setEmail(u.email);
        if (u.orgId) setOrgId(u.orgId);
      } catch(e){}
    }
  }, []);

  const canProceed = name.trim() && email.trim() && orgId.trim();

  const handleProceed = async () => {
    if (!canProceed) return;
    setLoading(true);

    const userData = {
      name: name.trim(),
      email: email.trim(),
      orgId: orgId.trim(),
      role: "organizer"
    };

    localStorage.setItem("hackflow_user", JSON.stringify(userData));

    try {
      await fetch("http://localhost:8000/api/auth/register-organizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          org_id: orgId.trim()
        })
      });
    } catch (e) {
      console.log("Backend offline or local demo mode", e);
    }

    setLoading(false);
    setSubmitted(true);

    if (onRegistrationSuccess) {
      onRegistrationSuccess(userData);
    }

    setTimeout(() => {
      if (onNavigate) {
        onNavigate("Organizer Dashboard");
      }
    }, 900);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0F1115", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
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
        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #5B5F6D;
          pointer-events: none;
        }
        .split {
          display: grid;
          grid-template-columns: 1.1fr 480px;
          gap: 48px;
          align-items: center;
        }
        @media (max-width: 980px) {
          .split { grid-template-columns: 1fr; gap: 40px; }
        }
        .stats-row {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
        }
        @media (max-width: 500px) {
          .stats-row { gap: 20px; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1D2029", padding: "18px 24px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onNavigate && onNavigate("HackFlow Home")}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Rocket size={16} color="#0F1115" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16 }}>
              HackFlow
            </span>
          </div>

          <button
            onClick={() => onNavigate && onNavigate("HackFlow Home")}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #262A34",
              color: "#C7C4D6", padding: "7px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer"
            }}
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "48px 24px 60px" }}>
        <div className="split">
          {/* Left: copy */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "#9B87F5", letterSpacing: "0.12em", marginBottom: 12 }}>
              <Zap size={14} color="#9B87F5" /> FOR ORGANIZERS
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px, 5vw, 44px)", fontWeight: 700, margin: "0 0 16px", lineHeight: 1.15 }}>
              Register your organization to create hackathons
            </h1>
            <p style={{ color: "#9A96AC", fontSize: 15.5, lineHeight: 1.6, margin: "0 0 36px", maxWidth: 520 }}>
              Unlock the full organizer dashboard to manage registrations, teams, tracks, and judges effortlessly.
            </p>

            <div className="stats-row" style={{ marginBottom: 56 }}>
              <Feature icon={Zap} title="Create & manage" note="Your hackathons" />
              <Feature icon={Users} title="Build teams" note="Of student builders" />
              <Feature icon={Trophy} title="Judge with ease" note="Structured scoring" />
            </div>

            <HeroIllustration hideOnNarrow={width < 980} />
          </div>

          {/* Right: form */}
          <div style={{
            background: "#14161C", border: "1px solid #1D2029", borderRadius: 16,
            padding: "32px", width: "100%",
          }}>
            {submitted ? (
              <SuccessState name={name} onNavigate={onNavigate} />
            ) : (
              <>
                <div style={{ display: "flex", gap: 14, marginBottom: 26 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(124,92,252,0.18)", border: "1px solid rgba(155,135,245,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <UserCircle size={22} color="#B8A9FD" />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, margin: "0 0 4px" }}>
                      Organizer registration
                    </h2>
                    <p style={{ fontSize: 13.5, color: "#5B5F6D", margin: 0, lineHeight: 1.5 }}>
                      Enter your details to continue and access the organizer dashboard.
                    </p>
                  </div>
                </div>

                <Field label="Full name" required>
                  <div style={{ position: "relative" }}>
                    <User size={16} className="field-icon" />
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
                  </div>
                </Field>

                <Field label="Email address" required>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} className="field-icon" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                </Field>

                <Field label="Organizer ID" required>
                  <div style={{ position: "relative" }}>
                    <CreditCard size={16} className="field-icon" />
                    <input value={orgId} onChange={(e) => setOrgId(e.target.value)} placeholder="Enter your organizer ID (e.g. org_01)" />
                  </div>
                </Field>

                <button
                  disabled={!canProceed || loading}
                  onClick={handleProceed}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: canProceed ? "linear-gradient(135deg, #8A6EFC, #6D4FE8)" : "#262A34",
                    color: canProceed ? "#FFFFFF" : "#5B5F6D",
                    border: "none", padding: "14px", borderRadius: 10, fontSize: 15, fontWeight: 600,
                    cursor: canProceed ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif", marginTop: 6,
                  }}
                >
                  {loading ? "Registering..." : "Proceed & Access Dashboard"} <ArrowRight size={16} />
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "26px 0 16px" }}>
                  <div style={{ flex: 1, height: 1, background: "#1D2029" }} />
                  <span style={{ fontSize: 12.5, color: "#5B5F6D" }}>Need help?</span>
                  <div style={{ flex: 1, height: 1, background: "#1D2029" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <a href="#" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#B8A9FD", textDecoration: "none" }}>
                    <HelpCircle size={15} /> Contact support
                  </a>
                </div>
              </>
            )}
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

function Feature({ icon: Icon, title, note }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Icon size={18} color="#9B87F5" strokeWidth={2} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#E8E6F0" }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "#5B5F6D" }}>{note}</div>
      </div>
    </div>
  );
}

function SuccessState({ name, onNavigate }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 8px" }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", margin: "0 auto 20px",
        background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Trophy size={24} color="#4ADE80" />
      </div>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 21, fontWeight: 600, margin: "0 0 10px" }}>
        Welcome, {name.split(" ")[0] || "organizer"}!
      </h2>
      <p style={{ color: "#9A96AC", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
        Your registration is complete! Redirecting to your Organizer Dashboard...
      </p>
      <button
        onClick={() => onNavigate && onNavigate("Organizer Dashboard")}
        style={{
          background: "linear-gradient(135deg, #8A6EFC, #6D4FE8)", color: "#FFF",
          border: "none", padding: "12px 20px", borderRadius: 8, fontSize: 14,
          fontWeight: 600, cursor: "pointer"
        }}
      >
        Go to Dashboard Now
      </button>
    </div>
  );
}

function HeroIllustration({ hideOnNarrow }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 420, height: 260, display: hideOnNarrow ? "none" : "block" }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "radial-gradient(ellipse at center, rgba(124,92,252,0.14), transparent 70%)",
      }} />
      <svg width="100%" height="100%" viewBox="0 0 420 260" fill="none" style={{ position: "relative" }}>
        <ellipse cx="210" cy="190" rx="150" ry="18" stroke="#3A3560" strokeWidth="1" opacity="0.5" />
      </svg>

      <div style={{ position: "absolute", top: 8, left: 40 }}>
        <IconChip icon={Calendar} />
      </div>
      <div style={{ position: "absolute", top: 20, right: 60 }}>
        <IconChip icon={Users} />
      </div>
      <div style={{ position: "absolute", top: 110, right: 10 }}>
        <IconChip icon={Trophy} />
      </div>

      <div style={{
        position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
        width: 220, height: 150,
      }}>
        <div style={{
          width: "100%", height: 128, borderRadius: "10px 10px 4px 4px",
          background: "linear-gradient(160deg, #232640, #171A28)",
          border: "1px solid #3A3560",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Code2 size={40} color="#7C5CFC" strokeWidth={1.6} />
        </div>
        <div style={{
          width: "115%", marginLeft: "-7.5%", height: 10,
          background: "linear-gradient(180deg, #2A2E42, #1A1D2E)",
          borderRadius: "0 0 6px 6px",
        }} />
      </div>
    </div>
  );
}

function IconChip({ icon: Icon }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 10,
      background: "#1B1E2C", border: "1px solid #2E3245",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
    }}>
      <Icon size={17} color="#8A93F5" />
    </div>
  );
}
