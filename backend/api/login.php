<?php
session_start();
require_once __DIR__ . '/../config/config.php';
require __DIR__ . '/../vendor/autoload.php';

// Verifica se o usuário já está logado
if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'logged_in' => true,
        'redirect' => 'frontend/pages/dashboard.html'
    ]);
    exit;
}

// Gerar URL de autenticação do Google
$params = [
    'client_id' => $_ENV['GOOGLE_CLIENT_ID'],
    'redirect_uri' => GOOGLE_REDIRECT_URI,
    'response_type' => 'code',
    'scope' => 'email profile',
    'access_type' => 'online',
    'prompt' => 'select_account'
];

$googleLoginUrl = GOOGLE_AUTH_URL . '?' . http_build_query($params);

echo json_encode([
    'logged_in' => false,
    'google_login_url' => $googleLoginUrl
]);

exit;