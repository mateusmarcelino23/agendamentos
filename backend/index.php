<?php
// Força o retorno como JSON
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'status' => 'API online',
    'project' => 'SAEE',
    'version' => '0.1',
    'timestamp' => date('Y-m-d H:i:s')
], JSON_PRETTY_PRINT);
