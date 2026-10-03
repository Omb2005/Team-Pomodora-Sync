import Event from "../models/Event.js";
import Team from "../models/Team.js";

// Get events for a team or all user teams
export const getTeamEvents = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (teamId && teamId !== "all") {
      const team = await Team.findOne({
        _id: teamId,
        members: req.user._id,
      });

      if (!team) {
        return res.status(404).json({ message: "Team not found or access denied" });
      }

      const events = await Event.find({ team: teamId })
        .populate("createdBy", "name email")
        .sort({ date: 1 });

      return res.status(200).json({ events });
    }

    // Get all user teams' events
    const userTeams = await Team.find({ members: req.user._id });
    const teamIds = userTeams.map((t) => t._id);

    const events = await Event.find({ team: { $in: teamIds } })
      .populate("team", "name roomCode")
      .populate("createdBy", "name email")
      .sort({ date: 1 });

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
};

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { teamId, title, description, date, time, type } = req.body;

    if (!teamId || !title || !date) {
      return res.status(400).json({ message: "Team, title, and date are required" });
    }

    const team = await Team.findOne({
      _id: teamId,
      members: req.user._id,
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found or access denied" });
    }

    const event = await Event.create({
      team: teamId,
      title: title.trim(),
      description: description || "",
      date: new Date(date),
      time: time || "10:00 AM",
      type: type || "Focus Session",
      createdBy: req.user._id,
    });

    const populatedEvent = await Event.findById(event._id)
      .populate("team", "name roomCode")
      .populate("createdBy", "name email");

    res.status(201).json({ message: "Event created successfully", event: populatedEvent });
  } catch (error) {
    res.status(500).json({ message: "Failed to create event", error: error.message });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const team = await Team.findOne({
      _id: event.team,
      members: req.user._id,
    });

    if (!team) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Event.findByIdAndDelete(eventId);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
};
