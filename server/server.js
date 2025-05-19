const express = require("express");
const cors = require("cors");
const path = require("path");

require("./models/User");
require("./models/Carro");

const sequelize = require("./config/db");
const carrosRoutes = require("./routes/carros");
const usersRoutes = require("./routes/users");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/carros", carrosRoutes);
app.use("/api/users", usersRoutes);

app.get("/api/teste", (req, res) => {
  res.json({ mensagem: "API teste com PostgreSQL!" });
});

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

app.get("/teste-index", (req, res) => {
  const indexPath = path.resolve(__dirname, "public", "index.html");
  console.log("🧪 Enviando:", indexPath);
  res.sendFile(indexPath);
});
