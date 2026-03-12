import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from 'lucide-react';

interface AdmissionFrequencyProps {
  admissionId: string;
}

export default function AdmissionFrequency({ admissionId }: AdmissionFrequencyProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequency & Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <Calendar className="size-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Frequency Management</p>
          <p className="text-sm">This feature is coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
