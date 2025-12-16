module.exports = {
  local: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: console.log,
    seederStorage: "sequelize",
    define: {
      underscored: true,
    },
    dialectOptions: {
      useUTC: false,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    timezone: "+05:30", // save dates in IST timezone
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "db-test",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
    seederStorage: "sequelize",
    define: {
      underscored: true,
    },
    dialectOptions: {
      useUTC: false,
    },
    timezone: "+05:30",
  },
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
    seederStorage: "sequelize",
    define: {
      underscored: true,
    },
    dialectOptions: {
      useUTC: false,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    timezone: "+05:30",
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: console.log,
    seederStorage: "sequelize",
    define: {
      underscored: true,
    },
    ssl: false,
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false,
        ca: process.env.DB_CERTIFICATE,
      },
      useUTC: false,
    },
    timezone: "+05:30",
  },
};
