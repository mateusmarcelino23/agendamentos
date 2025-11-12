<?php
// Força o retorno como JSON
header('Content-Type: application/json; charset=utf-8');

// Opcional: inclui o autoload e as configs (caso queira testar conexões, etc)
// require_once __DIR__ . '/vendor/autoload.php';
// require_once __DIR__ . '/config/config.php';

echo json_encode([
    'status' => 'API online',
    'project' => 'SAEE',
    'version' => '0.1',
    'timestamp' => date('Y-m-d H:i:s')
], JSON_PRETTY_PRINT);
