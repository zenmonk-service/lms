const { getSchema } = require("./schema");

async function setSearchPath(transaction) {

    const schema = getSchema();

    await transaction.sequelize.query(

        `SET LOCAL search_path TO "${schema}", public`,

        {
            transaction
        }

    );
}

module.exports = {
    setSearchPath
};