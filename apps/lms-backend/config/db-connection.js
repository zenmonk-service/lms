const { Sequelize } = require("sequelize");

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
    }
};

// Immediately check the database connection
// (async () => {
//     const isConnected = await checkConnection();
//     if (!isConnected) {
//         process.exit(1);
//     }
// })();

module.exports = {
    sequelize,
    checkConnection,
};
