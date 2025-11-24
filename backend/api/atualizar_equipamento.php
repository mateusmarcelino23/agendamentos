<?php
session_start();
require_once('../config/database.php');

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    exit;
}

$professorId = $_SESSION['user_id'];
$agendamentoId = $_POST['agendamento_id'] ?? null;
$acao = $_POST['acao'] ?? null;

if (!$agendamentoId || !$acao) {
    http_response_code(400);
    exit;
}

try {
    $conn = getConnection();

    // Busca o equipamento do agendamento
    $stmt = $conn->prepare("SELECT equipamento_id FROM agendamentos WHERE id = :id AND professor_id = :professor_id");
    $stmt->execute([':id' => $agendamentoId, ':professor_id' => $professorId]);
    $equipamento = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$equipamento) {
        http_response_code(404);
        exit;
    }

    $status = 'disponivel';
    if ($acao === 'em_uso' || $acao === 'irei') {
        $status = 'em_uso';
    }

    // Atualiza status do equipamento
    $stmt = $conn->prepare("UPDATE equipamentos SET status = :status WHERE id = :id");
    $stmt->execute([':status' => $status, ':id' => $equipamento['equipamento_id']]);

    header('Content-Type: application/json');
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Erro ao atualizar equipamento.']);
}
