import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { joinTeam } from "../services/api";

function JoinTeam() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError("Room code is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await joinTeam(roomCode.trim().toUpperCase());
      navigate(`/teams/${data.team._id}`);
    } catch (err) {
      setError(err.message || "Failed to join team. Please verify the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="container py-5 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                {/* Heading */}
                <div className="text-center mb-4">
                  <div className="display-5 mb-2">🔗</div>
                  <h2 className="fw-bold">Join a Team</h2>
                  <p className="text-muted">
                    Enter the team code provided by your team owner.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger py-2 small" role="alert">
                    {error}
                  </div>
                )}

                {/* Join Form */}
                <form id="joinTeamForm" onSubmit={handleSubmit}>
                  {/* Team Code */}
                  <div className="mb-4">
                    <label htmlFor="teamCode" className="form-label fw-semibold">
                      Team Code
                    </label>
                    <input
                      type="text"
                      id="teamCode"
                      className="form-control form-control-lg text-center text-uppercase font-monospace fw-bold"
                      placeholder="Example: TMS7K4P"
                      maxLength={12}
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      required
                    />
                    <div className="form-text text-center mt-2">
                      Enter the unique code shared by your team owner.
                    </div>
                  </div>

                  {/* Join Button */}
                  <button
                    type="submit"
                    className="btn btn-danger w-100 py-2 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? "Joining..." : "Join Team"}
                  </button>
                </form>

                {/* Create Team Link */}
                <p className="text-center mt-4 mb-2 text-muted">
                  Don't have a team yet?{" "}
                  <Link to="/teams/create" className="text-danger fw-semibold text-decoration-none">
                    Create a Team
                  </Link>
                </p>

                {/* Back to Dashboard */}
                <div className="text-center mt-3">
                  <Link to="/dashboard" className="text-muted small text-decoration-none">
                    ← Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default JoinTeam;
