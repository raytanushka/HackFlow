import React, { useState, useEffect } from "react";
import { Zap, Mail, Shield, ArrowRight, ArrowLeft, AlertCircle, Loader2, Gavel } from "lucide-react";

export default function Login({ onLoginSuccess, onNavigate, redirectTo, initialRole, eventId, eventName, name }) {
  const getInitialRole = () => {
    if (initialRole) return initialRole;
    if (typeof window !== "undefined" && window.location) {
      const params = new URLSearchParams(window.location.search);
      const r = params.get("role");
      if (r === "judge" || r === "participant" || r === "organizer") return r;
      if (window.location.pathname === "/judge/login") return "judge";
    }
    return "organizer";
  };

  const [role, setRole] = useState(getInitialRole);
  const [dbEvent, setDbEvent] = useState(null);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [email, setEmail] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [judgeId, setJudgeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  useEffect(() => {
    fetch("http://localhost:8000/api/events")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableEvents(data);
        }
      })
      .catch(() => {});
  }, []);

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

  const matchedEvent = (availableEvents && availableEvents.find((e) => e.id === eventId)) || dbEvent;
  const rawPassedName = eventName || name;
  const isGenericDefault = rawPassedName === "Smart Hack 2027" || rawPassedName === "Sample Hack 2027";

  const displayEventName = (matchedEvent && matchedEvent.name)
    || (eventId === "evt_fintech" ? "FinTech Buildathon" : (eventId === "evt_01" ? "Sample Hack 2026" : null))
    || (!isGenericDefault && rawPassedName ? rawPassedName : null)
    || (eventId === "evt_fintech" ? "FinTech Buildathon" : (eventId === "evt_01" ? "Sample Hack 2026" : "FinTech Buildathon"));

  const canSubmit = role === "participant" 
    ? Boolean(email.trim()) 
    : role === "judge"
      ? Boolean(email.trim() && judgeId.trim())
      : Boolean(email.trim() && organizerId.trim());

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError("");

    try {
      let endpoint = "http://localhost:8000/api/auth/login";
      let payload = {};

      if (role === "participant") {
        endpoint = "http://localhost:8000/api/auth/login-participant";
        payload = { email: email.trim(), event_id: eventId };
      } else if (role === "judge") {
        endpoint = "http://localhost:8000/api/auth/login-judge";
        payload = { email: email.trim(), judge_id: judgeId.trim() };
      } else {
        endpoint = "http://localhost:8000/api/auth/login";
        payload = { email: email.trim(), organizer_id: organizerId.trim(), event_id: eventId };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        let msg = role === "judge" ? "Invalid judge credentials" : "Invalid email or organizer ID";
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
        } else if (res.status === 401) {
          msg = role === "judge" ? "Invalid judge credentials" : "Invalid email or organizer ID";
        } else if (res.status === 404) {
          msg = "Account not found. Please register first.";
        }
        throw new Error(msg);
      }

      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        orgId: data.user.org_id,
        role: data.user.role || role,
        token: data.token,
        eventId: eventId,
        eventName: (data.event && data.event.name) || displayEventName
      };

      localStorage.setItem("hackflow_user", JSON.stringify(userData));
      localStorage.setItem("hackflow_token", data.token);

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      if (onNavigate) {
        if (role === "participant") {
          onNavigate(redirectTo || "Participant Dashboard", { eventId, name: (data.event && data.event.name) || displayEventName });
        } else if (role === "judge") {
          onNavigate("Judge Dashboard");
        } else {
          onNavigate("Organizer Dashboard");
        }
      }
    } catch (err) {
      const msg = typeof err === "string" ? err : (err?.message || "An unexpected error occurred during login.");
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0C10",
      fontFamily: "Inter, sans-serif",
      color: "#E8E6F0",
      display: "flex",
      flexDirection: "column"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        input {
          width: 100%;
          background: #14161C;
          border: 1px solid #262A34;
          border-radius: 8px;
          padding: 12px 14px 12px 42px;
          color: #E8E6F0;
          font-family: 'Inter', sans-serif;
          font-size: 14.5px;
          outline: none;
          transition: border-color 0.15s ease;
        }
        input:focus { border-color: #7C5CFC; }
        input::placeholder { color: #5B5F6D; }
      `}</style>

      {/* Top Navbar */}
      <div style={{ borderBottom: "1px solid #1D2029", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}
            onClick={() => onNavigate && onNavigate("HackFlow Home")}
          >
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={16} color="#0B0C10" strokeWidth={2.5} fill="#0B0C10" />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 17 }}>
              Hack<span style={{ color: "#8A6EFC" }}>Flow</span>
            </span>
          </div>

          <button
            onClick={() => onNavigate && onNavigate("HackFlow Home")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "transparent", border: "none", color: "#9A96AC",
              fontSize: 14, cursor: "pointer"
            }}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </div>

      {/* Login Card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{
          width: "100%", maxWidth: 440,
          background: "#12141A",
          border: "1px solid #1D2029",
          borderRadius: 16,
          padding: "32px 28px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
        }}>
          {/* Role Switcher */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6,
            background: "#181B22", padding: 4, borderRadius: 10, marginBottom: 22, border: "1px solid #262A34"
          }}>
            <button
              type="button"
              onClick={() => { setRole("participant"); setEmail(""); setOrganizerId(""); setJudgeId(""); setError(""); }}
              style={{
                padding: "8px 8px", borderRadius: 7, border: "none", fontSize: 13.5, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s ease",
                background: role === "participant" ? "#7C5CFC" : "transparent",
                color: role === "participant" ? "#FFFFFF" : "#9A96AC"
              }}
            >
              Participant
            </button>
            <button
              type="button"
              onClick={() => { setRole("organizer"); setEmail(""); setOrganizerId(""); setJudgeId(""); setError(""); }}
              style={{
                padding: "8px 8px", borderRadius: 7, border: "none", fontSize: 13.5, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s ease",
                background: role === "organizer" ? "#7C5CFC" : "transparent",
                color: role === "organizer" ? "#FFFFFF" : "#9A96AC"
              }}
            >
              Organizer
            </button>
            <button
              type="button"
              onClick={() => { setRole("judge"); setEmail(""); setOrganizerId(""); setJudgeId(""); setError(""); }}
              style={{
                padding: "8px 8px", borderRadius: 7, border: "none", fontSize: 13.5, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s ease",
                background: role === "judge" ? "#7C5CFC" : "transparent",
                color: role === "judge" ? "#FFFFFF" : "#9A96AC"
              }}
            >
              Judge
            </button>
          </div>

          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12,
              background: "rgba(124, 92, 252, 0.12)", border: "1px solid rgba(124, 92, 252, 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px"
            }}>
              {role === "judge" ? (
                <Gavel size={22} color="#B8A9FD" />
              ) : (
                <Shield size={22} color="#B8A9FD" />
              )}
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>
              {role === "participant" ? "Participant Login" : (role === "judge" ? "Judge Login" : "Organizer Login")}
            </h1>
            <p style={{ color: "#9A96AC", fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
              {role === "participant"
                ? `Enter your email to sign in and submit to ${displayEventName}.`
                : role === "judge"
                  ? "Enter your registered judge email and ID to access your dashboard."
                  : "Enter your registered organizer email and ID to access your dashboard."}
            </p>
            {role === "participant" && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(124, 92, 252, 0.12)", border: "1px solid rgba(124, 92, 252, 0.3)",
                color: "#B8A9FD", fontSize: 12.5, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
                marginTop: 10
              }}>
                🚀 {displayEventName}
              </div>
            )}
          </div>

          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(248, 113, 113, 0.1)",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              borderRadius: 8, padding: "12px 14px",
              color: "#F87171", fontSize: 13.5, marginBottom: 20
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{typeof error === "string" ? error : JSON.stringify(error)}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 500, color: "#C7C4D6", marginBottom: 7 }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="#5B5F6D" style={{ position: "absolute", left: 14, top: 14 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === "participant"
                      ? "you@college.edu"
                      : role === "judge"
                        ? "judge@example.org"
                        : "organizer@example.org"
                  }
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {role === "organizer" && (
              <div>
                <label style={{ display: "block", fontSize: 13.5, fontWeight: 500, color: "#C7C4D6", marginBottom: 7 }}>
                  Organizer ID
                </label>
                <div style={{ position: "relative" }}>
                  <Shield size={16} color="#5B5F6D" style={{ position: "absolute", left: 14, top: 14 }} />
                  <input
                    type="text"
                    value={organizerId}
                    onChange={(e) => setOrganizerId(e.target.value)}
                    placeholder="e.g. org_01"
                    autoComplete="off"
                    disabled={loading}
                  />
                </div>
                <div style={{ fontSize: 12, color: "#5B5F6D", marginTop: 5 }}>
                  Your unique organization identifier provided during registration.
                </div>
              </div>
            )}

            {role === "judge" && (
              <div>
                <label style={{ display: "block", fontSize: 13.5, fontWeight: 500, color: "#C7C4D6", marginBottom: 7 }}>
                  Judge ID
                </label>
                <div style={{ position: "relative" }}>
                  <Gavel size={16} color="#5B5F6D" style={{ position: "absolute", left: 14, top: 14 }} />
                  <input
                    type="text"
                    value={judgeId}
                    onChange={(e) => setJudgeId(e.target.value)}
                    placeholder="e.g. jdg_08"
                    autoComplete="off"
                    disabled={loading}
                  />
                </div>
                <div style={{ fontSize: 12, color: "#5B5F6D", marginTop: 5 }}>
                  Your unique judge identifier assigned by the organizer.
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              style={{
                marginTop: 8,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: canSubmit && !loading ? "#7C5CFC" : "#262A34",
                color: canSubmit && !loading ? "#0F1115" : "#5B5F6D",
                border: "none", padding: "13px", borderRadius: 8,
                fontSize: 14.5, fontWeight: 600,
                cursor: canSubmit && !loading ? "pointer" : "not-allowed",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.15s ease"
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  {role === "participant"
                    ? "Sign in as Participant"
                    : role === "judge"
                      ? "Sign in as Judge"
                      : "Sign in to Dashboard"}{" "}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {role !== "judge" && (
            <div style={{
              marginTop: 24, paddingTop: 20,
              borderTop: "1px solid #1D2029",
              textAlign: "center", fontSize: 13.5, color: "#9A96AC"
            }}>
              {role === "participant" ? (
                <>
                  Don't have a participant account?{" "}
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate("Participant Registration", { eventId, name: displayEventName, redirectTo })}
                    style={{
                      background: "none", border: "none", color: "#8A6EFC",
                      fontWeight: 600, cursor: "pointer", padding: 0, fontSize: 13.5
                    }}
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Don't have an organizer account?{" "}
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate("Organizer Registration")}
                    style={{
                      background: "none", border: "none", color: "#8A6EFC",
                      fontWeight: 600, cursor: "pointer", padding: 0, fontSize: 13.5
                    }}
                  >
                    Register here
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
