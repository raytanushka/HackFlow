import React, { useState, useEffect } from "react";
import HackFlowHome from "./pages/HackFlowHome";
import HackathonsListing from "./pages/HackathonsListing";
import HackathonDetail from "./pages/HackathonDetail";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerRegistration from "./pages/OrganizerRegistration";
import ParticipantRegistration from "./pages/ParticipantRegistration";
import JudgeRegistration from "./pages/JudgeRegistration";
import JudgeDashboard from "./pages/JudgeDashboard";
import ProjectEvaluation from "./pages/ProjectEvaluation";
import Login from "./pages/Login";
import SubmissionForm from "./pages/SubmissionForm";
import OrganizerProjects from "./pages/OrganizerProjects";
import ParticipantDashboard from "./pages/ParticipantDashboard";

const getPageFromPath = (path) => {
  if (!path) return "HackFlow Home";
  const cleanPath = path.toLowerCase().replace(/\/$/, "");
  if (cleanPath === "/participant" || cleanPath === "/participant/dashboard" || cleanPath === "/participant-dashboard") {
    return "Participant Dashboard";
  }
  if (cleanPath === "/organizer/projects" || cleanPath === "/organizer-projects" || cleanPath === "/projects") {
    return "Organizer Projects";
  }
  if (cleanPath === "/organizer" || cleanPath === "/organizer/dashboard" || cleanPath === "/organizer-dashboard") {
    return "Organizer Dashboard";
  }
  if (cleanPath === "/organizer/registration" || cleanPath === "/organizer-registration") {
    return "Organizer Registration";
  }
  if (cleanPath === "/participant/registration" || cleanPath === "/participant-registration") {
    return "Participant Registration";
  }
  if (cleanPath === "/login") {
    return "Login";
  }
  if (cleanPath === "/hackathons" || cleanPath === "/hackathons-listing") {
    return "Hackathons Listing";
  }
  if (cleanPath === "/judge" || cleanPath === "/judge/dashboard" || cleanPath === "/judge-dashboard") {
    return "Judge Dashboard";
  }
  return "HackFlow Home";
};

const getPathFromPage = (pageName) => {
  switch (pageName) {
    case "Organizer Projects":
    case "organizer-projects":
    case "All Projects":
    case "all-projects":
    case "projects":
      return "/organizer/projects";
    case "Organizer Dashboard":
    case "organizer-dashboard":
      return "/organizer/dashboard";
    case "Organizer Registration":
    case "organizer-registration":
      return "/organizer/registration";
    case "Participant Registration":
    case "participant-registration":
      return "/participant/registration";
    case "Participant Dashboard":
    case "participant-dashboard":
    case "participant":
      return "/participant/dashboard";
    case "Login":
    case "login":
      return "/login";
    case "Hackathons Listing":
    case "hackathons-listing":
    case "hackathons":
      return "/hackathons";
    case "Judge Dashboard":
    case "judge-dashboard":
      return "/judge/dashboard";
    default:
      return "/";
  }
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#0B0C10",
          color: "#E8E6F0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
          padding: 24,
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: 24, marginBottom: 12, color: "#F87171" }}>Something went wrong</h2>
          <p style={{ color: "#9A96AC", maxWidth: 480, marginBottom: 24 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            style={{
              background: "#7C5CFC",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== "undefined" && window.location) {
      return getPageFromPath(window.location.pathname);
    }
    return "HackFlow Home";
  });
  const [user, setUser] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState("evt_01");
  const [selectedEventName, setSelectedEventName] = useState("Sample Hack 2026");
  const [navParams, setNavParams] = useState({});

  useEffect(() => {
    // 1. Initial cached user display to avoid flash
    const saved = localStorage.getItem("hackflow_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch(e){}
    }

    // 2. Authoritative backend session verification
    let isMounted = true;
    const verifySession = async () => {
      try {
        const token = localStorage.getItem("hackflow_token");
        const headers = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("http://localhost:8000/api/auth/me", {
          method: "GET",
          headers,
          credentials: "include"
        });

        if (res.ok) {
          const data = await res.json();
          const authenticatedUser = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            orgId: data.org_id,
            participantId: data.participant_id || data.id,
            token: token || ""
          };
          if (isMounted) {
            setUser(authenticatedUser);
            localStorage.setItem("hackflow_user", JSON.stringify(authenticatedUser));
          }
        } else if (res.status === 401 || res.status === 400 || res.status === 404) {
          // Backend session expired or invalid
          if (isMounted) {
            setUser(null);
            localStorage.removeItem("hackflow_user");
            localStorage.removeItem("hackflow_token");
            localStorage.removeItem("hackflow_participant");
          }
        }
      } catch (err) {
        // Network error: keep existing state
      }
    };

    verifySession();

    const handlePopState = () => {
      const page = getPageFromPath(window.location.pathname);
      setCurrentPage(page);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      isMounted = false;
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleNavigate = (pageName, params = {}) => {
    if (params && params.eventId) {
      setSelectedEventId(params.eventId);
    }
    if (params && params.name) {
      setSelectedEventName(params.name);
    }
    setNavParams(params || {});
    setCurrentPage(pageName);

    if (typeof window !== "undefined" && window.history) {
      const targetPath = getPathFromPage(pageName);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, "", targetPath);
      }
    }
  };

  const handleRegistrationSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("hackflow_user", JSON.stringify(userData));
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("hackflow_user", JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("hackflow_token");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        headers,
        credentials: "include"
      });
    } catch (_) {}
    setUser(null);
    localStorage.removeItem("hackflow_user");
    localStorage.removeItem("hackflow_token");
    localStorage.removeItem("hackflow_participant");
    localStorage.removeItem("hackflow_registered");
    localStorage.removeItem("hackflow_organizer_registered");
    handleNavigate("HackFlow Home");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "HackFlow Home":
      case "home":
        return (
          <HackFlowHome
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case "Login":
      case "login":
        return (
          <Login
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
            redirectTo={navParams.redirectTo}
            initialRole={navParams.role}
            eventId={navParams.eventId || selectedEventId}
            eventName={navParams.name || selectedEventName}
            name={navParams.name || selectedEventName}
          />
        );
      case "Organizer Registration":
      case "organizer-registration":
        return (
          <OrganizerRegistration
            onNavigate={handleNavigate}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        );
      case "Organizer Dashboard":
      case "organizer-dashboard":
        return (
          <OrganizerDashboard
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case "Organizer Projects":
      case "organizer-projects":
      case "All Projects":
      case "all-projects":
      case "projects":
        return (
          <OrganizerProjects
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case "Participant Registration":
      case "participant-registration":
        return (
          <ParticipantRegistration
            eventId={navParams.eventId || selectedEventId}
            eventName={navParams.name || selectedEventName}
            name={navParams.name || selectedEventName}
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onRegistrationSuccess={handleRegistrationSuccess}
            redirectTo={navParams.redirectTo}
          />
        );
      case "Participant Dashboard":
      case "participant-dashboard":
      case "participant":
        return (
          <ParticipantDashboard
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            eventId={navParams.eventId || selectedEventId}
            eventName={navParams.name || selectedEventName}
          />
        );
      case "Hackathons Listing":
      case "hackathons-listing":
      case "hackathons":
        return (
          <HackathonsListing
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case "Hackathon Detail":
      case "hackathon-detail":
        return (
          <HackathonDetail
            eventId={navParams.eventId || selectedEventId}
            name={navParams.name || selectedEventName}
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case "Submission Form":
      case "submission-form":
        return (
          <SubmissionForm
            eventId={navParams.eventId || selectedEventId}
            name={navParams.name || selectedEventName}
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case "Judge Registration":
      case "judge-registration":
        return (
          <JudgeRegistration
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case "Judge Dashboard":
      case "judge-dashboard":
        return (
          <JudgeDashboard
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case "Project Evaluation":
      case "project-evaluation":
        return (
          <ProjectEvaluation
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <HackFlowHome
            user={user}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <div className="app">
      <ErrorBoundary onReset={() => setCurrentPage("HackFlow Home")}>
        {renderPage()}
      </ErrorBoundary>
    </div>
  );
}
