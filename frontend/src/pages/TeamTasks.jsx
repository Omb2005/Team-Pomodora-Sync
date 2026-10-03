import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getTeamTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  getTeamDetails,
} from "../services/api";

function TeamTasks() {
  const { id: teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assignedTo: "",
    dueDate: "",
  });

  const loadTasks = async () => {
    try {
      const [tasksRes, teamRes] = await Promise.all([
        getTeamTasks(teamId),
        getTeamDetails(teamId),
      ]);
      setTasks(tasksRes.tasks || []);
      setStats(tasksRes.stats || { total: 0, pending: 0, inProgress: 0, completed: 0 });
      setTeam(teamRes.team);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [teamId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await createTask(teamId, {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assignedTo: newTask.assignedTo || null,
        dueDate: newTask.dueDate || null,
      });

      setShowModal(false);
      setNewTask({
        title: "",
        description: "",
        priority: "Medium",
        assignedTo: "",
        dueDate: "",
      });
      loadTasks();
    } catch (err) {
      alert(err.message || "Failed to create task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      loadTasks();
    } catch (err) {
      alert(err.message || "Failed to update task");
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
      loadTasks();
    } catch (err) {
      alert(err.message || "Failed to delete task");
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === "High") return "bg-danger";
    if (priority === "Medium") return "bg-warning text-dark";
    return "bg-info text-dark";
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <main className="container py-4 flex-grow-1">
        {/* HEADER matching UI ref */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <h2 className="fw-bold mb-1">📋 Team Tasks</h2>
            <p className="text-muted mb-0">
              Manage your team's tasks and track progress in {team?.name || "your team"}.
            </p>
          </div>

          <button onClick={() => setShowModal(true)} className="btn btn-danger">
            + Add Task
          </button>
        </div>

        {/* ================= TASK SUMMARY matching UI ref ================= */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center">
              <div className="card-body">
                <h6 className="text-muted mb-1">Total Tasks</h6>
                <h3 className="fw-bold mb-0">{stats.total}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center">
              <div className="card-body">
                <h6 className="text-muted mb-1">Pending</h6>
                <h3 className="fw-bold text-danger mb-0">{stats.pending}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center">
              <div className="card-body">
                <h6 className="text-muted mb-1">In Progress</h6>
                <h3 className="fw-bold text-warning mb-0">{stats.inProgress}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card border-0 shadow-sm text-center">
              <div className="card-body">
                <h6 className="text-muted mb-1">Completed</h6>
                <h3 className="fw-bold text-success mb-0">{stats.completed}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* ================= TASK LIST matching UI ref ================= */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Current Tasks</h5>

            {loading ? (
              <p className="text-muted">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <div className="text-center py-5">
                <div className="display-6 mb-2">📋</div>
                <h5 className="fw-bold">No tasks created yet</h5>
                <p className="text-muted mb-3">
                  Break your project into manageable focus sprints and assign them to members.
                </p>
                <button onClick={() => setShowModal(true)} className="btn btn-sm btn-danger">
                  + Add First Task
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {tasks.map((task) => (
                  <div key={task._id} className="border rounded-3 p-3 bg-white hover-lift">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="fw-bold mb-0">{task.title}</h6>
                          <span className={`badge ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-muted small mb-2">{task.description}</p>
                        )}

                        <div className="small text-muted d-flex flex-wrap gap-3">
                          <span>
                            👤 Assignee: <strong>{task.assignedTo?.name || "Unassigned"}</strong>
                          </span>
                          {task.dueDate && (
                            <span>
                              📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <select
                          className="form-select form-select-sm"
                          style={{ width: "140px" }}
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>

                        <button
                          onClick={() => handleDelete(task._id)}
                          className="btn btn-sm btn-outline-danger"
                          title="Delete task"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BACK TO WORKSPACE */}
        <div className="text-center mt-4">
          <Link to={`/teams/${teamId}`} className="text-muted text-decoration-none">
            ← Back to Team Workspace
          </Link>
        </div>
      </main>

      {/* ================= ADD TASK MODAL matching UI ref ================= */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add New Task</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateTask}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Task Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Implement Pomodoro WebSocket synchronization"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Details about what needs to get done..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Priority</label>
                      <select
                        className="form-select"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label fw-semibold">Assignee</label>
                      <select
                        className="form-select"
                        value={newTask.assignedTo}
                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      >
                        <option value="">Unassigned</option>
                        {team?.members?.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label fw-semibold">Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
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
                    Save Task
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

export default TeamTasks;
