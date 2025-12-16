const { Umzug, SequelizeStorage } = require("umzug");
const { Sequelize } = require("sequelize");
const config = require("../config/config")[process.env.NODE_ENV];

exports.createSchemaAndRunMigrations = async (schema) => {
  const sequelize = new Sequelize(config);
  await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

  const migrator = new Umzug({
    migrations: {
      glob: "migrations/tenants/*.js",
      resolve: ({ name, path }) => {
        const migration = require(path);
        return {
          name,
          up: async ({ context }) => migration.up(context, Sequelize, schema),
          down: async ({ context }) =>
            migration.down(context, Sequelize, schema),
        };
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, schema }),
    logger: console,
  });

  await migrator.up();
  await sequelize.close();
};
