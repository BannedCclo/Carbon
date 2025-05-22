const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Carro = sequelize.define(
  "Carro",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    marca: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    modelo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ano: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    preco: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    rodagem_km: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cor: {
      type: DataTypes.STRING,
      defaultValue: "Não especificada",
    },
    cambio: {
      type: DataTypes.STRING,
      defaultValue: "Não especificado",
    },
    combustivel: {
      type: DataTypes.STRING,
      defaultValue: "Não especificado",
    },
    potencia_cv: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    descricao: {
      type: DataTypes.TEXT,
    },
    categoria: {
      type: DataTypes.ENUM("sport", "suv", "sedan"),
      allowNull: false,
    },
  },
  {
    tableName: "carros",
    timestamps: false,
  }
);

module.exports = Carro;
