require("dotenv").config();
const { Command } = require("commander");
const { dbConnection } = require("../config");
const { expiryLeaveRequests } = require("../cron-jobs/expiry-leave-request");

const program = new Command();

program
  .name("handle-expiry-leave-request")
  .description("Expire pending leave requests")
  .requiredOption(
    "-o, --organization_uuid <organization_uuid>",
    "Organization UUID"
  )
  .action(async (options) => {
    try {
      await dbConnection.checkConnection();

      await expiryLeaveRequests(options.organization_uuid);

      process.exit(0);
    } catch (error) {
      console.error("handle-leave-balances failed:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);