<?php
session_start();
require_once('../config/database.php');

if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(null);
    exit;
}

$professorId = $_SESSION['user_id'];
$horaAtual = date('H:i');
$periodoAtual = null;
$aulaAtual = null;

// Define período atual
if ($horaAtual >= '07:00' && $horaAtual <= '12:20') {
    $periodoAtual = 'manha';
} elseif ($horaAtual >= '13:00' && $horaAtual <= '17:30') {
    $periodoAtual = 'tarde';
} elseif ($horaAtual >= '18:00' && $horaAtual <= '22:30') {
    $periodoAtual = 'noite';
}

// Define aula atual para manhã
if ($periodoAtual === 'manha') {
    if ($horaAtual >= '07:00' && $horaAtual <= '07:50') $aulaAtual = 1;
    elseif ($horaAtual >= '08:00' && $horaAtual <= '08:50') $aulaAtual = 2;
    elseif ($horaAtual >= '09:00' && $horaAtual <= '09:50') $aulaAtual = 3;
    elseif ($horaAtual >= '10:00' && $horaAtual <= '10:50') $aulaAtual = 4;
    elseif ($horaAtual >= '11:00' && $horaAtual <= '11:50') $aulaAtual = 5;
    elseif ($horaAtual >= '12:00' && $horaAtual <= '12:20') $aulaAtual = 6;
}

// Define aula atual para tarde


if (!$periodoAtual || !$aulaAtual) {
    echo json_encode(null);
    exit;
}

try {
    $conn = getConnection();

    $stmt = $conn->prepare("
        SELECT a.id, e.nome AS equipamento, a.aula
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE a.professor_id = :professor_id
          AND a.data = CURDATE()
          AND a.periodo = :periodo
          AND a.aula = :aula
        LIMIT 1
    ");

    $stmt->execute([
        ':professor_id' => $professorId,
        ':periodo' => $periodoAtual,
        ':aula' => $aulaAtual
    ]);

    $agendamento = $stmt->fetch(PDO::FETCH_ASSOC);
    header('Content-Type: application/json');
    echo json_encode($agendamento ?: null);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Erro ao consultar agendamento ativo.']);
}
