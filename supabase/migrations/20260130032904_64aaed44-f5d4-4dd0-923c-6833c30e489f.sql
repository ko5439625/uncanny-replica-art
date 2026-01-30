-- Create meeting_records table
CREATE TABLE public.meeting_records (
  id SERIAL PRIMARY KEY,
  meeting_number INTEGER NOT NULL CHECK (meeting_number BETWEEN 1 AND 10),
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.meeting_records ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Public read meeting_records" ON public.meeting_records
FOR SELECT USING (true);

CREATE POLICY "Public insert meeting_records" ON public.meeting_records
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public delete meeting_records" ON public.meeting_records
FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_records;