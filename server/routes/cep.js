const express = require("express");
const router = express.Router();
const cep = require("cep-promise");

router.get("/:cep", async (req, res) => {
  try {
    const resultado = await cep(req.params.cep);
    res.json(resultado);
  } catch (erro) {
    res.status(400).json({ erro: "CEP inválido ou não encontrado" });
  }
});

module.exports = router;
