-- Schema inicial para Party Booth

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  music_path  TEXT,                          -- storage path del MP3
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ                    -- null = no expira
);

-- Tabla de fotos
CREATE TABLE IF NOT EXISTS photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  taken_by     TEXT,                        -- device fingerprint anónimo
  taken_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_taken_at ON photos(taken_at);
CREATE INDEX IF NOT EXISTS idx_events_owner_id ON events(owner_id);

-- RLS: solo el owner ve sus eventos
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "owner access" ON events
  USING (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "owner insert" ON events
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "owner update" ON events
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "owner delete" ON events
  FOR DELETE USING (owner_id = auth.uid());

-- RLS: fotos del evento son públicas para lectura si tienes el event_id
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "public read by event" ON photos
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "anyone can insert" ON photos
  FOR INSERT WITH CHECK (true);

-- Trigger para limpiar storage al borrar evento (opcional, requiere función)
-- Nota: En Supabase, la limpieza de storage al borrar filas
-- se puede manejar con Edge Functions o manualmente
