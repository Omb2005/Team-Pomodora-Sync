import express from "express";
import {
  getTeamTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
} from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:teamId", protect, getTeamTasks);
router.post("/:teamId", protect, createTask);
router.patch("/:taskId/status", protect, updateTaskStatus);
router.delete("/:taskId", protect, deleteTask);

export default router;
