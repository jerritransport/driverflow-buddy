-- 1. Add test result tracking fields to drivers
ALTER TABLE drivers 
  ADD COLUMN IF NOT EXISTS sample_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS collection_date DATE,
  ADD COLUMN IF NOT EXISTS test_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS urine_result_url TEXT,
  ADD COLUMN IF NOT EXISTS alcohol_result_url TEXT,
  ADD COLUMN IF NOT EXISTS ccf_url TEXT;

-- 2. Create intake_forms table
CREATE TABLE IF NOT EXISTS intake_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  form_pdf_url TEXT,
  cdl_attachment_url TEXT,
  source VARCHAR(50) DEFAULT 'bolo',
  status VARCHAR(50) DEFAULT 'received',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;

-- Grant permissions with separate policies for different operations
CREATE POLICY "intake_forms_select_policy" ON intake_forms 
  FOR SELECT TO authenticated USING (true);
  
CREATE POLICY "intake_forms_insert_policy" ON intake_forms 
  FOR INSERT TO authenticated WITH CHECK (true);
  
CREATE POLICY "intake_forms_update_policy" ON intake_forms 
  FOR UPDATE TO authenticated USING (true);
  
CREATE POLICY "intake_forms_delete_policy" ON intake_forms 
  FOR DELETE TO authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON intake_forms TO authenticated;