const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    if (!users[roomId]) users[roomId] = [];
    users[roomId].push(userId);
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      users[roomId] = users[roomId].filter(id => id !== userId);
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });

  socket.on("signal", (data) => {
    io.to(data.to).emit("signal", {
      from: data.from,
      signal: data.signal
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));