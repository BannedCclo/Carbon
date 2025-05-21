const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("carbon", "postgres", "1809", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

module.exports = sequelize;
