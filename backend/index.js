import express, { urlencoded } from "express";
import http from "http";
import socketIo from "socket.io";
// import db from "./config/db.js";

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

export { app, io };
