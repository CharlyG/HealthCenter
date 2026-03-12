import { useMemo } from 'react';
import { X, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAlerts } from '../context/AlertContext';
import { RiskScoreBadge } from './risk-scoring/RiskScoreBadge';

interface PatientContextHeaderProps {
  patient: {
    id?: string;
    first_name: string;
    last_name: string;
    dob: string;
    mrn: string;
    office?: string;
    admission_status?: string;
    payer?: string[];
  };
  onClose: () => void;
}

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export default function PatientContextHeader({ patient, onClose }: PatientContextHeaderProps) {
  const age = calculateAge(patient.dob);
  const { getPatientAlertCounts } = useAlerts();
  
  const alertCounts = useMemo(
    () => patient.id ? getPatientAlertCounts(patient.id) : { total: 0, critical: 0, high: 0, warning: 0, info: 0, open: 0, acknowledged: 0 },
    [patient.id, getPatientAlertCounts]
  );

  return (
    <div className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* Patient Name */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold">
              {patient.first_name[0]}{patient.last_name[0]}
            </span>
          </div>
          <div>
            <div className="font-semibold text-lg">
              {patient.first_name} {patient.last_name}
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-blue-100">DOB:</span>{' '}
            <span className="font-medium">{patient.dob} ({age}y)</span>
          </div>
          <div className="w-px h-4 bg-white/30" />
          <div>
            <span className="text-blue-100">MRN:</span>{' '}
            <span className="font-medium">{patient.mrn}</span>
          </div>
          {patient.office && (
            <>
              <div className="w-px h-4 bg-white/30" />
              <div>
                <span className="text-blue-100">Office:</span>{' '}
                <span className="font-medium">{patient.office}</span>
              </div>
            </>
          )}
        </div>

        {/* Status, Payer, and Alert Badges */}
        <div className="flex items-center gap-2">
          {patient.admission_status && (
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
              {patient.admission_status}
            </Badge>
          )}
          {patient.payer?.map((payer, index) => (
            <Badge key={index} variant="outline" className="bg-white/10 border-white/40 text-white">
              {payer}
            </Badge>
          ))}
          {/* Alert Badge */}
          {alertCounts.total > 0 && (
            <Badge
              variant="destructive"
              className="gap-1 bg-red-500 hover:bg-red-600 text-white border-0"
            >
              <Bell className="size-3" />
              {alertCounts.total} {alertCounts.total === 1 ? 'Alert' : 'Alerts'}
              {alertCounts.critical > 0 && (
                <span className="ml-0.5">({alertCounts.critical} critical)</span>
              )}
            </Badge>
          )}
          {/* Risk Score Badge */}
          {patient.id && (
            <RiskScoreBadge patientId={patient.id} variant="header" />
          )}
        </div>
      </div>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="text-white hover:bg-white/20"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}