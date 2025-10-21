<?php
require_once 'config.php';
require_once 'database.php';
session_start();

// converte warnings/notices em exceções
set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// sanitiza dados sensíveis antes de enviar pro error.php
function redact_sensitive($data)
{
    if (is_array($data)) {
        $out = [];
        foreach ($data as $k => $v) {
            $key = strtolower($k);
            if (strpos($key, 'secret') !== false || strpos($key, 'token') !== false || strpos($key, 'access') !== false || strpos($key, 'id_token') !== false) {
                $out[$k] = '[REDACTED]';
            } else {
                $out[$k] = redact_sensitive($v);
            }
        }
        return $out;
    }
    return $data;
}

function sendErrorAndExit($title, $meta = [])
{
    $payload = [
        'title' => $title,
        'meta' => redact_sensitive($meta),
        'request_uri' => $_SERVER['REQUEST_URI'] ?? null,
        'server' => [
            'method' => $_SERVER['REQUEST_METHOD'] ?? null,
            'host' => $_SERVER['HTTP_HOST'] ?? null,
            'time' => date('c')
        ]
    ];
    $_SESSION['oauth_error'] = $payload;
    // redireciona para página de erro (altere se necessário)
    header('Location: /agendamentos/error.php');
    exit;
}

try {
    // Verificar se recebeu o código
    if (!isset($_GET['code'])) {
        // não trata como fatal: apenas redireciona com info
        sendErrorAndExit('Código de autorização ausente', ['query' => $_GET]);
    }

    $code = $_GET['code'];

    // Trocar código por token de acesso
    $tokenData = [
        'code' => $code,
        'client_id' => GOOGLE_CLIENT_ID,
        'client_secret' => GOOGLE_CLIENT_SECRET,
        'redirect_uri' => GOOGLE_REDIRECT_URI,
        'grant_type' => 'authorization_code'
    ];

    $ch = curl_init(GOOGLE_TOKEN_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($tokenData));
    // optional: set timeout
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);

    $response = curl_exec($ch);
    $curlErrNo = curl_errno($ch);
    $curlErr = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($curlErrNo !== 0) {
        sendErrorAndExit('Erro cURL ao obter token', [
            'curl_errno' => $curlErrNo,
            'curl_error' => $curlErr,
            'token_request' => $tokenData
        ]);
    }

    $tokenInfo = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendErrorAndExit('Resposta JSON inválida do token endpoint', [
            'json_error' => json_last_error_msg(),
            'raw_response' => $response,
            'http_code' => $httpCode
        ]);
    }

    if (!isset($tokenInfo['access_token'])) {
        sendErrorAndExit('Não foi retornado access_token', [
            'token_response' => $tokenInfo,
            'http_code' => $httpCode
        ]);
    }

    // Obter informações do usuário
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

    $userInfo = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendErrorAndExit('Resposta JSON inválida do userinfo', [
            'json_error' => json_last_error_msg(),
            'raw_response' => $response,
            'http_code' => $httpCode
        ]);
    }

    if (!isset($userInfo['id'])) {
        sendErrorAndExit('Erro ao obter informações do usuário', [
            'userinfo_response' => $userInfo,
            'http_code' => $httpCode
        ]);
    }

    // Salvar usuário no banco de dados (supondo que saveUser exista)
    $userId = saveUser(
        $userInfo['id'],
        $userInfo['name'] ?? null,
        $userInfo['email'] ?? null,
        $userInfo['picture'] ?? null
    );

    if (!$userId) {
        sendErrorAndExit('Falha ao salvar usuário no banco', [
            'userinfo' => $userInfo
        ]);
    }

    // Salvar na sessão
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_name'] = $userInfo['name'] ?? null;
    $_SESSION['user_email'] = $userInfo['email'] ?? null;
    $_SESSION['user_picture'] = $userInfo['picture'] ?? null;

    // Limpa qualquer erro anterior
    unset($_SESSION['oauth_error']);

    // Redirecionar para dashboard
    header('Location: calendario.php');
    exit;
} catch (Throwable $e) {
    sendErrorAndExit('Exceção disparada', [
        'message' => $e->getMessage(),
        'file' => $e->getFile() . ':' . $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}
