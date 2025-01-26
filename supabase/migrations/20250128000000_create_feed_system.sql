-- Create an enum for feed item types
CREATE TYPE public.feed_item_type AS ENUM (
  'new_submission',
  'needs_review',
  'review_completed',
  'discussion',
  'achievement'
);

-- Create the feed table
CREATE TABLE public.feed_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type feed_item_type NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  reference_type text NOT NULL,
  reference_id uuid NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  visibility text[] DEFAULT '{public}'::text[], -- Can be ['public', 'cohort', 'private']
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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
ALTER TABLE public.feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Feed items are viewable by cohort members or public"
  ON public.feed_items FOR SELECT
  USING (
    'public' = ANY(visibility) OR
    (EXISTS (
      SELECT 1 FROM public.cohort_members cm
      WHERE cm.cohort_id = feed_items.cohort_id
      AND cm.user_id = auth.uid()
    ))
  );

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
CREATE INDEX idx_feed_items_type ON public.feed_items(type);
CREATE INDEX idx_feed_items_created_at ON public.feed_items(created_at);
CREATE INDEX idx_feed_items_cohort_id ON public.feed_items(cohort_id);
CREATE INDEX idx_feed_items_visibility ON public.feed_items USING gin(visibility);
CREATE INDEX idx_cohort_members_user_id ON public.cohort_members(user_id);

-- Function to create a feed item
CREATE OR REPLACE FUNCTION public.create_feed_item(
  p_type feed_item_type,
  p_title text,
  p_description text,
  p_reference_type text,
  p_reference_id uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_visibility text[] DEFAULT '{public}'::text[],
  p_cohort_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_feed_item_id uuid;
BEGIN
  INSERT INTO public.feed_items (
    type,
    user_id,
    title,
    description,
    reference_type,
    reference_id,
    metadata,
    visibility,
    cohort_id
  )
  VALUES (
    p_type,
    auth.uid(),
    p_title,
    p_description,
    p_reference_type,
    p_reference_id,
    p_metadata,
    p_visibility,
    p_cohort_id
  )
  RETURNING id INTO v_feed_item_id;

  RETURN v_feed_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create feed items for new code submissions
CREATE OR REPLACE FUNCTION public.handle_new_submission()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_feed_item(
    'new_submission',
    NEW.title,
    NEW.description,
    'code_snippet',
    NEW.id,
    jsonb_build_object(
      'language', NEW.language,
      'user_name', (SELECT username FROM public.profiles WHERE id = NEW.user_id)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_code_snippet_created
  AFTER INSERT ON public.code_snippets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_submission(); 