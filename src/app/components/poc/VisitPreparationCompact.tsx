/**
 * Visit Preparation Compact
 * 
 * Compact version of Visit Preparation Panel for embedding in other workflows.
 * Displays essential patient information in a condensed format.
 */
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  User,
  Heart,
  AlertTriangle,
  Pill,
  Phone,
  MapPin,
  AlertOctagon,
  Eye,
  ChevronRight,
} from 'lucide-react';

interface VisitPreparationCompactProps {
  patientId: string;
  visitId: string;
  onViewFull?: () => void;
}

export default function VisitPreparationCompact({
  patientId,
  visitId,
  onViewFull,
}: VisitPreparationCompactProps) {
  // Mock data - in production, fetch from dataGateway
  const patientSummary = {
    name: 'Margaret Thompson',
    age: 78,
    gender: 'Female',
    phone: '(555) 123-4567',
    address: '1234 Oak Street, Springfield, IL 62701',
  };

  const primaryDiagnosis = {
    code: 'I50.9',
    description: 'Congestive Heart Failure',
  };

  const allergies = [
    { allergen: 'Penicillin', severity: 'severe' as const },
    { allergen: 'Sulfa drugs', severity: 'moderate' as const },
  ];

  const keyMedications = [
    'Furosemide 40mg daily',
    'Metformin 500mg BID',
    'Lisinopril 10mg daily',
  ];

  const criticalAlerts = [
    { severity: 'high' as const, message: 'CHF exacerbation - monitor weight daily' },
    { severity: 'critical' as const, message: 'FALL RISK - Use gait belt' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'severe':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'high':
      case 'moderate':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      default:
        return 'bg-yellow-100 text-yellow-900 border-yellow-300';
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Summary Card */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="size-5 text-blue-600" />
              Patient Quick View
            </CardTitle>
            {onViewFull && (
              <Button variant="outline" size="sm" onClick={onViewFull}>
                <Eye className="size-4 mr-2" />
                Full Prep
                <ChevronRight className="size-4 ml-1" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-lg font-bold text-gray-900">{patientSummary.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {patientSummary.age} yrs
              </Badge>
              <Badge variant="outline" className="text-xs">
                {patientSummary.gender}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Phone className="size-3 text-gray-500" />
              <span className="text-gray-900">{patientSummary.phone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3 text-gray-500" />
              <span className="text-gray-900 truncate">{patientSummary.address}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertOctagon className="size-4 text-orange-600" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {criticalAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-2 rounded border text-xs font-semibold ${getSeverityColor(
                  alert.severity
                )}`}
              >
                {alert.message}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Primary Diagnosis */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Heart className="size-4 text-red-600" />
            Primary Diagnosis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-semibold text-sm text-gray-900">{primaryDiagnosis.description}</p>
          <p className="text-xs text-gray-600 font-mono mt-1">{primaryDiagnosis.code}</p>
        </CardContent>
      </Card>

      {/* Allergies */}
      {allergies.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-600" />
              ALLERGIES
              <Badge className="bg-red-600 text-white text-[10px]">{allergies.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {allergies.map((allergy, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900">{allergy.allergen}</p>
                <Badge
                  className={`text-[10px] ${
                    allergy.severity === 'severe'
                      ? 'bg-red-600 text-white'
                      : 'bg-orange-600 text-white'
                  }`}
                >
                  {allergy.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Key Medications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Pill className="size-4 text-purple-600" />
            Key Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {keyMedications.map((med, index) => (
              <li key={index} className="text-xs text-gray-900">
                • {med}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <p className="text-xs font-semibold text-blue-900 mb-1">Visit Reminders:</p>
          <ul className="text-[11px] text-blue-800 space-y-0.5">
            <li>• Obtain daily weight and vital signs</li>
            <li>• Assess for edema and respiratory status</li>
            <li>• Review medication compliance</li>
            <li>• Document all interventions and education</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
