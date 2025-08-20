-- Add translations column to resources table
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '[]'::jsonb;
