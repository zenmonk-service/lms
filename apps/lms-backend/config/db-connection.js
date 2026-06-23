const { Sequelize } = require("sequelize");
const { SequelizeError } = require("../middleware/error.js");

if (!process.env.NODE_ENV) {
    console.log("NODE_ENV is not defined.");
    process.exit(128);
}
const config = require("./config.js")[process.env.NODE_ENV];
const sequelize = new Sequelize(config);

const checkConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
        return true;
    } catch (error) {
        console.error("Unable to connect to the database:", error);
         throw new SequelizeError("Unable to connect with database");
    }
};

module.exports = {
    sequelize,
    checkConnection,
};
