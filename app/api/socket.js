// src/pages/api/socket.js
import { Server } from "socket.io";

export default function SocketHandler(req, res) {
  // Agar socket pehle se chal raha hai toh dobara start na karo
  if (res.socket.server.io) {
    console.log("Socket already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });
    res.socket.server.io = io;

    // Jab koi user connect ho
    io.on("connection", (socket) => {
      // Jab koi message bheje
      socket.on("send-message", (msgData) => {
        // Yeh message sab ko bhej do (Frontend par hum filter kar lenge)
        io.emit("receive-message", msgData);
      });
    });
  }
  res.end();
}