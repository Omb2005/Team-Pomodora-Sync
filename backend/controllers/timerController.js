import Timer from "../models/Timer.js";
import Team from "../models/Team.js";
import SessionHistory from "../models/SessionHistory.js";
import Notification from "../models/Notification.js";

const DURATIONS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

// Send the latest timer state to everyone in the team room
const broadcastTimer = (req, teamId, timer) => {
  const io = req.app.get("io");

  if (!io) return;

  io.to(String(teamId)).emit("timer-updated", {
    timer: {
      ...timer.toObject(),
      remainingSeconds: getRemainingTime(timer),
    },
  });
};

// Check team membership and get its timer
const getTeamTimer = async (teamId, userId) => {
  const team = await Team.findOne({
    _id: teamId,
    members: userId,
  });

  if (!team) {
    return { error: "Team not found or access denied" };
  }

  let timer = await Timer.findOne({ team: teamId });

  if (!timer) {
    timer = await Timer.create({ team: teamId });
  }

  return { timer, team };
};

// Calculate remaining time
const getRemainingTime = (timer) => {
  if (timer.status !== "running" || !timer.startedAt) {
    return timer.remainingSeconds;
  }

  const elapsed = Math.floor(
    (Date.now() - timer.startedAt.getTime()) / 1000
  );

  return Math.max(0, timer.remainingSeconds - elapsed);
};

// Complete an expired session and prepare the next one
const completeExpiredSession = async (req, teamId, timer, team, userId) => {
  if (
    timer.status !== "running" ||
    getRemainingTime(timer) > 0
  ) {
    return timer;
  }

  const completedMode = timer.mode;

  if (completedMode === "focus") {
    timer.completedFocusSessions += 1;

    // Record session history
    try {
      await SessionHistory.create({
        team: teamId,
        user: userId || team?.createdBy,
        mode: "focus",
        durationMinutes: 25,
        completed: true,
      });

      // Notify other members
      if (team && team.members) {
        const otherMembers = team.members.filter(
          (m) => m.toString() !== (userId ? userId.toString() : "")
        );
        if (otherMembers.length > 0) {
          const notifications = otherMembers.map((mId) => ({
            user: mId,
            team: teamId,
            title: "Focus Session Completed",
            message: `A 25-minute Pomodoro session in "${team.name}" was successfully completed!`,
            type: "session",
          }));
          await Notification.insertMany(notifications);
        }
      }
    } catch (err) {
      console.error("Error logging completed session:", err);
    }

    // Every fourth focus session is followed by a long break
    timer.mode =
      timer.completedFocusSessions % 4 === 0
        ? "longBreak"
        : "shortBreak";
  } else {
    // After a break, prepare the next focus session
    timer.mode = "focus";
  }

  timer.duration = DURATIONS[timer.mode];
  timer.remainingSeconds = timer.duration;
  timer.status = "idle";
  timer.startedAt = null;

  await timer.save();

  // Notify the team about the automatic mode transition
  broadcastTimer(req, teamId, timer);

  const io = req.app.get("io");
  if (io) {
    io.to(String(teamId)).emit("session-completed", {
      completedMode,
      nextMode: timer.mode,
      completedFocusSessions: timer.completedFocusSessions,
    });
  }

  return timer;
};

// Get current timer
export const getTimer = async (req, res) => {
  try {
    const teamId = req.params.teamId;

    const { timer, team, error } = await getTeamTimer(
      teamId,
      req.user._id
    );

    if (error) {
      return res.status(404).json({ message: error });
    }

    await completeExpiredSession(req, teamId, timer, team, req.user._id);

    res.json({
      timer: {
        ...timer.toObject(),
        remainingSeconds: getRemainingTime(timer),
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to get timer",
      error: err.message,
    });
  }
};

// Start or resume timer
export const startTimer = async (req, res) => {
  try {
    const teamId = req.params.teamId;

    const { timer, team, error } = await getTeamTimer(
      teamId,
      req.user._id
    );

    if (error) {
      return res.status(404).json({ message: error });
    }

    await completeExpiredSession(req, teamId, timer, team, req.user._id);

    if (timer.status === "running") {
      return res.json({
        message: "Timer is already running",
        timer: {
          ...timer.toObject(),
          remainingSeconds: getRemainingTime(timer),
        },
      });
    }

    timer.startedAt = new Date();
    timer.status = "running";

    await timer.save();

    broadcastTimer(req, teamId, timer);

    const io = req.app.get("io");
    if (io) {
      io.to(String(teamId)).emit("user-activity", {
        userName: req.user.name,
        action: "started the timer",
      });
    }

    res.json({
      message: "Timer started",
      timer: {
        ...timer.toObject(),
        remainingSeconds: getRemainingTime(timer),
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to start timer",
      error: err.message,
    });
  }
};

// Pause timer
export const pauseTimer = async (req, res) => {
  try {
    const teamId = req.params.teamId;

    const { timer, team, error } = await getTeamTimer(
      teamId,
      req.user._id
    );

    if (error) {
      return res.status(404).json({ message: error });
    }

    await completeExpiredSession(req, teamId, timer, team, req.user._id);

    if (timer.status !== "running") {
      return res.status(400).json({
        message: "Timer is not running",
        timer,
      });
    }

    timer.remainingSeconds = getRemainingTime(timer);
    timer.status = "paused";
    timer.startedAt = null;

    await timer.save();

    broadcastTimer(req, teamId, timer);

    const io = req.app.get("io");
    if (io) {
      io.to(String(teamId)).emit("user-activity", {
        userName: req.user.name,
        action: "paused the timer",
      });
    }

    res.json({
      message: "Timer paused",
      timer,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to pause timer",
      error: err.message,
    });
  }
};

// Reset current session
export const resetTimer = async (req, res) => {
  try {
    const teamId = req.params.teamId;

    const { timer, error } = await getTeamTimer(
      teamId,
      req.user._id
    );

    if (error) {
      return res.status(404).json({ message: error });
    }

    timer.status = "idle";
    timer.startedAt = null;
    timer.remainingSeconds = timer.duration;

    await timer.save();

    broadcastTimer(req, teamId, timer);

    const io = req.app.get("io");
    if (io) {
      io.to(String(teamId)).emit("user-activity", {
        userName: req.user.name,
        action: "reset the timer",
      });
    }

    res.json({
      message: "Timer reset",
      timer,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to reset timer",
      error: err.message,
    });
  }
};

// Manually switch timer mode
export const switchMode = async (req, res) => {
  try {
    const { mode } = req.body;
    const teamId = req.params.teamId;

    if (!DURATIONS[mode]) {
      return res.status(400).json({
        message: "Invalid timer mode",
      });
    }

    const { timer, error } = await getTeamTimer(
      teamId,
      req.user._id
    );

    if (error) {
      return res.status(404).json({ message: error });
    }

    timer.mode = mode;
    timer.duration = DURATIONS[mode];
    timer.remainingSeconds = DURATIONS[mode];
    timer.status = "idle";
    timer.startedAt = null;

    await timer.save();

    broadcastTimer(req, teamId, timer);

    res.json({
      message: "Timer mode changed",
      timer,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to switch timer mode",
      error: err.message,
    });
  }
};
