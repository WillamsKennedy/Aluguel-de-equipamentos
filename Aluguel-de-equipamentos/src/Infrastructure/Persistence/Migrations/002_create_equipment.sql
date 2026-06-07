CREATE TABLE IF NOT EXISTS equipment (
    id            VARCHAR(36)    NOT NULL PRIMARY KEY,
    name          VARCHAR(255)   NOT NULL,
    category      VARCHAR(100)   NOT NULL,
    serial_number VARCHAR(100)   NOT NULL UNIQUE,
    daily_rate    DECIMAL(10, 2) NOT NULL,
    status        VARCHAR(20)    NOT NULL DEFAULT 'disponivel',
    photo_paths   TEXT           NULL,
    created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipment_serial ON equipment (serial_number);
CREATE INDEX IF NOT EXISTS idx_equipment_status  ON equipment (status);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment (category);
