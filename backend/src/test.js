import pool from './config/db.js';

async function testDB() {
  try {
    const [rows] = await pool.query('SELECT * FROM professores LIMIT 2');
    console.log('Conexão OK:', rows);
  } catch (err) {
    console.error('Erro ao conectar:', err);
  }
}

testDB();
