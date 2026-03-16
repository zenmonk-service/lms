const {createClient} = require('redis');

 class RedisManager {
    static instance;

    constructor() {
        this.client = createClient();
        this.client.connect();
    }

    static getInstance() {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }

        return RedisManager.instance;
    }

    publishMessage(channel, message) {
        console.log('channel: ', channel);
        this.client.publish(channel, JSON.stringify(message));
    }
}

module.exports = {RedisManager}