import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    getUserNotifications()
      .then((data) => {
        setNotifications(data.notifications || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    if (type === "session") return "🍅";
    if (type === "task") return "📋";
    if (type === "team") return "👥";
    return "🔔";
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* HEADER matching UI ref */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">🔔 Notifications</h2>
            <p className="text-muted mb-0">
              Stay updated with your team's activity.
            </p>
          </div>

          {notifications.some((n) => !n.read) && (
            <button onClick={handleMarkAllRead} className="btn btn-outline-danger btn-sm">
              Mark All as Read
            </button>
          )}
        </div>

        {/* ================= NOTIFICATIONS LIST matching UI ref ================= */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-4 text-center text-muted">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-5">
                <div className="display-6 mb-2">🔔</div>
                <h5 className="fw-bold">No notifications yet</h5>
                <p className="text-muted mb-0">
                  When team members start sessions or assign tasks, you'll be notified here.
                </p>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.read && handleMarkOneRead(n._id)}
                    className={`p-4 border-bottom ${
                      !n.read ? "bg-danger bg-opacity-10" : ""
                    }`}
                    style={{ cursor: !n.read ? "pointer" : "default" }}
                  >
                    <div className="d-flex align-items-start">
                      <div className="fs-3 me-3">{getIcon(n.type)}</div>

                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">{n.title}</h6>
                        <p className="mb-1 text-secondary">{n.message}</p>
                        <small className="text-muted">
                          {new Date(n.createdAt).toLocaleDateString()} at{" "}
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>

                      {!n.read && (
                        <span className="badge bg-danger ms-2">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                ))}
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

export default Notifications;
