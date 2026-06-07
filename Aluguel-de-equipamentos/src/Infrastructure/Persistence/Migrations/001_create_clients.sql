CREATE TABLE IF NOT EXISTS clients (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    phone       VARCHAR(50)  NOT NULL,
    address     TEXT         NOT NULL,
    document    VARCHAR(20)  NOT NULL,
    doc_type    VARCHAR(4)   NOT NULL CHECK (doc_type IN ('cpf','cnpj')),
    active      TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients (email);
