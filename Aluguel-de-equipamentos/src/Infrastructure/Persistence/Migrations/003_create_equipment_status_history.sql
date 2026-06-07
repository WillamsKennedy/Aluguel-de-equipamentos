CREATE TABLE IF NOT EXISTS equipment_status_history (
    id               VARCHAR(36)  NOT NULL PRIMARY KEY,
    equipment_id     VARCHAR(36)  NOT NULL,
    from_status      VARCHAR(20)  NOT NULL,
    to_status        VARCHAR(20)  NOT NULL,
    changed_at       DATETIME     NOT NULL,
    changed_by_user  VARCHAR(36)  NOT NULL,
    notes            TEXT         NULL,
    FOREIGN KEY (equipment_id) REFERENCES equipment (id)
);

CREATE INDEX IF NOT EXISTS idx_status_history_equipment ON equipment_status_history (equipment_id);
