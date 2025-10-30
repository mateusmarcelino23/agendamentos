-- phpMyAdmin SQL Dump - Reformulado e Normalizado
-- Banco de dados: agendamentos

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS agendamentos CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE agendamentos;

-- --------------------------------------------------------
-- Tabela: equipamentos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipamentos (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('laboratorio', 'guardiao') NOT NULL,
    quantidade INT DEFAULT 0,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabela: professores
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS professores (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(80) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    google_id VARCHAR(100),
    foto TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    funcao ENUM('professor','admin') NOT NULL DEFAULT 'professor',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabela: agendamentos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS agendamentos (
    id INT NOT NULL AUTO_INCREMENT,
    equipamento_id INT NOT NULL,
    professor_id INT NOT NULL,
    data DATE NOT NULL,
    aula TINYINT UNSIGNED NOT NULL CHECK(aula BETWEEN 1 AND 6),
    periodo ENUM('manha','tarde','noite') NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_equipamento FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE,
    CONSTRAINT fk_professor FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE,
    INDEX idx_data (data),
    INDEX idx_equipamento (equipamento_id),
    INDEX idx_professor (professor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

COMMIT;
