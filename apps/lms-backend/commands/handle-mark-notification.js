require("dotenv").config();
const { Command } = require("commander");
const { dbConnection } = require("../config");
const { RedisManager } = require("../http/redis/redis-manager");
const { markNotification } = require("../services/notification-service");
const { RedisChannel } = require("@repo/common");

const program = new Command();

program
    .name("handle-mark-notification")
    .description("Mark notifications as read.")
    .action(async () => {
        try {
            await dbConnection.checkConnection();

            await RedisManager.getInstance().consumeMessages(RedisChannel.ENUM.NOTIFICATION_EVENTS, markNotification);
        } catch (error) {
            console.error("handle-leave-balances failed:", error);
        }
    });

program.parse(process.argv);
