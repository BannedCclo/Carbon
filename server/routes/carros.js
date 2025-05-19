const express = require('express');
const router = express.Router();
const Carro = require('../models/Carro');

router.get('/', async (req, res) => {
  const carros = await Carro.findAll();
  res.json(carros);
});

router.get('/:id', async (req, res) => {
  const carro = await Carro.findByPk(req.params.id);
  if (!carro) return res.status(404).json({ erro: 'Carro não encontrado' });
  res.json(carro);
});

router.post('/', async (req, res) => {
  try {
    const novoCarro = await Carro.create(req.body);
    res.status(201).json(novoCarro);
  } catch (error) {
    res.status(400).json({ erro: 'Erro ao criar carro', detalhes: error });
  }
});

router.put('/:id', async (req, res) => {
  const carro = await Carro.findByPk(req.params.id);
  if (!carro) return res.status(404).json({ erro: 'Carro não encontrado' });

  try {
    await carro.update(req.body);
    res.json(carro);
  } catch (error) {
    res.status(400).json({ erro: 'Erro ao atualizar carro', detalhes: error });
  }
});

router.delete('/:id', async (req, res) => {
  const carro = await Carro.findByPk(req.params.id);
  if (!carro) return res.status(404).json({ erro: 'Carro não encontrado' });

  await carro.destroy();
  res.status(204).send();
});

module.exports = router;
