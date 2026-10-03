import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMyTeams } from "../services/api";

function MyTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    getMyTeams()
      .then((data) => {
        setTeams(data.teams || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load teams");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h2 className="fw-bold mb-1">👥 My Teams</h2>
            <p className="text-muted mb-0">
              Manage your focus spaces and collaborate with teammates.
            </p>
          </div>

          <div className="d-flex gap-2">
            <Link to="/teams/join" className="btn btn-outline-danger">
              Join Team
            </Link>
            <Link to="/teams/create" className="btn btn-danger">
              + Create Team
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger py-2 mb-4" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-2">Loading your teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="card shadow-sm border-0 text-center py-5">
            <div className="card-body">
              <div className="display-4 mb-3">🍅</div>
              <h4 className="fw-bold">No teams yet</h4>
              <p className="text-muted mb-4">
                Create a team to start synchronized Pomodoro sessions or join an existing team.
              </p>
              <div className="d-flex justify-content-center gap-2">
                <Link to="/teams/create" className="btn btn-danger">
                  + Create a Team
                </Link>
                <Link to="/teams/join" className="btn btn-outline-danger">
                  Join with Code
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {teams.map((team) => (
              <div key={team._id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm border-0 h-100 hover-lift">
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h4 className="fw-bold mb-0 text-truncate" title={team.name}>
                        {team.name}
                      </h4>
                      <span className="badge bg-success">Active</span>
                    </div>

                    <p className="text-muted small mb-3">
                      {team.description || "Collaborative Pomodoro team workspace"}
                    </p>

                    <div className="bg-light p-2 rounded mb-3 d-flex justify-content-between align-items-center">
                      <span className="small text-muted">Room Code:</span>
                      <div className="d-flex align-items-center gap-2">
                        <strong className="text-danger font-monospace">
                          {team.roomCode}
                        </strong>
                        <button
                          onClick={() => handleCopyCode(team.roomCode, team._id)}
                          className="btn btn-sm btn-outline-secondary py-0 px-2"
                          title="Copy Room Code"
                        >
                          {copiedId === team._id ? "✓ Copied" : "Copy"}
                        </button>
                      </div>
                    </div>

                    <div className="small text-muted mb-4">
                      👥 {team.members?.length || 1} team members
                    </div>

                    <div className="mt-auto pt-2 border-top">
                      <div className="row g-2">
                        <div className="col-6">
                          <Link
                            to={`/teams/${team._id}`}
                            className="btn btn-outline-dark btn-sm w-100"
                          >
                            Workspace
                          </Link>
                        </div>
                        <div className="col-6">
                          <Link
                            to={`/teams/${team._id}/timer`}
                            className="btn btn-danger btn-sm w-100"
                          >
                            🍅 Room
                          </Link>
                        </div>
                        <div className="col-6">
                          <Link
                            to={`/teams/${team._id}/tasks`}
                            className="btn btn-outline-secondary btn-sm w-100"
                          >
                            📋 Tasks
                          </Link>
                        </div>
                        <div className="col-6">
                          <Link
                            to={`/teams/${team._id}/analytics`}
                            className="btn btn-outline-secondary btn-sm w-100"
                          >
                            📊 Stats
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default MyTeams;
