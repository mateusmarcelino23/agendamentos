<?php
// Garante que a sessão esteja ativa
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Importa conexão com banco
require_once('../config/database.php');

// Define resposta como JSON
header('Content-Type: application/json');

// Bloqueia acesso se usuário não estiver logado
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

// Aceita apenas requisições POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Lê dados JSON enviados pelo frontend
$input = json_decode(file_get_contents('php://input'), true);

// Verifica se é um array de agendamentos
if (!is_array($input) || empty($input)) {
    echo json_encode(['error' => 'Formato inválido']);
    exit;
}

// ID do professor logado
$professor_id = $_SESSION['user_id'];

try {
    // Conecta ao banco
    $conn = getConnection();

    // Inicia transação para garantir consistência
    $conn->beginTransaction();

    // Array para guardar o que foi inserido com sucesso
    $registrados = [];

    // Array para controlar equipamentos já reservados no mesmo envio
    $reservasDoEnvio = [];

    foreach ($input as $index => $item) {
        // Extrai campos individuais
        $data        = $item['data'] ?? null;
        $equipamento = $item['equipamento_id'] ?? null;
        $quantidade  = (int)($item['quantidade'] ?? 1);
        $periodo     = $item['periodo'] ?? null;
        $aula        = $item['aula'] ?? null;

        // Validação básica
        if (!$data || !$equipamento || !$periodo || !$aula || $quantidade < 1) {
            $conn->rollBack();
            echo json_encode([
                'error' => "Dados incompletos no item $index"
            ]);
            exit;
        }

        // 1) Consulta quantidade total do equipamento
        $stmt = $conn->prepare("SELECT quantidade FROM equipamentos WHERE id = :id");
        $stmt->execute([':id' => $equipamento]);
        $equipInfo = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$equipInfo) {
            $conn->rollBack();
            echo json_encode([
                'error' => "Equipamento $equipamento não encontrado no item $index"
            ]);
            exit;
        }

        $quantidadeTotal = (int)$equipInfo['quantidade'];

        // 2) Soma unidades já reservadas no banco
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

        // 3) Soma unidades já reservadas no mesmo envio
        $chaveReserva = "$data|$periodo|$aula|$equipamento";
        $jaReservadoNoEnvio = $reservasDoEnvio[$chaveReserva] ?? 0;

        // Calcula unidades disponíveis considerando banco + envio atual
        $disponivel = $quantidadeTotal - $totalAgendado - $jaReservadoNoEnvio;

        if ($quantidade > $disponivel) {
            $conn->rollBack();
            echo json_encode([
                'error' => "Somente $disponivel unidade(s) disponíveis para o item $index"
            ]);
            exit;
        }

        // 4) Insere agendamento
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

        // Atualiza reservas do envio
        $reservasDoEnvio[$chaveReserva] = ($jaReservadoNoEnvio + $quantidade);

        // Adiciona item na lista de registrados
        $registrados[] = [
            'data' => $data,
            'periodo' => $periodo,
            'aula' => $aula,
            'equipamento_id' => $equipamento,
            'quantidade' => $quantidade
        ];
    }

    // Confirma todos os inserts
    $conn->commit();

    // Retorna sucesso com lista de agendamentos registrados
    echo json_encode([
        'success' => true,
        'registrados' => $registrados
    ]);
} catch (Exception $e) {
    // Desfaz transação em caso de erro
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    http_response_code(500);
    error_log("Erro create múltiplos agendamentos: " . $e->getMessage());
    echo json_encode(['error' => 'Erro ao registrar agendamentos']);
}
