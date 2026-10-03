import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getTeamAnalytics, getMyTeams } from "../services/api";

function Analytics() {
  const { id: paramTeamId } = useParams();
  const [teamId, setTeamId] = useState(paramTeamId || "");
  const [teams, setTeams] = useState([]);
  const [analytics, setAnalytics] = useState({
    summary: {
      pomodorosCompleted: 0,
      totalFocusMinutes: 0,
      focusTimeFormatted: "0h 0m",
      tasksCompleted: 0,
      activeMembers: 0,
    },
    weeklyData: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
    memberProductivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTeams()
      .then((res) => {
        const teamList = res.teams || [];
        setTeams(teamList);
        if (!paramTeamId && teamList.length > 0) {
          setTeamId(teamList[0]._id);
        }
      })
      .catch(() => {});
  }, [paramTeamId]);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getTeamAnalytics(teamId)
      .then((data) => {
        setAnalytics(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [teamId]);

  // Max minutes for weekly bar scale (minimum 60 mins for nice visual)
  const maxWeekly = Math.max(
    60,
    ...Object.values(analytics.weeklyData || {})
  );

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* HEADER matching UI ref */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h2 className="fw-bold mb-1">📊 Team Analytics</h2>
            <p className="text-muted mb-0">
              Track your team's productivity and Pomodoro sessions.
            </p>
          </div>

          {teams.length > 1 && (
            <select
              className="form-select w-auto"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            >
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  👥 {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ================= SUMMARY CARDS matching UI ref ================= */}
        <div className="row g-4 mb-4">
          {/* Card 1: Pomodoros Completed */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center hover-lift h-100">
              <div className="card-body">
                <div className="fs-1 mb-2">🍅</div>
                <h6 className="text-muted">Pomodoros Completed</h6>
                <h3 className="fw-bold text-danger mb-0">
                  {analytics.summary?.pomodorosCompleted || 0}
                </h3>
              </div>
            </div>
          </div>

          {/* Card 2: Focus Time */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center hover-lift h-100">
              <div className="card-body">
                <div className="fs-1 mb-2">⏱️</div>
                <h6 className="text-muted">Focus Time</h6>
                <h3 className="fw-bold mb-0">
                  {analytics.summary?.focusTimeFormatted || "0h 0m"}
                </h3>
              </div>
            </div>
          </div>

          {/* Card 3: Tasks Completed */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center hover-lift h-100">
              <div className="card-body">
                <div className="fs-1 mb-2">📋</div>
                <h6 className="text-muted">Tasks Completed</h6>
                <h3 className="fw-bold text-success mb-0">
                  {analytics.summary?.tasksCompleted || 0}
                </h3>
              </div>
            </div>
          </div>

          {/* Card 4: Active Members */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center hover-lift h-100">
              <div className="card-body">
                <div className="fs-1 mb-2">👥</div>
                <h6 className="text-muted">Active Members</h6>
                <h3 className="fw-bold mb-0">
                  {analytics.summary?.activeMembers || 0}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* ================= PRODUCTIVITY CHART matching UI ref ================= */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Weekly Focus Time</h5>
              <small className="text-muted">Minutes per day</small>
            </div>

            <div
              className="row align-items-end text-center g-2"
              style={{ height: "240px", paddingBottom: "20px" }}
            >
              {days.map((day) => {
                const mins = analytics.weeklyData?.[day] || 0;
                // Height between 25px and 180px
                const heightPx = Math.max(25, Math.round((mins / maxWeekly) * 180));
                const isTopDay = mins > 0 && mins === maxWeekly;

                return (
                  <div key={day} className="col">
                    <div className="small text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                      {mins > 0 ? `${mins}m` : ""}
                    </div>
                    <div
                      className={`mx-auto rounded-top ${
                        isTopDay ? "bg-danger" : mins > 0 ? "bg-danger opacity-75" : "bg-secondary opacity-25"
                      }`}
                      style={{
                        height: `${heightPx}px`,
                        width: "42px",
                        transition: "height 0.4s ease",
                      }}
                      title={`${day}: ${mins} minutes`}
                    ></div>
                    <small className="d-block mt-2 fw-medium text-muted">{day}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= MEMBER PRODUCTIVITY matching UI ref ================= */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4">👥 Member Productivity</h5>

            {analytics.memberProductivity && analytics.memberProductivity.length > 0 ? (
              analytics.memberProductivity.map((member, idx) => {
                const barColors = ["bg-danger", "bg-primary", "bg-success", "bg-warning", "bg-info"];
                const barColor = barColors[idx % barColors.length];

                return (
                  <div key={member.id || idx} className="mb-4">
                    <div className="d-flex justify-content-between mb-1">
                      <strong>{member.name}</strong>
                      <span className="text-muted">
                        {member.pomodoros} Pomodoro{member.pomodoros === 1 ? "" : "s"} ({member.focusMinutes}m)
                      </span>
                    </div>

                    <div className="progress" style={{ height: "10px" }}>
                      <div
                        className={`progress-bar ${barColor}`}
                        style={{
                          width: `${Math.max(8, member.percentage || 15)}%`,
                          transition: "width 0.5s ease",
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted">No member session records found yet.</p>
            )}
          </div>
        </div>

        {/* BACK TO WORKSPACE */}
        <div className="text-center mt-4">
          <Link
            to={teamId ? `/teams/${teamId}` : "/dashboard"}
            className="text-muted text-decoration-none"
          >
            ← Back to Team Workspace
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Analytics;
