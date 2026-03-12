import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users } from 'lucide-react';

interface AdmissionDisciplinesProps {
  admissionId: string;
}

export default function AdmissionDisciplines({ admissionId }: AdmissionDisciplinesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Disciplines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-gray-500">
          <Users className="size-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Discipline Management</p>
          <p className="text-sm">This feature is coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
