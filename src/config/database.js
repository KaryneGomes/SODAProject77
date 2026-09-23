const { Sequelize } = require("sequelize");
require("dotenv").config();

const dialect = process.env.DB_DIALECT || "sqlite";
const config = { dialect };

if (dialect === "sqlite") {
  config.storage = process.env.DB_STORAGE || "./soda.sqlite";
} else {
  config.host = process.env.DB_HOST || "localhost";
  config.port = process.env.DB_PORT || 3306;
}

const sequelize = new Sequelize(
  process.env.DB_NAME || "soda",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  config
);

module.exports = sequelize;