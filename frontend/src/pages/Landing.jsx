import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Landing() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section className="hero-section text-center py-5">
        <div className="container py-lg-4">
          <div className="display-4 fw-bold mb-3 text-dark">
            Focus Together.
            <br />
            <span className="text-danger">Achieve Together. 🍅</span>
          </div>

          <p className="lead text-muted mb-4 mx-auto" style={{ maxWidth: "600px" }}>
            A real-time collaborative Pomodoro platform designed for teams. Boost productivity, sync timers, coordinate tasks, and reach your goals in rhythm.
          </p>

          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-danger btn-lg px-4 shadow-sm fw-semibold">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-outline-dark btn-lg px-4 fw-semibold">
              Login
            </Link>
          </div>

          {/* Quick Mock Preview */}
          <div className="mt-5 mx-auto" style={{ maxWidth: "420px" }}>
            <div className="card shadow-sm border-0 p-4 bg-white text-center">
              <div className="small text-muted fw-bold text-uppercase mb-2">Team Focus Demo</div>
              <div className="timer-circle running" style={{ width: "190px", height: "190px" }}>
                <div className="small text-white-50">FOCUS</div>
                <div className="timer-display" style={{ fontSize: "2.8rem" }}>25:00</div>
              </div>
              <div className="mt-3">
                <span className="badge bg-success px-3 py-2">● 3 Members Focusing in Sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="container py-5 my-3">
        <h2 className="text-center fw-bold mb-2">
          Why Team Pomodoro Sync?
        </h2>
        <p className="text-center text-muted mb-5">
          Everything your distributed team needs to stay aligned and deeply focused.
        </p>

        <div className="row g-4">
          {/* Feature 1 */}
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0 hover-lift text-center p-3">
              <div className="card-body">
                <div className="display-5 mb-3">🔄</div>
                <h4 className="fw-bold mb-2">Real-Time Sync</h4>
                <p className="text-muted">
                  Synchronize Pomodoro sessions with your entire team. When one member starts or pauses, everyone stays in the flow together.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0 hover-lift text-center p-3">
              <div className="card-body">
                <div className="display-5 mb-3">👥</div>
                <h4 className="fw-bold mb-2">Team Collaboration</h4>
                <p className="text-muted">
                  Create dedicated teams, invite colleagues with simple 6-character room codes, and assign shared tasks effortlessly.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0 hover-lift text-center p-3">
              <div className="card-body">
                <div className="display-5 mb-3">📊</div>
                <h4 className="fw-bold mb-2">Productivity Analytics</h4>
                <p className="text-muted">
                  Track completed focus sessions, study streaks, and member leaderboards to celebrate your collective momentum.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;
