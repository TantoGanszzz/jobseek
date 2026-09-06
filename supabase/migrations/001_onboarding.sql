-- JOBSEEK — Post-registration onboarding system migration (superseded by 000_base.sql)
-- 000_base.sql now contains the COMPLETE schema (including everything here).
-- Keep this file for compatibility: it is idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- and safe to run AFTER 000_base.sql. Do NOT run it on an empty database before 000_base.sql.

-- ============================================================
-- 1. profiles: onboarding + extended profile columns
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS education_level text,
  ADD COLUMN IF NOT EXISTS graduation_year integer,
  ADD COLUMN IF NOT EXISTS education_status text,
  ADD COLUMN IF NOT EXISTS gpa text,
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS has_experience boolean,
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS preferred_roles text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS preferred_work_type text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS preferred_work_location text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS preferred_city text,
  ADD COLUMN IF NOT EXISTS preferred_province text,
  ADD COLUMN IF NOT EXISTS willing_to_relocate boolean,
  ADD COLUMN IF NOT EXISTS career_goal text,
  ADD COLUMN IF NOT EXISTS short_term_goal text,
  ADD COLUMN IF NOT EXISTS long_term_goal text,
  ADD COLUMN IF NOT EXISTS behance_url text,
  ADD COLUMN IF NOT EXISTS dribbble_url text,
  ADD COLUMN IF NOT EXISTS position text,
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id) ON DELETE SET NULL;

-- ============================================================
-- 2. companies: extended company info + moderation status
-- ============================================================
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS company_size text,
  ADD COLUMN IF NOT EXISTS company_type text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- ============================================================
-- 3. experiences (user work history)
-- ============================================================
CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  position text NOT NULL,
  start_date text,
  end_date text,
  is_current boolean DEFAULT false,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS experiences_user_id_idx ON experiences (user_id);

-- ============================================================
-- 4. career_recommendations (persisted AI-style recommendations)
-- ============================================================
CREATE TABLE IF NOT EXISTS career_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  career_name text NOT NULL,
  match_score integer NOT NULL,
  reason text NOT NULL,
  required_skills text[] DEFAULT '{}'::text[],
  recommended_skills text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS career_recommendations_user_id_idx ON career_recommendations (user_id);

-- ============================================================
-- 5. company_preferences (HRD recruitment matching data)
-- ============================================================
CREATE TABLE IF NOT EXISTS company_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  preferred_roles text[] DEFAULT '{}'::text[],
  hiring_types text[] DEFAULT '{}'::text[],
  work_modes text[] DEFAULT '{}'::text[],
  candidate_experience text[] DEFAULT '{}'::text[],
  preferred_skills text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS company_preferences_company_id_idx ON company_preferences (company_id);

-- Only one preferences row per company
CREATE UNIQUE INDEX IF NOT EXISTS company_preferences_company_id_key ON company_preferences (company_id);

-- ============================================================
-- 6. Row Level Security
-- ============================================================
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_preferences ENABLE ROW LEVEL SECURITY;

-- Users manage their own experiences
DROP POLICY IF EXISTS experiences_select_own ON experiences;
CREATE POLICY experiences_select_own ON experiences FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS experiences_insert_own ON experiences;
CREATE POLICY experiences_insert_own ON experiences FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS experiences_update_own ON experiences;
CREATE POLICY experiences_update_own ON experiences FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS experiences_delete_own ON experiences;
CREATE POLICY experiences_delete_own ON experiences FOR DELETE USING (user_id = auth.uid());

-- Career recommendations are readable only by their owner (admin excluded via service role)
DROP POLICY IF EXISTS career_recommendations_select_own ON career_recommendations;
CREATE POLICY career_recommendations_select_own ON career_recommendations FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS career_recommendations_insert_own ON career_recommendations;
CREATE POLICY career_recommendations_insert_own ON career_recommendations FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS career_recommendations_delete_own ON career_recommendations;
CREATE POLICY career_recommendations_delete_own ON career_recommendations FOR DELETE USING (user_id = auth.uid());

-- Company preferences managed by the company's HRD owner
DROP POLICY IF EXISTS company_preferences_all_own ON company_preferences;
CREATE POLICY company_preferences_all_own ON company_preferences
  FOR ALL
  USING (
    company_id IN (
      SELECT companies.id FROM companies WHERE companies.created_by = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT companies.id FROM companies WHERE companies.created_by = auth.uid()
    )
  );

-- Allow HRD to update their own profile & company
DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS companies_update_own ON companies;
CREATE POLICY companies_update_own ON companies FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());