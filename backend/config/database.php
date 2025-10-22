<?php
require_once 'config.php';
// session_start();

function getConnection()
{
  try {
    $pdo = new PDO(
      "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
      DB_USER,
      DB_PASS,
      [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    return $pdo;
  } catch (PDOException $e) {
    die("Erro na conexão: " . $e->getMessage());
  }
}

function saveUser($googleId, $name, $email, $picture)
{
  $pdo = getConnection();

  $stmt = $pdo->prepare("
        INSERT INTO professores (google_id, nome, email, foto) 
        VALUES (:google_id, :nome, :email, :foto)
        ON DUPLICATE KEY UPDATE 
            nome = :nome, 
            foto = :foto,
            ultimo_login = CURRENT_TIMESTAMP
    ");

  $stmt->execute([
    ':google_id' => $googleId,
    ':nome' => $name,
    ':email' => $email,
    ':foto' => $picture
  ]);

  return $pdo->lastInsertId() ?: $pdo->query("SELECT id FROM professores WHERE google_id = '$googleId'")->fetchColumn();
}

function getUserById($id)
{
  $pdo = getConnection();
  $stmt = $pdo->prepare("SELECT * FROM professores WHERE id = :id");
  $stmt->execute([':id' => $id]);
  return $stmt->fetch(PDO::FETCH_ASSOC);
}
