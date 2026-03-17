const { createClient } = require('redis');

class RedisManager {
  static instance;

  constructor() {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;
    const password = process.env.REDIS_PASSWORD;

    this.client = createClient({
      socket: {
        host,
        port: Number(port),
      },
      password
    });

    this.client.connect();
  }

  static getInstance() {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  async publishMessage(channel, message) {
    try {
      console.log('📢 channel:', channel);
      await this.client.publish(channel, JSON.stringify(message));
    } catch (err) {
      console.error('❌ Publish Error:', err);
    }
  }
}

module.exports = { RedisManager };