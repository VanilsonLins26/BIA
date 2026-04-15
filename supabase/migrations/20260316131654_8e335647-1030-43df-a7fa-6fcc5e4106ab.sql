-- Create metrics table for tracking project impact
CREATE TABLE public.metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read metrics
CREATE POLICY "Anyone can read metrics" ON public.metrics FOR SELECT USING (true);

-- Allow anonymous inserts/updates via RPC function
CREATE OR REPLACE FUNCTION public.increment_metric(metric_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.metrics (event_name, count)
  VALUES (metric_name, 1)
  ON CONFLICT (event_name)
  DO UPDATE SET count = public.metrics.count + 1, updated_at = now();
END;
$$;

-- Seed initial metrics
INSERT INTO public.metrics (event_name, count) VALUES
  ('pageViews', 0),
  ('chatStarted', 0),
  ('chatInteractions', 0),
  ('installClicks', 0),
  ('npsPositive', 0),
  ('npsNegative', 0);