import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getTeamEvents, createEvent, deleteEvent, getMyTeams } from "../services/api";

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    type: "Focus Session",
    teamId: "",
  });

  const loadData = async () => {
    try {
      const [eventsRes, teamsRes] = await Promise.all([
        getTeamEvents("all"),
        getMyTeams(),
      ]);
      setEvents(eventsRes.events || []);
      const userTeams = teamsRes.teams || [];
      setTeams(userTeams);
      if (userTeams.length > 0 && !newEvent.teamId) {
        setNewEvent((prev) => ({ ...prev, teamId: userTeams[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = monthNames[month];

  // Calendar matrix calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthTotalDays - i,
      currentMonth: false,
      dateStr: new Date(year, month - 1, prevMonthTotalDays - i).toISOString().split("T")[0],
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({
      day: d,
      currentMonth: true,
      dateStr: dStr,
    });
  }

  // Next month padding to fill grid
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      day: i,
      currentMonth: false,
      dateStr: new Date(year, month + 1, i).toISOString().split("T")[0],
    });
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.teamId || !newEvent.title.trim()) {
      alert("Please select a team and enter an event title");
      return;
    }

    try {
      await createEvent(newEvent);
      setShowModal(false);
      setNewEvent({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        time: "10:00 AM",
        type: "Focus Session",
        teamId: teams[0]?._id || "",
      });
      loadData();
    } catch (err) {
      alert(err.message || "Failed to create event");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(eventId);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to delete event");
    }
  };

  const getEventsForDate = (dateStr) => {
    return events.filter((e) => {
      const eDate = new Date(e.date).toISOString().split("T")[0];
      return eDate === dateStr;
    });
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* HEADER matching UI ref */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h2 className="fw-bold mb-1">📅 Team Calendar</h2>
            <p className="text-muted mb-0">
              Schedule team focus sessions and events.
            </p>
          </div>

          <button onClick={() => setShowModal(true)} className="btn btn-danger">
            + Add Event
          </button>
        </div>

        {/* ================= CALENDAR CARD matching UI ref ================= */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            {/* Month Switcher */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button onClick={handlePrevMonth} className="btn btn-outline-secondary">
                ←
              </button>

              <h4 className="fw-bold mb-0">
                {monthName} {year}
              </h4>

              <button onClick={handleNextMonth} className="btn btn-outline-secondary">
                →
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="row text-center fw-bold mb-2 text-muted">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="col py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="border rounded-3 overflow-hidden">
              {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIdx) => (
                <div key={weekIdx} className="row g-0 text-center border-bottom">
                  {calendarDays.slice(weekIdx * 7, weekIdx * 7 + 7).map((cell, dayIdx) => {
                    const cellEvents = getEventsForDate(cell.dateStr);
                    const isToday =
                      cell.dateStr === new Date().toISOString().split("T")[0];

                    return (
                      <div
                        key={dayIdx}
                        className={`col calendar-day-cell border-end p-2 ${
                          !cell.currentMonth
                            ? "text-muted bg-light bg-opacity-50"
                            : isToday
                            ? "bg-danger bg-opacity-10 fw-bold"
                            : ""
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className={isToday ? "badge bg-danger rounded-circle" : ""}>
                            {cell.day}
                          </small>
                        </div>

                        {cellEvents.map((evt) => (
                          <div
                            key={evt._id}
                            className="calendar-event-pill bg-danger text-white text-start shadow-sm"
                            title={`${evt.time} ${evt.title} (${evt.team?.name || ""})`}
                          >
                            {evt.time} {evt.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= UPCOMING EVENTS matching UI ref ================= */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Upcoming Scheduled Focus Sessions</h5>

            {events.length === 0 ? (
              <p className="text-muted mb-0">No upcoming events scheduled. Click "+ Add Event" to plan your team sessions.</p>
            ) : (
              <div className="list-group list-group-flush">
                {events.slice(0, 8).map((evt) => (
                  <div
                    key={evt._id}
                    className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-danger">{evt.type}</span>
                        <h6 className="fw-bold mb-0">{evt.title}</h6>
                      </div>
                      <small className="text-muted">
                        📅 {new Date(evt.date).toLocaleDateString()} at {evt.time} • Team: {evt.team?.name || "Workspace"}
                      </small>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(evt._id)}
                      className="btn btn-sm btn-outline-secondary"
                      title="Cancel Event"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BACK TO DASHBOARD */}
        <div className="text-center">
          <Link to="/dashboard" className="text-muted text-decoration-none">
            ← Back to Dashboard
          </Link>
        </div>
      </main>

      {/* ================= ADD EVENT MODAL ================= */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Schedule Team Event</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateEvent}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Team</label>
                    <select
                      className="form-select"
                      value={newEvent.teamId}
                      onChange={(e) => setNewEvent({ ...newEvent, teamId: e.target.value })}
                      required
                    >
                      {teams.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Session Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Sprint Planning Focus"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Time</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="10:00 AM"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Session Type</label>
                    <select
                      className="form-select"
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    >
                      <option value="Focus Session">Focus Session</option>
                      <option value="Sprint Planning">Sprint Planning</option>
                      <option value="Deep Work">Deep Work</option>
                      <option value="Team Sync">Team Sync</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Schedule Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default CalendarPage;
