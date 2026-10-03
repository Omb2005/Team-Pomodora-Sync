import SessionHistory from "../models/SessionHistory.js";
import Team from "../models/Team.js";
import User from "../models/User.js";

// Get leaderboard for a specific team
export const getTeamLeaderboard = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findOne({
      _id: teamId,
      members: req.user._id,
    }).populate("members", "name email profileImage");

    if (!team) {
      return res.status(404).json({ message: "Team not found or access denied" });
    }

    const sessions = await SessionHistory.find({
      team: teamId,
      mode: "focus",
      completed: true,
    });

    const leaderboardMap = {};
    team.members.forEach((m) => {
      leaderboardMap[m._id.toString()] = {
        user: {
          id: m._id,
          name: m.name,
          email: m.email,
          profileImage: m.profileImage,
        },
        pomodoros: 0,
        focusMinutes: 0,
        streakDays: 1, // baseline streak
      };
    });

    sessions.forEach((s) => {
      const uId = s.user.toString();
      if (leaderboardMap[uId]) {
        leaderboardMap[uId].pomodoros += 1;
        leaderboardMap[uId].focusMinutes += s.durationMinutes;
      }
    });

    // Sort descending by pomodoros, then focusMinutes
    const sortedMembers = Object.values(leaderboardMap).sort(
      (a, b) => b.pomodoros - a.pomodoros || b.focusMinutes - a.focusMinutes
    );

    const ranked = sortedMembers.map((item, index) => ({
      ...item,
      rank: index + 1,
      badge:
        index === 0
          ? "🥇 Top Focus"
          : index === 1
          ? "🥈 Silver Scholar"
          : index === 2
          ? "🥉 Bronze Achiever"
          : "🌟 Team Contributor",
    }));

    res.status(200).json({
      leaderboard: ranked,
      teamName: team.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leaderboard", error: error.message });
  }
};

// Global / overall leaderboard across user's teams
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const userTeams = await Team.find({ members: req.user._id });
    const teamIds = userTeams.map((t) => t._id);

    const sessions = await SessionHistory.find({
      team: { $in: teamIds },
      mode: "focus",
      completed: true,
    }).populate("user", "name email profileImage");

    const userMap = {};
    sessions.forEach((s) => {
      if (!s.user) return;
      const uId = s.user._id.toString();
      if (!userMap[uId]) {
        userMap[uId] = {
          user: {
            id: s.user._id,
            name: s.user.name,
            email: s.user.email,
            profileImage: s.user.profileImage,
          },
          pomodoros: 0,
          focusMinutes: 0,
          streakDays: Math.floor(Math.random() * 5) + 1,
        };
      }
      userMap[uId].pomodoros += 1;
      userMap[uId].focusMinutes += s.durationMinutes;
    });

    // Make sure logged-in user is at least present
    if (!userMap[req.user._id.toString()]) {
      userMap[req.user._id.toString()] = {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          profileImage: req.user.profileImage,
        },
        pomodoros: 0,
        focusMinutes: 0,
        streakDays: 1,
      };
    }

    const sortedUsers = Object.values(userMap).sort(
      (a, b) => b.pomodoros - a.pomodoros || b.focusMinutes - a.focusMinutes
    );

    const ranked = sortedUsers.map((item, index) => ({
      ...item,
      rank: index + 1,
      badge:
        index === 0
          ? "🥇 Grand Master"
          : index === 1
          ? "🥈 Focus Master"
          : index === 2
          ? "🥉 Focus Champion"
          : "🌟 Deep Worker",
    }));

    res.status(200).json({ leaderboard: ranked });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leaderboard", error: error.message });
  }
};
