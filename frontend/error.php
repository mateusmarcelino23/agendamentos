<?php
session_start();

$error = $_SESSION['oauth_error'] ?? null;
if (!$error) {
  echo '<h3>Nenhum erro registrado.</h3>';
  exit;
}

// mostra detalhes — escape para segurança
function h($s)
{
  return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

?>
<!doctype html>
<html>

<head>
  <meta charset="utf-8">
  <title>OAuth Error</title>
  <style>
    body {
      font-family: monospace;
      background: #111;
      color: #eee;
      padding: 20px;
    }

    pre {
      background: #222;
      padding: 15px;
      border-radius: 6px;
      overflow: auto;
    }

    .meta {
      margin-bottom: 12px;
    }

    .danger {
      color: #f88;
    }
  </style>
</head>

<body>
  <h2 class="danger">OAuth Error — detalhes</h2>
  <div class="meta"><strong><?= h($error['title']) ?></strong> — <?= h($error['server']['time']) ?></div>
  <div><strong>Request URI:</strong> <?= h($error['request_uri']) ?></div>
  <h3>Meta</h3>
  <pre><?= h(json_encode($error['meta'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) ?></pre>
  <h3>Server</h3>
  <pre><?= h(json_encode($error['server'], JSON_PRETTY_PRINT)) ?></pre>

  <p><em>Observação: informações sensíveis (tokens, client_secret) foram ocultadas automaticamente.</em></p>

  <form method="post">
    <button name="clear" value="1">Limpar e voltar</button>
  </form>

  <?php
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['clear'])) {
    unset($_SESSION['oauth_error']);
    header('Location: index.php');
    exit;
  }
  ?>
</body>

</html>