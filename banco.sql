CREATE DATABASE IF NOT EXISTS soda;

USE soda;

-- ==========================================
-- TABELA DE USUÁRIOS
-- ==========================================

CREATE TABLE IF NOT EXISTS usuarios (

    idUsuario INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(255) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    senha VARCHAR(255) NOT NULL,

    tipoUsuario ENUM(
        'admin',
        'aluno',
        'professor',
        'servidor',
        'coordenador'
    ) NOT NULL DEFAULT 'aluno',

    -- Dados do aluno
    matricula VARCHAR(100),

    curso VARCHAR(255),

    periodo VARCHAR(50),

    -- Dados do professor
    disciplina VARCHAR(255),

    -- Dados do servidor
    siape VARCHAR(100),

    cargo VARCHAR(255),

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);


-- ==========================================
-- TABELA DE MANIFESTAÇÕES
-- ==========================================

CREATE TABLE IF NOT EXISTS manifestacoes (

    idManifestacao INT AUTO_INCREMENT PRIMARY KEY,

    titulo VARCHAR(255) NOT NULL,

    descricao TEXT NOT NULL,

    status ENUM(
        'aberta',
        'em andamento',
        'concluida'
    ) NOT NULL DEFAULT 'aberta',

    idUsuario INT NOT NULL,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_manifestacao_usuario
        FOREIGN KEY (idUsuario)
        REFERENCES usuarios(idUsuario)
        ON DELETE CASCADE

);


-- ==========================================
-- TABELA DE RESPOSTAS
-- ==========================================

CREATE TABLE IF NOT EXISTS respostas (

    idResposta INT AUTO_INCREMENT PRIMARY KEY,

    texto TEXT NOT NULL,

    idManifestacao INT NOT NULL,

    idUsuario INT,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_resposta_manifestacao
        FOREIGN KEY (idManifestacao)
        REFERENCES manifestacoes(idManifestacao)
        ON DELETE CASCADE,

    CONSTRAINT fk_resposta_usuario
        FOREIGN KEY (idUsuario)
        REFERENCES usuarios(idUsuario)
        ON DELETE SET NULL

);