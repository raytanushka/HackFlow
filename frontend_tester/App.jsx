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
  const [currentPage, setCurrentPage] = useState("HackFlow Home");
  const [user, setUser] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState("evt_smart_hack_2027");
  const [selectedEventName, setSelectedEventName] = useState("Smart Hack 2027");
  const [navParams, setNavParams] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("hackflow_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch(e){}
    }
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
  };

  const handleRegistrationSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("hackflow_user", JSON.stringify(userData));
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("hackflow_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("hackflow_user");
    localStorage.removeItem("hackflow_token");
    setCurrentPage("HackFlow Home");
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
            user={user}
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
      case "Participant Registration":
      case "participant-registration":
        return (
          <ParticipantRegistration
            eventId={navParams.eventId || selectedEventId}
            eventName={navParams.name || selectedEventName}
            name={navParams.name || selectedEventName}
            user={user}
            onNavigate={handleNavigate}
            onRegistrationSuccess={handleRegistrationSuccess}
            redirectTo={navParams.redirectTo}
          />
        );
      case "Hackathons Listing":
      case "hackathons-listing":
      case "hackathons":
        return (
          <HackathonsListing
            onNavigate={handleNavigate}
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
          />
        );
      case "Judge Registration":
      case "judge-registration":
        return (
          <JudgeRegistration
            onNavigate={handleNavigate}
          />
        );
      case "Judge Dashboard":
      case "judge-dashboard":
        return (
          <JudgeDashboard
            onNavigate={handleNavigate}
          />
        );
      case "Project Evaluation":
      case "project-evaluation":
        return (
          <ProjectEvaluation
            onNavigate={handleNavigate}
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
