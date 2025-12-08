<?php
// Inicia sessão se necessário
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Carrega conexão PDO
require_once('../config/database.php');

// Define saída JSON
header('Content-Type: application/json');

// Bloqueia acesso se não estiver logado
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

try {
    $conn = getConnection();
    $professor_id = $_SESSION['user_id']; // pega o usuário logado

    // Consulta agendamentos do professor
    $stmt = $conn->prepare("
        SELECT a.id, a.data, a.aula, a.periodo, a.quantidade, e.nome AS equipamento
        FROM agendamentos a
        JOIN equipamentos e ON e.id = a.equipamento_id
        WHERE a.professor_id = :professor_id
        ORDER BY a.data ASC, a.aula ASC
    ");

    $stmt->bindParam(':professor_id', $professor_id, PDO::PARAM_INT);
    $stmt->execute();

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
            'quantidade' => $row['quantidade'],
            'equipamento' => $row['equipamento']
        ];
    }

    // Transformar em array de datas com total e detalhes
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
