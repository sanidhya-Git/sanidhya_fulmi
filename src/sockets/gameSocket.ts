import { Server } from "socket.io";
import { Server as HTTPServer } from "http";

export function initSocket(server: HTTPServer) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🔗 User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
}
