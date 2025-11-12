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

    // 🔹 Dados do professor logado
    $stmt = $conn->prepare("SELECT nome, email, funcao FROM professores WHERE id = :id");
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $professor = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$professor) throw new Exception('Professor não encontrado');

    $userId = $_SESSION['user_id'];
    $nomeCompleto = trim($professor['nome']);
    $funcao = $professor['funcao'];

    // =======================================================
    // 🏆 1️⃣ RANKINGS DO MÊS (TOP 5)
    // =======================================================
    $stmt = $conn->prepare("
        SELECT p.nome, COUNT(a.id) AS total
        FROM agendamentos a
        JOIN professores p ON a.professor_id = p.id
        WHERE MONTH(a.data)=MONTH(CURDATE()) AND YEAR(a.data)=YEAR(CURDATE())
        GROUP BY p.id
        ORDER BY total DESC
        LIMIT 5
    ");
    $stmt->execute();
    $rankingProfessores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $conn->prepare("
        SELECT e.nome, COUNT(a.id) AS total
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE MONTH(a.data)=MONTH(CURDATE()) AND YEAR(a.data)=YEAR(CURDATE())
        GROUP BY e.id
        ORDER BY total DESC
        LIMIT 5
    ");
    $stmt->execute();
    $rankingEquipamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $conn->prepare("
        SELECT periodo, COUNT(id) AS total
        FROM agendamentos
        WHERE MONTH(data)=MONTH(CURDATE()) AND YEAR(data)=YEAR(CURDATE())
        GROUP BY periodo
        ORDER BY total DESC
    ");
    $stmt->execute();
    $rankingTurnos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // =======================================================
    // 📊 2️⃣ VISÃO GERAL DO SISTEMA (MÊS ATUAL)
    // =======================================================

    // Cards de resumo
    $stmt = $conn->prepare("
        SELECT COUNT(*) AS totalMes,
            SUM(CASE WHEN status=1 THEN 1 ELSE 0 END) AS concluidos,
            SUM(CASE WHEN status=2 THEN 1 ELSE 0 END) AS cancelados
        FROM agendamentos
        WHERE MONTH(data)=MONTH(CURDATE()) AND YEAR(data)=YEAR(CURDATE())
    ");
    $stmt->execute();
    $cards = $stmt->fetch(PDO::FETCH_ASSOC);

    // Equipamento mais usado
    $stmt = $conn->prepare("
        SELECT e.nome, COUNT(a.id) AS total
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE MONTH(a.data)=MONTH(CURDATE()) AND YEAR(a.data)=YEAR(CURDATE())
        GROUP BY e.id
        ORDER BY total DESC
        LIMIT 1
    ");
    $stmt->execute();
    $equipamentoMaisUsado = $stmt->fetch(PDO::FETCH_ASSOC) ?: ['nome' => '-', 'total' => 0];

    // Gráficos gerais
    $graficos = [];

    $stmt = $conn->prepare("
        SELECT status, COUNT(*) AS total
        FROM agendamentos
        WHERE MONTH(data)=MONTH(CURDATE()) AND YEAR(data)=YEAR(CURDATE())
        GROUP BY status
    ");
    $stmt->execute();
    $graficos['status'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $conn->prepare("
        SELECT e.tipo, COUNT(a.id) AS total
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE MONTH(a.data)=MONTH(CURDATE()) AND YEAR(a.data)=YEAR(CURDATE())
        GROUP BY e.tipo
    ");
    $stmt->execute();
    $graficos['tipoEquipamento'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $conn->prepare("
        SELECT periodo, COUNT(*) AS total
        FROM agendamentos
        WHERE MONTH(data)=MONTH(CURDATE()) AND YEAR(data)=YEAR(CURDATE())
        GROUP BY periodo
    ");
    $stmt->execute();
    $graficos['periodos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $conn->prepare("
        SELECT DAY(data) AS dia, COUNT(*) AS total
        FROM agendamentos
        WHERE MONTH(data)=MONTH(CURDATE()) AND YEAR(data)=YEAR(CURDATE())
        GROUP BY dia
        ORDER BY dia ASC
    ");
    $stmt->execute();
    $graficos['evolucao'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Insights automáticos do sistema
    $insightsSistema = [];
    if ($equipamentoMaisUsado['nome'] !== '-') {
        $insightsSistema[] = "O equipamento mais usado foi {$equipamentoMaisUsado['nome']}.";
    }
    if (!empty($rankingTurnos)) {
        $insightsSistema[] = "O turno mais movimentado foi {$rankingTurnos[0]['periodo']}.";
    }
    $insightsSistema[] = "Foram realizados {$cards['totalMes']} agendamentos no total este mês.";

    // =======================================================
    // 👨‍🏫 3️⃣ VISÃO DO PROFESSOR LOGADO
    // =======================================================
    $stmt = $conn->prepare("
        SELECT COUNT(*) AS total,
            SUM(CASE WHEN status=1 THEN 1 ELSE 0 END) AS concluidos,
            SUM(CASE WHEN status=2 THEN 1 ELSE 0 END) AS cancelados
        FROM agendamentos
        WHERE professor_id = :id
          AND MONTH(data)=MONTH(CURDATE()) AND YEAR(data)=YEAR(CURDATE())
    ");
    $stmt->execute([':id' => $userId]);
    $meusCards = $stmt->fetch(PDO::FETCH_ASSOC);

    // Equipamento mais usado pelo professor
    $stmt = $conn->prepare("
        SELECT e.nome, COUNT(a.id) AS total
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE a.professor_id = :id
          AND MONTH(a.data)=MONTH(CURDATE()) AND YEAR(a.data)=YEAR(CURDATE())
        GROUP BY e.id
        ORDER BY total DESC
        LIMIT 1
    ");
    $stmt->execute([':id' => $userId]);
    $meuEquipamentoMaisUsado = $stmt->fetch(PDO::FETCH_ASSOC) ?: ['nome' => '-', 'total' => 0];

    // Gráficos do professor
    $meusGraficos = [];

    $stmt = $conn->prepare("
        SELECT status, COUNT(*) AS total
        FROM agendamentos
        WHERE professor_id = :id
          AND MONTH(data)=MONTH(CURDATE()) AND YEAR(data)=YEAR(CURDATE())
        GROUP BY status
    ");
    $stmt->execute([':id' => $userId]);
    $meusGraficos['status'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $conn->prepare("
        SELECT e.nome, COUNT(a.id) AS total
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE a.professor_id = :id
          AND MONTH(a.data)=MONTH(CURDATE()) AND YEAR(a.data)=YEAR(CURDATE())
        GROUP BY e.id
        ORDER BY total DESC
    ");
    $stmt->execute([':id' => $userId]);
    $meusGraficos['equipamentos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $conn->prepare("
        SELECT periodo, COUNT(*) AS total
        FROM agendamentos
        WHERE professor_id = :id
          AND MONTH(data)=MONTH(CURDATE()) AND YEAR(data)=YEAR(CURDATE())
        GROUP BY periodo
    ");
    $stmt->execute([':id' => $userId]);
    $meusGraficos['periodos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Insights do professor
    $meusInsights = [];
    $meusInsights[] = "Você realizou {$meusCards['total']} agendamentos neste mês.";
    if ($meuEquipamentoMaisUsado['nome'] !== '-') {
        $meusInsights[] = "Seu equipamento mais usado foi {$meuEquipamentoMaisUsado['nome']}.";
    }
    $taxaConclusao = ($meusCards['total'] > 0) ? round(($meusCards['concluidos'] / $meusCards['total']) * 100, 1) : 0;
    $meusInsights[] = "Sua taxa de conclusão é de {$taxaConclusao}%.";

    // =======================================================
    // 📦 MONTAGEM FINAL DO JSON
    // =======================================================
    $data = [
        'usuario' => [
            'nome' => $nomeCompleto,
            'funcao' => $funcao
        ],
        'rankings' => [
            'professores' => $rankingProfessores,
            'equipamentos' => $rankingEquipamentos,
            'turnos' => $rankingTurnos
        ],
        'sistema' => [
            'cards' => [
                'totalMes' => $cards['totalMes'],
                'concluidos' => $cards['concluidos'],
                'cancelados' => $cards['cancelados'],
                'equipamentoMaisUsado' => $equipamentoMaisUsado
            ],
            'graficos' => $graficos,
            'insights' => $insightsSistema
        ],
        'professor' => [
            'cards' => [
                'total' => $meusCards['total'],
                'concluidos' => $meusCards['concluidos'],
                'cancelados' => $meusCards['cancelados'],
                'equipamentoMaisUsado' => $meuEquipamentoMaisUsado
            ],
            'graficos' => $meusGraficos,
            'insights' => $meusInsights
        ]
    ];

    header('Content-Type: application/json');
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
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
