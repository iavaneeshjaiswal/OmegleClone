import http from "http";
import express, { urlencoded } from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import cors from "cors";
import { setupSocket } from "./socket.js";

const server = http.createServer(app);

// Connection from MongoDB
connectDb();

//🔥 Initialize Socket.io
setupSocket(server);

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
