-- ──────────────────────────────────────────────────────────────────────────────
-- DetachX: Create settings / profile tables
-- Migration 003 (2024-06-01)
--
-- Adds one table:
--   scan_history  — records of each scan the user runs (inbox + footprint)
--
-- Does NOT modify existing tables (unsub_history, block_history,
-- discovered_accounts, evidence_messages, service_deletion_info).
-- ──────────────────────────────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════════════════════
-- TABLE: scan_history
-- Immutable log of every scan a user runs.
-- Rows are INSERT-only (no UPDATE, no DELETE by user except full account wipe).
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.scan_history (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_email      TEXT        NOT NULL,
  scanned_at      TIMESTAMPTZ DEFAULT now(),
  scan_type       TEXT        DEFAULT 'inbox'
                               CHECK (scan_type IN ('inbox', 'footprint')),
  total_emails    INTEGER     DEFAULT 0,
  active_found    INTEGER     DEFAULT 0,
  unsubscribed    INTEGER     DEFAULT 0,
  blocked         INTEGER     DEFAULT 0,
  risk_summary    JSONB       DEFAULT '{}'::jsonb,
  services_found  INTEGER     DEFAULT 0
);

-- Fast lookups by user, newest first
CREATE INDEX IF NOT EXISTS idx_scan_history_user_email
  ON public.scan_history (user_email, scanned_at DESC);


-- ══════════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY scan_history_select ON public.scan_history
  FOR SELECT USING (user_email = auth.email());

CREATE POLICY scan_history_insert ON public.scan_history
  FOR INSERT WITH CHECK (user_email = auth.email());

CREATE POLICY scan_history_delete ON public.scan_history
  FOR DELETE USING (user_email = auth.email());
