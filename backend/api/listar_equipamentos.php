<?php
// Assegura que a sessão esteja ativa antes de manipular informações do usuário.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Carrega arquivo de conexão com banco de dados.
require_once('../config/database.php');

// Define saída padrão como JSON para o frontend.
header('Content-Type: application/json');

// Bloqueia acesso caso não exista usuário logado.
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

try {
    // Obtém instância de conexão PDO.
    $conn = getConnection();

    // Consulta simples retornando todos os equipamentos cadastrados.
    $stmt = $conn->query("
        SELECT id, nome, tipo, quantidade 
        FROM equipamentos 
        ORDER BY nome ASC
    ");

    // Converte resultado do banco para array associativo.
    $equipamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Retorna JSON contendo lista de equipamentos.
    echo json_encode([
        'success' => true,
        'equipamentos' => $equipamentos
    ]);
} catch (Exception $e) {

    // Em caso de erro interno, registra no log para depuração.
    http_response_code(500);
    error_log("Erro equipamentos: " . $e->getMessage());

    // Retorna erro genérico ao cliente.
    echo json_encode(['error' => 'Erro ao carregar equipamentos']);
}
