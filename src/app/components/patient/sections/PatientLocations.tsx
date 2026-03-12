/**
 * PatientLocations Section
 * Patient-level alternate locations (care locations other than primary address)
 */
import { MapPin } from 'lucide-react';
import PatientAlternateLocations from '../../PatientAlternateLocations';

interface PatientLocationsProps {
  patientId: string;
}

export default function PatientLocations({ patientId }: PatientLocationsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="size-6 text-gray-600" />
          Alternate Locations
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Patient-level care locations (hospitals, nursing homes, assisted living, etc.)
        </p>
      </div>

      {/* Alternate Locations Component */}
      <PatientAlternateLocations patientId={patientId} />
    </div>
  );
}
