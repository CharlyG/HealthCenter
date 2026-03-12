/**
 * Admission Disciplines Tab
 * Manage ordered disciplines (RN, PT, OT, ST, MSW, Aide)
 */
import { useState } from 'react';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';

interface AdmissionDisciplinesTabProps {
  admissionId?: string;
}

interface Discipline {
  id: string;
  code: string;
  name: string;
  is_ordered: boolean;
  start_date: string;
}

const AVAILABLE_DISCIPLINES = [
  { code: 'RN', name: 'Registered Nurse', description: 'Skilled nursing care' },
  { code: 'PT', name: 'Physical Therapy', description: 'Physical rehabilitation' },
  { code: 'OT', name: 'Occupational Therapy', description: 'ADL training' },
  { code: 'ST', name: 'Speech Therapy', description: 'Speech and swallowing' },
  { code: 'MSW', name: 'Medical Social Worker', description: 'Psychosocial services' },
  { code: 'AIDE', name: 'Home Health Aide', description: 'Personal care' },
];

export default function AdmissionDisciplinesTab({ admissionId }: AdmissionDisciplinesTabProps) {
  const [disciplines, setDisciplines] = useState<Discipline[]>([
    {
      id: '1',
      code: 'RN',
      name: 'Registered Nurse',
      is_ordered: true,
      start_date: '2024-03-08',
    },
    {
      id: '2',
      code: 'PT',
      name: 'Physical Therapy',
      is_ordered: true,
      start_date: '2024-03-08',
    },
  ]);

  const handleToggleDiscipline = (code: string) => {
    const exists = disciplines.find(d => d.code === code);
    
    if (exists) {
      setDisciplines(prev => prev.filter(d => d.code !== code));
      toast.success(`${exists.name} removed`);
    } else {
      const discipline = AVAILABLE_DISCIPLINES.find(d => d.code === code);
      if (discipline) {
        setDisciplines(prev => [...prev, {
          id: `disc-${Date.now()}`,
          code: discipline.code,
          name: discipline.name,
          is_ordered: true,
          start_date: new Date().toISOString().split('T')[0],
        }]);
        toast.success(`${discipline.name} added`);
      }
    }
  };

  const isDisciplineOrdered = (code: string) => {
    return disciplines.some(d => d.code === code);
  };

  const getDisciplineColor = (code: string) => {
    const colors: Record<string, string> = {
      RN: 'bg-blue-100 text-blue-800 border-blue-300',
      PT: 'bg-green-100 text-green-800 border-green-300',
      OT: 'bg-purple-100 text-purple-800 border-purple-300',
      ST: 'bg-pink-100 text-pink-800 border-pink-300',
      MSW: 'bg-orange-100 text-orange-800 border-orange-300',
      AIDE: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[code] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Ordered Disciplines</h3>
        <p className="text-sm text-gray-600">Select the disciplines ordered for this patient</p>
      </div>

      {/* Discipline Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Available Disciplines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {AVAILABLE_DISCIPLINES.map((discipline) => {
              const isOrdered = isDisciplineOrdered(discipline.code);
              
              return (
                <div
                  key={discipline.code}
                  className={`
                    p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${isOrdered 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => handleToggleDiscipline(discipline.code)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={isOrdered} />
                      <Badge className={getDisciplineColor(discipline.code)}>
                        {discipline.code}
                      </Badge>
                    </div>
                    {isOrdered && (
                      <CheckCircle className="size-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{discipline.name}</p>
                    <p className="text-sm text-gray-600">{discipline.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ordered Summary */}
      {disciplines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ordered Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {disciplines.map((discipline) => (
                <div key={discipline.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getDisciplineColor(discipline.code)}>
                      {discipline.code}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-900">{discipline.name}</p>
                      <p className="text-sm text-gray-500">Start date: {discipline.start_date}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleDiscipline(discipline.code)}
                  >
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
