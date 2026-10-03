import mongoose from "mongoose";

const sessionHistorySchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mode: {
      type: String,
      enum: ["focus", "shortBreak", "longBreak"],
      default: "focus",
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 25,
    },
    completed: {
      type: Boolean,
      default: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
  },
  { timestamps: true }
);

const SessionHistory = mongoose.model("SessionHistory", sessionHistorySchema);
export default SessionHistory;
