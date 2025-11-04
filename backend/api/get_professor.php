<?php
header('Content-Type: application/json');
session_start();

$professorId = $_SESSION['user_id'] ?? null;

require_once('../config/database.php');

try {
    $pdo = getConnection(); // usa a função que já faz a conexão
} catch (PDOException $e) {
    echo json_encode(['error' => 'Erro na conexão: ' . $e->getMessage()]);
    exit;
}

$stmt = $pdo->prepare("SELECT nome, foto FROM professores WHERE id = ?");
$stmt->execute([$professorId]);
$professor = $stmt->fetch(PDO::FETCH_ASSOC);

if ($professor) {
    echo json_encode($professor);
} else {
    echo json_encode(['error' => 'Professor não encontrado']);
}
exit;  
?>