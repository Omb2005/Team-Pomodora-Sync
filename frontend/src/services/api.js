export const API_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ================= AUTH =================
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Registration failed");
  return data;
};

export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  return data;
};

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    const error = new Error("No login token found");
    error.status = 401;
    throw error;
  }
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || "Unable to load profile");
    error.status = response.status;
    throw error;
  }
  return data;
};

// ================= TEAMS =================
export const getMyTeams = async () => {
  const response = await fetch(`${API_URL}/teams/my-teams`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch teams");
  return data;
};

export const createTeam = async (teamData) => {
  const response = await fetch(`${API_URL}/teams/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(teamData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create team");
  return data;
};

export const joinTeam = async (roomCode) => {
  const response = await fetch(`${API_URL}/teams/join`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ roomCode }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to join team");
  return data;
};

export const getTeamDetails = async (id) => {
  const response = await fetch(`${API_URL}/teams/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch team details");
  return data;
};

// ================= TIMER =================
export const getTimer = async (teamId) => {
  const response = await fetch(`${API_URL}/timer/${teamId}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to get timer");
  return data;
};

export const startTimer = async (teamId) => {
  const response = await fetch(`${API_URL}/timer/${teamId}/start`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to start timer");
  return data;
};

export const pauseTimer = async (teamId) => {
  const response = await fetch(`${API_URL}/timer/${teamId}/pause`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to pause timer");
  return data;
};

export const resetTimer = async (teamId) => {
  const response = await fetch(`${API_URL}/timer/${teamId}/reset`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to reset timer");
  return data;
};

export const switchTimerMode = async (teamId, mode) => {
  const response = await fetch(`${API_URL}/timer/${teamId}/mode`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ mode }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to switch timer mode");
  return data;
};

// ================= TASKS =================
export const getTeamTasks = async (teamId) => {
  const response = await fetch(`${API_URL}/tasks/${teamId}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch tasks");
  return data;
};

export const createTask = async (teamId, taskData) => {
  const response = await fetch(`${API_URL}/tasks/${teamId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create task");
  return data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await fetch(`${API_URL}/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update task status");
  return data;
};

export const deleteTask = async (taskId) => {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete task");
  return data;
};

// ================= HISTORY =================
export const getTeamHistory = async (teamId) => {
  const response = await fetch(`${API_URL}/history/${teamId}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch history");
  return data;
};

export const getUserHistory = async () => {
  const response = await fetch(`${API_URL}/history/user/all`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch history");
  return data;
};

export const recordSession = async (teamId, sessionData) => {
  const response = await fetch(`${API_URL}/history/${teamId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(sessionData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to record session");
  return data;
};

// ================= ANALYTICS =================
export const getTeamAnalytics = async (teamId) => {
  const response = await fetch(`${API_URL}/analytics/${teamId}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch analytics");
  return data;
};

export const getUserDashboardSummary = async () => {
  const response = await fetch(`${API_URL}/analytics/user/summary`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch dashboard summary");
  return data;
};

// ================= LEADERBOARD =================
export const getTeamLeaderboard = async (teamId) => {
  const response = await fetch(`${API_URL}/leaderboard/${teamId}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch leaderboard");
  return data;
};

export const getGlobalLeaderboard = async () => {
  const response = await fetch(`${API_URL}/leaderboard/global`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch leaderboard");
  return data;
};

// ================= EVENTS / CALENDAR =================
export const getTeamEvents = async (teamId = "all") => {
  const response = await fetch(`${API_URL}/events/${teamId}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch events");
  return data;
};

export const createEvent = async (eventData) => {
  const response = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(eventData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create event");
  return data;
};

export const deleteEvent = async (eventId) => {
  const response = await fetch(`${API_URL}/events/${eventId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete event");
  return data;
};

// ================= NOTIFICATIONS =================
export const getUserNotifications = async () => {
  const response = await fetch(`${API_URL}/notifications`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch notifications");
  return data;
};

export const markAllNotificationsRead = async () => {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update notifications");
  return data;
};

export const markNotificationRead = async (id) => {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update notification");
  return data;
};
