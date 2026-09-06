-- ==============================================================================
-- 000_base.sql
-- Comprehensive Base Migration for Jobseek
-- Supports Candidates and full HRD Workspace
-- ==============================================================================

-- ==============================================================================
-- 1. CREATE TABLES (22 Tables)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    headline TEXT,
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}'::text[],
    resume_url TEXT,
    education TEXT,
    university TEXT,
    major TEXT,
    portfolio_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    role TEXT DEFAULT 'user',
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT,
    company_size TEXT,
    location TEXT,
    website TEXT,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    department TEXT,
    location TEXT,
    job_type TEXT,
    work_mode TEXT,
    salary_range TEXT,
    experience_level TEXT,
    education TEXT,
    skills TEXT[] DEFAULT '{}'::text[],
    preferred_skills TEXT[] DEFAULT '{}'::text[],
    requirements TEXT,
    responsibilities TEXT,
    stages TEXT[] DEFAULT '{}'::text[],
    min_qualification_score INTEGER DEFAULT 0,
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_name TEXT,
    candidate_headline TEXT,
    candidate_email TEXT,
    candidate_phone TEXT,
    candidate_location TEXT,
    candidate_education TEXT,
    candidate_school TEXT,
    candidate_major TEXT,
    candidate_skills TEXT[] DEFAULT '{}'::text[],
    candidate_bio TEXT,
    candidate_portfolio_url TEXT,
    candidate_github_url TEXT,
    candidate_linkedin_url TEXT,
    candidate_resume_url TEXT,
    match_score INTEGER,
    qual_score INTEGER,
    qual_min_score INTEGER,
    status TEXT NOT NULL DEFAULT 'new',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

CREATE TABLE IF NOT EXISTS public.application_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    location TEXT,
    duration_minutes INTEGER,
    notes TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.test_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    questions JSONB DEFAULT '[]'::jsonb,
    min_score INTEGER,
    time_limit_minutes INTEGER,
    status TEXT DEFAULT 'pending',
    score INTEGER,
    passed BOOLEAN,
    answers JSONB,
    submission JSONB,
    review_score INTEGER,
    review_feedback TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}'::text[],
    role TEXT,
    year TEXT,
    live_url TEXT,
    github_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    skill_category TEXT,
    difficulty TEXT,
    estimated_duration TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    progress_pct INTEGER DEFAULT 0,
    status TEXT DEFAULT 'not_started',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    location TEXT,
    skills TEXT[] DEFAULT '{}'::text[],
    joined_date DATE,
    status TEXT DEFAULT 'active',
    UNIQUE(user_id, company_id)
);

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning',
    start_date DATE,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_members (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    start_date DATE,
    deadline DATE,
    status TEXT DEFAULT 'todo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_channel BOOLEAN DEFAULT false,
    member_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    type TEXT DEFAULT 'event'
);

CREATE TABLE IF NOT EXISTS public.calendar_event_participants (
    event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    audience TEXT,
    publish_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 2. HELPER FUNCTIONS FOR RLS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_company_owner(cid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.companies WHERE id = cid AND created_by = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_hrd_for_job(jid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.companies c ON j.company_id = c.id
    WHERE j.id = jid AND c.created_by = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_hrd_for_application(appid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    JOIN public.companies c ON j.company_id = c.id
    WHERE a.id = appid AND c.created_by = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_employee_of_company(cid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.company_id = cid AND e.user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ==============================================================================
-- 3. TRIGGERS (Column-Level Security)
-- ==============================================================================

-- Trigger to prevent Candidates from modifying HRD-only fields on test_assignments
CREATE OR REPLACE FUNCTION public.check_test_assignment_candidate_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If updater is candidate and NOT the HRD owner of the job
  IF NEW.candidate_id = auth.uid() AND NOT public.is_hrd_for_job(NEW.job_id) THEN
    -- Prevent altering HRD fields
    IF NEW.score IS DISTINCT FROM OLD.score OR
       NEW.passed IS DISTINCT FROM OLD.passed OR
       NEW.review_score IS DISTINCT FROM OLD.review_score OR
       NEW.review_feedback IS DISTINCT FROM OLD.review_feedback OR
       NEW.min_score IS DISTINCT FROM OLD.min_score OR
       NEW.job_id IS DISTINCT FROM OLD.job_id OR
       NEW.application_id IS DISTINCT FROM OLD.application_id THEN
      RAISE EXCEPTION 'Candidates cannot update HRD-controlled fields on test assignments.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS test_assignment_candidate_update_trg ON public.test_assignments;
CREATE TRIGGER test_assignment_candidate_update_trg
BEFORE UPDATE ON public.test_assignments
FOR EACH ROW
EXECUTE FUNCTION public.check_test_assignment_candidate_update();

-- ==============================================================================
-- 4. ENABLE RLS
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. RLS POLICIES
-- ==============================================================================

-- profiles
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- companies
CREATE POLICY "Companies viewable by authenticated users" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "HRD can insert company" ON public.companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "HRD can update own company" ON public.companies FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

-- jobs
CREATE POLICY "Jobs viewable by authenticated users" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "HRD can insert jobs for their company" ON public.jobs FOR INSERT TO authenticated WITH CHECK (public.is_company_owner(company_id));
CREATE POLICY "HRD can update jobs for their company" ON public.jobs FOR UPDATE TO authenticated USING (public.is_company_owner(company_id)) WITH CHECK (public.is_company_owner(company_id));
CREATE POLICY "HRD can delete jobs for their company" ON public.jobs FOR DELETE TO authenticated USING (public.is_company_owner(company_id));

-- applications
CREATE POLICY "Candidates can view own applications and HRD can view their jobs applications" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_hrd_for_job(job_id));
CREATE POLICY "Candidates can insert own applications" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- HRD UPDATE rule with WITH CHECK ensuring HRD doesn't move application to another job they don't own
CREATE POLICY "HRD can update applications for their jobs" ON public.applications FOR UPDATE TO authenticated USING (public.is_hrd_for_job(job_id)) WITH CHECK (public.is_hrd_for_job(job_id));
CREATE POLICY "HRD can delete applications for their jobs" ON public.applications FOR DELETE TO authenticated USING (public.is_hrd_for_job(job_id));

-- application_history
CREATE POLICY "Candidates and HRD can view history" ON public.application_history FOR SELECT TO authenticated USING (public.is_hrd_for_application(application_id) OR auth.uid() IN (SELECT user_id FROM public.applications WHERE id = application_id));
CREATE POLICY "HRD can insert history" ON public.application_history FOR INSERT TO authenticated WITH CHECK (public.is_hrd_for_application(application_id));

-- interviews
CREATE POLICY "Candidates and HRD can view interviews" ON public.interviews FOR SELECT TO authenticated USING (public.is_hrd_for_application(application_id) OR auth.uid() IN (SELECT user_id FROM public.applications WHERE id = application_id));
CREATE POLICY "HRD can insert interviews" ON public.interviews FOR INSERT TO authenticated WITH CHECK (public.is_hrd_for_application(application_id));
-- Ensure HRD doesn't move interview to an application they don't own
CREATE POLICY "HRD can update interviews" ON public.interviews FOR UPDATE TO authenticated USING (public.is_hrd_for_application(application_id)) WITH CHECK (public.is_hrd_for_application(application_id));
CREATE POLICY "HRD can delete interviews" ON public.interviews FOR DELETE TO authenticated USING (public.is_hrd_for_application(application_id));

-- test_assignments
CREATE POLICY "Candidate and HRD can view tests" ON public.test_assignments FOR SELECT TO authenticated USING (candidate_id = auth.uid() OR public.is_hrd_for_job(job_id));
CREATE POLICY "HRD can insert tests" ON public.test_assignments FOR INSERT TO authenticated WITH CHECK (public.is_hrd_for_job(job_id));
CREATE POLICY "HRD can update tests" ON public.test_assignments FOR UPDATE TO authenticated USING (public.is_hrd_for_job(job_id)) WITH CHECK (public.is_hrd_for_job(job_id));
CREATE POLICY "Candidate can update own test answers" ON public.test_assignments FOR UPDATE TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid() AND job_id = job_id);
CREATE POLICY "HRD can delete tests" ON public.test_assignments FOR DELETE TO authenticated USING (public.is_hrd_for_job(job_id));

-- saved_jobs
CREATE POLICY "Users can manage own saved jobs" ON public.saved_jobs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- portfolio_projects
CREATE POLICY "Viewable by authenticated users" ON public.portfolio_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own portfolio projects" ON public.portfolio_projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- courses
CREATE POLICY "Courses viewable by everyone" ON public.courses FOR SELECT USING (true);

-- learning_progress
CREATE POLICY "Users can manage own learning progress" ON public.learning_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- activities
CREATE POLICY "Users can manage own activities" ON public.activities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- employees
CREATE POLICY "HRD and Employees can view company employees" ON public.employees FOR SELECT TO authenticated USING (public.is_company_owner(company_id) OR public.is_employee_of_company(company_id));
CREATE POLICY "HRD can manage employees" ON public.employees FOR ALL TO authenticated USING (public.is_company_owner(company_id)) WITH CHECK (public.is_company_owner(company_id));

-- projects
CREATE POLICY "Workspace members can view projects" ON public.projects FOR SELECT TO authenticated USING (public.is_company_owner(company_id) OR public.is_employee_of_company(company_id));
CREATE POLICY "HRD can manage projects" ON public.projects FOR ALL TO authenticated USING (public.is_company_owner(company_id)) WITH CHECK (public.is_company_owner(company_id));

-- project_members
CREATE POLICY "Workspace members can view project members" ON public.project_members FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND (public.is_company_owner(p.company_id) OR public.is_employee_of_company(p.company_id)))
);
CREATE POLICY "HRD can manage project members" ON public.project_members FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND public.is_company_owner(p.company_id))
);

-- tasks
CREATE POLICY "Workspace members can view tasks" ON public.tasks FOR SELECT TO authenticated USING (public.is_company_owner(company_id) OR public.is_employee_of_company(company_id));
CREATE POLICY "HRD can insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (public.is_company_owner(company_id));
CREATE POLICY "HRD and assignees can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (public.is_company_owner(company_id) OR assignee_id = auth.uid()) WITH CHECK (public.is_company_owner(company_id) OR assignee_id = auth.uid());
CREATE POLICY "HRD can delete tasks" ON public.tasks FOR DELETE TO authenticated USING (public.is_company_owner(company_id));

-- conversations
CREATE POLICY "Workspace members can view conversations" ON public.conversations FOR SELECT TO authenticated USING (
    public.is_company_owner(company_id) OR 
    (is_channel = true AND public.is_employee_of_company(company_id)) OR 
    member_id = auth.uid()
);
CREATE POLICY "HRD can manage conversations" ON public.conversations FOR ALL TO authenticated USING (public.is_company_owner(company_id)) WITH CHECK (public.is_company_owner(company_id));

-- messages
CREATE POLICY "Conversation members can view messages" ON public.messages FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = conversation_id AND (
            public.is_company_owner(c.company_id) OR 
            (c.is_channel = true AND public.is_employee_of_company(c.company_id)) OR 
            c.member_id = auth.uid()
        )
    )
);
CREATE POLICY "Members can insert messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid() AND EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = conversation_id AND (
            public.is_company_owner(c.company_id) OR 
            (c.is_channel = true AND public.is_employee_of_company(c.company_id)) OR 
            c.member_id = auth.uid()
        )
    )
);

-- calendar_events
CREATE POLICY "Workspace members can view events" ON public.calendar_events FOR SELECT TO authenticated USING (public.is_company_owner(company_id) OR public.is_employee_of_company(company_id));
CREATE POLICY "HRD can manage events" ON public.calendar_events FOR ALL TO authenticated USING (public.is_company_owner(company_id)) WITH CHECK (public.is_company_owner(company_id));

-- calendar_event_participants
CREATE POLICY "Workspace members can view participants" ON public.calendar_event_participants FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.calendar_events e WHERE e.id = event_id AND (public.is_company_owner(e.company_id) OR public.is_employee_of_company(e.company_id)))
);
CREATE POLICY "HRD can manage participants" ON public.calendar_event_participants FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.calendar_events e WHERE e.id = event_id AND public.is_company_owner(e.company_id))
);

-- announcements
CREATE POLICY "Workspace members can view announcements" ON public.announcements FOR SELECT TO authenticated USING (public.is_company_owner(company_id) OR public.is_employee_of_company(company_id));
CREATE POLICY "HRD can manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_company_owner(company_id)) WITH CHECK (public.is_company_owner(company_id));