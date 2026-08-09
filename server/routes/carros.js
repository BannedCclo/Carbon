const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const Carro = require('../models/Carro');
const CarroImagem = require('../models/CarroImagem');

router.get('/', async (req, res) => {
  const carros = await Carro.findAll({
    include: [{ model: CarroImagem, as: 'imagens' }],
    order: [[{ model: CarroImagem, as: 'imagens' }, 'id', 'ASC']]
  });
  res.json(carros);
});

// A home só precisa do carro em hero e dos carros em destaque, mas GET /
// devolve o estoque inteiro com todas as fotos em base64 de cada carro -
// em produção isso passa de 6MB de JSON, o que em rede móvel real (ao
// contrário de wifi/rede local) demora dezenas de segundos ou mais pra
// baixar e fazer parse, e é a causa raiz do "loading infinito" da hero
// no celular. Esta rota busca só os carros que a home realmente usa.
router.get('/destaques', async (req, res) => {
  const carros = await Carro.findAll({
    where: { [Op.or]: [{ hero: true }, { destaque: true }] },
    include: [{ model: CarroImagem, as: 'imagens' }],
    order: [[{ model: CarroImagem, as: 'imagens' }, 'id', 'ASC']]
  });
  res.json(carros);
});

router.get('/:id', async (req, res) => {
  const carro = await Carro.findByPk(req.params.id, {
    include: [{ model: CarroImagem, as: 'imagens' }],
    order: [[{ model: CarroImagem, as: 'imagens' }, 'id', 'ASC']]
  });
  if (!carro) return res.status(404).json({ erro: 'Carro não encontrado' });
  res.json(carro);
});

router.post('/', async (req, res) => {
  try {
    const { imagensBase64, ...carroData } = req.body;

    // Só pode existir um carro em destaque no hero por vez.
    if (carroData.hero) {
      await Carro.update({ hero: false }, { where: { hero: true } });
    }

    const novoCarro = await Carro.create(carroData);

    if (imagensBase64 && Array.isArray(imagensBase64) && imagensBase64.length > 0) {
      const imagesToCreate = imagensBase64.map(base64 => ({
        carro_id: novoCarro.id,
        imagem_base64: base64
      }));
      await CarroImagem.bulkCreate(imagesToCreate);
    }

    const carroCriado = await Carro.findByPk(novoCarro.id, {
      include: [{ model: CarroImagem, as: 'imagens' }],
      order: [[{ model: CarroImagem, as: 'imagens' }, 'id', 'ASC']]
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

    // Só pode existir um carro em destaque no hero por vez.
    if (carroData.hero) {
      await Carro.update(
        { hero: false },
        { where: { hero: true, id: { [Op.ne]: carro.id } } }
      );
    }

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
      order: [[{ model: CarroImagem, as: 'imagens' }, 'id', 'ASC']]
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
