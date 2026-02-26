-- Add column weight_capacity_tons to containers table
ALTER TABLE containers ADD COLUMN IF NOT EXISTS weight_capacity_tons INTEGER DEFAULT 24;

-- Drop existing check constraint if it exists BEFORE updating values
-- Inline constraints are usually named "table_column_check"
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'containers_container_type_check') THEN
        ALTER TABLE containers DROP CONSTRAINT containers_container_type_check;
    END IF;
END $$;

-- Update existing container types to the new standard
-- 20 and 40 become 40ST (Standard)
UPDATE containers SET container_type = '40ST' WHERE container_type IN ('20', '40');

-- Add new check constraint for container types
ALTER TABLE containers ADD CONSTRAINT containers_container_type_check 
    CHECK (container_type IN ('40HC', '40ST'));

-- Add check constraint for weight capacity (10TN to 24TN in steps of 2)
ALTER TABLE containers ADD CONSTRAINT containers_weight_capacity_check 
    CHECK (weight_capacity_tons IN (10, 12, 14, 16, 18, 20, 22, 24));
