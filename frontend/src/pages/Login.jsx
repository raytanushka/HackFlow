import React, { useState } from "react";
import { Zap, Mail, Shield, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

export default function Login({ onLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = email.trim() && organizerId.trim();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          organizer_id: organizerId.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Login failed. Please verify your email and organizer ID.");
      }

      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        orgId: data.user.org_id,
        role: data.user.role,
        token: data.token
      };

      localStorage.setItem("hackflow_user", JSON.stringify(userData));
      localStorage.setItem("hackflow_token", data.token);

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      if (onNavigate) {
        onNavigate("Organizer Dashboard");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred during login.");
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
          padding: "36px 32px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
        }}>
          <div style={{ marginBottom: 26, textAlign: "center" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "rgba(124, 92, 252, 0.12)", border: "1px solid rgba(124, 92, 252, 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <Shield size={24} color="#B8A9FD" />
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>
              Organizer Login
            </h1>
            <p style={{ color: "#9A96AC", fontSize: 14, margin: 0, lineHeight: 1.5 }}>
              Enter your registered organizer email and ID to access your dashboard.
            </p>
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
              <div>{error}</div>
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
                  placeholder="organizer@example.org"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

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
                  disabled={loading}
                />
              </div>
              <div style={{ fontSize: 12, color: "#5B5F6D", marginTop: 5 }}>
                Your unique organization identifier provided during registration.
              </div>
            </div>

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
                  Sign in to Dashboard <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: 24, paddingTop: 20,
            borderTop: "1px solid #1D2029",
            textAlign: "center", fontSize: 13.5, color: "#9A96AC"
          }}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
