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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Lê JSON enviado pelo fetch()
$input = json_decode(file_get_contents('php://input'), true);

$data         = $input['data'] ?? null;
$equipamento  = $input['equipamento_id'] ?? null;
$quantidade   = $input['quantidade'] ?? null;
$periodo      = $input['periodo'] ?? null;
$aula         = $input['aula'] ?? null;

$professor_id = $_SESSION['user_id'];

if (!$data || !$equipamento || !$periodo || !$aula) {
    echo json_encode(['error' => 'Dados incompletos']);
    exit;
}

try {
    $conn = getConnection();

    // 1 — validar se já existe agendamento igual
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

    if ($stmt->fetch(PDO::FETCH_ASSOC)['total'] > 0) {
        echo json_encode(['error' => 'Este horário já está ocupado']);
        exit;
    }

    // 2 — inserir agendamento
    $stmt = $conn->prepare("
        INSERT INTO agendamentos 
        (equipamento_id, professor_id, data, aula, periodo, status)
        VALUES (:equip, :prof, :data, :aula, :periodo, 0)
    ");

    $stmt->execute([
        ':equip' => $equipamento,
        ':prof' => $professor_id,
        ':data' => $data,
        ':aula' => $aula,
        ':periodo' => $periodo
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Agendamento registrado com sucesso!'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Erro create agendamento: " . $e->getMessage());
    echo json_encode(['error' => 'Erro ao registrar agendamento']);
}
