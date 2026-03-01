const express = require('express');
const router = express.Router();
const Carro = require('../models/Carro');
const CarroImagem = require('../models/CarroImagem');

router.get('/', async (req, res) => {
  const carros = await Carro.findAll({
    include: [{ model: CarroImagem, as: 'imagens' }]
  });
  res.json(carros);
});

router.get('/:id', async (req, res) => {
  const carro = await Carro.findByPk(req.params.id, {
    include: [{ model: CarroImagem, as: 'imagens' }]
  });
  if (!carro) return res.status(404).json({ erro: 'Carro não encontrado' });
  res.json(carro);
});

router.post('/', async (req, res) => {
  try {
    const { imagensBase64, ...carroData } = req.body;
    const novoCarro = await Carro.create(carroData);

    if (imagensBase64 && Array.isArray(imagensBase64) && imagensBase64.length > 0) {
      const imagesToCreate = imagensBase64.map(base64 => ({
        carro_id: novoCarro.id,
        imagem_base64: base64
      }));
      await CarroImagem.bulkCreate(imagesToCreate);
    }

    const carroCriado = await Carro.findByPk(novoCarro.id, {
      include: [{ model: CarroImagem, as: 'imagens' }]
    });

    res.status(201).json(carroCriado);
  } catch (error) {
    res.status(400).json({ erro: 'Erro ao criar carro', detalhes: error });
  }
});

router.put('/:id', async (req, res) => {
  const carro = await Carro.findByPk(req.params.id);
  if (!carro) return res.status(404).json({ erro: 'Carro não encontrado' });

  try {
    const { imagensBase64, ...carroData } = req.body;
    await carro.update(carroData);

    if (imagensBase64 && Array.isArray(imagensBase64)) {
      // Remover todas as imagens antigas associadas ao carro
      await CarroImagem.destroy({ where: { carro_id: carro.id } });

      // Inserir as novas imagens
      if (imagensBase64.length > 0) {
        const imagesToCreate = imagensBase64.map((base64) => ({
          carro_id: carro.id,
          imagem_base64: base64,
        }));
        await CarroImagem.bulkCreate(imagesToCreate);
      }
    }

    const carroAtualizado = await Carro.findByPk(carro.id, {
      include: [{ model: CarroImagem, as: 'imagens' }],
    });

    res.json(carroAtualizado);
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
