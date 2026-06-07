CREATE TABLE IF NOT EXISTS reservations (
    id               VARCHAR(36)    NOT NULL PRIMARY KEY,
    client_id        VARCHAR(36)    NOT NULL,
    equipment_id     VARCHAR(36)    NOT NULL,
    start_date       DATE           NOT NULL,
    end_date         DATE           NOT NULL,
    daily_rate       DECIMAL(10, 2) NOT NULL,
    days             INT            NOT NULL,
    total_value      DECIMAL(10, 2) NOT NULL,
    deposit          DECIMAL(10, 2) NOT NULL,
    contract_signed  TINYINT(1)     NOT NULL DEFAULT 0,
    contract_path    VARCHAR(500)   NULL,
    cancelled        TINYINT(1)     NOT NULL DEFAULT 0,
    deposit_retained TINYINT(1)     NOT NULL DEFAULT 0,
    actual_return_at DATETIME       NULL,
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id)    REFERENCES clients   (id),
    FOREIGN KEY (equipment_id) REFERENCES equipment (id)
);

CREATE INDEX IF NOT EXISTS idx_reservations_client    ON reservations (client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_equipment ON reservations (equipment_id);
CREATE INDEX IF NOT EXISTS idx_reservations_period    ON reservations (start_date, end_date);
