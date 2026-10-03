
import Team from "../models/Team.js";

// Generate a room code
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create a team
export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Team name is required",
      });
    }

    const roomCode = generateRoomCode();

    const team = await Team.create({
      name: name.trim(),
      roomCode,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create team",
      error: error.message,
    });
  }
};

// Join a team using room code
export const joinTeam = async (req, res) => {
  try {
    const { roomCode } = req.body;

    if (!roomCode) {
      return res.status(400).json({
        message: "Room code is required",
      });
    }

    const team = await Team.findOne({
      roomCode: roomCode.toUpperCase(),
    });

    if (!team) {
      return res.status(404).json({
        message: "Team not found",
      });
    }

    if (team.members.some(
      (member) => member.toString() === req.user._id.toString()
    )) {
      return res.status(400).json({
        message: "You are already a member of this team",
      });
    }

    team.members.push(req.user._id);
    await team.save();

    res.status(200).json({
      message: "Joined team successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to join team",
      error: error.message,
    });
  }
};

// Get all teams of logged-in user
export const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      members: req.user._id,
    })
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      teams,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch teams",
      error: error.message,
    });
  }
};

// Get team details
export const getTeamDetails = async (req, res) => {
  try {
    const team = await Team.findOne({
      _id: req.params.id,
      members: req.user._id,
    })
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!team) {
      return res.status(404).json({
        message: "Team not found or access denied",
      });
    }

    res.status(200).json({
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch team details",
      error: error.message,
    });
  }
};
