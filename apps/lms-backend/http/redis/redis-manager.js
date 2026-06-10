const { createClient } = require("redis");

class RedisManager {
  static instance;

  constructor() {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;
    const password = process.env.REDIS_PASSWORD;

    const clientConfig = {
      socket: { host, port: Number(port) },
      password,
    };

    this.client = createClient(clientConfig);
    this.client.connect();

    this.subscriber = createClient(clientConfig);
    this.subscriber.connect();
  }

  static getInstance() {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  async publishMessage(channel, message) {
    try {
      await this.client.publish(channel, JSON.stringify(message));
    } catch (err) {
      console.error("❌ Publish Error:", err);
    }
  }

  async consumeMessages(pattern = "*", handler) {
    try {
      await this.subscriber.pSubscribe(pattern, (message, channel) => {
        if (channel == "notification_events") {
          try {
            const { organization_uuid, notification_uuid } =
              JSON.parse(message);
            handler(organization_uuid, notification_uuid);
          } catch (err) {}
        }
      });
    } catch (err) {}
  }
}

module.exports = { RedisManager };
