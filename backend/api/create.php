<?php
// Garante sessão ativa para identificar o professor.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Importa conexão com banco.
require_once('../config/database.php');

// Define saída JSON por padrão.
header('Content-Type: application/json');

// Bloqueia requisição caso usuário não esteja autenticado.
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

// Aceita exclusivamente requisições POST contendo JSON.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Converte corpo da requisição em array associativo.
$input = json_decode(file_get_contents('php://input'), true);

// Extrai os campos enviados pelo frontend.
$data         = $input['data'] ?? null;
$equipamento  = $input['equipamento_id'] ?? null;
$quantidade   = (int)($input['quantidade'] ?? 1);
$periodo      = $input['periodo'] ?? null;
$aula         = $input['aula'] ?? null;

// Obtém ID do professor diretamente da sessão ativa.
$professor_id = $_SESSION['user_id'];

// Valida presença de todos os campos obrigatórios.
if (!$data || !$equipamento || !$periodo || !$aula || $quantidade < 1) {
    echo json_encode(['error' => 'Dados incompletos']);
    exit;
}

try {
    // Abre conexão com banco.
    $conn = getConnection();

    // 1) Obtém a quantidade total disponível do equipamento.
    $stmt = $conn->prepare("SELECT quantidade FROM equipamentos WHERE id = :id");
    $stmt->execute([':id' => $equipamento]);
    $equipInfo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$equipInfo) {
        echo json_encode(['error' => 'Equipamento não encontrado']);
        exit;
    }

    $quantidadeTotal = (int)$equipInfo['quantidade'];

    // 2) Verifica quantas unidades já estão agendadas para o mesmo horário.
    $stmt = $conn->prepare("
        SELECT SUM(quantidade) AS total_agendado
        FROM agendamentos
        WHERE equipamento_id = :equip
          AND data = :data
          AND periodo = :periodo
          AND aula = :aula
    ");
    $stmt->execute([
        ':equip' => $equipamento,
        ':data' => $data,
        ':periodo' => $periodo,
        ':aula' => $aula
    ]);

    $totalAgendado = (int)($stmt->fetch(PDO::FETCH_ASSOC)['total_agendado'] ?? 0);

    // 3) Calcula quantas unidades ainda podem ser reservadas.
    $disponivel = $quantidadeTotal - $totalAgendado;

    if ($quantidade > $disponivel) {
        echo json_encode(['error' => "Somente $disponivel unidade(s) disponíveis para este horário"]);
        exit;
    }

    // 4) Insere o agendamento.
    $stmt = $conn->prepare("
        INSERT INTO agendamentos 
        (equipamento_id, professor_id, data, aula, periodo, quantidade, status)
        VALUES (:equip, :prof, :data, :aula, :periodo, :quant, 0)
    ");

    $stmt->execute([
        ':equip' => $equipamento,
        ':prof' => $professor_id,
        ':data' => $data,
        ':aula' => $aula,
        ':periodo' => $periodo,
        ':quant' => $quantidade
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
