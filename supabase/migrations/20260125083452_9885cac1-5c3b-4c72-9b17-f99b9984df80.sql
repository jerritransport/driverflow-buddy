-- Phase 1: Make driver form fields optional
ALTER TABLE drivers ALTER COLUMN cdl_number DROP NOT NULL;
ALTER TABLE drivers ALTER COLUMN cdl_state DROP NOT NULL;
ALTER TABLE drivers ALTER COLUMN gender DROP NOT NULL;
ALTER TABLE drivers ALTER COLUMN date_of_birth DROP NOT NULL;

-- Drop gender check constraint if it exists (allows any value or NULL)
ALTER TABLE drivers DROP CONSTRAINT IF EXISTS drivers_gender_check;

-- Phase 3.1: Create driver_notes table for comments system
CREATE TABLE public.driver_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on driver_notes
ALTER TABLE driver_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for driver_notes
CREATE POLICY "Authenticated users can view notes"
  ON driver_notes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add notes"
  ON driver_notes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own notes"
  ON driver_notes FOR DELETE
  USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON driver_notes TO authenticated;

-- Phase 3.2: Add follow-up reminder fields to drivers table
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS follow_up_note TEXT;

-- Phase 3.4: Add documents_uploaded JSONB column for document tracking
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS documents_uploaded JSONB DEFAULT '{}';