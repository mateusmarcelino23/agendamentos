<?php
// Garante sessão ativa antes de acessar dados do usuário.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Carrega dependências de banco.
require_once('../config/database.php');

// Define saída JSON.
header('Content-Type: application/json');

// Verifica autenticação básica.
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

// Aceita apenas requisições GET.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Extrai os parâmetros enviados pelo frontend.
$data = $_GET['data'] ?? null;
$equipamento = $_GET['equipamento_id'] ?? null;
$aula = $_GET['aula'] ?? null;
$periodo = $_GET['periodo'] ?? null;

// Valida presença de todos os parâmetros obrigatórios.
if (!$data || !$equipamento || !$aula || !$periodo) {
    echo json_encode(['error' => 'Parâmetros inválidos']);
    exit;
}

try {
    // Abre conexão.
    $conn = getConnection();

    // Verifica se existe algum agendamento no mesmo horário para o mesmo equipamento.
    $stmt = $conn->prepare("
        SELECT COUNT(*) AS total
        FROM agendamentos
        WHERE data = :data
          AND equipamento_id = :equip
          AND aula = :aula
          AND periodo = :periodo
    ");

    // Executa consulta usando parâmetros nomeados para segurança.
    $stmt->execute([
        ':data' => $data,
        ':equip' => $equipamento,
        ':aula' => $aula,
        ':periodo' => $periodo
    ]);

    // Obtém total de conflitos encontrados.
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Retorna somente o que o frontend precisa.
    echo json_encode([
        // Indica se já existe conflito.
        'ocupado' => $total > 0
    ]);
} catch (Exception $e) {

    // Registra erro interno.
    http_response_code(500);
    error_log("Erro disponibilidade: " . $e->getMessage());

    // Retorna erro genérico para o frontend.
    echo json_encode(['error' => 'Erro ao verificar disponibilidade']);
}
