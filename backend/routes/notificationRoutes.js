import express from "express";
import {
  getUserNotifications,
  markAllAsRead,
  markOneAsRead,
} from "../controllers/notificationController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUserNotifications);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, markOneAsRead);

export default router;
