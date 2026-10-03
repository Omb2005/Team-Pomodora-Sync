import SessionHistory from "../models/SessionHistory.js";
import Team from "../models/Team.js";
import Notification from "../models/Notification.js";

// Record a completed session
export const recordSession = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { mode, durationMinutes, task } = req.body;

    const team = await Team.findOne({
      _id: teamId,
      members: req.user._id,
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found or access denied" });
    }

    const session = await SessionHistory.create({
      team: teamId,
      user: req.user._id,
      mode: mode || "focus",
      durationMinutes: durationMinutes || 25,
      completed: true,
      task: task || null,
    });

    // Notify other team members
    const otherMembers = team.members.filter(
      (m) => m.toString() !== req.user._id.toString()
    );

    if (otherMembers.length > 0 && (mode === "focus" || !mode)) {
      const notifications = otherMembers.map((memberId) => ({
        user: memberId,
        team: teamId,
        title: "Pomodoro Session Completed",
        message: `${req.user.name} completed a ${durationMinutes || 25}-minute focus session in "${team.name}".`,
        type: "session",
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ message: "Session recorded successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Failed to record session", error: error.message });
  }
};

// Get session history for a team
export const getTeamHistory = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findOne({
      _id: teamId,
      members: req.user._id,
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found or access denied" });
    }

    const sessions = await SessionHistory.find({ team: teamId })
      .populate("user", "name email profileImage")
      .populate("task", "title")
      .sort({ createdAt: -1 });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.completed).length;
    const totalFocusMinutes = sessions
      .filter((s) => s.mode === "focus" && s.completed)
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    const hours = Math.floor(totalFocusMinutes / 60);
    const mins = totalFocusMinutes % 60;
    const focusTimeFormatted = `${hours}h ${mins}m`;

    res.status(200).json({
      sessions,
      stats: {
        totalSessions,
        completedSessions,
        totalFocusMinutes,
        focusTimeFormatted,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history", error: error.message });
  }
};

// Get user's session history across all teams
export const getUserHistory = async (req, res) => {
  try {
    const sessions = await SessionHistory.find({ user: req.user._id })
      .populate("team", "name roomCode")
      .populate("task", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.completed).length;
    const totalFocusMinutes = sessions
      .filter((s) => s.mode === "focus" && s.completed)
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    const hours = Math.floor(totalFocusMinutes / 60);
    const mins = totalFocusMinutes % 60;
    const focusTimeFormatted = `${hours}h ${mins}m`;

    res.status(200).json({
      sessions,
      stats: {
        totalSessions,
        completedSessions,
        totalFocusMinutes,
        focusTimeFormatted,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user history", error: error.message });
  }
};
