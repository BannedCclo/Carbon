const express = require("express");
const cors = require("cors");
const path = require("path");

require("./models/User");
const Carro = require("./models/Carro");
const CarroImagem = require("./models/CarroImagem");

Carro.hasMany(CarroImagem, { foreignKey: "carro_id", as: "imagens", onDelete: "CASCADE" });
CarroImagem.belongsTo(Carro, { foreignKey: "carro_id" });

const sequelize = require("./config/db");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const authRoutes = require("./routes/auth");
const carrosRoutes = require("./routes/carros");
const usersRoutes = require("./routes/users");
const cepRoutes = require("./routes/cep");
const contactRoutes = require("./routes/contact");

app.use("/api/auth", authRoutes);
app.use("/api/carros", carrosRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/cep", cepRoutes);
app.use("/api/contact", contactRoutes);

app.get("/teste", (req, res) => {
  console.log(res);
});

sequelize
  .authenticate()
  .then(() => {
    console.log("🟢 Conectado ao PostgreSQL com sucesso!", __dirname);
    return sequelize.sync({ alter: true });
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no banco:", err);
  });

// Na Vercel o arquivo é importado e o app é invocado diretamente como
// função serverless — não existe processo de longa duração para dar
// listen(). Rodar app.listen() só localmente evita porta duplicada e
// deixa claro qual é o entrypoint que a Vercel deve consumir.
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  });
}

module.exports = app;
