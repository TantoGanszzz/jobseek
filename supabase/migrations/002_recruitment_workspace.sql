-- Additive persistent recruitment and employee workspace schema.
-- This migration intentionally preserves all existing tables and seed data.

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS work_mode text,
  ADD COLUMN IF NOT EXISTS employment_type text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS salary_min numeric,
  ADD COLUMN IF NOT EXISTS salary_max numeric,
  ADD COLUMN IF NOT EXISTS education_requirement text,
  ADD COLUMN IF NOT EXISTS application_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS recruitment_stages text[] NOT NULL DEFAULT ARRAY['APPLICATION', 'SCREENING', 'QUALIFICATION_TEST', 'INTERVIEW', 'FINAL_REVIEW']::text[];

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS overall_match_score integer,
  ADD COLUMN IF NOT EXISTS skill_match_score integer,
  ADD COLUMN IF NOT EXISTS location_match_score integer,
  ADD COLUMN IF NOT EXISTS work_mode_match_score integer,
  ADD COLUMN IF NOT EXISTS career_match_score integer,
  ADD COLUMN IF NOT EXISTS matched_skills text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS missing_skills text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS hired_at timestamptz;

CREATE TABLE IF NOT EXISTS public.application_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_required_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, skill_name)
);

CREATE TABLE IF NOT EXISTS public.technical_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  instructions text,
  duration_minutes integer,
  deadline timestamptz,
  passing_score integer NOT NULL DEFAULT 70 CHECK (passing_score BETWEEN 0 AND 100),
  submission_type text NOT NULL DEFAULT 'github_url',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.technical_challenges(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  github_url text,
  live_demo_url text,
  text_answer text,
  notes text,
  status text NOT NULL DEFAULT 'ASSIGNED',
  score integer CHECK (score BETWEEN 0 AND 100),
  feedback text,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, application_id)
);

CREATE TABLE IF NOT EXISTS public.interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer,
  platform text NOT NULL,
  meeting_url text,
  notes text,
  internal_notes text,
  status text NOT NULL DEFAULT 'SCHEDULED',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recruitment_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL UNIQUE REFERENCES public.applications(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recruitment_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.recruitment_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text NOT NULL CHECK (length(trim(message)) > 0),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
  related_job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  hired_application_id uuid NOT NULL UNIQUE REFERENCES public.applications(id) ON DELETE RESTRICT,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE RESTRICT,
  department text,
  status text NOT NULL DEFAULT 'ACTIVE',
  hired_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  deadline timestamptz,
  status text NOT NULL DEFAULT 'PLANNING',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_members (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'MEMBER',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'MEDIUM',
  deadline timestamptz,
  status text NOT NULL DEFAULT 'TODO',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  event_type text NOT NULL,
  related_application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
  related_project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS applications_user_id_idx ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS applications_job_id_idx ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS application_status_history_application_id_idx ON public.application_status_history(application_id, created_at);
CREATE INDEX IF NOT EXISTS challenge_submissions_application_id_idx ON public.challenge_submissions(application_id);
CREATE INDEX IF NOT EXISTS interviews_application_id_idx ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS recruitment_messages_conversation_id_idx ON public.recruitment_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id, read_at, created_at DESC);
CREATE INDEX IF NOT EXISTS employees_user_id_idx ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS tasks_assigned_to_idx ON public.tasks(assigned_to, status);

CREATE OR REPLACE FUNCTION public.is_company_member(target_company_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin() OR EXISTS (
    SELECT 1 FROM public.companies WHERE id = target_company_id AND created_by = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.application_company_id(target_application_id uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT j.company_id FROM public.applications a JOIN public.jobs j ON j.id = a.job_id WHERE a.id = target_application_id;
$$;

CREATE OR REPLACE FUNCTION public.is_application_participant(target_application_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.applications WHERE id = target_application_id AND user_id = auth.uid())
    OR public.is_company_member(public.application_company_id(target_application_id));
$$;

-- RLS cannot restrict UPDATE to individual columns. These guards ensure an
-- employee can only advance their assigned task, while HRD retains full task
-- management for their own company.
CREATE OR REPLACE FUNCTION public.guard_employee_task_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_company_member(OLD.company_id) THEN RETURN NEW; END IF;
  IF OLD.assigned_to <> auth.uid()
     OR NEW.company_id IS DISTINCT FROM OLD.company_id
     OR NEW.project_id IS DISTINCT FROM OLD.project_id
     OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
     OR NEW.created_by IS DISTINCT FROM OLD.created_by
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.priority IS DISTINCT FROM OLD.priority
     OR NEW.deadline IS DISTINCT FROM OLD.deadline
     OR NOT ((OLD.status = 'TODO' AND NEW.status = 'IN_PROGRESS') OR (OLD.status = 'IN_PROGRESS' AND NEW.status = 'IN_REVIEW'))
  THEN RAISE EXCEPTION 'Employees may only advance their own assigned task'; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_employee_task_update
  BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.guard_employee_task_update();

ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_required_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY application_status_history_select ON public.application_status_history FOR SELECT USING (public.is_application_participant(application_id));
CREATE POLICY application_status_history_insert ON public.application_status_history FOR INSERT WITH CHECK (public.is_company_member(public.application_company_id(application_id)));
CREATE POLICY job_required_skills_select ON public.job_required_skills FOR SELECT USING (true);
CREATE POLICY job_required_skills_manage ON public.job_required_skills FOR ALL USING (public.is_company_member((SELECT company_id FROM public.jobs WHERE id = job_id))) WITH CHECK (public.is_company_member((SELECT company_id FROM public.jobs WHERE id = job_id)));
CREATE POLICY technical_challenges_select ON public.technical_challenges FOR SELECT USING (public.is_company_member((SELECT company_id FROM public.jobs WHERE id = job_id)) OR EXISTS (SELECT 1 FROM public.applications WHERE job_id = technical_challenges.job_id AND user_id = auth.uid()));
CREATE POLICY technical_challenges_manage ON public.technical_challenges FOR ALL USING (public.is_company_member((SELECT company_id FROM public.jobs WHERE id = job_id))) WITH CHECK (public.is_company_member((SELECT company_id FROM public.jobs WHERE id = job_id)));
CREATE POLICY challenge_submissions_select ON public.challenge_submissions FOR SELECT USING (candidate_id = auth.uid() OR public.is_application_participant(application_id));
CREATE POLICY challenge_submissions_insert ON public.challenge_submissions FOR INSERT WITH CHECK (candidate_id = auth.uid());
CREATE POLICY challenge_submissions_update ON public.challenge_submissions FOR UPDATE USING (candidate_id = auth.uid() OR public.is_application_participant(application_id));
CREATE POLICY interviews_select ON public.interviews FOR SELECT USING (candidate_id = auth.uid() OR public.is_company_member(company_id));
CREATE POLICY interviews_manage ON public.interviews FOR ALL USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY recruitment_conversations_select ON public.recruitment_conversations FOR SELECT USING (candidate_id = auth.uid() OR public.is_company_member(company_id));
CREATE POLICY recruitment_conversations_insert ON public.recruitment_conversations FOR INSERT WITH CHECK (candidate_id = auth.uid() OR public.is_company_member(company_id));
CREATE POLICY recruitment_messages_select ON public.recruitment_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.recruitment_conversations c WHERE c.id = conversation_id AND (c.candidate_id = auth.uid() OR public.is_company_member(c.company_id))));
CREATE POLICY recruitment_messages_insert ON public.recruitment_messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.recruitment_conversations c WHERE c.id = conversation_id AND (c.candidate_id = auth.uid() OR public.is_company_member(c.company_id))));
CREATE POLICY notifications_own ON public.notifications FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY employees_select ON public.employees FOR SELECT USING (user_id = auth.uid() OR public.is_company_member(company_id));
CREATE POLICY employees_manage ON public.employees FOR ALL USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY projects_select ON public.projects FOR SELECT USING (public.is_company_member(company_id) OR EXISTS (SELECT 1 FROM public.project_members WHERE project_id = projects.id AND user_id = auth.uid()));
CREATE POLICY projects_manage ON public.projects FOR ALL USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY project_members_select ON public.project_members FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND public.is_company_member(company_id)));
CREATE POLICY project_members_manage ON public.project_members FOR ALL USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND public.is_company_member(company_id))) WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND public.is_company_member(company_id)));
CREATE POLICY tasks_select ON public.tasks FOR SELECT USING (assigned_to = auth.uid() OR public.is_company_member(company_id));
CREATE POLICY tasks_manage ON public.tasks FOR ALL USING (public.is_company_member(company_id) OR assigned_to = auth.uid()) WITH CHECK (public.is_company_member(company_id) OR assigned_to = auth.uid());
CREATE POLICY announcements_select ON public.announcements FOR SELECT USING (public.is_company_member(company_id) OR EXISTS (SELECT 1 FROM public.employees WHERE company_id = announcements.company_id AND user_id = auth.uid()));
CREATE POLICY announcements_manage ON public.announcements FOR ALL USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
CREATE POLICY calendar_events_select ON public.calendar_events FOR SELECT USING (public.is_company_member(company_id) OR EXISTS (SELECT 1 FROM public.employees WHERE company_id = calendar_events.company_id AND user_id = auth.uid()));
CREATE POLICY calendar_events_manage ON public.calendar_events FOR ALL USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));
