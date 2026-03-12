/**
 * Admission Diagnoses Tab
 * Manage ICD-10 diagnoses with primary designation
 */
import { useState } from 'react';
import { Plus, Search, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { CompactTable } from '../../design-system/CompactTable';

interface AdmissionDiagnosesTabProps {
  admissionId?: string;
}

interface Diagnosis {
  id: string;
  code: string;
  description: string;
  is_primary: boolean;
  onset_date: string;
}

export default function AdmissionDiagnosesTab({ admissionId }: AdmissionDiagnosesTabProps) {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([
    {
      id: '1',
      code: 'I50.9',
      description: 'Heart failure, unspecified',
      is_primary: true,
      onset_date: '2024-02-15',
    },
    {
      id: '2',
      code: 'E11.9',
      description: 'Type 2 diabetes mellitus without complications',
      is_primary: false,
      onset_date: '2023-05-10',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const handleSetPrimary = (diagnosisId: string) => {
    setDiagnoses(prev => prev.map(d => ({
      ...d,
      is_primary: d.id === diagnosisId,
    })));
    toast.success('Primary diagnosis updated');
  };

  const handleRemove = (diagnosisId: string) => {
    setDiagnoses(prev => prev.filter(d => d.id !== diagnosisId));
    toast.success('Diagnosis removed');
  };

  const columns = [
    {
      key: 'code',
      header: 'ICD-10 Code',
      render: (diagnosis: Diagnosis) => (
        <div className="flex items-center gap-2">
          {diagnosis.is_primary && <Star className="size-4 text-yellow-500 fill-yellow-500" />}
          <span className="font-mono font-semibold">{diagnosis.code}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (diagnosis: Diagnosis) => (
        <div>
          <div>{diagnosis.description}</div>
          {diagnosis.is_primary && (
            <Badge variant="outline" className="mt-1 text-xs">Primary</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'onset_date',
      header: 'Onset Date',
      render: (diagnosis: Diagnosis) => diagnosis.onset_date,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (diagnosis: Diagnosis) => (
        <div className="flex items-center gap-2">
          {!diagnosis.is_primary && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSetPrimary(diagnosis.id)}
            >
              <Star className="size-4 mr-1" />
              Set Primary
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemove(diagnosis.id)}
          >
            <Trash2 className="size-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Diagnoses</h3>
          <p className="text-sm text-gray-600">ICD-10 diagnosis codes for this admission</p>
        </div>
        <Button>
          <Plus className="size-4 mr-2" />
          Add Diagnosis
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search ICD-10 codes (e.g., I50.9, diabetes, heart failure)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Diagnoses List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Diagnoses ({diagnoses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <CompactTable
            columns={columns}
            data={diagnoses}
            keyExtractor={(diagnosis) => diagnosis.id}
            emptyMessage="No diagnoses added yet"
          />
        </CardContent>
      </Card>
    </div>
  );
}