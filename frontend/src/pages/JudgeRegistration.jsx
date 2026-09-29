import React, { useState, useEffect } from "react";
import {
  Zap, User, Mail, CreditCard, ArrowRight, ChevronDown, Menu, X,
  ShieldCheck, Users, Star, HelpCircle, Trophy, LayoutDashboard,
  LogIn, CheckCircle, AlertCircle, Loader2
} from "lucide-react";

const NAV = ["Home", "Hackathons", "Projects", "Judge Dashboard"];

const PERKS = [
  { icon: ShieldCheck, title: "Review projects", note: "Evaluate innovative ideas" },
  { icon: Users, title: "Support talent", note: "Help build future leaders" },
  { icon: Star, title: "Make an impact", note: "Be part of something bigger" },
];

const DEMO_JUDGES = [
  { name: "Marek Nowak", email: "marek.nowak@example.org", id: "jdg_08", track: "Security" },
  { name: "Priya Nair", email: "priya.nair@example.org", id: "jdg_03", track: "Security, Climate" },
];

export default function JudgeRegistration({
  onNavigate,
  user,
  onLogout,
  onRegistrationSuccess,
  onLoginSuccess
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const [isLoginMode, setIsLoginMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [judgeId, setJudgeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Active judge session banner is rendered in the UI without trapping navigation

  const canContinue = isLoginMode
    ? Boolean(email.trim() || judgeId.trim())
    : Boolean(name.trim() && email.trim() && judgeId.trim());

  const handleAuthSubmit = async (e) => {
    e?.preventDefault();
    if (!canContinue || loading) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = isLoginMode
        ? "http://localhost:8000/api/auth/login-judge"
        : "http://localhost:8000/api/auth/register-judge";

      const payload = isLoginMode
        ? { email: email.trim(), judge_id: judgeId.trim() }
        : { name: name.trim(), email: email.trim(), judge_id: judgeId.trim() };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.message || "Judge authentication failed.");
      }

      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: "judge",
        token: data.token,
      };

      localStorage.setItem("hackflow_user", JSON.stringify(userData));
      localStorage.setItem("hackflow_token", data.token);

      if (isLoginMode && onLoginSuccess) {
        onLoginSuccess(userData);
      } else if (onRegistrationSuccess) {
        onRegistrationSuccess(userData);
      } else if (onLoginSuccess) {
        onLoginSuccess(userData);
      }

      setSubmitted(true);
      if (onNavigate) {
        onNavigate("Judge Dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to authenticate judge.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoJudge) => {
    setName(demoJudge.name);
    setEmail(demoJudge.email);
    setJudgeId(demoJudge.id);
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/auth/login-judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: demoJudge.email, judge_id: demoJudge.id })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Demo judge login failed.");
      }

      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: "judge",
        token: data.token,
      };

      localStorage.setItem("hackflow_user", JSON.stringify(userData));
      localStorage.setItem("hackflow_token", data.token);

      if (onLoginSuccess) onLoginSuccess(userData);
      setSubmitted(true);
      if (onNavigate) onNavigate("Judge Dashboard");
    } catch (err) {
      setError(err.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

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
              <a key={item} href="#" onClick={(e) => {
                e.preventDefault();
                if (item === "Home" && onNavigate) onNavigate("HackFlow Home");
                if (item === "Hackathons" && onNavigate) onNavigate("Hackathons Listing");
                if (item === "Projects" && onNavigate) onNavigate("Organizer Projects");
                if (item === "Judge Dashboard" && onNavigate) onNavigate("Judge Dashboard");
              }} style={{ color: "#9A96AC", textDecoration: "none", fontSize: 14.5, fontWeight: 500 }}>
                {item}
              </a>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
            {user ? (
              <div style={{ position: "relative" }}>
                <div
                  className="desktop-nav"
                  onClick={() => setUserDropdown(!userDropdown)}
                  style={{
                    alignItems: "center", gap: 8, border: "1px solid #7C5CFC", borderRadius: 9,
                    padding: "8px 14px", cursor: "pointer", background: "rgba(124,92,252,0.12)",
                    display: "flex"
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", background: "#7C5CFC",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#FFF", fontSize: 11, fontWeight: 700
                  }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : (user.role === "participant" ? "P" : (user.role === "judge" ? "J" : "O"))}
                  </div>
                  <span style={{ fontSize: 13.5, color: "#E8E6F0", fontWeight: 600 }}>
                    {user.name || (user.role === "participant" ? "Participant" : (user.role === "judge" ? "Judge" : "Organizer"))}
                  </span>
                  <ChevronDown size={14} color="#9A96AC" />
                </div>

                {userDropdown && (
                  <div style={{
                    position: "absolute", top: "115%", right: 0, width: 200, background: "#14161C",
                    border: "1px solid #262A34", borderRadius: 10, padding: 8, zIndex: 100,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                  }}>
                    <div style={{ padding: "8px 12px", borderBottom: "1px solid #202430", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E6F0" }}>{user.name}</div>
                      <div style={{ fontSize: 11.5, color: "#9A96AC", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        if (onNavigate) {
                          if (user.role === "participant") {
                            onNavigate("Participant Dashboard");
                          } else if (user.role === "judge") {
                            onNavigate("Judge Dashboard");
                          } else {
                            onNavigate("Organizer Dashboard");
                          }
                        }
                      }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                        background: "none", border: "none", color: "#C7C4D6", fontSize: 13,
                        cursor: "pointer", borderRadius: 6, textAlign: "left"
                      }}
                    >
                      <LayoutDashboard size={14} color="#8A6EFC" /> Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        if (onLogout) onLogout();
                      }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                        background: "none", border: "none", color: "#F87171", fontSize: 13,
                        cursor: "pointer", borderRadius: 6, textAlign: "left", marginTop: 4
                      }}
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate && onNavigate("Login")}
                style={{
                  background: "transparent", border: "1px solid #7C5CFC", color: "#B8A9FD",
                  padding: "8px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                Log In
              </button>
            )}
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
              <a key={item} href="#" onClick={(e) => {
                e.preventDefault();
                setNavOpen(false);
                if (item === "Home" && onNavigate) onNavigate("HackFlow Home");
                if (item === "Hackathons" && onNavigate) onNavigate("Hackathons Listing");
                if (item === "Projects" && onNavigate) onNavigate("Organizer Projects");
                if (item === "Judge Dashboard" && onNavigate) onNavigate("Judge Dashboard");
              }} style={{ color: "#C7C4D6", textDecoration: "none", fontSize: 15, padding: "10px 0", borderTop: "1px solid #1D2029" }}>
                {item}
              </a>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 24px 80px" }}>
        <div className="split">
          {/* Left: pitch & demo logins */}
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#9B87F5", letterSpacing: "0.1em", display: "block", marginBottom: 14 }}>
              JUDGING ENGINE
            </span>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px, 5vw, 46px)",
              fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.02em", margin: "0 0 20px",
            }}>
              Fair, normalized<br />and <span style={{ color: "#8A6EFC" }}>Isolated Evaluation.</span>
            </h1>
            <p style={{ color: "#9A96AC", fontSize: 16, lineHeight: 1.6, margin: "0 0 32px", maxWidth: 460 }}>
              Join as an official hackathon judge to review assigned tracks, submit rubric scores,
              and contribute to normalized project rankings.
            </p>

            <div className="perks-row" style={{ marginBottom: 40 }}>
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

            {/* Quick Demo Judge Logins */}
            <div style={{
              background: "#14161C", border: "1px solid #262A34", borderRadius: 12,
              padding: "18px 20px", maxWidth: 460
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#B8A9FD", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={15} /> Quick Demo Judge Login (Official Fixtures)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {DEMO_JUDGES.map((dj) => (
                  <button
                    key={dj.id}
                    onClick={() => handleQuickDemoLogin(dj)}
                    disabled={loading}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "#1B1E28", border: "1px solid #2E3245", borderRadius: 8,
                      padding: "10px 14px", color: "#E8E6F0", cursor: "pointer", textAlign: "left",
                      fontSize: 13
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: "#FFF" }}>{dj.name}</span>
                      <span style={{ color: "#7C5CFC", marginLeft: 8 }}>({dj.id})</span>
                      <div style={{ fontSize: 11.5, color: "#9A96AC" }}>Tracks: {dj.track}</div>
                    </div>
                    <ArrowRight size={15} color="#B8A9FD" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div style={{
            background: "#14161C", border: "1px solid #1D2029", borderRadius: 16,
            padding: "32px", width: "100%",
          }}>
            {user && (user.role === "judge" || user.role === "organizer") && (
              <div style={{
                background: "rgba(124, 92, 252, 0.12)",
                border: "1px solid rgba(155, 135, 245, 0.35)",
                borderRadius: 12,
                padding: "14px 18px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#E8E6F0" }}>
                    Signed in as {user.name} ({user.id || user.email})
                  </div>
                  <div style={{ fontSize: 12, color: "#9A96AC", marginTop: 2 }}>
                    Active role: <span style={{ color: "#B8A9FD", textTransform: "capitalize" }}>{user.role}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate("Judge Dashboard")}
                    style={{
                      background: "linear-gradient(135deg, #8A6EFC, #6D4FE8)",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Go to Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onLogout) onLogout();
                    }}
                    style={{
                      background: "transparent",
                      color: "#F87171",
                      border: "1px solid rgba(248, 113, 113, 0.4)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontSize: 12.5,
                      fontWeight: 500,
                      cursor: "pointer"
                    }}
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
            {submitted ? (
              <SuccessState name={name} onNavigate={onNavigate} />
            ) : (
              <form onSubmit={handleAuthSubmit}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(124,92,252,0.18)", border: "1px solid rgba(155,135,245,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <User size={22} color="#B8A9FD" />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 600, margin: "0 0 4px" }}>
                        {isLoginMode ? "Judge Sign In" : "Judge Registration"}
                      </h2>
                      <p style={{ fontSize: 13.5, color: "#5B5F6D", margin: 0, lineHeight: 1.5 }}>
                        {isLoginMode
                          ? "Enter your judge credentials to access your scoring dashboard."
                          : "Fill in your details to join as an official hackathon judge."}
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)",
                    borderRadius: 8, padding: "10px 14px", marginBottom: 18, color: "#F87171",
                    fontSize: 13.5, display: "flex", alignItems: "center", gap: 8
                  }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {!isLoginMode && (
                  <Field label="Full name" required>
                    <div style={{ position: "relative" }}>
                      <User size={16} className="field-icon" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Marek Nowak"
                        autoComplete="name"
                      />
                    </div>
                  </Field>
                )}

                <Field label="Email address" required={!isLoginMode || !judgeId}>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} className="field-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. marek.nowak@example.org"
                      autoComplete="email"
                    />
                  </div>
                </Field>

                <Field label="Judge ID" required={!isLoginMode || !email}>
                  <div style={{ position: "relative" }}>
                    <CreditCard size={16} className="field-icon" />
                    <input
                      type="text"
                      value={judgeId}
                      onChange={(e) => setJudgeId(e.target.value)}
                      placeholder="e.g. jdg_08"
                      autoComplete="off"
                    />
                  </div>
                </Field>

                <button
                  type="submit"
                  disabled={!canContinue || loading}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: canContinue ? "linear-gradient(135deg, #8A6EFC, #6D4FE8)" : "#262A34",
                    color: canContinue ? "#FFFFFF" : "#5B5F6D",
                    border: "none", padding: "14px", borderRadius: 10, fontSize: 15, fontWeight: 600,
                    cursor: canContinue ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif", marginTop: 10,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin" /> Authenticating...
                    </>
                  ) : (
                    <>
                      {isLoginMode ? "Sign In & Open Dashboard" : "Register & Open Dashboard"} <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 16px" }}>
                  <div style={{ flex: 1, height: 1, background: "#1D2029" }} />
                  <span style={{ fontSize: 12.5, color: "#5B5F6D" }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: "#1D2029" }} />
                </div>

                <div style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(!isLoginMode);
                      setError("");
                    }}
                    style={{
                      background: "none", border: "none", color: "#B8A9FD",
                      fontSize: 13.5, cursor: "pointer", textDecoration: "underline"
                    }}
                  >
                    {isLoginMode
                      ? "Need to register a new judge ID? Click here"
                      : "Already have a judge ID or account? Sign in directly"}
                  </button>
                </div>
              </form>
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
        Welcome, {name ? name.split(" ")[0] : "Judge"}
      </h2>
      <p style={{ color: "#9A96AC", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
        You are authenticated with judge privileges.
      </p>
      <button
        onClick={() => onNavigate && onNavigate("Judge Dashboard")}
        style={{
          background: "linear-gradient(135deg, #8A6EFC, #6D4FE8)", color: "#FFF",
          border: "none", padding: "12px 24px", borderRadius: 8, fontSize: 14.5,
          fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8
        }}
      >
        Go to Judge Dashboard <ArrowRight size={16} />
      </button>
    </div>
  );
}
