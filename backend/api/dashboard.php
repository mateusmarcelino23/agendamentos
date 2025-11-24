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
  // Se for uma requisição AJAX, retorna JSON de erro
  if ($isAjax) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Usuário não autenticado']);
  } else {
    // Se não for AJAX, redireciona para a página inicial
    header('Location: ../../');
  }
  exit;
}

// Pega o ID do professor logado da sessão
$professorId = $_SESSION['user_id'];

try {
  // Cria conexão com o banco de dados usando PDO
  $conn = getConnection();

  // Busca nome e email do professor logado
  $stmt = $conn->prepare("SELECT nome, email FROM professores WHERE id = :id");
  $stmt->execute([':id' => $professorId]);
  $professor = $stmt->fetch(PDO::FETCH_ASSOC);

  // Se não encontrar o professor, lança erro
  if (!$professor) {
    throw new Exception('Professor não encontrado no banco de dados.');
  }

  // Guarda o nome completo
  $nomeCompleto = trim($professor['nome']);
  // Pega apenas o primeiro nome (antes do primeiro espaço)
  $primeiroNome = explode(' ', $nomeCompleto)[0] ?? 'Professor';

  // Busca o próximo agendamento do professor (data futura mais próxima)
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

  // Conta o total de agendamentos que o professor já fez
  $stmt = $conn->prepare("
        SELECT COUNT(*) AS total
        FROM agendamentos
        WHERE professor_id = :professor_id
    ");
  $stmt->execute([':professor_id' => $professorId]);
  $totalAgendamentosProfessor = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

  // Conta quantos agendamentos foram feitos nesta semana (de todos os professores)
  $stmt = $conn->prepare("
        SELECT COUNT(*) AS total_semana
        FROM agendamentos
        WHERE YEARWEEK(data, 1) = YEARWEEK(CURDATE(), 1)
    ");
  $stmt->execute();
  $totalSemana = $stmt->fetch(PDO::FETCH_ASSOC)['total_semana'] ?? 0;

  // Busca os últimos 10 agendamentos do sistema
  $stmt = $conn->prepare("
        SELECT 
            p.nome AS professor,
            e.nome AS equipamento,
            a.data,
            a.aula,
            a.periodo
        FROM agendamentos a
        JOIN professores p ON a.professor_id = p.id
        JOIN equipamentos e ON a.equipamento_id = e.id
        ORDER BY a.data DESC, a.aula DESC
        LIMIT 10
    ");
  $stmt->execute();
  $ultimosAgendamentos = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

  // Pega a hora atual do servidor (para determinar o período)
  $horaAtual = date('H:i');
  $periodoAtual = null;

  // Define o período atual com base na hora
  if ($horaAtual >= '07:00' && $horaAtual <= '12:20') {
    $periodoAtual = 'manha';
  } elseif ($horaAtual >= '13:00' && $horaAtual <= '17:30') {
    $periodoAtual = 'tarde';
  } elseif ($horaAtual >= '18:00' && $horaAtual <= '22:30') {
    $periodoAtual = 'noite';
  }

  // Cria array vazio para armazenar a utilização atual
  $utilizacaoAtual = [];

  // Se houver um período correspondente à hora atual
  if ($periodoAtual) {
    // Busca todos os agendamentos do período atual na data de hoje
    $stmt = $conn->prepare("
            SELECT 
                p.nome AS professor,
                e.nome AS equipamento,
                a.aula,
                a.periodo
            FROM agendamentos a
            JOIN professores p ON a.professor_id = p.id
            JOIN equipamentos e ON a.equipamento_id = e.id
            WHERE a.data = CURDATE() AND a.periodo = :periodo
        ");
    $stmt->execute([':periodo' => $periodoAtual]);
    $utilizacaoAtual = $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  // Busca todas as datas do mês atual que têm agendamentos
  $stmt = $conn->prepare("
        SELECT 
            DATE(data) AS data,
            COUNT(*) AS total
        FROM agendamentos
        WHERE MONTH(data) = MONTH(CURDATE())
          AND YEAR(data) = YEAR(CURDATE())
        GROUP BY data
        ORDER BY data ASC
    ");
  $stmt->execute();
  $datasComAgendamento = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Monta o array final de dados que será convertido em JSON
  $data = [
    'primeiroNome' => $primeiroNome,
    'email' => $professor['email'],
    'proximoAgendamento' => $proximoAgendamento,
    'totalAgendamentosProfessor' => $totalAgendamentosProfessor,
    'totalAgendamentosSemana' => $totalSemana,
    'ultimosAgendamentos' => $ultimosAgendamentos,
    'utilizacaoAtual' => $utilizacaoAtual,
    'datasComAgendamento' => $datasComAgendamento
  ];

  // Define o tipo de resposta como JSON
  header('Content-Type: application/json');
  // Converte o array em JSON e envia ao front-end
  echo json_encode($data);
} catch (PDOException $e) {
  // Captura erros de banco de dados
  http_response_code(500);
  header('Content-Type: application/json');
  // Registra o erro no log do servidor
  error_log("Erro PDO: " . $e->getMessage());
  // Retorna mensagem genérica de erro
  echo json_encode(['error' => 'Erro interno do servidor (banco de dados).']);
} catch (Exception $e) {
  // Captura erros genéricos (ex: professor não encontrado)
  http_response_code(500);
  header('Content-Type: application/json');
  error_log("Erro: " . $e->getMessage());
  echo json_encode(['error' => 'Erro interno do servidor.']);
}

// Encerra o script
exit;
