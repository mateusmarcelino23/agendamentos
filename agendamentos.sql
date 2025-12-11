-- Banco de dados: agendamentos
CREATE DATABASE IF NOT EXISTS `agendamentos` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `agendamentos`;

-- --------------------------------------------------------
-- Tabela: professores
-- --------------------------------------------------------
CREATE TABLE `professores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(80) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `google_id` varchar(100) DEFAULT NULL,
  `foto` text DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_login` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `funcao` enum('professor','admin') NOT NULL DEFAULT 'professor',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabela: equipamentos
-- --------------------------------------------------------
CREATE TABLE `equipamentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `tipo` enum('informatica','guardiao') NOT NULL,
  `quantidade` int(11) DEFAULT 0,
  `status` enum('disponivel','em_uso','em_manutencao') DEFAULT 'disponivel',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `equipamentos` (`id`, `nome`, `tipo`, `quantidade`) VALUES
(1, 'Guardião 1', 'guardiao', 30),
(2, 'Guardião 2', 'guardiao', 30),
(3, 'Guardião 3', 'guardiao', 30),
(4, 'Informática 1', 'informatica', 30),
(5, 'Informática 2', 'informatica', 30),
(6, 'Informática 3', 'informatica', 30);

-- --------------------------------------------------------
-- Tabela: agendamentos
-- --------------------------------------------------------
CREATE TABLE `agendamentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equipamento_id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `aula` tinyint(3) UNSIGNED NOT NULL CHECK (`aula` BETWEEN 1 AND 6),
  `periodo` enum('manha','tarde','noite') NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` tinyint(2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_data` (`data`),
  KEY `idx_equipamento` (`equipamento_id`),
  KEY `idx_professor` (`professor_id`),
  CONSTRAINT `fk_equipamento` FOREIGN KEY (`equipamento_id`) REFERENCES `equipamentos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_professor` FOREIGN KEY (`professor_id`) REFERENCES `professores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabela: alertas_equipamentos
-- --------------------------------------------------------
CREATE TABLE `alertas_equipamentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equipamento_id` int(11) NOT NULL,
  `professor_id` int(11) NOT NULL,
  `descricao` text NOT NULL,
  `status` enum('novo','em_analise','resolvido') DEFAULT 'novo',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_alerta_equipamento` (`equipamento_id`),
  KEY `fk_alerta_professor` (`professor_id`),
  CONSTRAINT `fk_alerta_equipamento` FOREIGN KEY (`equipamento_id`) REFERENCES `equipamentos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_alerta_professor` FOREIGN KEY (`professor_id`) REFERENCES `professores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabela: mensagens_admin
-- --------------------------------------------------------
CREATE TABLE `mensagens_admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `professor_id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensagem` text NOT NULL,
  `lida` tinyint(1) DEFAULT 0,
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_msg_admin_professor` (`professor_id`),
  CONSTRAINT `fk_msg_admin_professor` FOREIGN KEY (`professor_id`) REFERENCES `professores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Tabela: mensagens_professores
-- --------------------------------------------------------
CREATE TABLE `mensagens_professores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `professor_id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensagem` text NOT NULL,
  `status` enum('novo','lida','resolvida') DEFAULT 'novo',
  `criado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_msg_professor` (`professor_id`),
  CONSTRAINT `fk_msg_professor` FOREIGN KEY (`professor_id`) REFERENCES `professores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
