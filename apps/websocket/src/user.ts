import { WebSocket } from "ws";
import { SubscriptionManager } from "./subscription-manager";

export class User {
  private id: string;
  private ws: WebSocket;

  private HEARTBEAT_INTERVAL = 1000 * 5;
  private HEARTBEAT_VALUE = 1;

  private interval?: NodeJS.Timeout;

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
        this.clearHeartbeat();
        return;
      }

      socket.isAlive = false;
      this.ping();
    }, this.HEARTBEAT_INTERVAL);
  }

  private startListening() {
    this.ws.on("message", (data, isBinary) => {
      if (isBinary && (data as any)[0] === this.HEARTBEAT_VALUE) {
        (this.ws as any).isAlive = true;
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(data.toString());
      } catch (err) {
        console.error("Invalid JSON:", data.toString());
        return;
      }

      const { organization, action, user_uuid, notification_uuid } = parsed;

      if (action === "subscribe") {
        SubscriptionManager.getInstance().subscribe(organization, this.id, user_uuid);
      } else if (action === "unsubscribe") {
        SubscriptionManager.getInstance().unsubscribe(organization, this.id);
      } else if(action==="mark_notification") {
        SubscriptionManager.getInstance().markNotification(organization, notification_uuid);
      }
    });

    this.ws.on("close", () => {
      console.log(`🔌 Connection closed: ${this.id}`);
      this.clearHeartbeat();
    });

    this.ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  }

  private clearHeartbeat() {
    if (!this.interval) {
      return;
    }

    clearInterval(this.interval);
    this.interval = undefined;
  }
}
