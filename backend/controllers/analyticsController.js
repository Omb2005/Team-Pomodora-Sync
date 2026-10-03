import SessionHistory from "../models/SessionHistory.js";
import Task from "../models/Task.js";
import Team from "../models/Team.js";

// Get analytics for a specific team
export const getTeamAnalytics = async (req, res) => {
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
    }).populate("user", "name email profileImage");

    const tasks = await Task.find({ team: teamId });
    const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;

    const pomodorosCompleted = sessions.length;
    const totalFocusMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    const hours = Math.floor(totalFocusMinutes / 60);
    const mins = totalFocusMinutes % 60;
    const focusTimeFormatted = `${hours}h ${mins}m`;

    // Calculate weekly focus time distribution for last 7 days (or Mon-Sun)
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    sessions.forEach((s) => {
      const sessionDate = new Date(s.createdAt);
      if (sessionDate >= oneWeekAgo) {
        const dayName = daysOfWeek[sessionDate.getDay()];
        weeklyData[dayName] = (weeklyData[dayName] || 0) + s.durationMinutes;
      }
    });

    // Calculate member productivity
    const memberStatsMap = {};
    team.members.forEach((m) => {
      memberStatsMap[m._id.toString()] = {
        id: m._id,
        name: m.name,
        email: m.email,
        profileImage: m.profileImage,
        pomodoros: 0,
        focusMinutes: 0,
      };
    });

    sessions.forEach((s) => {
      if (s.user && memberStatsMap[s.user._id.toString()]) {
        memberStatsMap[s.user._id.toString()].pomodoros += 1;
        memberStatsMap[s.user._id.toString()].focusMinutes += s.durationMinutes;
      }
    });

    const maxPomodoros = Math.max(
      1,
      ...Object.values(memberStatsMap).map((m) => m.pomodoros)
    );

    const memberProductivity = Object.values(memberStatsMap).map((m) => ({
      ...m,
      percentage: Math.round((m.pomodoros / maxPomodoros) * 100),
    }));

    res.status(200).json({
      summary: {
        pomodorosCompleted,
        totalFocusMinutes,
        focusTimeFormatted,
        tasksCompleted: completedTasksCount,
        activeMembers: team.members.length,
      },
      weeklyData,
      memberProductivity,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
  }
};

// Get personal user dashboard summary
export const getUserDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Today's date range
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Today's sessions for user
    const todaySessions = await SessionHistory.find({
      user: userId,
      mode: "focus",
      completed: true,
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });

    const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const todayPomodoros = todaySessions.length;
    const hours = Math.floor(todayFocusMinutes / 60);
    const mins = todayFocusMinutes % 60;
    const todayFocusTimeFormatted = `${hours}h ${mins}m`;

    // Tasks assigned to user
    const userTasksCount = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: "Completed" },
    });

    // Teams user is part of
    const userTeams = await Team.find({ members: userId })
      .populate("members", "name email")
      .populate("createdBy", "name email")
      .sort({ updatedAt: -1 });

    // Recent activity (sessions, tasks, team joins)
    const recentSessions = await SessionHistory.find({ user: userId })
      .populate("team", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivities = recentSessions.map((s) => ({
      id: s._id,
      type: "pomodoro",
      text: `🍅 Pomodoro completed in ${s.team ? s.team.name : "Team"} (${s.durationMinutes}m)`,
      time: s.createdAt,
    }));

    res.status(200).json({
      stats: {
        focusTimeFormatted: todayFocusTimeFormatted,
        todayPomodoros,
        assignedTasks: userTasksCount,
        activeTeams: userTeams.length,
      },
      teams: userTeams,
      recentActivities,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard summary", error: error.message });
  }
};
