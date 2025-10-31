<?php
require_once __DIR__ . '/backend/config/config.php'; // Carrega as configurações

// Autoload do Composer
require __DIR__ . '/backend/vendor/autoload.php';


// Se já estiver logado, redirecionar para dashboard
if (isset($_SESSION['user_id'])) {
  header('Location: frontend/pages/dashboard.html');
  exit;
}

// Gerar URL de autenticação do Google
$params = [
  'client_id' => $_ENV['GOOGLE_CLIENT_ID'], // Usando variável de ambiente
  'redirect_uri' => GOOGLE_REDIRECT_URI, // Constante definida no config.php
  'response_type' => 'code', // Código de autorização
  'scope' => 'email profile', // Escopos necessários
  'access_type' => 'online', // Tipo de acesso
  'prompt' => 'select_account' // Forçar seleção de conta
];

$googleLoginUrl = GOOGLE_AUTH_URL . '?' . http_build_query($params); // Constante definida no config.php

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="frontend/assets/img/1748908346791.png">
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
  <!-- Lottie Animation Library -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.10.2/lottie.min.js"></script>
  <!-- Estilos personalizados -->
  <link rel="stylesheet" href="frontend/assets/styles/login.css">
  <title>Login do Professor - SAEE</title>
</head>

<body>

  <!-- Versão para mobile -->

  <div class="login-container">

    <!-- Cabeçalho com logos -->
    <div class="login-header">
      <img src="frontend/assets/img/1748908346791.png" alt="Logo Miguel Vicente Cury" class="logo">
      <img src="frontend/assets/img/saeelogo.png" alt="Logo SAEE" class="logo saee-logo">
      <img src="frontend/assets/img/f3y98K8qjJjSJr8w7M6qu2EpzpofC8MLWbltM77l.png" alt="Secretaria de Educação" class="logo">
    </div>

    <!-- Animação do robozinho dando oi -->
    <div id="robozinho"></div>

    <!-- Caixa de login -->
    <div class="login-box">
      <!-- Botão de Login com Google -->
      <a href="<?php echo htmlspecialchars($googleLoginUrl); ?>" class="google-btn">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
        </svg>
        Login do Professor
        <!-- Ícone de seta Bootstrap -->
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-arrow-right-circle" viewBox="0 0 16 16" style="margin-right: 8px;">
          <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
        </svg>
      </a>
    </div>

    <!-- Link de Sobre abaixo -->
    <div style="text-align: center;">
      <u class="about-link" onclick="window.location.href='frontend/pages/sobre.php'">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
        </svg>
        Sobre o SAEE (PDF)
      </u>
    </div>

    <!-- Direitos reservados -->
    <div class="login-footer">
      &copy; <?php echo date('Y'); ?> Mateus Marcelino dos Santos - Todos os direitos reservados.
    </div>

  </div>


  <!-- Versão para desktop -->

  <!-- Container da versão desktop -->
  <div class="desktop-login-container">

    <!-- Lado esquerdo: formulário -->
    <div class="desktop-left-side">

      <!-- Cabeçalho com logos (versão desktop) -->
      <div class="desktop-header">
        <img src="frontend/assets/img/1748908346791.png" alt="Logo Miguel Vicente Cury" class="desktop-logo">
        <img src="frontend/assets/img/saeelogo.png" alt="Logo SAEE" class="desktop-logo saee-logo-desktop">
        <img src="frontend/assets/img/f3y98K8qjJjSJr8w7M6qu2EpzpofC8MLWbltM77l.png" alt="Secretaria de Educação" class="desktop-logo">
      </div>

      <!-- Animação do robozinho -->
      <div id="desktop-robozinho"></div>

      <!-- Caixa de login -->
      <div class="desktop-login-box">
        <a href="<?php echo htmlspecialchars($googleLoginUrl); ?>" class="desktop-google-btn">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
          </svg>
          Login do Professor
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-arrow-right-circle" viewBox="0 0 16 16" style="margin-right: 8px;">
            <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
          </svg>
        </a>
      </div>

      <!-- Link de Sobre -->
      <div class="desktop-about-link-container">
        <u class="desktop-about-link" onclick="window.location.href='frontend/pages/sobre.php'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
          </svg>
          Sobre o SAEE (PDF)
        </u>
      </div>

      <!-- Footer -->
      <div class="desktop-login-footer">
        &copy; <?php echo date('Y'); ?> Mateus Marcelino dos Santos - Todos os direitos reservados.
      </div>
    </div>

    <!-- Lado direito: vídeo + frase -->
    <div class="desktop-right-side">
      <video autoplay muted loop class="desktop-background-video">
        <source src="frontend/assets/animations/200522-SpeedLineAnimeHol.mp4" type="video/mp4">
      </video>
      <div class="desktop-overlay-text">
        <h1>Educação é o futuro sendo escrito hoje.</h1>
      </div>
    </div>

  </div>

</body>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>

<script>
  // Seleciona o container
  var container = document.getElementById('robozinho');

  // Carrega a animação
  var animacao = lottie.loadAnimation({
    container: container, // o div
    renderer: 'svg', // pode ser 'svg', 'canvas' ou 'html'
    loop: true, // repetir indefinidamente
    autoplay: true, // inicia sozinha
    path: 'frontend/assets/animations/RobotSaludando.json' // caminho do arquivo JSON
  });
</script>

<script>
  // Seleciona o container
  var container = document.getElementById('desktop-robozinho');

  // Carrega a animação
  var animacao = lottie.loadAnimation({
    container: container, // o div
    renderer: 'svg', // pode ser 'svg', 'canvas' ou 'html'
    loop: true, // repetir indefinidamente
    autoplay: true, // inicia sozinha
    path: 'frontend/assets/animations/RobotSaludando.json' // caminho do arquivo JSON
  });
</script>


</html>