<?php
// Inicia a sessão se ainda não estiver ativa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Importa a conexão com o banco de dados
require_once('../config/database.php');

// Verifica se o usuário está logado
if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

$professorId = $_SESSION['user_id'];

try {
    $conn = getConnection();

    // -------------------------
    // 1. Dados do professor
    // -------------------------
    $stmt = $conn->prepare("SELECT nome, email FROM professores WHERE id = :id");
    $stmt->execute([':id' => $professorId]);
    $professor = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$professor) throw new Exception("Professor não encontrado");

    $nomeCompleto = trim($professor['nome']);

    // -------------------------
    // 2. Determinar período atual
    // -------------------------
    $horaAtual = date('H:i');
    $periodoAtual = null;
    if ($horaAtual >= '07:00' && $horaAtual <= '12:20') {
        $periodoAtual = 'manha';
    } elseif ($horaAtual >= '13:00' && $horaAtual <= '17:30') {
        $periodoAtual = 'tarde';
    } elseif ($horaAtual >= '18:00' && $horaAtual <= '22:45') {
        $periodoAtual = 'noite';
    }

    // -------------------------
    // 3. Agendamento ativo agora (baseado no período e hora da aula)
    // -------------------------
    $agendamentoAtivo = null;
    if ($periodoAtual) {
        $stmt = $conn->prepare("
            SELECT 
                a.id,
                e.nome AS equipamento,
                a.aula,
                a.periodo,
                a.status
            FROM agendamentos a
            JOIN equipamentos e ON a.equipamento_id = e.id
            WHERE a.professor_id = :professor_id
              AND a.data = CURDATE()
              AND a.periodo = :periodo
              AND a.status = 0  -- 0 = pendente/ativo
            ORDER BY a.aula ASC
            LIMIT 1
        ");
        $stmt->execute([
            ':professor_id' => $professorId,
            ':periodo' => $periodoAtual
        ]);
        $agendamentoAtivo = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    // -------------------------
    // 4. Histórico mensal do professor
    // -------------------------
    $stmt = $conn->prepare("
        SELECT 
            id,
            equipamento_id,
            data,
            aula,
            periodo,
            status
        FROM agendamentos
        WHERE professor_id = :professor_id
          AND MONTH(data) = MONTH(CURDATE())
          AND YEAR(data) = YEAR(CURDATE())
        ORDER BY data ASC, aula ASC
    ");
    $stmt->execute([':professor_id' => $professorId]);
    $historicoMensal = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // -------------------------
    // 5. Cards detalhados
    // -------------------------
    // Total de agendamentos do mês
    $totalMes = count($historicoMensal);

    // Agendamentos pendentes
    $pendentes = array_filter($historicoMensal, fn($a) => $a['status'] == 0);
    $totalPendentes = count($pendentes);

    // Agendamentos concluídos
    $concluidos = array_filter($historicoMensal, fn($a) => $a['status'] == 1);
    $totalConcluidos = count($concluidos);

    // Agendamentos cancelados
    $cancelados = array_filter($historicoMensal, fn($a) => $a['status'] == 2);
    $totalCancelados = count($cancelados);

    // Próximo agendamento (futuro)
    $stmt = $conn->prepare("
        SELECT a.data, a.aula, e.nome AS equipamento
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE a.professor_id = :professor_id AND a.data >= CURDATE()
        ORDER BY a.data ASC, a.aula ASC
        LIMIT 1
    ");
    $stmt->execute([':professor_id' => $professorId]);
    $proximoAgendamento = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

    // Equipamento mais usado pelo professor (no mês)
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
    $equipamentoMaisUsado = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

    // Monta array de cards detalhados
    $cardsDetalhados = [
        ['titulo' => 'Total de Agendamentos no Mês', 'valor' => $totalMes],
        ['titulo' => 'Agendamentos Pendentes', 'valor' => $totalPendentes],
        ['titulo' => 'Agendamentos Concluídos', 'valor' => $totalConcluidos],
        ['titulo' => 'Equipamento Mais Usado', 'valor' => $equipamentoMaisUsado['nome'] ?? 'Nenhum']
    ];

    // -------------------------
    // 6. Retorna os dados em JSON
    // -------------------------
    $data = [
        'nomeCompleto' => $nomeCompleto,
        'agendamentoAtivo' => $agendamentoAtivo,
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
