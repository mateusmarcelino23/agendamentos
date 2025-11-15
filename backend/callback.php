<?php
require_once __DIR__ . '/config/config.php'; // Arquivo com constantes do Google e do sistema
require_once __DIR__ . '/config/database.php'; // Arquivo que cria a conexão PDO $pdo
session_start(); // Inicia a sessão PHP para armazenar dados do usuário e erros

// Converte warnings e notices do PHP em exceções para tratar de forma unificada
set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// Função para remover dados sensíveis antes de armazenar ou mostrar em página de erro
function redact_sensitive($data)
{
    if (is_array($data)) { // Se for array, percorre recursivamente
        $out = [];
        foreach ($data as $k => $v) {
            $key = strtolower($k);
            // Se a chave sugere informação sensível, substitui por "[REDACTED]"
            if (strpos($key, 'secret') !== false || strpos($key, 'token') !== false || strpos($key, 'access') !== false || strpos($key, 'id_token') !== false) {
                $out[$k] = '[REDACTED]';
            } else {
                $out[$k] = redact_sensitive($v); // Chama recursivamente para valores aninhados
            }
        }
        return $out;
    }
    return $data; // Se não for array, retorna o valor original
}

// Função que envia o erro para a página de erro e termina o script
function sendErrorAndExit($title, $meta = [])
{
    // Monta o payload com título, metadados, URL da requisição e info do servidor
    $payload = [
        'title' => $title,
        'meta' => redact_sensitive($meta),
        'request_uri' => $_SERVER['REQUEST_URI'] ?? null,
        'server' => [
            'method' => $_SERVER['REQUEST_METHOD'] ?? null,
            'host' => $_SERVER['HTTP_HOST'] ?? null,
            'time' => date('c') // Hora atual no padrão ISO 8601
        ]
    ];
    $_SESSION['oauth_error'] = $payload; // Armazena o payload na sessão
    header('Location: /agendamentos/backend/views/error.php'); // Redireciona para página de erro
    exit; // Interrompe o script
}

try {
    // Verifica se o código de autorização do Google foi recebido
    if (!isset($_GET['code'])) {
        sendErrorAndExit('Código de autorização ausente', ['query' => $_GET]);
    }

    $code = $_GET['code']; // Captura o código enviado pelo Google

    // Monta dados para trocar o código pelo token de acesso
    $tokenData = [
        'code' => $code,
        'client_id' => GOOGLE_CLIENT_ID,
        'client_secret' => GOOGLE_CLIENT_SECRET,
        'redirect_uri' => GOOGLE_REDIRECT_URI,
        'grant_type' => 'authorization_code'
    ];

    // Inicia requisição cURL para obter o token
    $ch = curl_init(GOOGLE_TOKEN_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Retornar resultado como string
    curl_setopt($ch, CURLOPT_POST, true); // POST
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($tokenData)); // Dados codificados
    curl_setopt($ch, CURLOPT_TIMEOUT, 15); // Timeout 15s

    $response = curl_exec($ch); // Executa requisição
    $curlErrNo = curl_errno($ch); // Captura erros cURL
    $curlErr = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch); // Fecha cURL

    // Se ocorreu erro cURL, envia para página de erro
    if ($curlErrNo !== 0) {
        sendErrorAndExit('Erro cURL ao obter token', [
            'curl_errno' => $curlErrNo,
            'curl_error' => $curlErr,
            'token_request' => $tokenData
        ]);
    }

    $tokenInfo = json_decode($response, true); // Decodifica JSON
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendErrorAndExit('Resposta JSON inválida do token endpoint', [
            'json_error' => json_last_error_msg(),
            'raw_response' => $response,
            'http_code' => $httpCode
        ]);
    }

    // Verifica se o access_token foi retornado
    if (!isset($tokenInfo['access_token'])) {
        sendErrorAndExit('Não foi retornado access_token', [
            'token_response' => $tokenInfo,
            'http_code' => $httpCode
        ]);
    }

    // Requisição cURL para obter informações do usuário
    $ch = curl_init(GOOGLE_USER_INFO_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $tokenInfo['access_token']
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $response = curl_exec($ch);
    $curlErrNo = curl_errno($ch);
    $curlErr = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($curlErrNo !== 0) {
        sendErrorAndExit('Erro cURL ao obter userinfo', [
            'curl_errno' => $curlErrNo,
            'curl_error' => $curlErr,
            'token_response_summary' => [
                'expires_in' => $tokenInfo['expires_in'] ?? null,
                'scope' => $tokenInfo['scope'] ?? null
            ]
        ]);
    }

    $userInfo = json_decode($response, true); // Decodifica JSON do usuário
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendErrorAndExit('Resposta JSON inválida do userinfo', [
            'json_error' => json_last_error_msg(),
            'raw_response' => $response,
            'http_code' => $httpCode
        ]);
    }

    // Verifica se Google retornou ID do usuário
    if (!isset($userInfo['id'])) {
        sendErrorAndExit('Erro ao obter informações do usuário', [
            'userinfo_response' => $userInfo,
            'http_code' => $httpCode
        ]);
    }

    // Salva usuário no banco e obtém o ID
    $userId = saveUser(
        $userInfo['id'],
        $userInfo['name'] ?? null,
        $userInfo['email'] ?? null,
        $userInfo['picture'] ?? null
    );

    if (!$userId) {
        sendErrorAndExit('Falha ao salvar usuário no banco', ['userinfo' => $userInfo]);
    }

    // Armazena informações do usuário na sessão
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_name'] = $userInfo['name'] ?? null;
    $_SESSION['user_email'] = $userInfo['email'] ?? null;
    $_SESSION['user_picture'] = $userInfo['picture'] ?? null;

    unset($_SESSION['oauth_error']); // Limpa erro anterior se houver
    header('Location: ../frontend/pages/dashboard.html'); // Redireciona para dashboard
    exit;
} catch (Throwable $e) { // Captura qualquer exceção
    sendErrorAndExit('Exceção disparada', [
        'message' => $e->getMessage(),
        'file' => $e->getFile() . ':' . $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}

?>