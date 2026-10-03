import express from "express";
import {
  getTeamLeaderboard,
  getGlobalLeaderboard,
} from "../controllers/leaderboardController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/global", protect, getGlobalLeaderboard);
router.get("/:teamId", protect, getTeamLeaderboard);

export default router;
