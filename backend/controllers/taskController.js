import Task from "../models/Task.js";
import Team from "../models/Team.js";
import Notification from "../models/Notification.js";

// Get all tasks for a team
export const getTeamTasks = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findOne({
      _id: teamId,
      members: req.user._id,
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found or access denied" });
    }

    const tasks = await Task.find({ team: teamId })
      .populate("assignedTo", "name email profileImage")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "Pending").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const completed = tasks.filter((t) => t.status === "Completed").length;

    res.status(200).json({
      tasks,
      stats: { total, pending, inProgress, completed },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, description, assignedTo, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const team = await Team.findOne({
      _id: teamId,
      members: req.user._id,
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found or access denied" });
    }

    const task = await Task.create({
      team: teamId,
      title: title.trim(),
      description: description || "",
      assignedTo: assignedTo || null,
      priority: priority || "Medium",
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email profileImage")
      .populate("createdBy", "name email");

    // If assigned to another user, send notification
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: assignedTo,
        team: teamId,
        title: "New Task Assigned",
        message: `${req.user.name} assigned you the task: "${title.trim()}".`,
        type: "task",
      });
    }

    res.status(201).json({ message: "Task created successfully", task: populatedTask });
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const team = await Team.findOne({
      _id: task.team,
      members: req.user._id,
    });

    if (!team) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (status) task.status = status;
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email profileImage")
      .populate("createdBy", "name email");

    res.status(200).json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Failed to update task", error: error.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const team = await Team.findOne({
      _id: task.team,
      members: req.user._id,
    });

    if (!team) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Task.findByIdAndDelete(taskId);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};
