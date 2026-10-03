
import express from "express";

import {
  getTimer,
  startTimer,
  pauseTimer,
  resetTimer,
  switchMode,
} from "../controllers/timerController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:teamId", protect, getTimer);
router.post("/:teamId/start", protect, startTimer);
router.post("/:teamId/pause", protect, pauseTimer);
router.post("/:teamId/reset", protect, resetTimer);
router.post("/:teamId/mode", protect, switchMode);

export default router;
