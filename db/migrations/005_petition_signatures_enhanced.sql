-- ============================================================
-- RAYEN — Migración 005: petition_signatures mejorada
-- Agrega campos de verificación con hashing de datos personales
-- Ejecutar con: psql $DATABASE_URL -f db/migrations/005_petition_signatures_enhanced.sql
-- ============================================================

-- 1. Hacer user_id nullable (firmas anónimas permitidas)
ALTER TABLE petition_signatures
  ALTER COLUMN user_id DROP NOT NULL;

-- 2. Agregar columnas de datos personales hasheados
ALTER TABLE petition_signatures
  ADD COLUMN IF NOT EXISTS nombres      TEXT,
  ADD COLUMN IF NOT EXISTS apellidos    TEXT,
  ADD COLUMN IF NOT EXISTS rut_hash     TEXT,
  ADD COLUMN IF NOT EXISTS correo_hash  TEXT,
  ADD COLUMN IF NOT EXISTS region       TEXT,
  ADD COLUMN IF NOT EXISTS razon        TEXT;

-- 3. Índices únicos parciales (solo cuando el hash está presente)
CREATE UNIQUE INDEX IF NOT EXISTS idx_petition_sigs_rut
  ON petition_signatures (petition_id, rut_hash)
  WHERE rut_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_petition_sigs_correo
  ON petition_signatures (petition_id, correo_hash)
  WHERE correo_hash IS NOT NULL;

-- 4. Habilitar RLS
ALTER TABLE petition_signatures ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS
DROP POLICY IF EXISTS "Firmas públicas visibles" ON petition_signatures;
CREATE POLICY "Firmas públicas visibles" ON petition_signatures
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solo el usuario puede insertar su firma" ON petition_signatures;
CREATE POLICY "Solo el usuario puede insertar su firma" ON petition_signatures
  FOR INSERT WITH CHECK (true);

-- 6. Vista pública de conteos (sin datos personales)
CREATE OR REPLACE VIEW petition_signature_counts AS
  SELECT petition_id, COUNT(*) AS total_signatures
  FROM petition_signatures
  GROUP BY petition_id;

-- 7. Trigger más preciso: usa COUNT en lugar de incremento
CREATE OR REPLACE FUNCTION update_petition_signatures_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE petitions
  SET signed_count = (
    SELECT COUNT(*) FROM petition_signatures WHERE petition_id = NEW.petition_id
  )
  WHERE id = NEW.petition_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_petition_signed_count ON petition_signatures;
DROP TRIGGER IF EXISTS on_signature_insert ON petition_signatures;

CREATE TRIGGER on_signature_insert
  AFTER INSERT ON petition_signatures
  FOR EACH ROW EXECUTE FUNCTION update_petition_signatures_count();

-- 8. Actualizar imagen de petición Carlos Anwandter
UPDATE petitions
SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Cisnes_de_cuello_negro_en_el_santuario_de_la_naturaleza_Carlos_Anwandter.jpg/1280px-Cisnes_de_cuello_negro_en_el_santuario_de_la_naturaleza_Carlos_Anwandter.jpg'
WHERE slug = 'restaurar-humedal-carlos-anwandter';
