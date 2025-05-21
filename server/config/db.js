const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  "carbon",
  "postgres",
  process.env.SEQUELIZE_PASS,
  {
    host: "localhost",
    dialect: "postgres",
    logging: false,
  }
);

module.exports = sequelize;
