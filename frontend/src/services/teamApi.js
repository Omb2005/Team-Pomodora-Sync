
import { API_URL } from "./api";

const getToken = () => localStorage.getItem("token");

// Common request for team APIs
const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}/teams${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// Common request for timer APIs
const timerRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}/timer${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Timer request failed");
  }

  return data;
};

// Team APIs
export const createTeam = (name) =>
  request("/create", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

export const joinTeam = (roomCode) =>
  request("/join", {
    method: "POST",
    body: JSON.stringify({ roomCode }),
  });

export const getMyTeams = () => request("/my-teams");

export const getTeamDetails = (id) => request(`/${id}`);

// Timer APIs
export const getTimer = (teamId) =>
  timerRequest(`/${teamId}`);

export const startTimer = (teamId) =>
  timerRequest(`/${teamId}/start`, {
    method: "POST",
  });

export const pauseTimer = (teamId) =>
  timerRequest(`/${teamId}/pause`, {
    method: "POST",
  });

export const resetTimer = (teamId) =>
  timerRequest(`/${teamId}/reset`, {
    method: "POST",
  });

export const switchTimerMode = (teamId, mode) =>
  timerRequest(`/${teamId}/mode`, {
    method: "POST",
    body: JSON.stringify({ mode }),
  });
