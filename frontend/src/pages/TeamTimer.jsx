import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import socket from "../services/socket";
import {
  getTimer,
  startTimer,
  pauseTimer,
  resetTimer,
  switchTimerMode,
  getTeamDetails,
  getTeamTasks,
} from "../services/api";

function TeamTimer() {
  const { id: teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [timer, setTimer] = useState({
    mode: "focus",
    status: "idle",
    duration: 1500,
    remainingSeconds: 1500,
    completedFocusSessions: 0,
  });
  const [displaySeconds, setDisplaySeconds] = useState(1500);
  const [roomMembers, setRoomMembers] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  // Local ticker ref
  const tickerRef = useRef(null);

  // Play gentle chime on session complete
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {}
  };

  // Load team details & current task
  useEffect(() => {
    getTeamDetails(teamId)
      .then((res) => setTeam(res.team))
      .catch((err) => setError(err.message));

    getTeamTasks(teamId)
      .then((res) => {
        if (res.tasks && res.tasks.length > 0) {
          const inProg = res.tasks.find((t) => t.status === "In Progress") || res.tasks[0];
          setCurrentTask(inProg);
        }
      })
      .catch(() => {});
  }, [teamId]);

  // Connect socket and load timer
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-team", { teamId, user: currentUser });

    // Listen for timer updates
    const handleTimerUpdate = (data) => {
      if (data && data.timer) {
        setTimer(data.timer);
        setDisplaySeconds(data.timer.remainingSeconds);
      }
    };

    const handleSessionCompleted = (data) => {
      playChime();
      alert(`🎉 Focus Session complete! Good job! Time for ${data.nextMode === "longBreak" ? "a Long Break (15m)" : "a Short Break (5m)"}`);
    };

    const handleRoomMembers = (members) => {
      setRoomMembers(members || []);
    };

    socket.on("timer-updated", handleTimerUpdate);
    socket.on("session-completed", handleSessionCompleted);
    socket.on("room-members-updated", handleRoomMembers);

    // Initial fetch
    getTimer(teamId)
      .then((res) => {
        if (res.timer) {
          setTimer(res.timer);
          setDisplaySeconds(res.timer.remainingSeconds);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    return () => {
      socket.off("timer-updated", handleTimerUpdate);
      socket.off("session-completed", handleSessionCompleted);
      socket.off("room-members-updated", handleRoomMembers);
      socket.emit("leave-team", teamId);
    };
  }, [teamId]);

  // Local ticker for smooth countdown every second when running
  useEffect(() => {
    if (timer.status === "running") {
      tickerRef.current = setInterval(() => {
        setDisplaySeconds((prev) => {
          if (prev <= 1) {
            // Re-fetch from backend to trigger session completion
            getTimer(teamId).then((res) => {
              if (res.timer) {
                setTimer(res.timer);
                setDisplaySeconds(res.timer.remainingSeconds);
              }
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(tickerRef.current);
    }

    return () => clearInterval(tickerRef.current);
  }, [timer.status, teamId]);

  // Format seconds into MM:SS
  const formatTime = (totalSeconds) => {
    const s = Math.max(0, totalSeconds);
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleStart = async () => {
    try {
      const res = await startTimer(teamId);
      setTimer(res.timer);
      setDisplaySeconds(res.timer.remainingSeconds);
    } catch (err) {
      alert(err.message || "Failed to start timer");
    }
  };

  const handlePause = async () => {
    try {
      const res = await pauseTimer(teamId);
      setTimer(res.timer);
      setDisplaySeconds(res.timer.remainingSeconds);
    } catch (err) {
      alert(err.message || "Failed to pause timer");
    }
  };

  const handleReset = async () => {
    try {
      const res = await resetTimer(teamId);
      setTimer(res.timer);
      setDisplaySeconds(res.timer.remainingSeconds);
    } catch (err) {
      alert(err.message || "Failed to reset timer");
    }
  };

  const handleModeChange = async (mode) => {
    try {
      const res = await switchTimerMode(teamId, mode);
      setTimer(res.timer);
      setDisplaySeconds(res.timer.remainingSeconds);
    } catch (err) {
      alert(err.message || "Failed to change mode");
    }
  };

  const isRunning = timer.status === "running";
  const isPaused = timer.status === "paused";
  const isBreak = timer.mode === "shortBreak" || timer.mode === "longBreak";

  // Session status messages matching UI ref
  const getStatusText = () => {
    if (isRunning) return isBreak ? "Taking a Rest Break" : "Team is Focusing";
    if (isPaused) return "Session Paused";
    return isBreak ? "Break Ready" : "Ready to Focus";
  };

  const getStatusMessage = () => {
    if (isRunning) return isBreak ? "Recharge before the next focus sprint." : "Stay focused until the timer ends.";
    if (isPaused) return "Resume when you're ready.";
    return "Start the session when your team is ready.";
  };

  const getAvatarBg = (idx) => {
    const list = ["bg-danger", "bg-primary", "bg-success", "bg-warning text-dark", "bg-info text-dark"];
    return list[idx % list.length];
  };

  const totalTeamFocusMins = (timer.completedFocusSessions || 0) * 25;
  const hours = Math.floor(totalTeamFocusMins / 60);
  const mins = totalTeamFocusMins % 60;
  const teamFocusFormatted = `${hours}h ${String(mins).padStart(2, "0")}m`;

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* HEADER matching UI ref */}
        <div className="text-center mb-4">
          <h2 className="fw-bold">
            🍅 Team Pomodoro Room
          </h2>
          <p className="text-muted mb-2">
            {team ? team.name : "Stay focused together with your team."}
          </p>
          <span className="badge bg-success px-3 py-2">
            ● Room Active
          </span>
        </div>

        {error && (
          <div className="alert alert-warning text-center mx-auto mb-4" style={{ maxWidth: "600px" }}>
            {error}
          </div>
        )}

        <div className="row g-4">
          {/* ================= LEFT COLUMN: TIMER ================= */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4 p-md-5">
                <h5 className="fw-bold mb-4">
                  {timer.mode === "focus"
                    ? "Focus Session"
                    : timer.mode === "shortBreak"
                    ? "Short Break"
                    : "Long Break"}
                </h5>

                {/* TIMER CIRCLE */}
                <div
                  className={`timer-circle ${isBreak ? "break-mode" : ""} ${
                    isRunning ? "running" : ""
                  }`}
                >
                  <div className="small fw-bold text-uppercase tracking-wider">
                    {timer.mode === "focus"
                      ? "FOCUS"
                      : timer.mode === "shortBreak"
                      ? "SHORT BREAK"
                      : "LONG BREAK"}
                  </div>

                  <div id="timer" className="timer-display">
                    {formatTime(displaySeconds)}
                  </div>
                </div>

                {/* SESSION STATUS */}
                <h4 id="sessionStatus" className="fw-bold mt-4 mb-1">
                  {getStatusText()}
                </h4>

                <p id="sessionMessage" className="text-muted mb-4">
                  {getStatusMessage()}
                </p>

                {/* CONTROLS matching UI ref */}
                <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">
                  <button
                    id="startBtn"
                    onClick={handleStart}
                    className="btn btn-danger px-4 py-2 fw-semibold"
                    disabled={isRunning}
                  >
                    ▶ Start
                  </button>

                  <button
                    id="pauseBtn"
                    onClick={handlePause}
                    className="btn btn-warning px-4 py-2 fw-semibold text-dark"
                    disabled={!isRunning}
                  >
                    ⏸ Pause
                  </button>

                  <button
                    id="resetBtn"
                    onClick={handleReset}
                    className="btn btn-outline-secondary px-4 py-2 fw-semibold"
                  >
                    ↻ Reset
                  </button>
                </div>

                {/* SESSION TYPE BUTTONS matching UI ref */}
                <div className="mt-4 pt-3 border-top d-flex justify-content-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleModeChange("focus")}
                    className={`btn btn-sm ${
                      timer.mode === "focus"
                        ? "btn-danger"
                        : "btn-outline-danger"
                    }`}
                  >
                    Focus — 25 min
                  </button>

                  <button
                    onClick={() => handleModeChange("shortBreak")}
                    className={`btn btn-sm ${
                      timer.mode === "shortBreak"
                        ? "btn-success"
                        : "btn-outline-secondary"
                    }`}
                  >
                    Short Break — 5 min
                  </button>

                  <button
                    onClick={() => handleModeChange("longBreak")}
                    className={`btn btn-sm ${
                      timer.mode === "longBreak"
                        ? "btn-success"
                        : "btn-outline-secondary"
                    }`}
                  >
                    Long Break — 15 min
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: TEAM MEMBERS & CURRENT TASK ================= */}
          <div className="col-lg-4">
            {/* TEAM MEMBERS matching UI ref */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">👥 Team Members</h5>
                  <span className="badge bg-light text-dark border">
                    {team?.members?.length || 1} Total
                  </span>
                </div>

                {team?.members && team.members.length > 0 ? (
                  team.members.map((member, idx) => {
                    const isUserFocusing = isRunning;
                    return (
                      <div key={member._id || idx} className="d-flex align-items-center mb-3">
                        <div className={`member-avatar ${getAvatarBg(idx)} me-3`}>
                          {member.name ? member.name.charAt(0).toUpperCase() : "M"}
                        </div>

                        <div className="flex-grow-1 text-truncate">
                          <strong className="d-block text-truncate">
                            {member.name}
                          </strong>
                          <small className={isUserFocusing ? "text-success" : "text-muted"}>
                            ● {isUserFocusing ? "Focusing" : "Ready"}
                          </small>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted small">No members joined yet.</p>
                )}
              </div>
            </div>

            {/* CURRENT TASK matching UI ref */}
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-bold mb-0">📋 Current Task</h5>
                  <Link to={`/teams/${teamId}/tasks`} className="btn btn-sm btn-outline-danger">
                    Manage
                  </Link>
                </div>

                {currentTask ? (
                  <>
                    <h6 className="fw-semibold mb-1 text-truncate" title={currentTask.title}>
                      {currentTask.title}
                    </h6>
                    <small className="text-muted">
                      Assigned to {currentTask.assignedTo?.name || "Team Member"}
                    </small>
                  </>
                ) : (
                  <p className="text-muted small mb-0">
                    No active task currently selected for this focus sprint.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= SESSION INFORMATION matching UI ref ================= */}
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-body p-4">
            <div className="row text-center g-3">
              <div className="col-md-4">
                <h6 className="text-muted mb-1">Session</h6>
                <h4 className="fw-bold text-dark mb-0">
                  #{ (timer.completedFocusSessions || 0) + 1 }
                </h4>
              </div>

              <div className="col-md-4">
                <h6 className="text-muted mb-1">Completed Today</h6>
                <h4 className="fw-bold text-danger mb-0">
                  {timer.completedFocusSessions || 0}
                </h4>
              </div>

              <div className="col-md-4">
                <h6 className="text-muted mb-1">Team Focus Time</h6>
                <h4 className="fw-bold text-success mb-0">
                  {teamFocusFormatted}
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* BACK TO TEAM WORKSPACE */}
        <div className="text-center mt-4">
          <Link to={`/teams/${teamId}`} className="text-muted text-decoration-none">
            ← Back to Team Workspace
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TeamTimer;
