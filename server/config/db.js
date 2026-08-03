const { Sequelize } = require("sequelize");
const pg = require("pg");
require("dotenv").config();

// A Vercel empacota a função serverless com node-file-trace, que so enxerga
// requires estaticos. O carregador de dialeto do Sequelize faz
// require(caminho) dinamicamente, entao o pacote "pg" fica de fora do bundle
// e a funcao quebra em runtime com "Please install pg package manually".
// Passar dialectModule explicitamente evita esse require dinamico.
// DATABASE_URL cobre provedores hospedados (Neon, Supabase, Vercel Postgres,
// Railway etc.), que expõem uma connection string em vez de host/porta
// separados. Sem ela, cai nas variáveis individuais (com os defaults de
// desenvolvimento local de sempre).
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectModule: pg,
      logging: false,
      dialectOptions: process.env.DB_SSL === "false"
        ? {}
        : { ssl: { require: true, rejectUnauthorized: false } },
    })
  : new Sequelize(
      process.env.SEQUELIZE_DB || "carbon",
      process.env.SEQUELIZE_USER || "postgres",
      process.env.SEQUELIZE_PASS,
      {
        host: process.env.SEQUELIZE_HOST || "localhost",
        port: process.env.SEQUELIZE_PORT || 5432,
        dialect: "postgres",
        dialectModule: pg,
        logging: false,
      }
    );

module.exports = sequelize;
