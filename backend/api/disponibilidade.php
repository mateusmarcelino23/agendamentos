<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once('../config/database.php');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

$data = $_GET['data'] ?? null;
$equipamento = $_GET['equipamento_id'] ?? null;
$aula = $_GET['aula'] ?? null;
$periodo = $_GET['periodo'] ?? null;

if (!$data || !$equipamento || !$aula || !$periodo) {
    echo json_encode(['error' => 'Parâmetros inválidos']);
    exit;
}

try {
    $conn = getConnection();

    $stmt = $conn->prepare("
        SELECT COUNT(*) AS total
        FROM agendamentos
        WHERE data = :data
          AND equipamento_id = :equip
          AND aula = :aula
          AND periodo = :periodo
    ");
    $stmt->execute([
        ':data' => $data,
        ':equip' => $equipamento,
        ':aula' => $aula,
        ':periodo' => $periodo
    ]);

    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode(['success' => true, 'ocupado' => $total > 0]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Erro disponibilidade: " . $e->getMessage());
    echo json_encode(['error' => 'Erro ao verificar disponibilidade']);
}
