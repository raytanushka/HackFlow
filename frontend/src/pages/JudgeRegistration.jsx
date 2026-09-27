import { useState } from "react";
import {
  Zap, User, Mail, CreditCard, ArrowRight, ChevronDown, Menu, X,
  ShieldCheck, Users, Star, HelpCircle, Trophy,
} from "lucide-react";

const NAV = ["Home", "Hackathons", "Projects", "About"];

const PERKS = [
  { icon: ShieldCheck, title: "Review projects", note: "Evaluate innovative ideas" },
  { icon: Users, title: "Support talent", note: "Help build future leaders" },
  { icon: Star, title: "Make an impact", note: "Be part of something bigger" },
];

export default function JudgeRegistration() {
  const [navOpen, setNavOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [judgeId, setJudgeId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canContinue = name.trim() && email.trim() && judgeId.trim();

  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
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
          align-items: center;
        }
        @media (max-width: 940px) {
          .split { grid-template-columns: 1fr; gap: 44px; }
        }
        .perks-row {
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
        }
        .desktop-nav { display: flex; }
        .mobile-toggle { display: none; }
        @media (max-width: 760px) {
          .desktop-nav { display: none; }
          .mobile-toggle { display: flex; }
        }
        .side-visual { display: flex; justify-content: center; }
        @media (max-width: 940px) {
          .side-visual { display: none; }
        }
      `}</style>

      {/* Nav */}
      <div style={{ borderBottom: "1px solid #1D2029" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
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

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px 80px" }}>
        <div className="split">
          {/* Left: pitch */}
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#9B87F5", letterSpacing: "0.1em", display: "block", marginBottom: 14 }}>
              JUDGE REGISTRATION
            </span>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px, 5vw, 46px)",
              fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.02em", margin: "0 0 20px",
            }}>
              Be a part of<br />the <span style={{ color: "#8A6EFC" }}>Innovation.</span>
            </h1>
            <p style={{ color: "#9A96AC", fontSize: 16, lineHeight: 1.6, margin: "0 0 36px", maxWidth: 460 }}>
              Join as a judge and help evaluate groundbreaking projects, guide talented teams,
              and make an impact in the developer community.
            </p>

            <div className="perks-row" style={{ marginBottom: 48 }}>
              {PERKS.map((p) => (
                <div key={p.title} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <p.icon size={18} color="#9B87F5" strokeWidth={2} fill={p.icon === Star ? "#9B87F5" : "none"} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#E8E6F0" }}>{p.title}</div>
                    <div style={{ fontSize: 12.5, color: "#5B5F6D" }}>{p.note}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="side-visual">
              <HeroIllustration />
            </div>
          </div>

          {/* Right: form */}
          <div style={{
            background: "#14161C", border: "1px solid #1D2029", borderRadius: 16,
            padding: "32px", width: "100%",
          }}>
            {submitted ? (
              <SuccessState name={name} />
            ) : (
              <>
                <div style={{ display: "flex", gap: 14, marginBottom: 26 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(124,92,252,0.18)", border: "1px solid rgba(155,135,245,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <User size={22} color="#B8A9FD" />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, margin: "0 0 4px" }}>
                      Judge registration
                    </h2>
                    <p style={{ fontSize: 13.5, color: "#5B5F6D", margin: 0, lineHeight: 1.5 }}>
                      Fill in your details to join as a judge and start reviewing hackathon projects.
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

                <Field label="Judge ID" required>
                  <div style={{ position: "relative" }}>
                    <CreditCard size={16} className="field-icon" />
                    <input value={judgeId} onChange={(e) => setJudgeId(e.target.value)} placeholder="Enter your judge ID" />
                  </div>
                </Field>

                <button
                  disabled={!canContinue}
                  onClick={() => canContinue && setSubmitted(true)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: canContinue ? "linear-gradient(135deg, #8A6EFC, #6D4FE8)" : "#262A34",
                    color: canContinue ? "#FFFFFF" : "#5B5F6D",
                    border: "none", padding: "14px", borderRadius: 10, fontSize: 15, fontWeight: 600,
                    cursor: canContinue ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif", marginTop: 6,
                  }}
                >
                  Continue <ArrowRight size={16} />
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

function SuccessState({ name }) {
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
        Welcome, {name.split(" ")[0] || "judge"}
      </h2>
      <p style={{ color: "#9A96AC", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
        Your judge request is in. We'll verify your ID and assign your first tracks shortly.
      </p>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div style={{ position: "relative", width: 280, height: 240 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "radial-gradient(ellipse at center, rgba(124,92,252,0.16), transparent 65%)",
      }} />

      {/* screen */}
      <div style={{
        position: "absolute", top: 10, left: 10, width: 190, height: 150,
        borderRadius: 10, background: "linear-gradient(160deg, #1D2038, #12141C)",
        border: "1px solid #2E3245", padding: 14,
      }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3A3560" }} />
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3A3560" }} />
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3A3560" }} />
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(124,92,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
          <ShieldCheck size={22} color="#B8A9FD" />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 2 }}>
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={11} color="#8A6EFC" fill="#8A6EFC" />)}
        </div>
        <div style={{ width: "70%", height: 4, borderRadius: 2, background: "#2E3245", margin: "10px auto 0" }} />
      </div>

      {/* gavel */}
      <div style={{
        position: "absolute", bottom: 12, left: 60, width: 90, height: 90,
        transform: "rotate(-25deg)",
      }}>
        <div style={{ width: 60, height: 14, borderRadius: 4, background: "linear-gradient(90deg, #6D4FE8, #4C3BCF)" }} />
        <div style={{ width: 6, height: 46, background: "#4C3BCF", margin: "0 auto" }} />
        <div style={{ width: 50, height: 8, borderRadius: 3, background: "#3A2E60", margin: "0 auto" }} />
      </div>

      {/* floating chips */}
      <div style={{ position: "absolute", top: -6, right: 14 }}>
        <FloatChip icon={ShieldCheck} />
      </div>
      <div style={{ position: "absolute", bottom: 30, right: -6 }}>
        <FloatChip icon={CreditCard} />
      </div>
    </div>
  );
}

function FloatChip({ icon: Icon }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 11,
      background: "#171A28", border: "1px solid #2E3245",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 10px 22px rgba(0,0,0,0.4)",
    }}>
      <Icon size={17} color="#8A93F5" />
    </div>
  );
}
