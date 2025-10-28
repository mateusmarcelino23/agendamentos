-- phpMyAdmin SQL Dump - Versão Base
-- Estrutura inicial do banco de dados: agendamentos

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS agendamentos;
USE agendamentos;

-- --------------------------------------------------------
-- Estrutura da tabela `agendamentos`
-- --------------------------------------------------------

CREATE TABLE `agendamentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equipamento_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `aula` set('1','2','3','4','5','6') NOT NULL,
  `nome_professor` varchar(80) NOT NULL,
  `email_professor` varchar(150) NOT NULL,
  `criado_em` datetime DEFAULT current_timestamp(),
  `periodo` enum('manha','tarde','noite') NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_equipamento` FOREIGN KEY (`equipamento_id`) REFERENCES `equipamentos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estrutura da tabela `equipamentos`
-- --------------------------------------------------------

CREATE TABLE `equipamentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome_equip` varchar(40) DEFAULT NULL,
  `tipo` enum('laboratorio','guardiao') NOT NULL,
  `quantidade` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Estrutura da tabela `professores`
-- --------------------------------------------------------

CREATE TABLE `professores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(80) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL UNIQUE,
  `google_id` varchar(100) DEFAULT NULL,
  `foto` text DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultimo_login` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `funcao` enum('professor','admin') NOT NULL DEFAULT 'professor',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

COMMIT;
