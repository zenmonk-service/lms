import { WebSocket } from "ws";
import { SubscriptionManager } from "./subscription-manager";
import { UserManager } from "./user-manager";

export class User {
  private id: string;
  private ws: WebSocket;
  private organization?: string;
  // "<organization>:<query_uuid>" keys this socket listens to, so they can be released on close.
  private queryKeys = new Set<string>();

  private HEARTBEAT_INTERVAL = 1000 * 5;
  private HEARTBEAT_VALUE = 1;

  private interval?: NodeJS.Timeout;

  constructor(id: string, ws: WebSocket) {
    this.id = id;
    this.ws = ws;

    (this.ws as any).isAlive = true;

    this.startListening();
    this.startHeartbeat();
  }

  emit(message: any) {
    if (this.ws.readyState !== WebSocket.OPEN) return;
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

      const { organization, action, user_uuid, notification_uuid, query_uuid } = parsed;
      if (action === "subscribe") {
        this.organization = organization;
        SubscriptionManager.getInstance().subscribe(organization, this.id, user_uuid);
      } else if (action === "unsubscribe") {
        SubscriptionManager.getInstance().unsubscribe(organization, this.id);
        this.organization = undefined;
      } else if (action === "subscribe_query") {
        if (organization && query_uuid) {
          this.queryKeys.add(`${organization}:${query_uuid}`);
          SubscriptionManager.getInstance().subscribeQuery(organization, query_uuid, this.id, user_uuid);
        }
      } else if (action === "unsubscribe_query") {
        if (organization && query_uuid) {
          this.queryKeys.delete(`${organization}:${query_uuid}`);
          SubscriptionManager.getInstance().unsubscribeQuery(organization, query_uuid, this.id);
        }
      } else if (action === "mark_notification") {
        SubscriptionManager.getInstance().markNotification(organization, notification_uuid);
      } else if (action === "mark_all_notification") {
        SubscriptionManager.getInstance().markNotification(organization, null, user_uuid);
      }
    });

    this.ws.on("close", () => {
      console.log(`🔌 Connection closed: ${this.id}`);
      this.clearHeartbeat();

      if (this.organization) {
        SubscriptionManager.getInstance().unsubscribe(this.organization, this.id);
      }

      this.queryKeys.forEach((key) => {
        const separator = key.indexOf(":");
        SubscriptionManager.getInstance().unsubscribeQuery(
          key.slice(0, separator),
          key.slice(separator + 1),
          this.id,
        );
      });
      this.queryKeys.clear();

      UserManager.getInstance().removeUser(this.id);
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