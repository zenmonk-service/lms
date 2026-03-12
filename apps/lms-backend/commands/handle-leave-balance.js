require("dotenv").config();
const { Command } = require("commander");
const { dbConnection } = require("../config");
const { leaveBalanceService } = require("../services");

const program = new Command();

program
    .name("handle-leave-balances")
    .option('-o, --organization_id <organization id>', 'Organization Id')
    .description("Dispatch messages with an optional limit")
    .action(async (option) => {
        const { organization_id } = option;
        try {
            await dbConnection.checkConnection();

            await leaveBalanceService.allotLeaveBalance({ query: { organization_id } });
            process.exit(0);
        } catch (error) {
            process.exit(1)
        }
    });

program.parse(process.argv);