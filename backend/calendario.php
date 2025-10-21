<?php
include '../database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // session_start();

  $nome_professor  = $_SESSION['user_name'] ?? 'Desconhecido';
  $email_professor = $_SESSION['user_email'] ?? 'desconhecido@email.com';
  $data            = trim($_POST['data-agendamento'] ?? '');
  $aulas           = $_POST['aulas'] ?? [];
  $equipamento_tipo = trim($_POST['equipamentos'] ?? '');
  $periodo         = trim($_POST['periodo'] ?? '');
  $extra           = trim($_POST['laboratorio'] ?? ($_POST['guardiao'] ?? ''));

  if (!$data || empty($aulas) || !$equipamento_tipo || !$extra || $periodo === '') {
    $_SESSION['mensagem_preencha_campos'] = "Por favor, preencha todos os campos obrigatórios.";
    header("Location: ../calendario.php");
    exit;
  }

  $pdo = getConnection();

  // Pega equipamento
  $stmt = $pdo->prepare("SELECT id FROM equipamentos WHERE tipo=? AND (nome_equip=? OR nome_equip='')");
  $stmt->execute([$equipamento_tipo, $extra]);
  $equipamento = $stmt->fetch();
  if (!$equipamento) {
    $_SESSION['mensagem_erro'] = "Equipamento não encontrado.";
    header("Location: ../calendario.php");
    exit;
  } 
  $equipamento_id = $equipamento['id'];

  // Concatena as aulas selecionadas
  $aulas_str = implode(',', $aulas);

  // Insere no banco incluindo período
  $stmt = $pdo->prepare("
        INSERT INTO agendamentos 
        (equipamento_id, data, aula, periodo, nome_professor, email_professor) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
  $stmt->execute([$equipamento_id, $data, $aulas_str, $periodo, $nome_professor, $email_professor]);

  $_SESSION['mensagem_sucesso'] = "Agendamento salvo com sucesso!";
  header("Location: ../calendario.php");
  exit;
}
