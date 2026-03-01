const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CarroImagem = sequelize.define(
  "CarroImagem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    carro_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    imagem_base64: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
  },
  {
    tableName: "carro_imagens",
    timestamps: false,
  }
);

module.exports = CarroImagem;
