<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once('../config/database.php');

$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest';

if (!isset($_SESSION['user_id'])) {
    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Usuário não autenticado']);
    } else {
        header('Location: ../../');
    }
    exit;
}

$professorId = $_SESSION['user_id'];
$conn = getConnection();

// Detecta o tipo de requisição (GET = carregar dados / POST = enviar alerta ou mensagem)
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $acao = $_POST['acao'] ?? null;

        // -------------------------------------------------
        // 1. ENVIAR ALERTA DE PROBLEMA
        // -------------------------------------------------
        if ($acao === 'alerta') {
            $equipamentoId = $_POST['equipamento_id'] ?? null;
            $descricao = trim($_POST['descricao'] ?? '');

            if (!$equipamentoId || empty($descricao)) {
                throw new Exception('Campos obrigatórios não preenchidos.');
            }

            $stmt = $conn->prepare("
                INSERT INTO alertas_equipamentos (equipamento_id, professor_id, descricao)
                VALUES (:equipamento_id, :professor_id, :descricao)
            ");
            $stmt->execute([
                ':equipamento_id' => $equipamentoId,
                ':professor_id' => $professorId,
                ':descricao' => $descricao
            ]);

            echo json_encode(['success' => true, 'message' => 'Alerta enviado com sucesso!']);
            exit;
        }

        // -------------------------------------------------
        // 2. ENVIAR MENSAGEM ENTRE PROFESSORES
        // -------------------------------------------------
        if ($acao === 'mensagem_professor') {
            $titulo = trim($_POST['titulo'] ?? '');
            $mensagem = trim($_POST['mensagem'] ?? '');

            if (empty($titulo) || empty($mensagem)) {
                throw new Exception('Título e mensagem são obrigatórios.');
            }

            $stmt = $conn->prepare("
                INSERT INTO mensagens_professores (professor_id, titulo, mensagem)
                VALUES (:professor_id, :titulo, :mensagem)
            ");
            $stmt->execute([
                ':professor_id' => $professorId,
                ':titulo' => $titulo,
                ':mensagem' => $mensagem
            ]);

            echo json_encode(['success' => true, 'message' => 'Mensagem enviada com sucesso!']);
            exit;
        }

        throw new Exception('Ação inválida.');
    }

    // -------------------------------------------------
    // 3. SE FOR GET → RETORNAR TODOS OS DADOS
    // -------------------------------------------------

    // Dados do professor
    $stmt = $conn->prepare("SELECT nome, email FROM professores WHERE id = :id");
    $stmt->execute([':id' => $professorId]);
    $professor = $stmt->fetch(PDO::FETCH_ASSOC);

    $nomeCompleto = trim($professor['nome']);
    $primeiroNome = explode(' ', $nomeCompleto)[0] ?? 'Professor';

    // Equipamentos
    $stmt = $conn->query("SELECT id, nome, tipo, quantidade, status FROM equipamentos ORDER BY nome ASC");
    $equipamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Mensagens do admin
    $stmt = $conn->prepare("
        SELECT id, titulo, mensagem, criado_em, lida
        FROM mensagens_admin
        WHERE professor_id = :professor_id
        ORDER BY criado_em DESC
        LIMIT 10
    ");
    $stmt->execute([':professor_id' => $professorId]);
    $mensagensAdmin = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Contador de mensagens não lidas
    $stmt = $conn->prepare("
        SELECT COUNT(*) AS nao_lidas
        FROM mensagens_admin
        WHERE professor_id = :professor_id AND lida = 0
    ");
    $stmt->execute([':professor_id' => $professorId]);
    $naoLidas = $stmt->fetch(PDO::FETCH_ASSOC)['nao_lidas'] ?? 0;

    // Mensagens entre professores (chat público)
    $stmt = $conn->prepare("
        SELECT m.id, p.nome AS professor, m.titulo, m.mensagem, m.criado_em
        FROM mensagens_professores m
        JOIN professores p ON m.professor_id = p.id
        ORDER BY m.criado_em DESC
        LIMIT 15
    ");
    $stmt->execute();
    $chatProfessores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $data = [
        'primeiroNome' => $primeiroNome,
        'email' => $professor['email'],
        'equipamentos' => $equipamentos,
        'mensagensAdmin' => $mensagensAdmin,
        'mensagensNaoLidas' => $naoLidas,
        'chatProfessores' => $chatProfessores
    ];

    header('Content-Type: application/json');
    echo json_encode($data);
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}

exit;
