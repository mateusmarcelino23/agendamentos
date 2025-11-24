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

    /*
     * 1) Verifica se o equipamento existe e obtém sua quantidade máxima.
     *    Essa informação é necessária para validar o limite do estoque.
     */
    $stmt = $conn->prepare("SELECT quantidade FROM equipamentos WHERE id = :id");
    $stmt->execute([':id' => $equipamento]);
    $equipInfo = $stmt->fetch(PDO::FETCH_ASSOC);

    // Tratamento caso o ID fornecido não exista.
    if (!$equipInfo) {
        echo json_encode(['error' => 'Equipamento não encontrado']);
        exit;
    }

    // Converte quantidade máxima registrada no banco para inteiro.
    $max = (int)$equipInfo['quantidade'];

    // Verifica se a quantidade solicitada excede o estoque total.
    if ($quantidade > $max) {
        echo json_encode(['error' => "Quantidade máxima permitida: $max"]);
        exit;
    }

    /*
     * 2) Verifica se já existe outro agendamento no mesmo:
     *    - equipamento
     *    - dia
     *    - período
     *    - aula
     *    Se existir, não é permitido duplicar agendamento.
     */
    $stmt = $conn->prepare("
        SELECT COUNT(*) AS total
        FROM agendamentos
        WHERE data = :data
          AND equipamento_id = :equip
          AND aula = :aula
          AND periodo = :periodo
    ");
    $stmt->execute([
        ':data' => $data,
        ':equip' => $equipamento,
        ':aula' => $aula,
        ':periodo' => $periodo
    ]);

    // Caso já exista um reservador anterior, retorna erro.
    if ($stmt->fetch(PDO::FETCH_ASSOC)['total'] > 0) {
        echo json_encode(['error' => 'Este horário já está ocupado']);
        exit;
    }

    /*
     * 3) Insere o agendamento devidamente validado.
     *    Status padrão "0" pode significar "pendente".
     */
    $stmt = $conn->prepare("
        INSERT INTO agendamentos 
        (equipamento_id, professor_id, data, aula, periodo, quantidade, status)
        VALUES (:equip, :prof, :data, :aula, :periodo, :quant, 0)
    ");

    // Executa inserção usando parâmetros nomeados para evitar SQL Injection.
    $stmt->execute([
        ':equip' => $equipamento,
        ':prof' => $professor_id,
        ':data' => $data,
        ':aula' => $aula,
        ':periodo' => $periodo,
        ':quant' => $quantidade
    ]);

    // Retorno padrão de sucesso.
    echo json_encode([
        'success' => true,
        'message' => 'Agendamento registrado com sucesso!'
    ]);
} catch (Exception $e) {

    // Registra falha no log para futuras investigações.
    http_response_code(500);
    error_log("Erro create agendamento: " . $e->getMessage());

    // Retorna erro amigável ao frontend.
    echo json_encode(['error' => 'Erro ao registrar agendamento']);
}
