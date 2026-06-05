import { createClient, RedisClientType } from "redis";
import { UserManager } from "./user-manager";

export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private subscriptions = new Map<string, Set<string>>();
  private activeChannels = new Set<string>();
  private client: RedisClientType;
  private userIdToUuid = new Map<string, string>();

  constructor() {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;
    const password = process.env.REDIS_PASSWORD;
    this.client = createClient({
      socket: {
        host,
        port: Number(port),
      },
      password,
    });
    this.client.connect();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SubscriptionManager();
    }

    return this.instance;
  }

  subscribe(organization: string, id: string, user_uuid: string) {
    const existingOrganization = this.subscriptions.has(organization);

    if (!existingOrganization) {
      this.subscriptions.set(organization, new Set());
    }
    const subscribers = this.subscriptions.get(organization);

    if (subscribers?.has(id)) {
      console.log("current org subs", Array.from(subscribers));
      return;
    }
    console.log('user_uuid: ', user_uuid);
    this.userIdToUuid.set(id, user_uuid);

    subscribers?.add(id);

    if (!this.activeChannels.has(organization)) {
      this.activeChannels.add(organization);
      this.client.subscribe(organization, (message: string) => {
        let parsedMessage: { send_to: string | string[]; message: string };

        try {
          parsedMessage = JSON.parse(message);
        } catch (error) {
          console.error("Invalid Redis message:", message);
          return;
        }

        const sendTo = parsedMessage.send_to;
        console.log('sendTo: ', sendTo);

        this.subscriptions.get(organization)?.forEach((subscriberId) => {
          const userUuid = this.userIdToUuid.get(subscriberId);
          const shouldSend =
            sendTo === "everyone" ||
            sendTo === userUuid 

            console.log('shouldSend: ', shouldSend);
          if (shouldSend) {
            UserManager.getInstance().getUser(subscriberId)?.emit(parsedMessage);
          }
        });
      });
    }

    console.log("current org subs", Array.from(subscribers ?? []));
  }

  public unsubscribe(organization: string, id: string) {
    const subscribers = this.subscriptions.get(organization);
    if (!subscribers || !subscribers.has(id)) {
      return;
    }

    subscribers.delete(id);
    this.userIdToUuid.delete(id);

    if (subscribers.size === 0) {
      this.subscriptions.delete(organization);
      if (this.activeChannels.has(organization)) {
        this.activeChannels.delete(organization);
        this.client.unsubscribe(organization);
      }
    }
  }
}
