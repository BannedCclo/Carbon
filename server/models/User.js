const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sobrenome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endereco: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        estruturaValida(endereco) {
          if (typeof endereco !== "object" || endereco === null) {
            throw new Error("Endereço deve ser um objeto");
          }

          const obrigatorios = [
            "estado",
            "cidade",
            "bairro",
            "logradouro",
            "numero",
            "cep",
          ];

          for (const campo of obrigatorios) {
            if (!endereco[campo] || typeof endereco[campo] !== "string") {
              throw new Error(
                `Campo "${campo}" é obrigatório e deve ser uma string`
              );
            }
          }
        },
      },
    },
    verificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    codigoVerificacao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "usuarios",
    timestamps: false,
  }
);

module.exports = Usuario;
