import express from "express";
import {
  getTeamAnalytics,
  getUserDashboardSummary,
} from "../controllers/analyticsController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/user/summary", protect, getUserDashboardSummary);
router.get("/:teamId", protect, getTeamAnalytics);

export default router;
