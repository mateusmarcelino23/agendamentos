<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once('../config/database.php');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

$professorId = $_SESSION['user_id'];
$agendamentoId = $_POST['id'] ?? null;

if (!$agendamentoId) {
    echo json_encode(['success' => false, 'message' => 'ID do agendamento não fornecido']);
    exit;
}

try {
    $conn = getConnection();

    // Verifica se o agendamento pertence ao professor
    $stmt = $conn->prepare("SELECT * FROM agendamentos WHERE id = :id AND professor_id = :professor_id");
    $stmt->execute([':id' => $agendamentoId, ':professor_id' => $professorId]);
    $agendamento = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$agendamento) {
        echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado ou não pertence a você']);
        exit;
    }

    // Atualiza o status para cancelado
    $stmt = $conn->prepare("UPDATE agendamentos SET status = 2 WHERE id = :id");
    $stmt->execute([':id' => $agendamentoId]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro ao cancelar agendamento']);
}
