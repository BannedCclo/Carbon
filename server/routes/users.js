const express = require("express");
const router = express.Router();
const User = require("../models/User");
const crypto = require("crypto");
const enviarEmailVerificacao = require("../utils/enviarEmail");

router.get("/", async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

router.get("/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar usuário", detalhes: err });
  }
});

router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    const codigo = crypto.randomInt(100000, 999999).toString();

    const novoUser = await User.create({
      ...req.body,
      verificado: false,
      codigoVerificacao: codigo,
    });

    await enviarEmailVerificacao(email, codigo);

    res.status(201).json({
      mensagem: "Usuário criado. Verifique seu e-mail.",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ erro: "Erro ao criar usuário", detalhes: err });
  }
});

router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    if (user.verificado) {
      return res.status(400).json({ erro: "Usuário já verificado" });
    }

    const codigo = crypto.randomInt(100000, 999999).toString();
    user.codigoVerificacao = codigo;
    await user.save();

    await enviarEmailVerificacao(email, codigo);

    res.json({ mensagem: "Código de verificação reenviado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao reenviar código", detalhes: err });
  }
});

router.post("/verify", async (req, res) => {
  const { email, code } = req.body;
  console.log("Verificando usuário:", email, code);
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    if (user.verificado) {
      return res.status(400).json({ erro: "Usuário já verificado" });
    }

    if (user.codigoVerificacao != code) {
      return res.status(400).json({ erro: "Código de verificação inválido" });
    }

    user.verificado = true;
    user.codigoVerificacao = null;
    await user.save();

    res.json({ mensagem: "Usuário verificado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao verificar usuário", detalhes: err });
  }
});

module.exports = router;
