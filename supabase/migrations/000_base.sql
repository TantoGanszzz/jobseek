-- JOBSEEK — Base schema (complete). Includes onboarding tables.
-- Run this FIRST in the Supabase SQL editor, then you may (safely) re-run 001_onboarding.sql.
-- Idempotent: safe to run multiple times.

-- ============================================================
-- 1. profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  headline text,
  avatar_url text,
  phone text,
  location text,
  bio text,
  skills text[] DEFAULT '{}'::text[],
  education text,
  university text,
  major text,
  github_url text,
  linkedin_url text,
  portfolio_url text,
  resume_url text,
  role text NOT NULL DEFAULT 'user',
  onboarding_completed boolean NOT NULL DEFAULT false,
  onboarding_step integer NOT NULL DEFAULT 1,
  date_of_birth date,
  gender text,
  city text,
  province text,
  education_level text,
  graduation_year integer,
  education_status text,
  gpa text,
  experience_level text,
  has_experience boolean,
  interests text[] DEFAULT '{}'::text[],
  preferred_roles text[] DEFAULT '{}'::text[],
  preferred_work_type text[] DEFAULT '{}'::text[],
  preferred_work_location text[] DEFAULT '{}'::text[],
  preferred_city text,
  preferred_province text,
  willing_to_relocate boolean,
  career_goal text,
  short_term_goal text,
  long_term_goal text,
  behance_url text,
  dribbble_url text,
  position text,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. companies
-- ============================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  description text,
  location text,
  website text,
  industry text,
  company_size text,
  company_type text,
  city text,
  province text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text,
  job_type text,
  experience_level text,
  salary_range text,
  skills text[] DEFAULT '{}'::text[],
  preferred_skills text[] DEFAULT '{}'::text[],
  responsibilities text,
  requirements text,
  min_qualification_score integer NOT NULL DEFAULT 70,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. applications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'test_required',
  score integer,
  applied_at timestamptz NOT NULL DEFAULT now(),
  cv_url text,
  test_attempt_id uuid,
  UNIQUE (user_id, job_id)
);

-- ============================================================
-- 5. saved_jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  saved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);

-- ============================================================
-- 6. qualification_tests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.qualification_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  time_limit_minutes integer NOT NULL DEFAULT 15,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. qualification_test_attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.qualification_test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.qualification_tests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- ============================================================
-- 8. portfolio_projects
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  tech_stack text[] DEFAULT '{}'::text[],
  role text,
  year integer,
  live_url text,
  github_url text,
  thumbnail_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 9. experiences
-- ============================================================
CREATE TABLE IF NOT EXISTS public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  position text NOT NULL,
  start_date text,
  end_date text,
  is_current boolean DEFAULT false,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS experiences_user_id_idx ON public.experiences (user_id);

-- ============================================================
-- 10. career_recommendations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.career_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  career_name text NOT NULL,
  match_score integer NOT NULL,
  reason text NOT NULL,
  required_skills text[] DEFAULT '{}'::text[],
  recommended_skills text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS career_recommendations_user_id_idx ON public.career_recommendations (user_id);

-- ============================================================
-- 11. company_preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS public.company_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  preferred_roles text[] DEFAULT '{}'::text[],
  hiring_types text[] DEFAULT '{}'::text[],
  work_modes text[] DEFAULT '{}'::text[],
  candidate_experience text[] DEFAULT '{}'::text[],
  preferred_skills text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS company_preferences_company_id_key ON public.company_preferences (company_id);

-- ============================================================
-- 12. courses
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  skill_category text,
  difficulty text,
  estimated_duration text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. learning_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress_pct integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'not_started',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (user_id, course_id)
);

-- ============================================================
-- 14. activities
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Helpers
-- (Define AFTER the tables so SQL function bodies can be
--  validated on a fresh/empty database.)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.companies WHERE created_by = auth.uid()
  );
$$;

-- Auto-create a profile row when an auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, onboarding_completed, onboarding_step)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'role',
      CASE WHEN NEW.raw_user_meta_data->>'account_type' = 'industry' THEN 'hrd' ELSE 'user' END
    ),
    false,
    1
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for users who registered before this migration ran
INSERT INTO public.profiles (id, email, full_name, role, onboarding_completed, onboarding_step)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
  COALESCE(
    u.raw_user_meta_data->>'role',
    CASE WHEN u.raw_user_meta_data->>'account_type' = 'industry' THEN 'hrd' ELSE 'user' END
  ),
  false,
  1
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- profiles: own, admins, or HRD reviewing an applicant
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR public.is_admin()
    OR id IN (
      SELECT a.user_id
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE j.company_id IN (SELECT c.id FROM public.companies c WHERE c.created_by = auth.uid())
    )
  );

-- profiles: insert happens via trigger (security definer); also allow auth flow upsert
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- companies: readable by anyone signed in (feed jo), edited by owner/admin
DROP POLICY IF EXISTS companies_select ON public.companies;
CREATE POLICY companies_select ON public.companies
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS companies_insert_own ON public.companies;
CREATE POLICY companies_insert_own ON public.companies
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS companies_update_own ON public.companies;
CREATE POLICY companies_update_own ON public.companies
  FOR UPDATE
  USING (created_by = auth.uid() OR public.is_admin())
  WITH CHECK (created_by = auth.uid() OR public.is_admin());

-- jobs: everyone can read; owner/admin manage
DROP POLICY IF EXISTS jobs_select ON public.jobs;
CREATE POLICY jobs_select ON public.jobs
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS jobs_insert_owner ON public.jobs;
CREATE POLICY jobs_insert_owner ON public.jobs
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR company_id IN (SELECT id FROM public.companies WHERE created_by = auth.uid())
  );

DROP POLICY IF EXISTS jobs_update_owner ON public.jobs;
CREATE POLICY jobs_update_owner ON public.jobs
  FOR UPDATE
  USING (
    public.is_admin()
    OR company_id IN (SELECT id FROM public.companies WHERE created_by = auth.uid())
  );

-- applications: user's own, company owner, or admin
DROP POLICY IF EXISTS applications_select ON public.applications;
CREATE POLICY applications_select ON public.applications
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR job_id IN (
      SELECT j.id FROM public.jobs j
      JOIN public.companies c ON c.id = j.company_id
      WHERE c.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS applications_insert_own ON public.applications;
CREATE POLICY applications_insert_own ON public.applications
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS applications_update_last ON public.applications;
CREATE POLICY applications_update_last ON public.applications
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR job_id IN (
      SELECT j.id FROM public.jobs j
      JOIN public.companies c ON c.id = j.company_id
      WHERE c.created_by = auth.uid()
    )
  );

-- saved_jobs: own
DROP POLICY IF EXISTS saved_jobs_all_own ON public.saved_jobs;
CREATE POLICY saved_jobs_all_own ON public.saved_jobs
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- qualification_tests: everyone can read (to take tests); only admin/owner writes
DROP POLICY IF EXISTS qualification_tests_select ON public.qualification_tests;
CREATE POLICY qualification_tests_select ON public.qualification_tests
  FOR SELECT
  USING (true);

-- attempts: own (company sees scores through applications join)
DROP POLICY IF EXISTS attempts_all_own ON public.qualification_test_attempts;
CREATE POLICY attempts_all_own ON public.qualification_test_attempts
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- portfolio: own
DROP POLICY IF EXISTS portfolio_all_own ON public.portfolio_projects;
CREATE POLICY portfolio_all_own ON public.portfolio_projects
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- experiences: own
DROP POLICY IF EXISTS experiences_select_own ON public.experiences;
CREATE POLICY experiences_select_own ON public.experiences FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS experiences_insert_own ON public.experiences;
CREATE POLICY experiences_insert_own ON public.experiences FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS experiences_update_own ON public.experiences;
CREATE POLICY experiences_update_own ON public.experiences FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS experiences_delete_own ON public.experiences;
CREATE POLICY experiences_delete_own ON public.experiences FOR DELETE USING (user_id = auth.uid());

-- career_recommendations: own
DROP POLICY IF EXISTS career_recommendations_select_own ON public.career_recommendations;
CREATE POLICY career_recommendations_select_own ON public.career_recommendations FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS career_recommendations_insert_own ON public.career_recommendations;
CREATE POLICY career_recommendations_insert_own ON public.career_recommendations FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS career_recommendations_delete_own ON public.career_recommendations;
CREATE POLICY career_recommendations_delete_own ON public.career_recommendations FOR DELETE USING (user_id = auth.uid());

-- company_preferences: company owner
DROP POLICY IF EXISTS company_preferences_all_own ON public.company_preferences;
CREATE POLICY company_preferences_all_own ON public.company_preferences
  FOR ALL
  USING (
    company_id IN (SELECT id FROM public.companies WHERE created_by = auth.uid())
  )
  WITH CHECK (
    company_id IN (SELECT id FROM public.companies WHERE created_by = auth.uid())
  );

-- courses / learning_progress / activities
DROP POLICY IF EXISTS courses_select ON public.courses;
CREATE POLICY courses_select ON public.courses
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS learning_progress_all_own ON public.learning_progress;
CREATE POLICY learning_progress_all_own ON public.learning_progress
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS activities_all_own ON public.activities;
CREATE POLICY activities_all_own ON public.activities
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Seed data
-- ============================================================
INSERT INTO public.companies (id, name, description, location, industry, company_size, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'TechNova',
  'Technology company building software for the future.',
  'Jakarta',
  'Technology',
  '51-200',
  'approved'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, company_id, title, description, location, job_type, experience_level, salary_range, skills, min_qualification_score, status)
VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Frontend Developer',
    'Build modern web interfaces with React and Next.js.',
    'Jakarta',
    'Full Time',
    'Junior',
    'Rp 6jt - 9jt',
    ARRAY['React','Next.js','TypeScript','HTML','CSS'],
    70,
    'active'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Backend Developer',
    'Design APIs and services with Node.js and PostgreSQL.',
    'Jakarta',
    'Full Time',
    'Mid Level',
    'Rp 9jt - 14jt',
    ARRAY['Node.js','TypeScript','PostgreSQL','Docker'],
    75,
    'active'
  ) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.qualification_tests (id, job_id, title, description, questions, time_limit_minutes)
VALUES
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'Frontend Developer Test',
    'Basic test for frontend skills.',
    '[
      {"id":"q1","question":"What does CSS stand for?","options":["Cascading Style Sheets","Computer Style Sheets","Creative Style System","Colorful Style Sheets"],"correct_answer":0},
      {"id":"q2","question":"Which hook is used for state in React?","options":["useEffect","useState","useMemo","useRef"],"correct_answer":1},
      {"id":"q3","question":"What does the display:flex property do?","options":["Makes text bold","Enables flex layout on a container","Hides an element","Aligns text to center"],"correct_answer":1},
      {"id":"q4","question":"Which is NOT a JavaScript data type?","options":["string","boolean","float","undefined"],"correct_answer":2},
      {"id":"q5","question":"Which Next.js folder is the entry point for App Router layouts?","options":["/pages","/app","/src","/components"],"correct_answer":1}
    ]'::jsonb,
    15
  ) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.courses (title, description, skill_category, difficulty, estimated_duration)
VALUES
  ('React Basics', 'Learn React from scratch.', 'Programming', 'Beginner', '4 weeks'),
  ('JavaScript Fundamentals', 'Core JavaScript concepts.', 'Programming', 'Beginner', '3 weeks'),
  ('PostgreSQL Essentials', 'Database design and SQL.', 'Data', 'Intermediate', '5 weeks')
ON CONFLICT (id) DO NOTHING;

-- Storage bucket for CV uploads (run separately if supabase_storage is unavailable)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;