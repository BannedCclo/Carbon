const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

router.post("/", async (req, res) => {
  try {
    const novoUser = await User.create(req.body);
    res.status(201).json(novoUser);
  } catch (err) {
    res.status(400).json({ erro: "Erro ao criar usuário", detalhes: err });
  }
});

module.exports = router;
