<?php
require_once 'vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
// Configurações do Google OAuth2
define('GOOGLE_CLIENT_ID', $_ENV['GOOGLE_CLIENT_ID']);
define('GOOGLE_CLIENT_SECRET', $_ENV['GOOGLE_CLIENT_SECRET']);
define('GOOGLE_REDIRECT_URI', 'http://127.0.0.1:8081/SAE/callback.php');

// Configurações do banco de dados
define('DB_HOST', $_ENV['DB_HOST']);
define('DB_NAME', $_ENV['DB_NAME']);
define('DB_USER', $_ENV['DB_USER']);
define('DB_PASS', $_ENV['DB_PASS']);

// URLs do Google OAuth2
define('GOOGLE_AUTH_URL', 'https://accounts.google.com/o/oauth2/v2/auth');
define('GOOGLE_TOKEN_URL', 'https://oauth2.googleapis.com/token');
define('GOOGLE_USER_INFO_URL', 'https://www.googleapis.com/oauth2/v2/userinfo');

// Iniciar sessão
session_start();
