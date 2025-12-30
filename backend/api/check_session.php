<?php
session_start();

header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    // Sessão existe
    echo json_encode(['logged_in' => true]);
} else {
    // Sessão não existe
    echo json_encode(['logged_in' => false]);
}
