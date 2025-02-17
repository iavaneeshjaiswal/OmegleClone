import http from "http";
import { app, io } from "./index.js";
import dotenv from "dotenv";

dotenv.config();

const server = http.createServer(app);

io.attach(server);

app.use("/api/users", require("./src/routes/user.routes"));
app.use("/api/chat", require("./src/routes/chat.routes"));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
