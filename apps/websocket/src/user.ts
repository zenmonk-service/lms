import { WebSocket } from "ws";
import { SubscriptionManager } from "./subscription-manager";

export class User {
  private id: string;
  private ws: WebSocket;

  constructor(id: string, ws: WebSocket) {
    this.id = id;
    this.ws = ws;
    this.startListening();
  }

  emit(message) {
    this.ws.send(JSON.stringify(message))
  }

  startListening() {
    this.ws.on("message", (data) => {
      const { organization, action } = JSON.parse(data);
      console.log('action: ', action);

      if (action == "subscribe") {
        SubscriptionManager.getInstance().subscribe(organization, this.id);
      } else {
        SubscriptionManager.getInstance().unsubscribe(organization, this.id)
      }
    });
  }
}
