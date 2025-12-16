const redis = require("ioredis");

const redisConfig = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
};

function connectRedisClient() {
  let redisClient = new redis(redisConfig);

  redisClient.on("error", (err) => {
    console.log("Redis error: " + err);
    process.exit(1);
  });

  redisClient.on("connect", () => {
    console.log(`Redis is connected`);
  });

  return redisClient;
}

module.exports = {
  connectRedisClient,
};
