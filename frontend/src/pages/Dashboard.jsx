import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getUserDashboardSummary, getMyTeams } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    focusTimeFormatted: "0h 0m",
    todayPomodoros: 0,
    assignedTasks: 0,
    activeTeams: 0,
  });
  const [teams, setTeams] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [dashRes, teamsRes] = await Promise.all([
          getUserDashboardSummary().catch(() => null),
          getMyTeams().catch(() => ({ teams: [] })),
        ]);

        if (isMounted) {
          if (dashRes) {
            setStats(dashRes.stats || {
              focusTimeFormatted: "0h 0m",
              todayPomodoros: 0,
              assignedTasks: 0,
              activeTeams: teamsRes.teams?.length || 0,
            });
            setRecentActivities(dashRes.recentActivities || []);
          }
          if (teamsRes && teamsRes.teams) {
            setTeams(teamsRes.teams);
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load dashboard data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartPomodoro = () => {
    if (teams.length > 0) {
      navigate(`/teams/${teams[0]._id}/timer`);
    } else {
      navigate("/teams/create");
    }
  };

  const handleOpenWorkspace = () => {
    if (teams.length > 0) {
      navigate(`/teams/${teams[0]._id}`);
    } else {
      navigate("/teams");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="container py-4">
        {/* Page Heading */}
        <div className="mb-4">
          <h2 className="fw-bold">Dashboard</h2>
          <p className="text-muted mb-0">
            Manage your teams and track your productivity.
          </p>
        </div>

        {error && (
          <div className="alert alert-warning py-2 mb-4" role="alert">
            {error}
          </div>
        )}

        {/* ================= STATISTICS ================= */}
        <div className="row g-4 mb-4">
          {/* Focus Time */}
          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 hover-lift h-100">
              <div className="card-body">
                <h6 className="text-muted mb-2">Focus Time</h6>
                <h3 className="fw-bold mb-1">{stats.focusTimeFormatted || "0h 0m"}</h3>
                <small className="text-success fw-medium">Today</small>
              </div>
            </div>
          </div>

          {/* Pomodoros */}
          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 hover-lift h-100">
              <div className="card-body">
                <h6 className="text-muted mb-2">Pomodoros</h6>
                <h3 className="fw-bold text-danger mb-1">{stats.todayPomodoros}</h3>
                <small className="text-success fw-medium">Completed today</small>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 hover-lift h-100">
              <div className="card-body">
                <h6 className="text-muted mb-2">Tasks</h6>
                <h3 className="fw-bold text-primary mb-1">{stats.assignedTasks}</h3>
                <small className="text-primary fw-medium">Assigned to you</small>
              </div>
            </div>
          </div>

          {/* Teams */}
          <div className="col-md-6 col-lg-3">
            <div className="card shadow-sm border-0 hover-lift h-100">
              <div className="card-body">
                <h6 className="text-muted mb-2">Active Teams</h6>
                <h3 className="fw-bold text-warning mb-1">{teams.length}</h3>
                <small className="text-muted">Teams joined</small>
              </div>
            </div>
          </div>
        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Quick Actions</h5>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/teams/create" className="btn btn-danger">
                + Create Team
              </Link>
              <Link to="/teams/join" className="btn btn-outline-danger">
                Join Team
              </Link>
              <button onClick={handleStartPomodoro} className="btn btn-danger">
                🍅 Start Pomodoro
              </button>
              <button onClick={handleOpenWorkspace} className="btn btn-outline-dark">
                Open Team Workspace
              </button>
            </div>
          </div>
        </div>

        {/* ================= MY TEAMS ================= */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">My Teams</h5>
              <Link to="/teams" className="btn btn-sm btn-outline-secondary">
                View All
              </Link>
            </div>

            {loading ? (
              <p className="text-muted">Loading teams...</p>
            ) : teams.length === 0 ? (
              <div className="text-center py-4">
                <div className="display-6 mb-2">👥</div>
                <p className="text-muted mb-3">You haven't joined any teams yet.</p>
                <div className="d-flex justify-content-center gap-2">
                  <Link to="/teams/create" className="btn btn-sm btn-danger">Create a Team</Link>
                  <Link to="/teams/join" className="btn btn-sm btn-outline-danger">Join with Code</Link>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Team</th>
                      <th>Room Code</th>
                      <th>Members</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, idx) => (
                      <tr key={team._id}>
                        <td className="fw-semibold">
                          <Link to={`/teams/${team._id}`} className="text-dark text-decoration-none">
                            👥 {team.name}
                          </Link>
                        </td>
                        <td>
                          <span className="badge bg-light text-danger border font-monospace">
                            {team.roomCode}
                          </span>
                        </td>
                        <td>{team.members?.length || 1}</td>
                        <td>
                          <span className={`badge ${idx % 2 === 0 ? "bg-success" : "bg-primary"}`}>
                            Active
                          </span>
                        </td>
                        <td className="text-end">
                          <Link to={`/teams/${team._id}`} className="btn btn-sm btn-danger me-2">
                            Open
                          </Link>
                          <Link to={`/teams/${team._id}/timer`} className="btn btn-sm btn-outline-danger">
                            🍅 Timer
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ================= RECENT ACTIVITY ================= */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Recent Activity</h5>
            <div className="list-group list-group-flush">
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <div key={act.id} className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                    <div>{act.text}</div>
                    <small className="text-muted">
                      {new Date(act.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </small>
                  </div>
                ))
              ) : (
                <>
                  <div className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                    <div>🍅 Pomodoro session ready to launch</div>
                    <small className="text-muted">Today</small>
                  </div>
                  <div className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                    <div>📋 Tasks workspace synchronized</div>
                    <small className="text-muted">Today</small>
                  </div>
                  <div className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                    <div>👥 Connected to collaborative workspace</div>
                    <small className="text-muted">Just now</small>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
