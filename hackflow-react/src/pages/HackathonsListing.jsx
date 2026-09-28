import { useState } from "react";
import {
  Zap, Search, Filter, ChevronDown, Calendar, Building2, ArrowRight,
  ArrowLeft, Menu, X, CalendarDays, Brain, Leaf, TrendingUp, HeartPulse,
  Lightbulb, GraduationCap, Lock,
} from "lucide-react";

const NAV = ["Home", "Hackathons", "Projects", "About"];

const HACKATHONS = [
  {
    tag: "Featured", tagBg: "#2E2560", tagColor: "#B8A9FD",
    name: "Sample Hack 2027",
    host: "Hosted by HackFlow",
    dates: "1 Mar – 3 Mar 2027",
    desc: "Build hardware and software that gets deployed, not shelved — for real users, real constraints.",
    tracks: ["Dev tools", "Security", "+6 more"],
    icon: Zap,
    iconBg: "linear-gradient(135deg, #4C3BCF, #7C5CFC)",
    btnBg: "linear-gradient(135deg, #8A6EFC, #6D4FE8)",
    closed: false,
  },
  {
    tag: "Environment", tagBg: "#173A28", tagColor: "#4ADE80",
    name: "Green Tech Hackathon",
    host: "Hosted by XYZ University",
    dates: "1 Oct – 4 Oct 2026",
    desc: "Create technology that helps build a more sustainable future.",
    tracks: ["Environment", "Hardware", "IoT"],
    icon: Leaf,
    iconBg: "linear-gradient(135deg, #1F4D2E, #3B7A4A)",
    btnBg: "linear-gradient(135deg, #22A45D, #178A4C)",
    closed: false,
  },
  {
    tag: "Web", tagBg: "#173047", tagColor: "#60A5FA",
    name: "FinTech Buildathon",
    host: "Hosted by PQR College of Engineering",
    dates: "10 Oct – 12 Oct 2026",
    desc: "Build solutions for a smarter, safer and more inclusive financial future.",
    tracks: ["FinTech", "Web", "Mobile"],
    icon: TrendingUp,
    iconBg: "linear-gradient(135deg, #1E3A6E, #2E5FA3)",
    btnBg: "linear-gradient(135deg, #3B82F6, #2563EB)",
    closed: true,
  },
  {
    tag: "Health", tagBg: "#3A1E45", tagColor: "#E879F9",
    name: "HealthTech Hackathon",
    host: "Hosted by LMN Medical College",
    dates: "18 Oct – 20 Oct 2026",
    desc: "Innovate solutions for better healthcare, accessibility and patient care.",
    tracks: ["Health", "AI", "Mobile"],
    icon: HeartPulse,
    iconBg: "linear-gradient(135deg, #6E2A6B, #B23A8C)",
    btnBg: "linear-gradient(135deg, #D946A6, #B23A8C)",
    closed: false,
  },
  {
    tag: "Miscellaneous", tagBg: "#3A2E14", tagColor: "#EAB308",
    name: "Campus Buildathon",
    host: "Hosted by University of Calcutta",
    dates: "25 Oct – 27 Oct 2026",
    desc: "A platform for students to build, learn and collaborate on innovative ideas.",
    tracks: ["Open", "AI", "Web"],
    icon: Lightbulb,
    iconBg: "linear-gradient(135deg, #6E5A1F, #A38524)",
    btnBg: "linear-gradient(135deg, #EAB308, #CA9A04)",
    closed: true,
  },
  {
    tag: "Education", tagBg: "#123A3E", tagColor: "#2DD4BF",
    name: "EdTech Innovation Challenge",
    host: "Hosted by St. Xavier's College",
    dates: "5 Nov – 7 Nov 2026",
    desc: "Reimagine the future of learning with technology and creativity.",
    tracks: ["EdTech", "AI", "Web"],
    icon: GraduationCap,
    iconBg: "linear-gradient(135deg, #164E4A, #1D8A7E)",
    btnBg: "linear-gradient(135deg, #2DD4BF, #17A08F)",
    closed: false,
  },
];

export default function HackathonsListing() {
  const [navOpen, setNavOpen] = useState(false);
  const [page, setPage] = useState(1);

  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        input {
          background: #14161C; border: 1px solid #262A34; border-radius: 9px;
          padding: 11px 14px 11px 40px; color: #E8E6F0; font-family: 'Inter', sans-serif;
          font-size: 14px; outline: none; width: 100%;
        }
        input::placeholder { color: #5B5F6D; }
        input:focus { border-color: #7C5CFC; }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 1080px) {
          .cards-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 700px) {
          .cards-grid { grid-template-columns: 1fr; }
        }
        .search-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .search-row > * { flex: 1; min-width: 200px; }
        .search-row > .filter-box { flex: 0 0 auto; min-width: 150px; }
        .desktop-nav { display: flex; }
        .mobile-toggle { display: none; }
        @media (max-width: 760px) {
          .desktop-nav { display: none; }
          .mobile-toggle { display: flex; }
        }
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
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
              <a key={item} href="#" style={{
                color: item === "Hackathons" ? "#B8A9FD" : "#9A96AC", textDecoration: "none", fontSize: 14.5, fontWeight: 500,
                borderBottom: item === "Hackathons" ? "2px solid #7C5CFC" : "2px solid transparent",
                paddingBottom: 18, marginBottom: -19,
              }}>
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

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 24px 80px" }}>
        {/* Header */}
        <div className="header-row" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: "rgba(124,92,252,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <CalendarDays size={22} color="#B8A9FD" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.015em" }}>
                Available <span style={{ color: "#8A6EFC" }}>Hackathons</span>
              </h1>
              <p style={{ color: "#9A96AC", fontSize: 14.5, margin: 0 }}>Explore and join hackathons that match your interests and skills.</p>
            </div>
          </div>
        </div>

        {/* Search row */}
        <div className="search-row" style={{ marginBottom: 30 }}>
          <div style={{ position: "relative" }}>
            <Search size={16} color="#5B5F6D" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input placeholder="Search hackathons..." />
          </div>
          <div className="filter-box" style={{
            display: "flex", alignItems: "center", gap: 8, border: "1px solid #262A34",
            borderRadius: 9, padding: "11px 14px", cursor: "pointer",
          }}>
            <Filter size={15} color="#5B5F6D" />
            <span style={{ fontSize: 14, color: "#C7C4D6" }}>All tracks</span>
            <ChevronDown size={14} color="#5B5F6D" style={{ marginLeft: "auto" }} />
          </div>
        </div>

        {/* Cards */}
        <div className="cards-grid" style={{ marginBottom: 36 }}>
          {HACKATHONS.map((h) => (
            <HackathonCard key={h.name} data={h} />
          ))}
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
          <PageArrow icon={ArrowLeft} onClick={() => setPage((p) => Math.max(1, p - 1))} />
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              style={{
                width: 34, height: 34, borderRadius: "50%", border: "none",
                background: page === n ? "#7C5CFC" : "transparent",
                color: page === n ? "#FFFFFF" : "#9A96AC",
                fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}
            >
              {n}
            </button>
          ))}
          <PageArrow icon={ArrowRight} onClick={() => setPage((p) => Math.min(3, p + 1))} />
        </div>
      </div>
    </div>
  );
}

function HackathonCard({ data }) {
  const { tag, tagBg, tagColor, name, host, dates, desc, tracks, icon: Icon, iconBg, btnBg, closed } = data;
  return (
    <div style={{
      background: "#14161C", border: "1px solid #1D2029", borderRadius: 16, padding: "22px",
      opacity: closed ? 0.6 : 1, position: "relative",
    }}>
      {closed && (
        <div style={{
          position: "absolute", top: 18, right: 18, display: "flex", alignItems: "center", gap: 5,
          background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)",
          color: "#F87171", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
        }}>
          <Lock size={11} /> Closed
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{
          fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
          background: tagBg, color: tagColor,
        }}>
          {tag}
        </span>
        <div style={{
          width: 52, height: 52, borderRadius: 12, background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={24} color="rgba(255,255,255,0.9)" />
        </div>
      </div>

      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, margin: "0 0 10px" }}>{name}</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#9A96AC" }}>
          <Building2 size={13} /> {host}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#9A96AC" }}>
          <Calendar size={13} /> {dates}
        </span>
      </div>

      <p style={{ fontSize: 13.5, color: "#9A96AC", lineHeight: 1.55, margin: "0 0 16px" }}>{desc}</p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tracks.map((t) => (
            <span key={t} style={{
              fontSize: 11.5, fontWeight: 500, padding: "4px 10px", borderRadius: 20,
              background: "#1D2029", color: "#C7C4D6",
            }}>
              {t}
            </span>
          ))}
        </div>
        <button
          disabled={closed}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: closed ? "#1D2029" : btnBg,
            color: closed ? "#5B5F6D" : "#FFFFFF",
            border: "none", padding: "9px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 600,
            cursor: closed ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
          }}
        >
          {closed ? "Registration closed" : "View details"} {!closed && <ArrowRight size={13} />}
        </button>
      </div>
    </div>
  );
}

function PageArrow({ icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 34, height: 34, borderRadius: "50%", border: "1px solid #262A34",
        background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <Icon size={15} color="#9A96AC" />
    </button>
  );
}
