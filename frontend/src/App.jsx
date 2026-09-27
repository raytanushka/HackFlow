import React, { useState, useEffect } from "react";
import HackFlowHome from "./pages/HackFlowHome";
import HackathonDetail from "./pages/HackathonDetail";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerRegistration from "./pages/OrganizerRegistration";
import SubmissionForm from "./pages/SubmissionForm";

export default function App() {
  const [currentPage, setCurrentPage] = useState("HackFlow Home");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("hackflow_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch(e){}
    }
  }, []);

  const handleNavigate = (pageName) => {
    setCurrentPage(pageName);
  };

  const handleRegistrationSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("hackflow_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("hackflow_user");
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
      case "Hackathon Detail":
      case "hackathon-detail":
        return <HackathonDetail onNavigate={handleNavigate} />;
      case "Submission Form":
      case "submission-form":
        return <SubmissionForm onNavigate={handleNavigate} />;
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

  return <div className="app">{renderPage()}</div>;
}
