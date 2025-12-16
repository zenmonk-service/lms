const { Sequelize } = require("sequelize");
const { Umzug, SequelizeStorage } = require("umzug");
const config = require("../config/config")[process.env.NODE_ENV];

exports.runSeeders = async (schema) => {
  const sequelize = new Sequelize(config);
  await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  const seeder = new Umzug({
    migrations: {
      glob: "seeders/tenants/*.js",
      resolve: ({ name, path }) => {
        const seed = require(path);
        return {
          name,
          up: async ({ context }) => seed.up(context, Sequelize, schema),
          down: async ({ context }) => seed.down(context, Sequelize, schema),
        };
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize ,schema }),
    logger: console,
  });
  await seeder.up();
  await sequelize.close();
};
