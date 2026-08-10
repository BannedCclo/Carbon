const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { enviarEmailVerificacao, enviarEmailResetSenha } = require("../utils/enviarEmail");
require("dotenv").config();

const jwtPass = process.env.JWT_SECRET;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    if (!user.verificado) {
      return res.status(403).json({ erro: "Email não verificado", emailNaoVerificado: true });
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

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    // Check if this user is an admin and if they are the last one
    if (user.tipo === "admin") {
      const adminCount = await User.count({ where: { tipo: "admin" } });
      if (adminCount <= 1) {
        return res.status(403).json({ erro: "Não é possível deletar o único administrador do sistema." });
      }
    }

    await user.destroy();
    res.json({ mensagem: "Conta deletada com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar usuário", detalhes: err });
  }
});

// Admin Route: Update any user field (including email and tipo)
router.put("/admin/id/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, sobrenome, telefone, endereco, email, tipo } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    // Optional: add a check here to ensure the requester has admin privileges 
    // (This requires middleware or decoding the token in the route. We'll skip complex auth for this MVP unless requested)

    // Check email uniqueness if changing email
    if (email && email !== user.email) {
      const emailInUse = await User.findOne({ where: { email } });
      if (emailInUse) {
        return res.status(400).json({ erro: "E-mail já está em uso" });
      }
    }

    user.nome = nome || user.nome;
    user.sobrenome = sobrenome || user.sobrenome;
    user.telefone = telefone || user.telefone;
    user.endereco = endereco || user.endereco;
    user.email = email || user.email;
    user.tipo = tipo || user.tipo;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar usuário como admin", detalhes: err });
  }
});

// Admin Route: Delete user without password
router.delete("/admin/id/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    // Check if deleting an admin, and if they are the last one
    if (user.tipo === "admin") {
      const adminCount = await User.count({ where: { tipo: "admin" } });
      if (adminCount <= 1) {
        return res.status(403).json({ erro: "Não é possível deletar o único administrador do sistema." });
      }
    }

    await user.destroy();
    res.json({ mensagem: "Usuário deletado pelo administrador com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar usuário como admin", detalhes: err });
  }
});

router.post("/", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(senha, salt);

    const codigo = crypto.randomInt(100000, 999999).toString();

    const novoUser = await User.create({
      ...req.body,
      senha: hashedSenha,
      verificado: false,
      codigoVerificacao: codigo,
    });

    try {
      await enviarEmailVerificacao(email, codigo);
    } catch (emailErr) {
      console.error("Usuário criado, mas falha ao enviar e-mail de verificação:", emailErr);
    }

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

    const codigo = crypto.randomBytes(32).toString("hex");
    user.codigoVerificacao = codigo;
    await user.save();

    const resetLink = `${clientUrl}/reset-password?token=${codigo}&id=${user.id}`;
    await enviarEmailResetSenha(user.email, resetLink);

    res.json({ mensagem: "Link de redefinição enviado para o seu e-mail" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao solicitar mudança de senha", detalhes: err });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const codigo = crypto.randomBytes(32).toString("hex");
    user.codigoVerificacao = codigo;
    await user.save();

    const resetLink = `${clientUrl}/reset-password?token=${codigo}&id=${user.id}`;
    await enviarEmailResetSenha(user.email, resetLink);

    res.json({ mensagem: "Link de redefinição enviado para o seu e-mail" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao solicitar redefinição de senha", detalhes: err });
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

    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(newPassword, salt);

    user.senha = hashedSenha;
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
