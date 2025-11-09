<?php
// iniciando sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// importando o arquivo de conexão com o banco de dados
require_once('../config/database.php');

// verificando se o usuário está logado
if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

// pega o ID do professor logado da sessão
$professorId = $_SESSION['user_id'];

try {
    // cria conexão com o banco de dados usando PDO
    $conn = getConnection();

    // busca o nome e email do professor logado
    $stmt = $conn->prepare("SELECT nome, email FROM professores WHERE id = :id");
    $stmt->execute([':id' => $professorId]);
    $professor = $stmt->fetch(PDO::FETCH_ASSOC);

    // se nao encontrar o professor, lanca erro
    if (!$professor) {
        throw new Exception('Professor nao encontrado no banco de dados.');
    }

    // guarda o nome completo
    $nomeCompleto = trim($professor['nome']);
    // pega apenas o primeiro nome (antes do primeiro espaço)
    $primeiroNome = explode(' ', $nomeCompleto)[0] ?? 'Professor';

    // retorna o nome completo e o primeiro nome do professor logado
    header('Content-Type: application/json');
    echo json_encode([
        'nomeCompleto' => $nomeCompleto,
        'primeiroNome' => $primeiroNome,
        'email' => $professor['email']
    ]);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}

