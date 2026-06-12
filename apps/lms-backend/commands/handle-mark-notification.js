require("dotenv").config();
const { Command } = require("commander");
const { dbConnection } = require("../config");
const { RedisManager } = require("../http/redis/redis-manager");
const { markNotification } = require("../services/notification-service");

const program = new Command();

program
    .name("handle-mark-notification")
    .description("Mark notifications as read.")
    .action(async () => {
        try {
            await dbConnection.checkConnection();

            await RedisManager.getInstance().consumeMessages('notification_events', markNotification);
        } catch (error) {
            console.error("handle-leave-balances failed:", error);
            process.exit(1)
        }
    });

program.parse(process.argv);
