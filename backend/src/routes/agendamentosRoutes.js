import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Rota de agendamentos funcionando!');
});

export default router;
