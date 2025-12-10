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

try {
    $conn = getConnection();

    $stmt = $conn->query("
        SELECT a.id, a.data, a.aula, a.periodo, a.quantidade,
               e.nome AS equipamento,
               p.nome AS professor
        FROM agendamentos a
        JOIN equipamentos e ON e.id = a.equipamento_id
        JOIN professores p ON p.id = a.professor_id
        ORDER BY a.data ASC, a.aula ASC
    ");

    $agendamentos = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $data = $row['data'];

        if (!isset($agendamentos[$data])) {
            $agendamentos[$data] = [];
        }

        $agendamentos[$data][] = [
            'id' => $row['id'],
            'aula' => $row['aula'],
            'periodo' => $row['periodo'],
            'equipamento' => $row['equipamento'],
            'professor' => $row['professor']
        ];
    }

    $response = [];

    foreach ($agendamentos as $data => $detalhes) {
        $response[] = [
            'data' => $data,
            'total' => count($detalhes),
            'detalhes' => $detalhes
        ];
    }

    echo json_encode(['success' => true, 'agendamentos' => $response]);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Erro ao carregar agendamentos: " . $e->getMessage());
    echo json_encode(['error' => 'Erro ao carregar agendamentos']);
}
