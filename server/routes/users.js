const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const enviarEmailVerificacao = require("../utils/enviarEmail");
require("dotenv").config();

const jwtPass = process.env.JWT_SECRET;

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || user.senha !== senha) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, tipo: user.tipo, nome: user.nome || "user" },
      jwtPass,
      { expiresIn: "168h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro no login" });
  }
});

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

router.get("/id/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar usuário", detalhes: err });
  }
});

router.put("/id/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, sobrenome, telefone, endereco } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    user.nome = nome || user.nome;
    user.sobrenome = sobrenome || user.sobrenome;
    user.telefone = telefone || user.telefone;
    user.endereco = endereco || user.endereco;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar usuário", detalhes: err });
  }
});

router.delete("/id/:id", async (req, res) => {
  const { id } = req.params;
  const { senha } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    if (user.senha !== senha) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    await user.destroy();
    res.json({ mensagem: "Conta deletada com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar usuário", detalhes: err });
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

router.post("/request-email-change", async (req, res) => {
  const { id } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const codigo = crypto.randomInt(100000, 999999).toString();
    user.codigoVerificacao = codigo;
    await user.save();

    await enviarEmailVerificacao(user.email, codigo);

    res.json({ mensagem: "Código de verificação enviado para o e-mail atual" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao solicitar mudança de e-mail", detalhes: err });
  }
});

router.post("/confirm-email-change", async (req, res) => {
  const { id, code, newEmail } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    if (user.codigoVerificacao != code) {
      return res.status(400).json({ erro: "Código de verificação inválido" });
    }

    const emailInUse = await User.findOne({ where: { email: newEmail } });
    if (emailInUse && emailInUse.id !== user.id) {
      return res.status(400).json({ erro: "O novo e-mail já está em uso" });
    }

    const novoCodigo = crypto.randomInt(100000, 999999).toString();
    user.email = newEmail;
    user.verificado = false;
    user.codigoVerificacao = novoCodigo;
    await user.save();

    await enviarEmailVerificacao(newEmail, novoCodigo);

    res.json({ mensagem: "E-mail alterado. Verifique o novo e-mail." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao confirmar mudança de e-mail", detalhes: err });
  }
});

router.post("/request-password-change", async (req, res) => {
  const { id } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const codigo = crypto.randomInt(100000, 999999).toString();
    user.codigoVerificacao = codigo;
    await user.save();

    await enviarEmailVerificacao(user.email, codigo);

    res.json({ mensagem: "Código de verificação enviado para o seu e-mail" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao solicitar mudança de senha", detalhes: err });
  }
});

router.post("/confirm-password-change", async (req, res) => {
  const { id, code, newPassword } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    if (user.codigoVerificacao != code) {
      return res.status(400).json({ erro: "Código de verificação inválido" });
    }

    user.senha = newPassword;
    user.codigoVerificacao = null;
    await user.save();

    res.json({ mensagem: "Senha alterada com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao confirmar mudança de senha", detalhes: err });
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
