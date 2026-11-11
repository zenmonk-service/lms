import { createClient, RedisClientType } from "redis";
import { UserManager } from "./user-manager";

export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private subscriptions = new Map<string, Set<string>>();
  private querySubscriptions = new Map<string, Set<string>>();
  private activeChannels = new Set<string>();
  private publisher: RedisClientType;
  private subscriber: RedisClientType;
  private userIdToUuid = new Map<string, string>();

  constructor() {
    const host = process.env.REDIS_HOST;
    const port = Number(process.env.REDIS_PORT);
    const password = process.env.REDIS_PASSWORD;

    this.publisher = createClient({
      socket: {
        host,
        port,
      },
      password,
    });

    this.subscriber = this.publisher.duplicate();

    this.publisher.connect();
    this.subscriber.connect();
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
    this.userIdToUuid.set(id, user_uuid);

    subscribers?.add(id);

    if (!this.activeChannels.has(organization)) {
      this.activeChannels.add(organization);
      this.subscriber.subscribe(organization, (message: string) => {
        let parsedMessage: { send_to: string | string[]; message: string };

        try {
          parsedMessage = JSON.parse(message);
        } catch (error) {
          console.error("Invalid Redis message:", message);
          return;
        }

        const sendTo = parsedMessage.send_to;

        this.subscriptions.get(organization)?.forEach((subscriberId) => {
          const userUuid = this.userIdToUuid.get(subscriberId);
          const shouldSend =
            sendTo === "everyone" ||
            (Array.isArray(sendTo) && sendTo.includes(userUuid ?? "")) ||
            sendTo === userUuid;

          if (shouldSend) {
            UserManager.getInstance()
              .getUser(subscriberId)
              ?.emit(parsedMessage);
          }
        });
      });
    }

    console.log("current org subs", Array.from(subscribers ?? []));
  }

  subscribeQuery(organization: string, query_uuid: string, id: string, user_uuid: string) {
    const channel = `query:${organization}:${query_uuid}`;
    const key = `${organization}:${query_uuid}`;

    if (!this.querySubscriptions.has(key)) {
      this.querySubscriptions.set(key, new Set());
    }

    const subscribers = this.querySubscriptions.get(key);
    if (subscribers?.has(id)) {
      return;
    }

    this.userIdToUuid.set(id, user_uuid);
    subscribers?.add(id);

    if (!this.activeChannels.has(channel)) {
      this.activeChannels.add(channel);
      this.subscriber.subscribe(channel, (message: string) => {
        let parsedMessage: { send_to: string | string[]; [key: string]: any };

        try {
          parsedMessage = JSON.parse(message);
        } catch (error) {
          console.error("Invalid query Redis message:", message);
          return;
        }

        const sendTo = parsedMessage.send_to;

        this.querySubscriptions.get(key)?.forEach((subscriberId) => {
          const userUuid = this.userIdToUuid.get(subscriberId);
          const shouldSend =
            sendTo === "everyone" ||
            (Array.isArray(sendTo) && sendTo.includes(userUuid ?? "")) ||
            sendTo === userUuid;

          if (shouldSend) {
            UserManager.getInstance()
              .getUser(subscriberId)
              ?.emit(parsedMessage);
          }
        });
      });
    }
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
        this.subscriber.unsubscribe(organization);
      }
    }
  }

  unsubscribeQuery(organization: string, query_uuid: string, id: string) {
    const key = `${organization}:${query_uuid}`;
    const subscribers = this.querySubscriptions.get(key);
    if (!subscribers || !subscribers.has(id)) {
      return;
    }

    subscribers.delete(id);

    if (subscribers.size === 0) {
      this.querySubscriptions.delete(key);
      const channel = `query:${organization}:${query_uuid}`;
      if (this.activeChannels.has(channel)) {
        this.activeChannels.delete(channel);
        this.subscriber.unsubscribe(channel);
      }
    }
  }

  public markNotification(organization_uuid: string, notification_uuid?: string | null, user_uuid?: string | null) {
    if(notification_uuid) this.publisher.publish("notification_events", JSON.stringify({ notification_uuid, organization_uuid }));
    if(user_uuid) this.publisher.publish("notification_events", JSON.stringify({ user_uuid, organization_uuid }));
  }
}
