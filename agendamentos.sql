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
    tipo ENUM('informatica', 'guardiao') NOT NULL,
    quantidade INT DEFAULT 0,
    status ENUM('disponivel', 'em_uso', 'em_manutencao') DEFAULT 'disponivel',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `equipamentos` (`id`, `nome`, `tipo`, `quantidade`) VALUES
(1, 'Guardião 1', 'guardiao', 30),
(2, 'Guardião 2', 'guardiao', 30),
(3, 'Guardião 3', 'guardiao', 30),
(4, 'Informática 1', 'informatica', 30),
(5, 'Informática 2', 'informatica', 30),
(6, 'Informática 3', 'informatica', 30);

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
    quantidade INT NOT NULL DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TINYINT(2) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_equipamento FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE,
    CONSTRAINT fk_professor FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE,
    INDEX idx_data (data),
    INDEX idx_equipamento (equipamento_id),
    INDEX idx_professor (professor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabela: alertas_equipamentos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS alertas_equipamentos (
    id INT NOT NULL AUTO_INCREMENT,
    equipamento_id INT NOT NULL,
    professor_id INT NOT NULL,
    descricao TEXT NOT NULL,
    status ENUM('novo','em_analise','resolvido') DEFAULT 'novo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_alerta_equipamento FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE,
    CONSTRAINT fk_alerta_professor FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabela: mensagens_admin
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS mensagens_admin (
    id INT NOT NULL AUTO_INCREMENT,
    professor_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    lida TINYINT(1) DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    CONSTRAINT fk_msg_admin_professor FOREIGN KEY(professor_id)
        REFERENCES professores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: mensagens_professores
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS mensagens_professores (
    id INT NOT NULL AUTO_INCREMENT,
    professor_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    status ENUM('novo','lida','resolvida') DEFAULT 'novo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    CONSTRAINT fk_msg_professor FOREIGN KEY(professor_id)
        REFERENCES professores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

