import express from "express";
import {
  getTeamEvents,
  createEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:teamId", protect, getTeamEvents);
router.post("/", protect, createEvent);
router.delete("/:eventId", protect, deleteEvent);

export default router;
