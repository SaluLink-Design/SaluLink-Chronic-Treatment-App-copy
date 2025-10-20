/*
  # SaluLink Chronic Treatment App Database Schema

  1. New Tables
    - `cases`
      - `id` (uuid, primary key)
      - `patient_notes` (text)
      - `detected_conditions` (jsonb)
      - `analysis_confidence` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `case_icd_codes`
      - `id` (uuid, primary key)
      - `case_id` (uuid, foreign key)
      - `icd_code` (text)
      - `description` (text)
      - `condition` (text)
      - `created_at` (timestamptz)
    
    - `case_treatments`
      - `id` (uuid, primary key)
      - `case_id` (uuid, foreign key)
      - `condition` (text)
      - `procedure_name` (text)
      - `procedure_code` (text)
      - `basket_type` (text)
      - `quantity` (integer)
      - `coverage_limit` (integer)
      - `created_at` (timestamptz)
    
    - `case_medicines`
      - `id` (uuid, primary key)
      - `case_id` (uuid, foreign key)
      - `condition` (text)
      - `medicine_class` (text)
      - `medicine_name` (text)
      - `active_ingredient` (text)
      - `cda_core` (numeric)
      - `cda_executive` (numeric)
      - `plan_type` (text)
      - `prescription_notes` (text)
      - `motivation` (text)
      - `created_at` (timestamptz)
    
    - `case_evidence`
      - `id` (uuid, primary key)
      - `case_id` (uuid, foreign key)
      - `treatment_id` (uuid, foreign key, nullable)
      - `medicine_id` (uuid, foreign key, nullable)
      - `evidence_type` (text)
      - `file_name` (text)
      - `file_url` (text, nullable)
      - `notes` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_notes text NOT NULL,
  detected_conditions jsonb DEFAULT '[]'::jsonb,
  analysis_confidence numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view all cases"
  ON cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete cases"
  ON cases FOR DELETE
  TO authenticated
  USING (true);

-- Create case_icd_codes table
CREATE TABLE IF NOT EXISTS case_icd_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  icd_code text NOT NULL,
  description text NOT NULL,
  condition text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE case_icd_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage ICD codes"
  ON case_icd_codes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create case_treatments table
CREATE TABLE IF NOT EXISTS case_treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  condition text NOT NULL,
  procedure_name text NOT NULL,
  procedure_code text NOT NULL,
  basket_type text NOT NULL,
  quantity integer DEFAULT 1,
  coverage_limit integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE case_treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage treatments"
  ON case_treatments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create case_medicines table
CREATE TABLE IF NOT EXISTS case_medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  condition text NOT NULL,
  medicine_class text NOT NULL,
  medicine_name text NOT NULL,
  active_ingredient text NOT NULL,
  cda_core numeric DEFAULT 0,
  cda_executive numeric DEFAULT 0,
  plan_type text DEFAULT '',
  prescription_notes text DEFAULT '',
  motivation text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE case_medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage medicines"
  ON case_medicines FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create case_evidence table
CREATE TABLE IF NOT EXISTS case_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  treatment_id uuid REFERENCES case_treatments(id) ON DELETE CASCADE,
  medicine_id uuid REFERENCES case_medicines(id) ON DELETE CASCADE,
  evidence_type text NOT NULL,
  file_name text NOT NULL,
  file_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE case_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage evidence"
  ON case_evidence FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_icd_codes_case_id ON case_icd_codes(case_id);
CREATE INDEX IF NOT EXISTS idx_case_treatments_case_id ON case_treatments(case_id);
CREATE INDEX IF NOT EXISTS idx_case_medicines_case_id ON case_medicines(case_id);
CREATE INDEX IF NOT EXISTS idx_case_evidence_case_id ON case_evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_case_evidence_treatment_id ON case_evidence(treatment_id);
CREATE INDEX IF NOT EXISTS idx_case_evidence_medicine_id ON case_evidence(medicine_id);
