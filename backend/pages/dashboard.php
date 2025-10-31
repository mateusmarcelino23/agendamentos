<?php
// Inicia sessão se não estiver ativa
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

require_once('../config/database.php'); // Contém $pdo

// Detecta se a requisição é AJAX
$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest';

// Se o usuário não estiver logado, retorna erro JSON ou redireciona
if (!isset($_SESSION['user_id'])) {
  if ($isAjax) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Usuário não autenticado']);
  } else {
    header('Location: ../../'); // Redireciona para a página inicial
  }
  exit;
}

// ID do professor logado
$professorId = $_SESSION['user_id'] ?? null;

try {
  // Conexão PDO
  $conn = getConnection();

  // Buscar dados do professor no banco pelo ID
  $stmt = $conn->prepare("SELECT nome, email FROM professores WHERE id = :id");
  $stmt->execute([':id' => $professorId]);
  $professor = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$professor) {
    // Se o professor não existir no banco (inconsistência)
    throw new Exception('Professor não encontrado no banco de dados.');
  }

  // Pega o nome completo do professor
  $nomeCompleto = $professor['nome'];
  // Extrai o primeiro nome (até o primeiro espaço) ou usa fallback
  $primeiroNome = explode(' ', trim($nomeCompleto))[0] ?? 'Professor';

  // Próximo agendamento do professor
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

  // Últimos 5 agendamentos do professor
  $stmt = $conn->prepare("
        SELECT a.data, a.aula, e.nome AS equipamento
        FROM agendamentos a
        JOIN equipamentos e ON a.equipamento_id = e.id
        WHERE a.professor_id = :professor_id
        ORDER BY a.data DESC, a.aula DESC
        LIMIT 5
    ");
  $stmt->execute([':professor_id' => $professorId]);
  $ultimosAgendamentos = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

  // Total de equipamentos cadastrados
  $stmt = $conn->query("SELECT COUNT(*) AS total FROM equipamentos");
  $totalEquipamentos = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

  // Monta resposta JSON
  $data = [
    'primeiroNome' => $primeiroNome,
    'proximoAgendamento' => $proximoAgendamento,
    'ultimosAgendamentos' => $ultimosAgendamentos,
    'totalEquipamentos' => $totalEquipamentos
  ];

  header('Content-Type: application/json');
  echo json_encode($data);
} catch (PDOException $e) {
  http_response_code(500);
  header('Content-Type: application/json');
  // Loga o erro internamente
  error_log("Erro PDO: " . $e->getMessage());
  echo json_encode(['error' => 'Erro interno do servidor']);
} catch (Exception $e) {
  http_response_code(500);
  header('Content-Type: application/json');
  error_log("Erro: " . $e->getMessage());
  echo json_encode(['error' => 'Erro interno do servidor']);
}

exit();
?>