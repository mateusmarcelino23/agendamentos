<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once('../config/database.php');

if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

$professorId = $_SESSION['user_id'];

try {
    $conn = getConnection();

    // Dados do professor
    $stmt = $conn->prepare("SELECT nome, email FROM professores WHERE id = :id");
    $stmt->execute([':id' => $professorId]);
    $professor = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$professor) throw new Exception("Professor não encontrado");
    $nomeCompleto = trim($professor['nome']);

    // Período atual
    $horaAtual = date('H:i');
    $periodoAtual = null;
    if ($horaAtual >= '07:00' && $horaAtual <= '12:20') $periodoAtual = 'manha';
    elseif ($horaAtual >= '13:00' && $horaAtual <= '17:30') $periodoAtual = 'tarde';
    elseif ($horaAtual >= '18:00' && $horaAtual <= '22:45') $periodoAtual = 'noite';

    // Agendamento ativo
    $agendamentoAtivo = null;
    if ($periodoAtual) {
        $stmt = $conn->prepare("
            SELECT a.id, e.nome AS equipamento, a.aula, a.periodo, a.status
            FROM agendamentos a
            JOIN equipamentos e ON a.equipamento_id = e.id
            WHERE a.professor_id = :professor_id
              AND a.data = CURDATE()
              AND a.periodo = :periodo
              AND a.status = 0
            ORDER BY a.aula ASC
            LIMIT 1
        ");
        $stmt->execute([':professor_id' => $professorId, ':periodo' => $periodoAtual]);
        $agendamentoAtivo = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    // Próximos agendamentos (futuros e hoje)
    $stmt = $conn->prepare("
        SELECT a.id, e.nome AS equipamento, a.quantidade, a.data, a.aula, a.periodo, a.status
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE a.professor_id = :professor_id
          AND a.data >= CURDATE()
        ORDER BY a.data ASC, a.aula ASC
    ");
    $stmt->execute([':professor_id' => $professorId]);
    $proximosAgendamentos = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // Histórico mensal (sem status nem botões)
    $stmt = $conn->prepare("
        SELECT e.nome AS equipamento, a.quantidade, a.data, a.aula, a.periodo
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE a.professor_id = :professor_id
          AND MONTH(a.data) = MONTH(CURDATE())
          AND YEAR(a.data) = YEAR(CURDATE())
        ORDER BY a.data ASC, a.aula ASC
    ");
    $stmt->execute([':professor_id' => $professorId]);
    $historicoMensal = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // Cards detalhados
    $totalMes = count($historicoMensal);

    // Agendamentos pendentes/concluídos/cancelados (mesmo mês)
    $stmt = $conn->prepare("
        SELECT status FROM agendamentos
        WHERE professor_id = :professor_id
          AND MONTH(data) = MONTH(CURDATE())
          AND YEAR(data) = YEAR(CURDATE())
    ");
    $stmt->execute([':professor_id' => $professorId]);
    $todosStatus = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $totalPendentes = count(array_filter($todosStatus, fn($s) => $s == 0));
    $totalConcluidos = count(array_filter($todosStatus, fn($s) => $s == 1));

    // Equipamento mais usado
    $stmt = $conn->prepare("
        SELECT e.nome, COUNT(*) AS vezes
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE a.professor_id = :professor_id
          AND MONTH(a.data) = MONTH(CURDATE())
          AND YEAR(a.data) = YEAR(CURDATE())
        GROUP BY e.id
        ORDER BY vezes DESC
        LIMIT 1
    ");
    $stmt->execute([':professor_id' => $professorId]);
    $equipamentoMaisUsado = $stmt->fetch(PDO::FETCH_ASSOC);

    $cardsDetalhados = [
        ['titulo' => 'Total de Agendamentos no Mês', 'valor' => $totalMes],
        ['titulo' => 'Agendamentos Pendentes', 'valor' => $totalPendentes],
        ['titulo' => 'Agendamentos Concluídos', 'valor' => $totalConcluidos],
        ['titulo' => 'Equipamento Mais Usado', 'valor' => $equipamentoMaisUsado['nome'] ?? 'Nenhum']
    ];

    // Retorno final
    $data = [
        'nomeCompleto' => $nomeCompleto,
        'agendamentoAtivo' => $agendamentoAtivo,
        'proximosAgendamentos' => $proximosAgendamentos,
        'historicoMensal' => $historicoMensal,
        'cardsDetalhados' => $cardsDetalhados
    ];

    header('Content-Type: application/json');
    echo json_encode($data);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Erro PDO: " . $e->getMessage());
    echo json_encode(['error' => 'Erro no servidor (banco de dados).']);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Erro: " . $e->getMessage());
    echo json_encode(['error' => 'Erro interno do servidor.']);
}

exit;
