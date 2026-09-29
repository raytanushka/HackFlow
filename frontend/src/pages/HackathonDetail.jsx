import { useState, useEffect } from "react";
import {
  Rocket, Calendar, Users, MapPin, ShieldCheck, Info, Check,
  Target, Trophy, ArrowRight, Lightbulb, FileText,
  Code2, BarChart3, Accessibility, Shield, Leaf, HeartPulse, BookOpen, Cpu,
} from "lucide-react";

const TRACKS = [
  { icon: Code2, label: "Developer Tools" },
  { icon: BarChart3, label: "Data and Analytics" },
  { icon: Accessibility, label: "Accessibility" },
  { icon: Shield, label: "Security" },
  { icon: Leaf, label: "Climate" },
  { icon: HeartPulse, label: "Health" },
  { icon: BookOpen, label: "Education" },
  { icon: Cpu, label: "Open Hardware" },
];

function computeTimeline(meta, dbEvent) {
  if (meta && meta.datesList) {
    return {
      duration: meta.duration || "48 Hours",
      durationSub: meta.durationSub || meta.datesRange || meta.dates,
      dates: meta.datesList,
    };
  }

  if (dbEvent && dbEvent.submissions_close) {
    try {
      const closeDate = new Date(dbEvent.submissions_close);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const fmt = (d, withTime = false) => {
        const m = months[d.getUTCMonth()];
        const day = d.getUTCDate();
        const yr = d.getUTCFullYear();
        if (!withTime) return `${m} ${day}, ${yr}`;
        const hrs = d.getUTCHours();
        const mins = d.getUTCMinutes().toString().padStart(2, "0");
        const ampm = hrs >= 12 ? "PM" : "AM";
        const h12 = hrs % 12 || 12;
        return `${m} ${day}, ${yr} (${h12}:${mins} ${ampm})`;
      };

      const beginDate = new Date(closeDate.getTime() - 48 * 3600 * 1000);
      const regClose = new Date(beginDate.getTime() - 5 * 24 * 3600 * 1000);
      const regOpen = new Date(beginDate.getTime() - 30 * 24 * 3600 * 1000);
      const resultsDate = new Date(closeDate.getTime() + 48 * 3600 * 1000);

      return {
        duration: "48 Hours",
        durationSub: `${months[beginDate.getUTCMonth()]} ${beginDate.getUTCDate()} – ${months[closeDate.getUTCMonth()]} ${closeDate.getUTCDate()}, ${closeDate.getUTCFullYear()}`,
        dates: [
          { label: "Registration Opens", date: fmt(regOpen) },
          { label: "Registration Closes", date: fmt(regClose) },
          { label: "Hackathon Begins", date: `${fmt(beginDate)} (9:00 AM)` },
          { label: "Submission Deadline", date: fmt(closeDate, true) },
          { label: "Results Announcement", date: fmt(resultsDate) },
        ],
      };
    } catch (e) {}
  }

  return {
    duration: "48 Hours",
    durationSub: "Mar 1 – Mar 3, 2027",
    dates: [
      { label: "Registration Opens", date: "Feb 1, 2027" },
      { label: "Registration Closes", date: "Feb 20, 2027" },
      { label: "Hackathon Begins", date: "Mar 1, 2027 (9:00 AM)" },
      { label: "Submission Deadline", date: "Mar 3, 2027 (6:00 PM)" },
      { label: "Results Announcement", date: "Mar 5, 2027" },
    ],
  };
}

const EVENT_METADATA = {
  evt_01: {
    name: "Sample Hack 2026",
    status: "Closed",
    dates: "27 Feb – 1 Mar 2026 (Closed)",
    duration: "48 Hours",
    durationSub: "Feb 27 – Mar 1, 2026",
    desc: "Official fixture hackathon dataset used for acceptance tests. Submissions are closed.",
    about: "Sample Hack 2026 is an official fixture hackathon for teams building hardware-integrated and software solutions.",
    isClosed: true,
    datesList: [
      { label: "Registration Opens", date: "Feb 1, 2026" },
      { label: "Registration Closes", date: "Feb 25, 2026" },
      { label: "Hackathon Begins", date: "Feb 27, 2026 (9:00 AM)" },
      { label: "Submission Deadline", date: "Mar 1, 2026 (6:00 PM)" },
      { label: "Results Announcement", date: "Mar 3, 2026" },
    ],
  },
  evt_smart_hack_2027: {
    name: "Smart Hack 2027",
    status: "Live",
    dates: "Mar 1, 2027 – Mar 3, 2027",
    duration: "48 Hours",
    durationSub: "Mar 1 – Mar 3, 2027",
    desc: "Build hardware and software that gets deployed, not shelved — for real users, real constraints.",
    about: "Smart Hack 2027 is a 48-hour hackathon for students building hardware-integrated and social-impact solutions. We're looking for teams who can take a real problem — accessibility, safety, sustainability — from concept to a working prototype in one weekend.",
    isClosed: false,
    datesList: [
      { label: "Registration Opens", date: "Feb 1, 2027" },
      { label: "Registration Closes", date: "Feb 20, 2027" },
      { label: "Hackathon Begins", date: "Mar 1, 2027 (9:00 AM)" },
      { label: "Submission Deadline", date: "Mar 3, 2027 (6:00 PM)" },
      { label: "Results Announcement", date: "Mar 5, 2027" },
    ],
  },
  evt_fintech: {
    name: "FinTech Buildathon",
    status: "Live",
    dates: "10 Oct – 12 Oct 2027",
    duration: "48 Hours",
    durationSub: "Oct 10 – Oct 12, 2027",
    desc: "Build solutions for a smarter, safer and more inclusive financial future.",
    about: "FinTech Buildathon brings together builders, designers, and developers to build novel decentralized finance, payments, security, and financial inclusion tools.",
    isClosed: false,
    datesList: [
      { label: "Registration Opens", date: "Sep 15, 2027" },
      { label: "Registration Closes", date: "Oct 5, 2027" },
      { label: "Hackathon Begins", date: "Oct 10, 2027 (9:00 AM)" },
      { label: "Submission Deadline", date: "Oct 12, 2027 (6:00 PM)" },
      { label: "Results Announcement", date: "Oct 15, 2027" },
    ],
  },
  evt_greentech: {
    name: "Green Tech Hackathon",
    status: "Upcoming",
    dates: "1 Oct – 4 Oct 2026",
    duration: "72 Hours",
    durationSub: "Oct 1 – Oct 4, 2026",
    desc: "Create technology that helps build a more sustainable future.",
    about: "Green Tech Hackathon focuses on environment, IoT, and clean energy prototypes.",
    isClosed: false,
    datesList: [
      { label: "Registration Opens", date: "Sep 1, 2026" },
      { label: "Registration Closes", date: "Sep 25, 2026" },
      { label: "Hackathon Begins", date: "Oct 1, 2026 (9:00 AM)" },
      { label: "Submission Deadline", date: "Oct 4, 2026 (6:00 PM)" },
      { label: "Results Announcement", date: "Oct 6, 2026" },
    ],
  },
  evt_healthtech: {
    name: "HealthTech Hackathon",
    status: "Upcoming",
    dates: "18 Oct – 20 Oct 2026",
    duration: "48 Hours",
    durationSub: "Oct 18 – Oct 20, 2026",
    desc: "Innovate solutions for better healthcare, accessibility and patient care.",
    about: "HealthTech Hackathon focuses on telemedicine, AI diagnostic assistants, and assistive technologies.",
    isClosed: false,
    datesList: [
      { label: "Registration Opens", date: "Sep 15, 2026" },
      { label: "Registration Closes", date: "Oct 10, 2026" },
      { label: "Hackathon Begins", date: "Oct 18, 2026 (9:00 AM)" },
      { label: "Submission Deadline", date: "Oct 20, 2026 (6:00 PM)" },
      { label: "Results Announcement", date: "Oct 22, 2026" },
    ],
  },
};

export default function HackathonDetail({ onNavigate, eventId = "evt_smart_hack_2027", name, user }) {
  const [joined, setJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [dbEvent, setDbEvent] = useState(null);
  const [participantStatus, setParticipantStatus] = useState(null);
  const isParticipant = Boolean(user && (user.role === "participant" || user.role === "organizer"));

  const handleJoinHackathon = async () => {
    if (joinLoading) return;
    setJoinLoading(true);
    setJoinError("");
    try {
      const token = localStorage.getItem("hackflow_token") || (user && user.token);
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8000/api/events/${eventId}/join`, {
        method: "POST",
        headers,
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Failed to join hackathon.");
      }

      setJoined(true);
      if (onNavigate) {
        onNavigate("Participant Dashboard", { eventId, name: eventName });
      }
    } catch (err) {
      setJoinError(err.message || "Failed to join hackathon.");
    } finally {
      setJoinLoading(false);
    }
  };

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

  useEffect(() => {
    if (user && user.role === "participant") {
      const token = localStorage.getItem("hackflow_token") || user.token;
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      fetch(`http://localhost:8000/api/participant/status?event_id=${encodeURIComponent(eventId)}`, {
        headers,
        credentials: "include"
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setParticipantStatus(data);
        })
        .catch(() => {});
    }
  }, [user, eventId]);

  const meta = EVENT_METADATA[eventId] || {};
  const isFixtureClosed = dbEvent ? !dbEvent.is_open : (eventId === "evt_01" || meta.isClosed);
  const eventName = name || (dbEvent && dbEvent.name) || meta.name || (isFixtureClosed ? "Sample Hack 2026" : "Smart Hack 2027");
  const eventStatus = (dbEvent && (dbEvent.is_open ? "Live" : "Closed")) || meta.status || (isFixtureClosed ? "Closed" : "Live");
  const eventDates = meta.dates || (isFixtureClosed ? "1 Mar 2026 (Closed)" : (dbEvent ? "Active – Submissions Open" : "Mar 1, 2027 – Mar 3, 2027"));
  const eventDesc = (dbEvent && dbEvent.description) || meta.desc || (isFixtureClosed
    ? "Official fixture hackathon dataset used for acceptance tests. Submissions are closed."
    : "Build hardware and software that gets deployed, not shelved — for real users, real constraints.");
  const eventAbout = meta.about || `${eventName} brings together builders, designers, and engineers to create working prototypes solving real challenges.`;
  const timeline = computeTimeline(meta, dbEvent);
  const displayTracks = (dbEvent && dbEvent.tracks && dbEvent.tracks.length > 0)
    ? dbEvent.tracks.map((t, idx) => ({
        icon: TRACKS[idx % TRACKS.length].icon,
        label: t.name,
      }))
    : TRACKS;

  return (
    <div style={{ minHeight: "100vh", background: "#0F1115", fontFamily: "Inter, sans-serif", color: "#E8E6F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .layout { grid-template-columns: 1fr; }
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 560px) {
          .info-grid { grid-template-columns: 1fr 1fr; }
        }
        .track-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        @media (max-width: 700px) {
          .track-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
      `}</style>

      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #1D2029", padding: "18px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            onClick={() => onNavigate && onNavigate("HackFlow Home")}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "#7C5CFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Rocket size={16} color="#0F1115" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>
              HackFlow
            </span>
          </div>
          <span style={{
            marginLeft: 12, fontSize: 12.5,
            color: isFixtureClosed ? "#F87171" : "#4ADE80",
            background: isFixtureClosed ? "rgba(248,113,113,0.1)" : "rgba(74,222,128,0.1)",
            padding: "4px 10px", borderRadius: 20, fontWeight: 500
          }}>
            {eventStatus}
          </span>

          <button
            onClick={() => onNavigate && onNavigate("Hackathons Listing")}
            style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "#9A96AC", cursor: "pointer", fontSize: 13.5
            }}
          >
            ← Back to Hackathons
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 24px 100px" }}>
        {/* Hero */}
        <div style={{
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          background: "linear-gradient(135deg, #1B1440 0%, #2A1D5C 45%, #171A21 100%)",
          border: "1px solid #2A2560",
          padding: "32px",
          marginBottom: 28,
        }}>
          <svg style={{ position: "absolute", right: -40, top: -20, opacity: 0.25 }} width="420" height="260" viewBox="0 0 420 260" fill="none">
            <path d="M0 200 Q 100 140 210 180 T 420 120" stroke="#9B87F5" strokeWidth="1.5" fill="none" />
            <path d="M0 240 Q 120 180 230 220 T 420 160" stroke="#9B87F5" strokeWidth="1" fill="none" />
          </svg>

          <div style={{ position: "relative", display: "flex", gap: 22, flexWrap: "wrap" }}>
            <div style={{
              width: 84, height: 84, borderRadius: 14, flexShrink: 0,
              background: "rgba(124,92,252,0.18)", border: "1px solid rgba(155,135,245,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Rocket size={34} color="#B8A9FD" strokeWidth={1.8} />
            </div>

            <div style={{ flex: 1, minWidth: 240 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: isFixtureClosed ? "rgba(248,113,113,0.15)" : "rgba(74,222,128,0.15)",
                color: isFixtureClosed ? "#F87171" : "#4ADE80",
                fontSize: 11.5, fontWeight: 600, padding: "3px 9px", borderRadius: 20, marginBottom: 12,
              }}>
                ● {eventStatus.toUpperCase()}
              </span>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px, 4.5vw, 32px)", fontWeight: 600, margin: "0 0 8px", letterSpacing: "-0.015em" }}>
                {eventName}
              </h1>
              <p style={{ color: "#C7C4D6", fontSize: 15, margin: "0 0 18px", maxWidth: 480, lineHeight: 1.5 }}>
                {eventDesc}
              </p>

              <div className="hero-meta">
                <MetaItem icon={Calendar} text={eventDates} />
                <MetaItem icon={Users} text="Team-based" />
                <MetaItem icon={MapPin} text="Virtual" />
              </div>
            </div>
          </div>
        </div>

        <div className="layout">
          {/* Main column */}
          <div>
            {/* Tracks */}
            <Panel>
              <PanelHeading icon={Users} title="Tracks" note="Choose from 8 tracks and build something meaningful." />
              <div className="track-grid">
                {displayTracks.map(({ icon: Icon, label }) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "12px 14px", borderRadius: 10,
                    border: "1px solid #262A34", background: "#14161C",
                  }}>
                    <Icon size={16} color="#B8A9FD" />
                    <span style={{ fontSize: 13.5, color: "#C7C4D6", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* About */}
            <Panel>
              <PanelHeading icon={FileText} title="About the Hackathon" />
              <p style={{ color: "#9A96AC", fontSize: 14.5, lineHeight: 1.7, margin: "0 0 22px" }}>
                {eventAbout}
              </p>

              <div className="info-grid" style={{ marginBottom: 28 }}>
                <InfoStat icon={Calendar} label="Duration" value={timeline.duration} sub={timeline.durationSub} />
                <InfoStat icon={Users} label="Team Size" value="2–4 members" sub="recommended" />
                <InfoStat icon={MapPin} label="Mode" value="Virtual" sub="Online" />
              </div>

              <SubSection icon={Target} title="What We're Looking For" items={[
                "Innovative and practical solutions to real-world problems",
                "Technical implementation — prototype or working build",
                "Clear problem statement and solution approach",
                "Well-documented code and project repository",
              ]} />

              <SubSection icon={Trophy} title="Rewards & Recognition" items={[
                "Top projects receive prizes and certificates",
                "Recognition across all 8 tracks",
                "Feature on our platform and community channels",
              ]} />

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Calendar size={16} color="#B8A9FD" />
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: 0 }}>Important Dates</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingLeft: 2 }}>
                  {timeline.dates.map((d, i) => (
                    <div key={d.label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#7C5CFC", marginTop: 6, flexShrink: 0 }} />
                      <div style={{ display: "flex", flex: 1, justifyContent: "space-between", flexWrap: "wrap", gap: 4, borderBottom: i < timeline.dates.length - 1 ? "1px dashed #1D2029" : "none", paddingBottom: 10 }}>
                        <span style={{ fontSize: 14, color: "#C7C4D6" }}>{d.label}</span>
                        <span style={{ fontSize: 13.5, color: "#5B5F6D" }}>{d.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            {/* Questions footer */}
            <div style={{
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
              background: "linear-gradient(135deg, #1B1440, #1A1D2E)",
              border: "1px solid #2A2560", borderRadius: 12, padding: "18px 22px",
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(124,92,252,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Lightbulb size={18} color="#B8A9FD" />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 2 }}>Have questions?</div>
                <div style={{ fontSize: 13, color: "#9A96AC" }}>Check the FAQ or reach out to the event team.</div>
              </div>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "transparent", border: "1px solid #3A3560", color: "#B8A9FD",
                padding: "9px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 500,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}>
                View FAQ <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Panel>
              <PanelHeading icon={ShieldCheck} title="Eligibility" />
              {isParticipant ? (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)",
                  borderRadius: 10, padding: "12px 14px", marginBottom: 16,
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#4ADE80", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Check size={13} color="#0F1115" strokeWidth={3} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#E8E6F0" }}>Logged in as {user.name || user.email}</div>
                    <div style={{ fontSize: 12.5, color: "#9A96AC", marginTop: 2 }}>
                      {participantStatus?.team
                        ? `You are registered with team "${participantStatus.team.name}".`
                        : "You are authenticated and ready to submit your project."}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: 10, padding: "12px 14px", marginBottom: 16,
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Info size={13} color="#0F1115" strokeWidth={3} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#FDE68A" }}>Participant Login Required</div>
                    <div style={{ fontSize: 12.5, color: "#C7C4D6", marginTop: 2 }}>
                      You must log in to join <strong style={{ color: "#FFFFFF" }}>{eventName}</strong> and submit your project.
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, color: "#9A96AC" }}>
                      New participant?{" "}
                      <span
                        onClick={() => onNavigate && onNavigate("Participant Registration", { eventId, name: eventName, redirectTo: "Submission Form" })}
                        style={{ color: "#8A6EFC", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
                      >
                        Register here
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {joinError && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 8, padding: "10px 14px", color: "#FCA5A5", fontSize: 13,
                  marginBottom: 14,
                }}>
                  {joinError}
                </div>
              )}

              <button
                disabled={isFixtureClosed || joinLoading}
                onClick={() => {
                  if (isFixtureClosed) return;

                  if (!isParticipant) {
                    if (onNavigate) {
                      onNavigate("Login", {
                        role: "participant",
                        eventId,
                        name: eventName,
                        redirectTo: "Hackathon Detail"
                      });
                    }
                    return;
                  }

                  if (participantStatus?.team || joined) {
                    if (onNavigate) {
                      onNavigate("Participant Dashboard", { eventId, name: eventName });
                    }
                    return;
                  }

                  handleJoinHackathon();
                }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: isFixtureClosed ? "#262A34" : (isParticipant ? (participantStatus?.team || joined ? "#22A45D" : "#7C5CFC") : "linear-gradient(135deg, #7C5CFC, #6366F1)"),
                  color: isFixtureClosed ? "#7C8092" : "#FFFFFF",
                  border: "none", padding: "13px", borderRadius: 9, fontSize: 14.5, fontWeight: 600,
                  cursor: isFixtureClosed || joinLoading ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", marginBottom: 20,
                  boxShadow: !isFixtureClosed ? "0 4px 14px rgba(124,92,252,0.3)" : "none"
                }}
              >
                {isFixtureClosed
                  ? "Submissions Closed"
                  : !isParticipant
                    ? "Log in as Participant to Join"
                    : (participantStatus?.team || joined
                        ? "Open Dashboard"
                        : (joinLoading ? "Joining Hackathon..." : "Join Hackathon"))}
                <ArrowRight size={15} />
              </button>

              <div style={{ borderTop: "1px solid #1D2029", paddingTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#9A96AC", marginBottom: 12 }}>Eligibility criteria</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <CriteriaLine text="Currently enrolled in a recognized institution, or a recent graduate" />
                  <CriteriaLine text="Open to individuals and teams" />
                  <CriteriaLine text="No prior participation restriction" />
                  <CriteriaLine text="Ensure your teammates also meet the criteria" info />
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeading icon={Info} title="Quick Info" />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <QuickRow label="Type" value="Online hackathon" />
                <QuickRow label="Tracks" value="8 tracks" />
                <QuickRow label="Team size" value="2–4 members" />
                <QuickRow label="Submission format" value="PPT + GitHub repo" />
                <QuickRow label="Languages" value="Any" />
                <QuickRow label="Eligibility" value="Open to all students" />
              </div>
            </Panel>

            <div style={{
              borderRadius: 12, padding: "18px 20px",
              background: "linear-gradient(135deg, #1B1440, #171A21)",
              border: "1px solid #2A2560",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 18 }}>✦</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Great ideas build a better tomorrow.</div>
                <div style={{ fontSize: 12.5, color: "#9A96AC" }}>We can't wait to see what you create.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ children }) {
  return (
    <div style={{
      background: "#14161C", border: "1px solid #1D2029", borderRadius: 14,
      padding: "24px", marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

function PanelHeading({ icon: Icon, title, note }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: note ? 18 : 16 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(124,92,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        <Icon size={15} color="#B8A9FD" />
      </div>
      <div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, margin: 0 }}>{title}</h2>
        {note && <p style={{ fontSize: 13, color: "#5B5F6D", margin: "3px 0 0" }}>{note}</p>}
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, color: "#C7C4D6" }}>
      <Icon size={15} color="#9B87F5" />
      {text}
    </div>
  );
}

function InfoStat({ icon: Icon, label, value, sub }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Icon size={14} color="#5B5F6D" />
        <span style={{ fontSize: 12.5, color: "#5B5F6D" }}>{label}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#E8E6F0" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#5B5F6D" }}>{sub}</div>
    </div>
  );
}

function SubSection({ icon: Icon, title, items }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon size={16} color="#B8A9FD" />
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: 0 }}>{title}</h3>
      </div>
      <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map((item) => (
          <li key={item} style={{ fontSize: 14, color: "#9A96AC", lineHeight: 1.5 }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function CriteriaLine({ text, info }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      {info ? (
        <Info size={14} color="#7C5CFC" style={{ marginTop: 2, flexShrink: 0 }} />
      ) : (
        <Check size={14} color="#4ADE80" style={{ marginTop: 2, flexShrink: 0 }} />
      )}
      <span style={{ fontSize: 13, color: "#9A96AC", lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function QuickRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13.5 }}>
      <span style={{ color: "#5B5F6D" }}>{label}</span>
      <span style={{ color: "#C7C4D6", fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}
