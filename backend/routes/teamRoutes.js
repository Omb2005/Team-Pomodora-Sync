
import express from "express";
import {
  createTeam,
  joinTeam,
  getMyTeams,
  getTeamDetails,
} from "../controllers/teamController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createTeam);
router.post("/join", protect, joinTeam);
router.get("/my-teams", protect, getMyTeams);
router.get("/:id", protect, getTeamDetails);

export default router;
