CREATE TABLE IF NOT EXISTS payments (
    id                  VARCHAR(36)    NOT NULL PRIMARY KEY,
    reservation_id      VARCHAR(36)    NOT NULL,
    method              VARCHAR(20)    NOT NULL CHECK (method IN ('card','pix','boleto')),
    amount              DECIMAL(10, 2) NOT NULL,
    status              VARCHAR(20)    NOT NULL DEFAULT 'pending',
    gateway_reference   VARCHAR(255)   NULL,
    processed_at        DATETIME       NULL,
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations (id)
    -- NUNCA armazenar número de cartão, CVV ou dados bancários brutos (PCI-DSS)
);

CREATE INDEX IF NOT EXISTS idx_payments_reservation ON payments (reservation_id);
