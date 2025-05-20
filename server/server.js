const express = require("express");
const cors = require("cors");
const path = require("path");

require("./models/User");
require("./models/Carro");

const sequelize = require("./config/db");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const carrosRoutes = require("./routes/carros");
const usersRoutes = require("./routes/users");
const cepRoutes = require("./routes/cep");

app.use("/api/carros", carrosRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/cep", cepRoutes);

sequelize
  .authenticate()
  .then(() => {
    console.log("🟢 Conectado ao PostgreSQL com sucesso!", __dirname);
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no banco:", err);
  });

app.get("/teste", (req, res) => {
  console.log(res);
});
