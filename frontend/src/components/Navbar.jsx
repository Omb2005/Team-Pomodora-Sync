import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUserNotifications } from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token) {
      getUserNotifications()
        .then((res) => {
          setUnreadCount(res.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [token, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") return "active";
    if (path !== "/dashboard" && location.pathname.startsWith(path)) return "active";
    return "";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger app-navbar sticky-top">
      <div className="container-fluid px-lg-4">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to={token ? "/dashboard" : "/"}>
          <span style={{ fontSize: "1.4rem" }}>🍅</span>
          <span>Team Pomodoro Sync</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#appNavbar"
          aria-controls="appNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="appNavbar">
          {token ? (
            <>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive("/dashboard")}`} to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive("/teams")}`} to="/teams">
                    Teams
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive("/calendar")}`} to="/calendar">
                    Calendar
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive("/leaderboard")}`} to="/leaderboard">
                    Leaderboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive("/history")}`} to="/history">
                    History
                  </Link>
                </li>
              </ul>

              <div className="d-flex align-items-center gap-3">
                <Link
                  to="/notifications"
                  className="btn btn-outline-light btn-sm position-relative d-flex align-items-center gap-1"
                  title="Notifications"
                >
                  <span>🔔</span>
                  {unreadCount > 0 && (
                    <span className="badge bg-warning text-dark rounded-pill ms-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <span className="text-white fw-medium d-none d-md-inline">
                  Welcome, {user?.name || "User"}
                </span>

                <button
                  onClick={handleLogout}
                  className="btn btn-light btn-sm fw-semibold text-danger"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="ms-auto d-flex gap-2">
              <Link to="/login" className="btn btn-outline-light">
                Login
              </Link>
              <Link to="/register" className="btn btn-light text-danger fw-bold">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
