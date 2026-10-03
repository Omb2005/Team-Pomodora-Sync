import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getGlobalLeaderboard, getMyTeams, getTeamLeaderboard } from "../services/api";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("global");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTeams()
      .then((res) => {
        setTeams(res.teams || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchBoard = selectedTeam === "global"
      ? getGlobalLeaderboard()
      : getTeamLeaderboard(selectedTeam);

    fetchBoard
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedTeam]);

  // Top 3 for podium
  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* HEADER matching UI ref */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h2 className="fw-bold mb-1">🏆 Team Leaderboard</h2>
            <p className="text-muted mb-0">
              Track team participation and completed focus sessions.
            </p>
          </div>

          {teams.length > 0 && (
            <select
              className="form-select w-auto"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="global">Global Leaderboard (All Teams)</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  👥 {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ================= TOP 3 PODIUM matching UI ref ================= */}
        {leaderboard.length > 0 && (
          <div className="row justify-content-center align-items-end g-4 mb-5">
            {/* SECOND PLACE */}
            {second ? (
              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-center hover-lift">
                  <div className="card-body p-4">
                    <div className="fs-1 mb-2">🥈</div>
                    <div
                      className="rounded-circle bg-primary text-white mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold shadow-sm"
                      style={{ width: "70px", height: "70px", fontSize: "25px" }}
                    >
                      {second.user?.name ? second.user.name.charAt(0).toUpperCase() : "2"}
                    </div>
                    <h5 className="fw-bold mb-1">{second.user?.name || "Participant"}</h5>
                    <p className="text-muted mb-1 small">{second.pomodoros} Pomodoros</p>
                    <strong className="text-primary">{second.focusMinutes} minutes</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-md-3"></div>
            )}

            {/* FIRST PLACE */}
            {first && (
              <div className="col-md-4">
                <div
                  className="card border-0 shadow text-center hover-lift"
                  style={{ border: "2px solid #ffc107", backgroundColor: "#fffdf5" }}
                >
                  <div className="card-body p-4">
                    <div className="fs-1 mb-2">🥇</div>
                    <div
                      className="rounded-circle bg-danger text-white mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold shadow"
                      style={{ width: "85px", height: "85px", fontSize: "32px" }}
                    >
                      {first.user?.name ? first.user.name.charAt(0).toUpperCase() : "1"}
                    </div>
                    <h4 className="fw-bold mb-1">{first.user?.name || "Champion"}</h4>
                    <span className="badge bg-warning text-dark mb-2">Top Performer</span>
                    <p className="text-muted mb-1">{first.pomodoros} Pomodoros</p>
                    <h5 className="fw-bold text-danger">{first.focusMinutes} minutes</h5>
                  </div>
                </div>
              </div>
            )}

            {/* THIRD PLACE */}
            {third ? (
              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-center hover-lift">
                  <div className="card-body p-4">
                    <div className="fs-1 mb-2">🥉</div>
                    <div
                      className="rounded-circle bg-success text-white mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold shadow-sm"
                      style={{ width: "70px", height: "70px", fontSize: "25px" }}
                    >
                      {third.user?.name ? third.user.name.charAt(0).toUpperCase() : "3"}
                    </div>
                    <h5 className="fw-bold mb-1">{third.user?.name || "Participant"}</h5>
                    <p className="text-muted mb-1 small">{third.pomodoros} Pomodoros</p>
                    <strong className="text-success">{third.focusMinutes} minutes</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-md-3"></div>
            )}
          </div>
        )}

        {/* ================= COMPLETE LEADERBOARD TABLE matching UI ref ================= */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Ranking & Stats</h5>

            {loading ? (
              <p className="text-muted py-3">Calculating leaderboard...</p>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-5">
                <div className="display-6 mb-2">🏆</div>
                <h5 className="fw-bold">No sessions logged yet</h5>
                <p className="text-muted">Start focusing to earn badges and climb the podium!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "80px" }}>Rank</th>
                      <th>Member</th>
                      <th>Pomodoros</th>
                      <th>Focus Time</th>
                      <th>Streak</th>
                      <th>Badge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((item) => (
                      <tr key={item.user?.id || item.rank}>
                        <td>
                          {item.rank === 1 ? (
                            <span className="fs-5">🥇 1</span>
                          ) : item.rank === 2 ? (
                            <span className="fs-5">🥈 2</span>
                          ) : item.rank === 3 ? (
                            <span className="fs-5">🥉 3</span>
                          ) : (
                            <span className="fw-bold text-muted ps-2">#{item.rank}</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center me-2 fw-semibold"
                              style={{ width: "36px", height: "36px", fontSize: "0.9rem" }}
                            >
                              {item.user?.name ? item.user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <span className="fw-semibold">{item.user?.name}</span>
                          </div>
                        </td>
                        <td className="fw-bold text-danger">{item.pomodoros}</td>
                        <td>{item.focusMinutes} mins</td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            🔥 {item.streakDays || 1} day streak
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary bg-opacity-10 text-dark border">
                            {item.badge}
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

export default Leaderboard;
