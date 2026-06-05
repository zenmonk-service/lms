require("dotenv").config();
const { Command } = require("commander");
const { dbConnection } = require("../config");
const { createWeekOffEntries } = require("../cron-jobs/weekoffs");

const program = new Command();

program
  .name("handle-week-offs")
  .description("Create week off attendance entries for the next 3 months")
  .action(async () => {
    try {
      await dbConnection.checkConnection();

      await createWeekOffEntries();
      process.exit(0);
    } catch (error) {
      console.error("handle-week-offs failed:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);
