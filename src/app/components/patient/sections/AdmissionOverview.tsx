/**
 * AdmissionOverview Section
 * Admission-level overview showing details of the selected admission
 * Now uses the Care Episode Dashboard component
 */
import CareEpisodeDashboard from '../../admission/CareEpisodeDashboard';
import NoAdmissionSelected from './NoAdmissionSelected';

interface AdmissionOverviewProps {
  patientId: string;
  admissionId?: string;
}

export default function AdmissionOverview({ patientId, admissionId }: AdmissionOverviewProps) {
  if (!admissionId) {
    return (
      <NoAdmissionSelected message="Select an admission to view the care episode dashboard" />
    );
  }

  return (
    <CareEpisodeDashboard patientId={patientId} admissionId={admissionId} />
  );
}