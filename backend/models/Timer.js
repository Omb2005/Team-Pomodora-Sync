
import mongoose from "mongoose";

const timerSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      unique: true,
    },

    mode: {
      type: String,
      enum: ["focus", "shortBreak", "longBreak"],
      default: "focus",
    },

    status: {
      type: String,
      enum: ["idle", "running", "paused"],
      default: "idle",
    },

    duration: {
      type: Number,
      default: 1500,
    },

    remainingSeconds: {
      type: Number,
      default: 1500,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedFocusSessions: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Timer = mongoose.model("Timer", timerSchema);

export default Timer;
