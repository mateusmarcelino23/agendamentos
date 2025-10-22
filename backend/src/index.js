// Importa as bibliotecas necessárias
import express from 'express';      // framework para criar o servidor HTTP e gerenciar rotas
import cors from 'cors';            // middleware que permite o acesso de outras origens (ex: frontend React)
import dotenv from 'dotenv';        // carrega variáveis de ambiente a partir de um arquivo .env
import session from 'express-session'; // middleware para gerenciar sessões de usuário
import passport from './auth/googleStrategy.js'; // importa a configuração do Passport com Google OAuth

// Importa rotas da aplicação
import professoresRoutes from './routes/professoresRoutes.js'; // rotas para gerenciar professores
import equipamentosRoutes from './routes/equipamentosRoutes.js'; // rotas para gerenciar equipamentos
import agendamentosRoutes from './routes/agendamentosRoutes.js'; // rotas para gerenciar agendamentos
import authRoutes from './auth/authRoutes.js'; // rotas de autenticação

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Cria a aplicação Express (servidor)
const app = express();

// Configura middlewares globais
app.use(cors({ // habilita CORS para permitir acesso de outros domínios
  origin: 'http://localhost:5173', // permite acesso apenas do frontend rodando na porta 3000
  credentials: true, // permite envio de cookies e credenciais 
}));

app.use(express.json());   // faz o servidor entender dados em formato JSON (ex: POST com JSON)

// Configura o middleware de sessão antes do Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret', // segredo para assinar o ID da sessão
  resave: false, // não salva a sessão se não houve modificações
  saveUninitialized: false, // não cria sessão até que algo seja armazenado
  cookie: { secure: false } // em produção, deve ser true se usar HTTPS
}));

app.use(passport.initialize()); // inicializa o Passport para autenticação
app.use(passport.session()); // necessário para sessões com login

app.use('/auth', authRoutes); // registra as rotas de autenticação

// Configura o middleware de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret', // segredo para assinar o ID da sessão
  resave: false,               // não salva a sessão se não houve modificações
  saveUninitialized: false,    // não cria sessão até que algo seja armazenado
  cookie: { secure: false }    // em produção, deve ser true se usar HTTPS
}));

// Rota simples para testar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Registra as rotas principais da aplicação
// (Esses arquivos ainda não existem, serão criados depois)
app.use('/professores', professoresRoutes);
app.use('/equipamentos', equipamentosRoutes);
app.use('/agendamentos', agendamentosRoutes);

// Define a porta do servidor. Primeiro tenta usar a variável de ambiente PORT.
// Se não existir, usa a porta 3000 por padrão.
const PORT = process.env.PORT || 3000;

// Inicia o servidor e exibe mensagem no console
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`); // mensagem de confirmação
});
