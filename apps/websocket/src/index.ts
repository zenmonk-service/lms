import { WebSocket, WebSocketServer } from "ws";
import { UserManager } from "./user-manager";

const wss = new WebSocketServer({port: 8083});

wss.on('connection', (ws: WebSocket) => {
    UserManager.getInstance().addUser(ws)
})