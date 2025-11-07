<?php
require_once __DIR__ . '/config.php';

// Inicia sessão se não estiver ativa
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

/**
 * Conexão PDO com o banco de dados
 * @return PDO Conexão PDO com o banco de dados
 * @throws PDOException Erro na conexão com o banco de dados
 */
function getConnection()
{
  try {
    // Cria uma conexão PDO com o banco de dados
    $pdo = new PDO(
      "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
      DB_USER,
      DB_PASS,
      [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    return $pdo;
  } catch (PDOException $e) {
    // Lança uma exceção se houver erro na conexão com o banco de dados
    die("Erro na conexão: " . $e->getMessage());
  }
}

/**
 * Salva um professor no banco de dados
 * @param string $googleId ID do professor no Google
 * @param string $name Nome do professor
 * @param string $email E-mail do professor
 * @param string $picture Foto do professor
 * @return int ID do professor no banco de dados
 */
function saveUser($googleId, $name, $email, $picture)
{
  $pdo = getConnection();

  // Prepara a query para inserir o professor no banco de dados
  $stmt = $pdo->prepare("
        INSERT INTO professores (google_id, nome, email, foto) 
        VALUES (:google_id, :nome, :email, :foto)
        ON DUPLICATE KEY UPDATE 
            nome = :nome, 
            foto = :foto,
            ultimo_login = CURRENT_TIMESTAMP
    ");

  // Executa a query com os parâmetros
  $stmt->execute([
    ':google_id' => $googleId,
    ':nome' => $name,
    ':email' => $email,
    ':foto' => $picture
  ]);

  // Retorna o ID do professor no banco de dados
  return $pdo->lastInsertId() ?: $pdo->query("SELECT id FROM professores WHERE google_id = '$googleId'")->fetchColumn();
}

/**
 * Busca um professor pelo seu ID
 * @param int $id ID do professor no banco de dados
 * @return array Associativo com os dados do professor
 */
function getUserById($id)
{
  $pdo = getConnection();
  // Prepara a query para buscar o professor pelo seu ID
  $stmt = $pdo->prepare("SELECT * FROM professores WHERE id = :id");
  // Executa a query com o parâmetro
  $stmt->execute([':id' => $id]);
  // Retorna os dados do professor
  return $stmt->fetch(PDO::FETCH_ASSOC);
}