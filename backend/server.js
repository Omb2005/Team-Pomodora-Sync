import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import timerRoutes from "./routes/timerRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Initialize Socket.IO once
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Make Socket.IO available in controllers
app.set("io", io);

// Health check
app.get("/", (req, res) => {
  res.send("Team Pomodoro Sync API is running");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/timer", timerRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);

// Track active members in rooms
const roomMembers = new Map(); // teamId -> Map(socketId -> { user })

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-team", ({ teamId, user }) => {
    const sTeamId = String(teamId);
    socket.join(sTeamId);

    if (!roomMembers.has(sTeamId)) {
      roomMembers.set(sTeamId, new Map());
    }

    if (user) {
      roomMembers.get(sTeamId).set(socket.id, {
        ...user,
        socketId: socket.id,
        status: "Focusing",
      });
    }

    const membersInRoom = Array.from(roomMembers.get(sTeamId).values());
    io.to(sTeamId).emit("room-members-updated", membersInRoom);
    console.log(`Socket ${socket.id} joined team ${teamId} as ${user?.name || "guest"}`);
  });

  socket.on("update-status", ({ teamId, status }) => {
    const sTeamId = String(teamId);
    if (roomMembers.has(sTeamId) && roomMembers.get(sTeamId).has(socket.id)) {
      const member = roomMembers.get(sTeamId).get(socket.id);
      member.status = status;
      roomMembers.get(sTeamId).set(socket.id, member);
      const membersInRoom = Array.from(roomMembers.get(sTeamId).values());
      io.to(sTeamId).emit("room-members-updated", membersInRoom);
    }
  });

  socket.on("leave-team", (teamId) => {
    const sTeamId = String(teamId);
    socket.leave(sTeamId);
    if (roomMembers.has(sTeamId)) {
      roomMembers.get(sTeamId).delete(socket.id);
      const membersInRoom = Array.from(roomMembers.get(sTeamId).values());
      io.to(sTeamId).emit("room-members-updated", membersInRoom);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const [teamId, membersMap] of roomMembers.entries()) {
      if (membersMap.has(socket.id)) {
        membersMap.delete(socket.id);
        const membersInRoom = Array.from(membersMap.values());
        io.to(teamId).emit("room-members-updated", membersInRoom);
      }
    }
  });
});

// Connect database and start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

export { io };
