<?php
// Inicia a sessão se ainda não estiver ativa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Importa o arquivo de conexão com o banco de dados
require_once('../config/database.php');

// Verifica se a requisição veio via AJAX
$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest';

// Verifica se o usuário está logado
if (!isset($_SESSION['user_id'])) {
    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Usuário não autenticado']);
    } else {
        header('Location: ../../');
    }
    exit;
}

try {
    $conn = getConnection();

    // Nome completo do professor logado
    $stmt = $conn->prepare("SELECT nome, email FROM professores WHERE id = :id");
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $professor = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$professor) throw new Exception('Professor não encontrado');

    $nomeCompleto = trim($professor['nome']);

    // --- 1️⃣ Cards resumo ---
    // Total de agendamentos do mês
    $stmt = $conn->prepare("
        SELECT COUNT(*) AS total 
        FROM agendamentos 
        WHERE MONTH(data) = MONTH(CURDATE()) AND YEAR(data) = YEAR(CURDATE())
    ");
    $stmt->execute();
    $totalMes = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // Agendamentos concluídos (status = 1)
    $stmt = $conn->prepare("
        SELECT COUNT(*) AS total 
        FROM agendamentos 
        WHERE MONTH(data) = MONTH(CURDATE()) AND YEAR(data) = YEAR(CURDATE())
          AND status = 1
    ");
    $stmt->execute();
    $concluidos = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // Agendamentos cancelados (status = 2)
    $stmt = $conn->prepare("
        SELECT COUNT(*) AS total 
        FROM agendamentos 
        WHERE MONTH(data) = MONTH(CURDATE()) AND YEAR(data) = YEAR(CURDATE())
          AND status = 2
    ");
    $stmt->execute();
    $cancelados = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // Equipamento mais usado do mês
    $stmt = $conn->prepare("
        SELECT e.nome, COUNT(a.id) AS total 
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE MONTH(a.data) = MONTH(CURDATE()) AND YEAR(a.data) = YEAR(CURDATE())
        GROUP BY e.id
        ORDER BY total DESC
        LIMIT 1
    ");
    $stmt->execute();
    $equipamentoMaisUsado = $stmt->fetch(PDO::FETCH_ASSOC) ?: ['nome' => '-', 'total' => 0];

    // --- 2️⃣ Gráficos ---
    // Equipamentos mais usados
    $stmt = $conn->prepare("
        SELECT e.nome, COUNT(a.id) AS total
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE MONTH(a.data) = MONTH(CURDATE()) AND YEAR(a.data) = YEAR(CURDATE())
        GROUP BY e.id
        ORDER BY total DESC
    ");
    $stmt->execute();
    $equipamentosRanking = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Professores mais ativos
    $stmt = $conn->prepare("
        SELECT p.nome, COUNT(a.id) AS total
        FROM agendamentos a
        JOIN professores p ON a.professor_id = p.id
        WHERE MONTH(a.data) = MONTH(CURDATE()) AND YEAR(a.data) = YEAR(CURDATE())
        GROUP BY p.id
        ORDER BY total DESC
        LIMIT 10
    ");
    $stmt->execute();
    $professoresRanking = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Agendamentos por período
    $stmt = $conn->prepare("
        SELECT periodo, COUNT(*) AS total
        FROM agendamentos
        WHERE MONTH(data) = MONTH(CURDATE()) AND YEAR(data) = YEAR(CURDATE())
        GROUP BY periodo
    ");
    $stmt->execute();
    $periodos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Agendamentos por tipo de equipamento
    $stmt = $conn->prepare("
        SELECT e.tipo, COUNT(*) AS total
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE MONTH(a.data) = MONTH(CURDATE()) AND YEAR(a.data) = YEAR(CURDATE())
        GROUP BY e.tipo
    ");
    $stmt->execute();
    $tipoEquipamento = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Agendamentos por status
    $stmt = $conn->prepare("
        SELECT status, COUNT(*) AS total
        FROM agendamentos
        WHERE MONTH(data) = MONTH(CURDATE()) AND YEAR(data) = YEAR(CURDATE())
        GROUP BY status
    ");
    $stmt->execute();
    $statusAgendamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Monta JSON final
    $data = [
        'nomeCompleto' => $nomeCompleto,
        'cards' => [
            'totalMes' => $totalMes,
            'concluidos' => $concluidos,
            'cancelados' => $cancelados,
            'equipamentoMaisUsado' => $equipamentoMaisUsado,
        ],
        'graficos' => [
            'equipamentosRanking' => $equipamentosRanking,
            'professoresRanking' => $professoresRanking,
            'periodos' => $periodos,
            'tipoEquipamento' => $tipoEquipamento,
            'statusAgendamentos' => $statusAgendamentos
        ]
    ];

    header('Content-Type: application/json');
    echo json_encode($data);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    error_log("Erro PDO: " . $e->getMessage());
    echo json_encode(['error' => 'Erro interno do servidor (banco de dados).']);
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    error_log("Erro: " . $e->getMessage());
    echo json_encode(['error' => 'Erro interno do servidor.']);
}

exit;
