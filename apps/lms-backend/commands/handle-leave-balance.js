require("dotenv").config();
const { Command } = require("commander");
const { dbConnection } = require("../config");
const { leaveBalanceService } = require("../services");
const { updateLeaveBalance } = require("../cron-jobs/leave-balances");

const program = new Command();

program
    .name("handle-leave-balances")
    .description("Dispatch messages with an optional limit")
    .action(async () => {
        try {
            await dbConnection.checkConnection();

            await updateLeaveBalance();
            process.exit(0);
        } catch (error) {
            console.error("handle-leave-balances failed:", error);
            process.exit(1)
        }
    });

program.parse(process.argv);
