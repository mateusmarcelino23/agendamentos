//importando bibliotecas necessárias
import express from 'express'; // framework para criar o servidor
import cors from 'cors';  // middleware para habilitar CORS (permite acessar o backend de outras origens)
import dotenv from 'dotenv'; // biblioteca para carregar variáveis de ambiente (variáveis do ambiente são importantes pois permitem configurar o comportamento do aplicativo sem alterar o código)
import routes from './routes'; // importando rotas definidas em outro arquivo

//configurando dotenv para carregar variáveis de ambiente do arquivo .env
dotenv.config();

//criando a instância do servidor
const app = express(); // app é o objeto principal do servidor

//configurando middlewares
app.use(cors()); // habilitando CORS para todas as rotas
app.use(express.json()); // habilitando o servidor para entender requisições com corpo em JSON

//definindo as rotas do servidor

//rota de teste
app.get('/', (req , res) => {})
    //Req: objeto que representa a requisição feita pelo cliente
    //Res: objeto que representa a resposta enviada pelo servidor ao cliente
    res.Send("Hello World!"); // Envia mensagem para navegador ou postman


import professoresRoutes from './routes/professoresRoutes.js';
import equipamentosRoutes from './routes/equipamentosRoutes.js';
import agendamentosRoutes from './routes/agendamentosRoutes.js';


//definindo porta do servidor
const PORT = process.env.PORT || 3000; // se nenhuma porta for especificada no ambiente, usa a porta 3000

//iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
    //mensagem do console após sabrer qual porta o servidor iniciou
});