import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getTeamDetails } from "../services/api";

function TeamDetails() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getTeamDetails(id)
      .then((data) => {
        setTeam(data.team);
      })
      .catch((err) => {
        setError(err.message || "Failed to load team details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleCopyCode = () => {
    if (team?.roomCode) {
      navigator.clipboard.writeText(team.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getAvatarColor = (index) => {
    const colors = ["bg-danger", "bg-primary", "bg-success", "bg-warning text-dark", "bg-info text-dark", "bg-secondary"];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5 text-center flex-grow-1">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Loading Team Workspace...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5 text-center flex-grow-1">
          <div className="alert alert-danger mx-auto" style={{ maxWidth: "500px" }}>
            {error || "Team not found or access denied."}
          </div>
          <Link to="/dashboard" className="btn btn-outline-dark">
            ← Back to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isAdmin = (memberId) => {
    const adminId = team.createdBy?._id || team.createdBy;
    return String(adminId) === String(memberId);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* ================= TEAM HEADER ================= */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h2 className="fw-bold mb-1">👥 {team.name}</h2>
                <p className="text-muted mb-0">
                  {team.description || "Collaborate, focus and complete tasks together."}
                </p>
              </div>

              <div className="text-md-end bg-light p-3 rounded border">
                <small className="text-muted d-block mb-1">Team Invite Code</small>
                <div className="d-flex align-items-center gap-2">
                  <h4 className="fw-bold text-danger font-monospace mb-0">
                    {team.roomCode}
                  </h4>
                  <button
                    onClick={handleCopyCode}
                    className="btn btn-sm btn-outline-danger py-0 px-2"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="row g-4 mb-4">
          {/* Action 1: Pomodoro Room */}
          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100 hover-lift text-center p-3">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <div className="display-5 mb-2">🍅</div>
                <h5 className="fw-bold">Pomodoro Room</h5>
                <p className="text-muted small">
                  Start a synchronized focus session with your team in real time.
                </p>
                <Link to={`/teams/${team._id}/timer`} className="btn btn-danger mt-auto px-4">
                  Enter Pomodoro
                </Link>
              </div>
            </div>
          </div>

          {/* Action 2: Team Tasks */}
          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100 hover-lift text-center p-3">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <div className="display-5 mb-2">📋</div>
                <h5 className="fw-bold">Team Tasks</h5>
                <p className="text-muted small">
                  View, create, and manage tasks assigned to your team members.
                </p>
                <Link to={`/teams/${team._id}/tasks`} className="btn btn-outline-danger mt-auto px-4">
                  View Tasks
                </Link>
              </div>
            </div>
          </div>

          {/* Action 3: Team Analytics */}
          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100 hover-lift text-center p-3">
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <div className="display-5 mb-2">📊</div>
                <h5 className="fw-bold">Team Analytics</h5>
                <p className="text-muted small">
                  Track focus hours, completed pomodoros, and team productivity charts.
                </p>
                <Link to={`/teams/${team._id}/analytics`} className="btn btn-outline-dark mt-auto px-4">
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ================= TEAM MEMBERS ================= */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">
              👥 Team Members ({team.members?.length || 0})
            </h5>

            <div className="list-group list-group-flush">
              {team.members && team.members.length > 0 ? (
                team.members.map((member, idx) => (
                  <div
                    key={member._id || idx}
                    className="d-flex justify-content-between align-items-center py-3 border-bottom"
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className={`member-avatar ${getAvatarColor(idx)} me-3`}
                        style={{ width: "45px", height: "45px" }}
                      >
                        {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{member.name || "Member"}</h6>
                        <small className="text-muted">
                          {isAdmin(member._id) ? "Team Admin" : "Member"} • {member.email}
                        </small>
                      </div>
                    </div>

                    <span className={`badge ${idx === 0 ? "bg-success" : "bg-primary"}`}>
                      {idx === 0 ? "Online" : "Active"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted py-2">No members found.</p>
              )}
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="text-center mt-4">
          <Link to="/dashboard" className="text-muted text-decoration-none">
            ← Back to Dashboard
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TeamDetails;
