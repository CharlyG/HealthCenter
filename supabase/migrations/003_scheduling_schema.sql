-- ============================================================================
-- SCHEDULING MODULE SCHEMA
-- Tables: visits, visit_status_history, caregiver_availability
-- ============================================================================

-- Visits table - Core visit scheduling
CREATE TABLE IF NOT EXISTS visits_845bc545 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  patient_id UUID NOT NULL,
  admission_id UUID NOT NULL,
  caregiver_id UUID,
  
  -- Schedule
  visit_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Billing
  billing_code TEXT NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'open', -- open, scheduled, confirmed, in-progress, completed, cancelled, no-show
  
  -- Travel time
  estimated_travel_time INTEGER, -- minutes
  actual_travel_time INTEGER, -- minutes (filled after visit)
  
  -- Open shift tracking
  notifications_sent INTEGER DEFAULT 0,
  last_notified_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  
  -- EVV (Electronic Visit Verification) - for future Monitor module
  clock_in_time TIMESTAMPTZ,
  clock_out_time TIMESTAMPTZ,
  clock_in_latitude DECIMAL,
  clock_in_longitude DECIMAL,
  clock_out_latitude DECIMAL,
  clock_out_longitude DECIMAL,
  
  -- Notes
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Visit status history - Track all status changes
CREATE TABLE IF NOT EXISTS visit_status_history_845bc545 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT
);

-- Caregiver availability - Manage caregiver schedules
CREATE TABLE IF NOT EXISTS caregiver_availability_845bc545 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL,
  
  -- Date range
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Recurring pattern
  day_of_week INTEGER, -- 0=Sunday, 6=Saturday (NULL for specific dates)
  
  -- Time
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Status
  is_available BOOLEAN DEFAULT true,
  reason TEXT, -- "PTO", "Training", "Out sick", etc.
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Visits indexes for query performance
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits_845bc545(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_caregiver_id ON visits_845bc545(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_visits_admission_id ON visits_845bc545(admission_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits_845bc545(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits_845bc545(status);
CREATE INDEX IF NOT EXISTS idx_visits_date_caregiver ON visits_845bc545(visit_date, caregiver_id);

-- Open shifts - visits without caregivers
CREATE INDEX IF NOT EXISTS idx_visits_open_shifts ON visits_845bc545(visit_date, status) 
  WHERE caregiver_id IS NULL AND status = 'open';

-- Status history indexes
CREATE INDEX IF NOT EXISTS idx_visit_status_history_visit_id ON visit_status_history_845bc545(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_status_history_changed_at ON visit_status_history_845bc545(changed_at);

-- Availability indexes
CREATE INDEX IF NOT EXISTS idx_caregiver_availability_caregiver_id ON caregiver_availability_845bc545(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_availability_date_range ON caregiver_availability_845bc545(start_date, end_date);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on visits
CREATE OR REPLACE FUNCTION update_visits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_visits_updated_at
  BEFORE UPDATE ON visits_845bc545
  FOR EACH ROW
  EXECUTE FUNCTION update_visits_updated_at();

-- Track status changes in history table
CREATE OR REPLACE FUNCTION track_visit_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO visit_status_history_845bc545 (visit_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.updated_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_visit_status_change
  AFTER UPDATE ON visits_845bc545
  FOR EACH ROW
  EXECUTE FUNCTION track_visit_status_change();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for today's visits with caregiver and patient info
CREATE OR REPLACE VIEW todays_visits_845bc545 AS
SELECT 
  v.*,
  p.first_name || ' ' || p.last_name as patient_name,
  p.phone as patient_phone,
  p.address as patient_address,
  c.first_name || ' ' || c.last_name as caregiver_name
FROM visits_845bc545 v
LEFT JOIN patients p ON v.patient_id = p.id
LEFT JOIN users c ON v.caregiver_id = c.id
WHERE v.visit_date = CURRENT_DATE
  AND v.status IN ('scheduled', 'confirmed', 'in-progress')
ORDER BY v.start_time;

-- View for open shifts
CREATE OR REPLACE VIEW open_shifts_845bc545 AS
SELECT 
  v.*,
  p.first_name || ' ' || p.last_name as patient_name,
  p.phone as patient_phone,
  p.address as patient_address
FROM visits_845bc545 v
LEFT JOIN patients p ON v.patient_id = p.id
WHERE v.caregiver_id IS NULL
  AND v.status = 'open'
  AND v.visit_date >= CURRENT_DATE
ORDER BY v.visit_date, v.start_time;

-- View for caregiver daily schedule
CREATE OR REPLACE VIEW caregiver_daily_schedule_845bc545 AS
SELECT 
  v.caregiver_id,
  v.visit_date,
  COUNT(*) as visit_count,
  SUM(EXTRACT(EPOCH FROM (v.end_time - v.start_time)) / 3600) as total_hours,
  MIN(v.start_time) as first_visit_time,
  MAX(v.end_time) as last_visit_time,
  SUM(v.estimated_travel_time) as total_travel_time
FROM visits_845bc545 v
WHERE v.status IN ('scheduled', 'confirmed', 'in-progress', 'completed')
GROUP BY v.caregiver_id, v.visit_date;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Note: This assumes patients and users tables exist
-- Sample visits (commented out - run manually if needed)
/*
INSERT INTO visits_845bc545 (patient_id, admission_id, caregiver_id, visit_date, start_time, end_time, billing_code, status)
VALUES 
  ('patient-uuid-1', 'admission-uuid-1', 'caregiver-uuid-1', CURRENT_DATE, '09:00', '10:00', 'G0154', 'scheduled'),
  ('patient-uuid-2', 'admission-uuid-2', 'caregiver-uuid-1', CURRENT_DATE, '11:00', '12:00', 'G0151', 'scheduled'),
  ('patient-uuid-3', 'admission-uuid-3', NULL, CURRENT_DATE + 1, '14:00', '15:00', 'G0154', 'open');
*/

-- ============================================================================
-- NOTES FOR PRODUCTION
-- ============================================================================

/*
TODO before production:
1. Add foreign key constraints to patients, admissions, users tables
2. Implement RLS (Row Level Security) policies for multi-tenant access
3. Add proper user authentication checks
4. Set up automated notifications (email/SMS) for open shifts
5. Integrate with mapping API (Google Maps, Mapbox) for accurate travel time
6. Add conflict resolution logic for concurrent caregiver assignments
7. Implement visit reminder notifications
8. Add reporting views for KPIs (visit completion rate, caregiver utilization, etc.)
9. Consider partitioning visits table by date for large datasets
10. Add audit logging for HIPAA compliance
*/
