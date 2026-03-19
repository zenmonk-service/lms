import { WebSocket } from "ws";
import { SubscriptionManager } from "./subscription-manager";

export class User {
  private id: string;
  private ws: WebSocket;

  private HEARTBEAT_INTERVAL = 1000 * 5;
  private HEARTBEAT_VALUE = 1;

  private interval: NodeJS.Timeout;

  constructor(id: string, ws: WebSocket) {
    this.id = id;
    this.ws = ws;

    // ✅ initialize
    (this.ws as any).isAlive = true;

    this.startListening();
    this.startHeartbeat();
  }

  emit(message: any) {
    this.ws.send(JSON.stringify(message));
  }

  private ping() {
    this.ws.send(Buffer.from([this.HEARTBEAT_VALUE]));
  }

  private startHeartbeat() {
    this.interval = setInterval(() => {
      const socket = this.ws as any;

      if (!socket.isAlive) {
        console.log(`❌ Terminating dead socket: ${this.id}`);
        this.ws.terminate();
        clearInterval(this.interval);
        return;
      }

      socket.isAlive = false;
      this.ping();
    }, this.HEARTBEAT_INTERVAL);
  }

  private startListening() {
    this.ws.on("message", (data, isBinary) => {
      // ✅ 1. Handle heartbeat FIRST
      if (isBinary && (data as any)[0] === this.HEARTBEAT_VALUE) {
        console.log('data: ', data);
        (this.ws as any).isAlive = true;
        return;
      }

      // ✅ 2. Then parse JSON
      let parsed;
      try {
        parsed = JSON.parse(data.toString());
      } catch (err) {
        console.error("Invalid JSON:", data.toString());
        return;
      }

      const { organization, action } = parsed;

      console.log("organization:", organization);
      console.log("action:", action);

      if (action === "subscribe") {
        SubscriptionManager.getInstance().subscribe(organization, this.id);
      } else if (action === "unsubscribe") {
        SubscriptionManager.getInstance().unsubscribe(organization, this.id);
      }
    });

    this.ws.on("close", () => {
      console.log(`🔌 Connection closed: ${this.id}`);
      clearInterval(this.interval);
    });

    this.ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  }
}