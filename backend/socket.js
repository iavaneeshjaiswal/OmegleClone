import { Server } from "socket.io";

const waitingUsers = []; // Queue of users waiting for a match (with details)
const activeChats = new Map(); // Store active chat pairs { socketId: partnerSocketId }

export function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🔌 User Connected:", socket.id);

    // User requests to find a match with preferences
    socket.on("findMatch", ({ name, language, country }) => {
      console.log(
        `🔍 ${name} is looking for a match (Language: ${language}, Country: ${country})`
      );

      // Try to find a match based on language & country
      const matchIndex = waitingUsers.findIndex(
        (user) => user.language === language && user.country === country
      );

      if (matchIndex !== -1) {
        // Found a match, remove them from the queue
        const partner = waitingUsers.splice(matchIndex, 1)[0];

        // Store the active chat
        activeChats.set(socket.id, partner.socketId);
        activeChats.set(partner.socketId, socket.id);

        // Notify both users of the match
        io.to(socket.id).emit("matchFound", {
          partner: partner.socketId,
          partnerName: partner.name,
        });
        io.to(partner.socketId).emit("matchFound", {
          partner: socket.id,
          partnerName: name,
        });

        console.log(
          `🔗 Match Created: ${name} (${socket.id}) ⇄ ${partner.name} (${partner.socketId})`
        );
      } else {
        // No match found, add user to waiting queue
        waitingUsers.push({ socketId: socket.id, name, language, country });
        console.log(
          `⏳ ${name} added to queue (Lang: ${language}, Country: ${country})`
        );
      }
    });

    // Handle chat messages
    socket.on("chatMessage", ({ message, name }) => {
      const partnerSocketId = activeChats.get(socket.id);
      if (partnerSocketId) {
        io.to(partnerSocketId).emit("chatMessage", {
          from: socket.id,
          partnerName: name,
          message,
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("❌ User Disconnected:", socket.id);

      // Remove from waiting queue if present
      const queueIndex = waitingUsers.findIndex(
        (user) => user.socketId === socket.id
      );
      if (queueIndex !== -1) {
        console.log(`🚫 Removed ${waitingUsers[queueIndex].name} from queue`);
        waitingUsers.splice(queueIndex, 1);
      }

      // Notify partner if in an active chat
      const partnerSocketId = activeChats.get(socket.id);
      if (partnerSocketId) {
        io.to(partnerSocketId).emit("partnerDisconnected");
        activeChats.delete(partnerSocketId);
      }

      // Remove from active chats
      activeChats.delete(socket.id);
    });
  });

  return io;
}
