-- Tabla para configuraciones del sistema
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Configuración inicial de ejemplo
INSERT INTO settings (key, value) VALUES
  ('company', '{"name": "Distribuidora Tapia", "address": "", "phone": "", "email": "", "tax_id": "", "logo": ""}'),
  ('notifications', '{"lowStock": true, "newOrders": true, "paymentDue": true, "emailNotifications": false}'),
  ('system', '{"currency": "USD", "taxRate": 16, "lowStockThreshold": 10, "autoBackup": true}')
ON CONFLICT (key) DO NOTHING;
