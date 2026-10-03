import express from "express";
import {
  recordSession,
  getTeamHistory,
  getUserHistory,
} from "../controllers/historyController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/user/all", protect, getUserHistory);
router.get("/:teamId", protect, getTeamHistory);
router.post("/:teamId", protect, recordSession);

export default router;
