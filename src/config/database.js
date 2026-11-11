const { Sequelize } = require("sequelize");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL;
const dialect = process.env.DB_DIALECT || (databaseUrl ? "postgres" : "sqlite");
const config = { dialect };

if (databaseUrl) {
  if (process.env.DB_SSL === "true") {
    config.dialectOptions = {
      ssl: {
        require: true,
        rejectUnauthorized: true,
      },
    };
  }
} else if (dialect === "sqlite") {
  config.storage = process.env.DB_STORAGE || "./soda.sqlite";
} else {
  config.host = process.env.DB_HOST || "localhost";
  config.port = process.env.DB_PORT || (dialect === "postgres" ? 5432 : 3306);
}

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, config)
  : new Sequelize(
      process.env.DB_NAME || "soda",
      process.env.DB_USER || "root",
      process.env.DB_PASSWORD || "",
      config
    );

module.exports = sequelize;