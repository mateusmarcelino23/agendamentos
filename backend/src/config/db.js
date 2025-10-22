import mysql from 'mysql2/promise'; // importa o pacote mysql2 com suporte a Promises
import dotenv from 'dotenv'; // carrega variáveis de ambiente a partir de um arquivo .env

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

const pool = mysql.createPool({ // cria um pool de conexões com o banco de dados MySQL
  host: process.env.DB_HOST, // endereço do servidor de banco de dados
  user: process.env.DB_USER, // usuário do banco de dados
  password: process.env.DB_PASSWORD, // senha do banco de dados
  database: process.env.DB_NAME, // nome do banco de dados
  port: process.env.DB_PORT, // porta do servidor de banco de dados
  waitForConnections: true, // espera por conexões disponíveis se o limite for atingido
  connectionLimit: 10, // número máximo de conexões simultâneas no pool
  queueLimit: 0 // número máximo de solicitações na fila (0 = ilimitado)
});

// Tenta se conectar ao banco
(async () => {
  try {
    const connection = await pool.getConnection(); // pega uma conexão do pool
    console.log('Conectado ao banco de dados MySQL com sucesso!');
    connection.release(); // devolve a conexão ao pool
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message); // loga o erro se a conexão falhar
  }
})();

export default pool; // Exporta o pool de conexões para uso em outras partes da aplicação
