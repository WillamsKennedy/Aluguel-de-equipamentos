CREATE TABLE IF NOT EXISTS contracts (
    id             VARCHAR(36)  NOT NULL PRIMARY KEY,
    reservation_id VARCHAR(36)  NOT NULL UNIQUE,
    file_path      VARCHAR(500) NOT NULL,
    signed         TINYINT(1)   NOT NULL DEFAULT 0,
    signed_at      DATETIME     NULL,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations (id)
);
