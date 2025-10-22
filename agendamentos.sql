-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 21/10/2025 às 17:08
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `sae`

CREATE DATABASE agendamentos;
USE agendamentos;
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `agendamentos`
--

CREATE TABLE `agendamentos` (
  `id` int(11) NOT NULL,
  `equipamento_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `aula` set('1','2','3','4','5','6') NOT NULL,
  `nome_professor` varchar(80) NOT NULL,
  `email_professor` varchar(150) NOT NULL,
  `criado_em` datetime DEFAULT current_timestamp(),
  `periodo` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `agendamentos`
--

INSERT INTO `agendamentos` (`id`, `equipamento_id`, `data`, `aula`, `nome_professor`, `email_professor`, `criado_em`, `periodo`) VALUES
(16, 1, '2025-10-21', '', 'Fernando Henrique De Franciolli', 'franciolli@prof.educacao.sp.gov.br', '2025-10-21 10:15:59', NULL),
(17, 1, '2025-10-21', '1,2,3', 'Fernando Henrique De Franciolli', 'franciolli@prof.educacao.sp.gov.br', '2025-10-21 10:52:56', NULL),
(18, 1, '2025-10-21', '1,3,4', 'Fernando Henrique De Franciolli', 'franciolli@prof.educacao.sp.gov.br', '2025-10-21 11:01:25', NULL),
(20, 1, '2025-10-21', '1,4,5,6', 'Fernando Henrique De Franciolli', 'franciolli@prof.educacao.sp.gov.br', '2025-10-21 11:04:39', 1),
(22, 5, '2025-10-21', '1,3,4', 'Fernando Henrique De Franciolli', 'franciolli@prof.educacao.sp.gov.br', '2025-10-21 11:08:05', 2),
(23, 5, '2025-10-21', '1,4,5', 'Fernando Henrique De Franciolli', 'franciolli@prof.educacao.sp.gov.br', '2025-10-21 11:09:41', 0),
(25, 5, '2025-10-22', '1,3,4', 'Fernando Henrique De Franciolli', 'franciolli@prof.educacao.sp.gov.br', '2025-10-21 11:27:10', 2),
(26, 6, '2025-10-21', '1,3,4', 'Fernando Henrique De Franciolli', 'franciolli@prof.educacao.sp.gov.br', '2025-10-21 11:30:26', 0),
(27, 5, '2025-10-22', '1,2,4', 'Fernando Henrique De Franciolli', 'franciolli@prof.educacao.sp.gov.br', '2025-10-21 11:32:34', 1),
(28, 6, '2025-10-21', '2,3,4', 'Fernando Henrique De Franciolli', 'franciolli@prof.educacao.sp.gov.br', '2025-10-21 11:44:25', 1),
(29, 6, '2025-10-21', '2,4,5', 'Fernando Henrique De Franciolli', 'franciolli@prof.educacao.sp.gov.br', '2025-10-21 11:44:51', 1),
(30, 6, '2025-10-21', '1,2,3', 'Fernando Henrique De Franciolli', 'franciolli@prof.educacao.sp.gov.br', '2025-10-21 12:01:32', 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `equipamentos`
--

CREATE TABLE `equipamentos` (
  `id` int(11) NOT NULL,
  `nome_equip` varchar(40) DEFAULT NULL,
  `tipo` enum('laboratorio','guardiao') NOT NULL,
  `quantidade` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `equipamentos`
--

INSERT INTO `equipamentos` (`id`, `nome_equip`, `tipo`, `quantidade`) VALUES
(1, 'Lab. Informática 1', 'laboratorio', NULL),
(2, 'Lab. Informática 2', 'laboratorio', NULL),
(3, 'Lab. Informática 3', 'laboratorio', NULL),
(5, 'Notebook', 'guardiao', 40),
(6, 'Tablet', 'guardiao', 40);

-- --------------------------------------------------------

--
-- Estrutura para tabela `professores`
--

CREATE TABLE `professores` (
  `id` int(11) NOT NULL,
  `nome` varchar(80) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `google_id` varchar(100) DEFAULT NULL,
  `foto` text DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultimo_login` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `professores`
--

INSERT INTO `professores` (`id`, `nome`, `email`, `google_id`, `foto`, `criado_em`, `ultimo_login`) VALUES
(2, 'Alef Souza Sobrinho', 'alefsouzasobrinho51@gmail.com', '114403621117967195715', 'https://lh3.googleusercontent.com/a/ACg8ocJPGENbY-PcH0UH9EQiTelxrfpvnccfw9WyjG7j08hYgBN0dQ=s96-c', '2025-10-17 13:00:15', '2025-10-17 13:04:43'),
(4, 'Fernando Henrique De Franciolli', 'franciolli@prof.educacao.sp.gov.br', '114164458428656254991', 'https://lh3.googleusercontent.com/a/ACg8ocIwi9AeVP5-rwLr4s2A_OIxbAoVPKae_hvvouXK3imifhKUzg=s96-c', '2025-10-17 13:06:01', '2025-10-21 13:05:06');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `equipamentos`
--
ALTER TABLE `equipamentos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `professores`
--
ALTER TABLE `professores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de tabela `equipamentos`
--
ALTER TABLE `equipamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `professores`
--
ALTER TABLE `professores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD CONSTRAINT `fk_equipamento` FOREIGN KEY (`equipamento_id`) REFERENCES `equipamentos` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
