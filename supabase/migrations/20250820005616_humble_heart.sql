/*
  # Create resources table for manuals and brochures

  1. New Tables
    - `resources`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `category` (text, not null)
      - `type` (text, not null) - 'manual' or 'brochure'
      - `file_url` (text, not null)
      - `file_name` (text, not null)
      - `qr_code` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `resources` table
    - Add policy for public read access
    - Add policy for authenticated users to manage resources

  3. Storage
    - Create storage bucket for resource files
    - Set up public access policies for downloads
*/

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  type text NOT NULL CHECK (type IN ('manual', 'brochure')),
  file_url text NOT NULL,
  file_name text NOT NULL,
  qr_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read resources"
  ON resources
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert resources"
  ON resources
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update resources"
  ON resources
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete resources"
  ON resources
  FOR DELETE
  TO authenticated
  USING (true);

-- Create storage bucket for resource files
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Anyone can view resource files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'resources');

CREATE POLICY "Authenticated users can upload resource files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resources');

CREATE POLICY "Authenticated users can delete resource files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'resources');

-- Insert sample data
INSERT INTO resources (title, description, category, type, file_url, file_name, qr_code) VALUES
('ICU Mobility Protocol', 'Comprehensive guide for implementing early mobility protocols in intensive care units', 'ICU Equipment', 'manual', 'https://example.com/sample.pdf', 'icu_mobility_protocol.pdf', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/sample.pdf'),
('Patient Transfer Guidelines', 'Step-by-step instructions for safe patient transfers using mechanical aids', 'Patient Care', 'manual', 'https://example.com/sample.pdf', 'patient_transfer_guidelines.pdf', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/sample.pdf'),
('Equipment Maintenance Schedule', 'Regular maintenance procedures and schedules for all medical equipment', 'Maintenance', 'manual', 'https://example.com/sample.pdf', 'equipment_maintenance.pdf', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/sample.pdf'),
('MobilityLift Pro Series', 'Product specifications and features for the MobilityLift Pro patient lifting system', 'Lifting Systems', 'brochure', 'https://example.com/sample.pdf', 'mobilitylift_pro_brochure.pdf', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/sample.pdf'),
('SmartBed Technology', 'Advanced features and benefits of our intelligent hospital bed systems', 'Smart Beds', 'brochure', 'https://example.com/sample.pdf', 'smartbed_technology.pdf', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/sample.pdf'),
('Rehabilitation Equipment Catalog', 'Complete catalog of rehabilitation and physical therapy equipment', 'Rehabilitation', 'brochure', 'https://example.com/sample.pdf', 'rehab_equipment_catalog.pdf', 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/sample.pdf');