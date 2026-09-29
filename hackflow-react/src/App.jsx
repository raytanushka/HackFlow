import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import HackFlowHome from "./pages/HackFlowHome";
import HackathonsListing from "./pages/HackathonsListing";
import HackathonDetail from "./pages/HackathonDetail";
import JudgeDashboard from "./pages/JudgeDashboard";
import JudgeRegistration from "./pages/JudgeRegistration";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerRegistration from "./pages/OrganizerRegistration";
import ParticipantRegistration from "./pages/ParticipantRegistration";
import ProjectEvaluation from "./pages/ProjectEvaluation";
import SubmissionForm from "./pages/SubmissionForm";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<HackFlowHome />}
        />
        <Route
          path="/judge/register"
          element={<JudgeRegistration />}
        />

        <Route
          path="/judge/dashboard"
          element={<JudgeDashboard />}
        />

        <Route
          path="/hackathons"
          element={<HackathonsListing />}
        />

        <Route
          path="/hackathons/:id"
          element={<HackathonDetail />}
        />

        <Route
          path="/judge/projects/:projectId"
          element={<ProjectEvaluation />}
        />

        <Route
          path="/organizer/register"
          element={<OrganizerRegistration />}
        />

        <Route
          path="/organizer/dashboard"
          element={<OrganizerDashboard />}
        />

        <Route
          path="/participant/register"
          element={<ParticipantRegistration />}
        />

        <Route
          path="/submission/new"
          element={<SubmissionForm />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}