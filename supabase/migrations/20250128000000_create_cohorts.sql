-- Create cohorts table for grouping users
CREATE TABLE public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cohort members junction table
CREATE TABLE public.cohort_members (
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member', -- Can be 'admin', 'member'
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (cohort_id, user_id)
);

-- Enable RLS
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Cohorts are viewable by members"
  ON public.cohorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cohort_members cm
      WHERE cm.cohort_id = cohorts.id
      AND cm.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_cohort_members_user_id ON public.cohort_members(user_id); 