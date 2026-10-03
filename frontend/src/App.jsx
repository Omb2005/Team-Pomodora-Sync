import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import CreateTeam from "./pages/CreateTeam";
import JoinTeam from "./pages/JoinTeam";
import MyTeams from "./pages/MyTeams";
import TeamDetails from "./pages/TeamDetails";
import TeamTimer from "./pages/TeamTimer";
import TeamTasks from "./pages/TeamTasks";
import Analytics from "./pages/Analytics";
import CalendarPage from "./pages/CalendarPage";
import SessionHistory from "./pages/SessionHistory";
import Leaderboard from "./pages/Leaderboard";
import Notifications from "./pages/Notifications";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" replace /> : <Landing />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teams" element={<MyTeams />} />
          <Route path="/teams/create" element={<CreateTeam />} />
          <Route path="/teams/join" element={<JoinTeam />} />
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/teams/:id/timer" element={<TeamTimer />} />
          <Route path="/teams/:id/tasks" element={<TeamTasks />} />
          <Route path="/teams/:id/analytics" element={<Analytics />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/history" element={<SessionHistory />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
