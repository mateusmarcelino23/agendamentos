// Importa as bibliotecas necessárias
import express from 'express';      // framework para criar o servidor HTTP e gerenciar rotas
import cors from 'cors';            // middleware que permite o acesso de outras origens (ex: frontend React)
import dotenv from 'dotenv';        // carrega variáveis de ambiente a partir de um arquivo .env

// Importa rotas (serão criadas depois)
import professoresRoutes from './routes/professoresRoutes.js';
import equipamentosRoutes from './routes/equipamentosRoutes.js';
import agendamentosRoutes from './routes/agendamentosRoutes.js';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Cria a aplicação Express (servidor)
const app = express();

// Configura middlewares globais
app.use(cors());           // habilita CORS para permitir acesso de outros domínios
app.use(express.json());   // faz o servidor entender dados em formato JSON (ex: POST com JSON)

// Rota simples para testar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('Hello World!');
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
  console.log(`Servidor iniciado na porta ${PORT}`);
});
