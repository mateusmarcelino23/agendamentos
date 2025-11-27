<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once('../config/database.php');
header('Content-Type: application/json');

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

    // 1) Obtém quantidade total do equipamento
    $stmt = $conn->prepare("SELECT quantidade FROM equipamentos WHERE id = :id");
    $stmt->execute([':id' => $equipamento]);
    $equipInfo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$equipInfo) {
        echo json_encode(['error' => 'Equipamento não encontrado']);
        exit;
    }

    $quantidadeTotal = (int)$equipInfo['quantidade'];

    // 2) Soma quantas unidades já foram reservadas para o horário
    $stmt = $conn->prepare("
        SELECT SUM(quantidade) AS total_agendado
        FROM agendamentos
        WHERE equipamento_id = :equip
          AND data = :data
          AND periodo = :periodo
          AND aula = :aula
    ");
    $stmt->execute([
        ':equip' => $equipamento,
        ':data' => $data,
        ':periodo' => $periodo,
        ':aula' => $aula
    ]);

    $totalAgendado = (int)($stmt->fetch(PDO::FETCH_ASSOC)['total_agendado'] ?? 0);

    // 3) Calcula unidades disponíveis
    $disponivel = $quantidadeTotal - $totalAgendado;

    echo json_encode([
        'disponivel' => $disponivel,
        'ocupado' => $disponivel <= 0
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Erro disponibilidade: " . $e->getMessage());
    echo json_encode(['error' => 'Erro ao verificar disponibilidade']);
}
