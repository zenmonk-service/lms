import { WebSocket, WebSocketServer } from "ws";
import { UserManager } from "./user-manager";

const wss = new WebSocketServer({
  port: Number(process.env.WEBSOCKET_PORT) | 8083,
});

wss.on("connection", (ws: WebSocket) => {
  UserManager.getInstance().addUser(ws);
});
