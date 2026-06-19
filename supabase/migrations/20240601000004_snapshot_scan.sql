-- ──────────────────────────────────────────────────────────────────────────────
-- DetachX: Convert scan_history from historical log to latest-snapshot table
-- Migration 004 (2024-06-01)
--
-- Changes:
--   - Drops the old INSERT-only scan_history table
--   - Recreates with composite PK (user_email, scan_type) so each user has
--     at most one row per scan type (inbox / footprint)
--   - Supports UPSERT via ON CONFLICT
--
-- This enables the "latest scan snapshot" pattern — every new scan
-- overwrites the previous summary rather than appending a new row.
-- ──────────────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS public.scan_history CASCADE;

-- ══════════════════════════════════════════════════════════════════════════════
-- TABLE: scan_history (snapshot)
-- One row per (user_email, scan_type). Each new scan UPSERTs the row.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.scan_history (
  user_email      TEXT        NOT NULL,
  scan_type       TEXT        NOT NULL DEFAULT 'inbox'
                               CHECK (scan_type IN ('inbox', 'footprint')),
  scanned_at      TIMESTAMPTZ DEFAULT now(),
  total_emails    INTEGER     DEFAULT 0,
  active_found    INTEGER     DEFAULT 0,
  unsubscribed    INTEGER     DEFAULT 0,
  blocked         INTEGER     DEFAULT 0,
  risk_summary    JSONB       DEFAULT '{}'::jsonb,
  services_found  INTEGER     DEFAULT 0,

  -- Each user has at most ONE snapshot per scan type
  PRIMARY KEY (user_email, scan_type)
);

-- Speed up lookups by scan_type
CREATE INDEX IF NOT EXISTS idx_scan_history_user_email
  ON public.scan_history (user_email);


-- ══════════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY scan_history_select ON public.scan_history
  FOR SELECT USING (user_email = auth.email());

CREATE POLICY scan_history_insert ON public.scan_history
  FOR INSERT WITH CHECK (user_email = auth.email());

CREATE POLICY scan_history_update ON public.scan_history
  FOR UPDATE USING (user_email = auth.email());

CREATE POLICY scan_history_delete ON public.scan_history
  FOR DELETE USING (user_email = auth.email());
