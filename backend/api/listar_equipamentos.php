<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once('../config/database.php');

$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) &&
    $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

try {
    $conn = getConnection();
    $stmt = $conn->query("SELECT id, nome, tipo, quantidade FROM equipamentos ORDER BY nome ASC");
    $equipamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'equipamentos' => $equipamentos]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Erro equipamentos: " . $e->getMessage());
    echo json_encode(['error' => 'Erro ao carregar equipamentos']);
}
