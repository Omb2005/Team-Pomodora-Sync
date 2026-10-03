import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createTeam } from "../services/api";

function CreateTeam() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "project",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Team name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await createTeam({
        name: formData.name,
        description: formData.description,
        type: formData.type,
      });

      navigate(`/teams/${data.team._id}`);
    } catch (err) {
      setError(err.message || "Failed to create team");
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
                  <div className="display-5 mb-2">👥</div>
                  <h2 className="fw-bold">Create a Team</h2>
                  <p className="text-muted">
                    Create a collaborative space for your team.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger py-2 small" role="alert">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form id="createTeamForm" onSubmit={handleSubmit}>
                  {/* Team Name */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-semibold">
                      Team Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="form-control"
                      placeholder="Example: Web Development Team"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Team Description */}
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label fw-semibold">
                      Team Description
                    </label>
                    <textarea
                      id="description"
                      className="form-control"
                      rows="4"
                      placeholder="Describe the purpose of your team..."
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  {/* Team Type */}
                  <div className="mb-4">
                    <label htmlFor="type" className="form-label fw-semibold">
                      Team Type
                    </label>
                    <select
                      id="type"
                      className="form-select"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="project">Project Team</option>
                      <option value="study">Study Team</option>
                      <option value="work">Work Team</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn btn-danger w-100 py-2 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Team"}
                  </button>
                </form>

                {/* Join Team Link */}
                <p className="text-center mt-4 mb-2 text-muted">
                  Already have a team code?{" "}
                  <Link to="/teams/join" className="text-danger fw-semibold text-decoration-none">
                    Join Team
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

export default CreateTeam;
