import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText } from 'lucide-react';

interface AdmissionDiagnosesProps {
  admissionId: string;
}

export default function AdmissionDiagnoses({ admissionId }: AdmissionDiagnosesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnoses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <FileText className="size-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Diagnosis Management</p>
          <p className="text-sm">This feature is coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
