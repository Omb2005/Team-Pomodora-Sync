import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getUserHistory } from "../services/api";

function SessionHistory() {
  const [historyData, setHistoryData] = useState({
    sessions: [],
    stats: {
      totalSessions: 0,
      completedSessions: 0,
      totalFocusMinutes: 0,
      focusTimeFormatted: "0h 0m",
    },
  });
  const [filterMode, setFilterMode] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserHistory()
      .then((data) => {
        setHistoryData(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredSessions = historyData.sessions.filter((s) => {
    if (filterMode === "all") return true;
    return s.mode === filterMode;
  });

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* HEADER matching UI ref */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1">🕒 Session History</h2>
          <p className="text-muted mb-0">
            View your team's previous Pomodoro sessions and focus track records.
          </p>
        </div>

        {/* ================= SUMMARY CARDS matching UI ref ================= */}
        <div className="row g-4 mb-4">
          {/* Total Sessions */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm text-center hover-lift h-100">
              <div className="card-body p-4">
                <h6 className="text-muted mb-2">Total Sessions</h6>
                <h3 className="fw-bold text-danger mb-0">
                  {historyData.stats?.totalSessions || 0}
                </h3>
              </div>
            </div>
          </div>

          {/* Completed Sessions */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm text-center hover-lift h-100">
              <div className="card-body p-4">
                <h6 className="text-muted mb-2">Completed Sessions</h6>
                <h3 className="fw-bold text-success mb-0">
                  {historyData.stats?.completedSessions || 0}
                </h3>
              </div>
            </div>
          </div>

          {/* Total Focus Time */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm text-center hover-lift h-100">
              <div className="card-body p-4">
                <h6 className="text-muted mb-2">Total Focus Time</h6>
                <h3 className="fw-bold mb-0">
                  {historyData.stats?.focusTimeFormatted || "0h 0m"}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* ================= HISTORY TABLE matching UI ref ================= */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <h5 className="fw-bold mb-0">Recent Sessions</h5>

              <div className="d-flex gap-2 align-items-center">
                <label className="small text-muted mb-0">Filter:</label>
                <select
                  className="form-select form-select-sm w-auto"
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value)}
                >
                  <option value="all">All Modes</option>
                  <option value="focus">Focus Sessions</option>
                  <option value="shortBreak">Short Breaks</option>
                  <option value="longBreak">Long Breaks</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p className="text-muted py-3">Loading session records...</p>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-5">
                <div className="display-6 mb-2">🕒</div>
                <h5 className="fw-bold">No sessions logged yet</h5>
                <p className="text-muted">
                  Complete focus sessions in your Pomodoro rooms to see them appear here automatically.
                </p>
                <Link to="/dashboard" className="btn btn-sm btn-danger">
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Team</th>
                      <th>Mode</th>
                      <th>Duration</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session) => (
                      <tr key={session._id}>
                        <td className="fw-semibold">
                          👥 {session.team?.name || "Team Workspace"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              session.mode === "focus"
                                ? "bg-danger"
                                : "bg-success"
                            }`}
                          >
                            {session.mode === "focus"
                              ? "Focus"
                              : session.mode === "shortBreak"
                              ? "Short Break"
                              : "Long Break"}
                          </span>
                        </td>
                        <td>{session.durationMinutes} mins</td>
                        <td className="text-muted">
                          {new Date(session.createdAt).toLocaleDateString()} at{" "}
                          {new Date(session.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>
                          <span className="badge bg-success">
                            ✓ Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* BACK TO DASHBOARD */}
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

export default SessionHistory;
