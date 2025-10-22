// backend/src/auth/authRoutes.js
import express from 'express'; // framework para criar rotas
import passport from './googleStrategy.js'; // importa a configuração do Passport com Google OAuth

const router = express.Router(); // cria um roteador Express

// Inicia login com Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }) // solicita acesso ao perfil e email do usuário
);

// Callback do Google após login
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure', // redireciona em caso de falha
    successRedirect: 'http://localhost:5173', // redireciona pro frontend
  })
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:5173'); // redireciona pro frontend após logout
  });
});

// Rota de falha
router.get('/failure', (req, res) => {
  res.send('Falha ao autenticar!'); // mensagem de falha
});

export default router; // exporta o roteador para uso em outros arquivos
