import { useState, useEffect } from "react";
import {
  Zap, Plus, Gavel, ArrowRight, Flame, Calendar, Users, ChevronDown,
  Code2, Trophy, Rocket, Menu, X, LogOut, LayoutDashboard
} from "lucide-react";

const HACKATHONS = [
  {
    name: "Sample Hack 2027",
    gradient: "linear-gradient(135deg, #4C3BCF, #7C5CFC 55%, #2A1D5C)",
    icon: Rocket,
    dates: "1 – 3 Mar 2027",
    teams: "40 teams",
    tags: ["Developer tools", "Data and analytics", "+6 more"],
    tagColors: ["#2E2560", "#233A2E"],
  },
  {
    name: "Green Tech Hackathon",
    gradient: "linear-gradient(135deg, #1F4D2E, #3B7A4A 60%, #14201A)",
    icon: null,
    dates: "1 – 4 Oct 2027",
    teams: "28 teams",
    tags: ["Environment", "Hardware"],
    tagColors: ["#233A2E", "#233A2E"],
  },
  {
    name: "FinTech Buildathon",
    gradient: "linear-gradient(135deg, #6E2A6B, #B23A8C 55%, #2A1230)",
    icon: null,
    dates: "10 – 12 Oct 2027",
    teams: "36 teams",
    tags: ["FinTech", "Web"],
    tagColors: ["#3A1E45", "#2E2560"],
  },
];

const NAV = ["Home", "Hackathons", "Projects", "About"];

export default function HackFlowHome({ onNavigate, user, onLogout }) {
  const [navOpen, setNavOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    } else {
      const saved = localStorage.getItem("hackflow_user");
      if (saved) {
        try { setCurrentUser(JSON.parse(saved)); } catch(e){}
      } else {
        setCurrentUser(null);
      }
    }
  }, [user]);

  const handleCreateHackathonClick = () => {
    if (currentUser) {
      if (onNavigate) onNavigate("Organizer Dashboard");
    } else {
      if (onNavigate) onNavigate("Organizer Registration");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hackflow_user");
    setCurrentUser(null);
    setUserDropdown(false);
    if (onLogout) onLogout();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 860px) {
          .actions-grid { grid-template-columns: 1fr; }
        }
        .hackathons-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 980px) {
          .hackathons-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 680px) {
          .hackathons-grid { grid-template-columns: 1fr; }
        }
        .hero-split {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .hero-split { grid-template-columns: 1fr; }
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
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 17 }}>
              HackFlow
            </span>
          </div>

          <div className="desktop-nav" style={{ gap: 28, flex: 1 }}>
            {NAV.map((item, i) => (
              <a key={item} href="#" onClick={(e) => { e.preventDefault(); if (i === 0 && onNavigate) onNavigate("HackFlow Home"); }} style={{
                color: i === 0 ? "#B8A9FD" : "#9A96AC", textDecoration: "none", fontSize: 14.5, fontWeight: 500,
                borderBottom: i === 0 ? "2px solid #7C5CFC" : "2px solid transparent", paddingBottom: 18, marginBottom: -19,
              }}>
                {item}
              </a>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
            {currentUser ? (
              <div style={{ position: "relative" }}>
                <div
                  onClick={() => setUserDropdown(!userDropdown)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, border: "1px solid #7C5CFC", borderRadius: 9,
                    padding: "8px 14px", cursor: "pointer", background: "rgba(124,92,252,0.12)"
                  }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: 11, fontWeight: 700 }}>
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "O"}
                  </div>
                  <span style={{ fontSize: 13.5, color: "#E8E6F0", fontWeight: 600 }}>
                    {currentUser.name || "Organizer"}
                  </span>
                  <ChevronDown size={14} color="#9A96AC" />
                </div>

                {userDropdown && (
                  <div style={{
                    position: "absolute", top: "115%", right: 0, width: 200, background: "#14161C",
                    border: "1px solid #262A34", borderRadius: 10, padding: 8, zIndex: 100,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                  }}>
                    <button
                      onClick={() => { setUserDropdown(false); if (onNavigate) onNavigate("Organizer Dashboard"); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                        background: "none", border: "none", color: "#C7C4D6", fontSize: 13.5,
                        cursor: "pointer", borderRadius: 6, textAlign: "left"
                      }}
                    >
                      <LayoutDashboard size={15} color="#8A6EFC" /> Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                        background: "none", border: "none", color: "#F87171", fontSize: 13.5,
                        cursor: "pointer", borderRadius: 6, textAlign: "left", marginTop: 4
                      }}
                    >
                      <LogOut size={15} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleCreateHackathonClick}
                style={{
                  background: "linear-gradient(135deg, #8A6EFC, #6D4FE8)", color: "#FFF", border: "none",
                  padding: "9px 16px", borderRadius: 9, fontSize: 13.5, fontWeight: 600, cursor: "pointer"
                }}
              >
                Create Hackathons
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
              <a key={item} href="#" style={{ color: "#C7C4D6", textDecoration: "none", fontSize: 15, padding: "10px 0", borderTop: "1px solid #1D2029" }}>
                {item}
              </a>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 24px 40px" }}>
        <div className="hero-split" style={{ marginBottom: 56 }}>
          {/* Left: copy */}
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#5B5F6D", letterSpacing: "0.14em" }}>
              THE ALL-IN-ONE HACKATHON PLATFORM
            </span>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(42px, 7vw, 64px)",
              fontWeight: 700, letterSpacing: "-0.02em", margin: "14px 0 20px", lineHeight: 1,
            }}>
              Hack<span style={{ color: "#8A6EFC" }}>Flow</span>
            </h1>
            <p style={{ fontSize: "clamp(19px, 3vw, 24px)", color: "#C7C4D6", fontWeight: 500, lineHeight: 1.4, margin: "0 0 14px", maxWidth: 480 }}>
              Run your hackathon without the spreadsheet chaos.
            </p>
            <p style={{ color: "#5B5F6D", fontSize: 15, margin: "0 0 32px" }}>
              Create. Build. Judge. Celebrate — all in one place.
            </p>

            <div className="actions-grid">
              <ActionCard
                icon={Zap}
                iconColor="#B8A9FD"
                bg="linear-gradient(135deg, #241C4E, #171A28)"
                border="#3A3560"
                title="Join a hackathon"
                note="Explore ongoing hackathons and be a part of the action."
              />
              <ActionCard
                icon={Plus}
                iconColor="#9A96AC"
                bg="#14161C"
                border="#262A34"
                title="Create a hackathon"
                note="Set up your own hackathon and bring your ideas to life."
                onClick={handleCreateHackathonClick}
              />
              <ActionCard
                icon={Gavel}
                iconColor="#4ADE80"
                bg="linear-gradient(135deg, #12251C, #14161C)"
                border="#254A34"
                title="Judge a hackathon"
                note="Review projects, give scores and help decide the winners."
              />
            </div>
          </div>

          {/* Right: illustration */}
          <HeroIllustration />
        </div>

        {/* Active hackathons */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Flame size={20} color="#8A6EFC" fill="#8A6EFC" />
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 21, fontWeight: 600, margin: 0 }}>
                Active hackathons
              </h2>
            </div>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13.5, color: "#B8A9FD", textDecoration: "none" }}>
              View all hackathons <ArrowRight size={14} />
            </a>
          </div>

          <div className="hackathons-grid">
            {HACKATHONS.map((h) => (
              <HackathonCard key={h.name} data={h} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, iconColor, bg, border, title, note, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: "20px",
      cursor: "pointer", display: "flex", flexDirection: "column", gap: 14, minHeight: 150,
      transition: "transform 0.15s ease, border-color 0.15s ease",
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={17} color={iconColor} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: "#E8E6F0", marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#9A96AC", lineHeight: 1.5 }}>{note}</div>
      </div>
      <ArrowRight size={16} color="#5B5F6D" />
    </div>
  );
}

function HackathonCard({ data }) {
  const { name, gradient, icon: Icon, dates, teams, tags, tagColors } = data;
  return (
    <div style={{ background: "#14161C", border: "1px solid #1D2029", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ height: 96, background: gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {Icon && <Icon size={30} color="rgba(255,255,255,0.85)" strokeWidth={1.6} />}
      </div>
      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{name}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#9A96AC" }}>
            <Calendar size={13} /> {dates}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#9A96AC" }}>
            <Users size={13} /> {teams}
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {tags.map((t, i) => (
            <span key={t} style={{
              fontSize: 11.5, fontWeight: 500, padding: "4px 10px", borderRadius: 20,
              background: tagColors[Math.min(i, tagColors.length - 1)], color: "#C7C4D6",
            }}>
              {t}
            </span>
          ))}
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "transparent", border: "1px solid #262A34", color: "#C7C4D6",
          padding: "9px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 500,
          cursor: "pointer", fontFamily: "Inter, sans-serif",
        }}>
          View details <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div style={{ position: "relative", width: "100%", maxHeight: 380, display: "flex", justifyContent: "center" }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "radial-gradient(ellipse at 60% 50%, rgba(124,92,252,0.18), transparent 65%)",
      }} />
      <svg width="90%" height="300" viewBox="0 0 400 300" fill="none" style={{ position: "relative", maxWidth: 420 }}>
        <path d="M20 220 Q 140 160 260 200 T 400 140" stroke="#3A3560" strokeWidth="1" fill="none" opacity="0.6" />
      </svg>

      <div style={{ position: "absolute", top: 20, left: "8%" }}>
        <FloatChip icon={Code2} />
      </div>
      <div style={{ position: "absolute", top: 90, left: "0%" }}>
        <FloatChip icon={Users} />
      </div>
      <div style={{ position: "absolute", top: 70, right: "4%" }}>
        <FloatChip icon={Trophy} />
      </div>

      <div style={{
        position: "absolute", bottom: 10, width: 280, height: 190,
      }}>
        <div style={{
          width: "100%", height: 160, borderRadius: "12px 12px 4px 4px",
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
