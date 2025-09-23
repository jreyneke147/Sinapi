-- Add icon_url column for manual icons
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS icon_url text;
