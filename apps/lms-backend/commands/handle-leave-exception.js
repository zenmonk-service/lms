require("dotenv").config();
const { Command } = require("commander");
const { dbConnection } = require("../config");
const { leaveExceptions } = require("../cron-jobs/leave-exceptions");

const program = new Command();

program
  .name("handle-leave-exception")
  .description("handle sandwich, clubbing and PDL exceptions")
  .requiredOption(
    "-o, --organization_uuid <organization_uuid>",
    "Organization UUID",
  )
  .action(async (options) => {
    try {
      await dbConnection.checkConnection();

      await leaveExceptions(options.organization_uuid);
      process.exit(0);
    } catch (error) {
      console.error("handle-leave-exceptions failed:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);
