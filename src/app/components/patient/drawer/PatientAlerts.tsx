/**
 * Patient Alerts - Right Drawer Component
 * Display active alerts and warnings using the clinical alert system.
 * Delegates to PatientAlertsPanel for real alert data from AlertContext.
 */
import { PatientAlertsPanel } from '../../alerts/PatientAlertsPanel';

interface PatientAlertsProps {
  patientId: string;
}

export default function PatientAlerts({ patientId }: PatientAlertsProps) {
  return (
    <PatientAlertsPanel
      patientId={patientId}
      defaultOpen={true}
      className="border-0 shadow-none"
    />
  );
}
