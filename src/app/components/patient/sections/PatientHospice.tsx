/**
 * Patient Hospice Section
 * Hospice-specific documentation and IDG tracking
 */
import { Heart, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';

interface PatientHospiceProps {
  patientId: string;
  /** When provided, only hospice data for this admission is shown */
  admissionId?: string;
}

export default function PatientHospice({ patientId, admissionId }: PatientHospiceProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Hospice</h2>
        <Button>New IDG Meeting</Button>
      </div>

      {/* Hospice Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="size-5" />
            Hospice Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Level of Care</p>
              <p className="text-lg font-medium">Routine Home Care</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Primary Diagnosis</p>
              <p className="text-lg font-medium">CHF</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Admission Date</p>
              <p className="text-lg font-medium">2024-02-15</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IDG Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Interdisciplinary Group (IDG) Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">IDG Meeting - Week of March 4, 2024</p>
                <p className="text-sm text-gray-500">Attended: RN, SW, Chaplain, MD</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
                <Button variant="outline" size="sm">View Notes</Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">IDG Meeting - Week of February 26, 2024</p>
                <p className="text-sm text-gray-500">Attended: RN, SW, MD</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
                <Button variant="outline" size="sm">View Notes</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recertifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Recertification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Benefit Period 1</p>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Start Date</p>
                  <p className="font-medium">2024-02-15</p>
                </div>
                <div>
                  <p className="text-gray-600">End Date</p>
                  <p className="font-medium">2024-05-14</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
