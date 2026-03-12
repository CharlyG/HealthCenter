/**
 * Disciplines Step
 * Step 5 of Admission Setup Wizard
 */

import { useEffect } from 'react';
import { Users, Plus, X, AlertCircle } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import type { WizardStepProps } from '../AdmissionSetupWizard';

export default function DisciplinesStep({ data, onChange, onValidationChange, onNext }: WizardStepProps) {
  useEffect(() => {
    const isValid = (data.disciplines || []).length > 0;
    onValidationChange(isValid);
  }, [data, onValidationChange]);

  const handleAdd = () => {
    const disciplines = data.disciplines || [];
    onChange({
      disciplines: [
        ...disciplines,
        {
          discipline: 'RN',
          frequency: 'Weekly',
          duration: '60 days',
          visits_per_week: 3,
        },
      ],
    });
  };

  const handleRemove = (index: number) => {
    const disciplines = data.disciplines || [];
    onChange({
      disciplines: disciplines.filter((_, i) => i !== index),
    });
  };

  const handleUpdate = (index: number, field: string, value: any) => {
    const disciplines = data.disciplines || [];
    const updated = [...disciplines];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ disciplines: updated });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onNext) onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Users className="size-5 text-blue-600" />
          Disciplines & Frequencies <span className="text-red-500">*</span>
        </h4>
        <Button onClick={handleAdd} size="sm" variant="outline">
          <Plus className="size-4 mr-2" />
          Add Discipline
        </Button>
      </div>

      {/* Info Alert */}
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="size-4 text-blue-600 mt-0.5" />
          <p className="text-xs text-blue-800">
            Add at least one discipline for this admission. You can specify frequency, duration, and visits per week for each discipline.
          </p>
        </div>
      </Card>

      {/* No disciplines state */}
      {(data.disciplines || []).length === 0 && (
        <Card className="p-6 text-center border-dashed">
          <p className="text-sm text-gray-600 mb-3">No disciplines added yet</p>
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="size-4 mr-2" />
            Add First Discipline
          </Button>
        </Card>
      )}

      {/* Disciplines List */}
      <div className="space-y-4">
        {(data.disciplines || []).map((discipline, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="default">Discipline #{index + 1}</Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemove(index)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discipline Type <span className="text-red-500">*</span></Label>
                <Select
                  value={discipline.discipline}
                  onValueChange={(value) => handleUpdate(index, 'discipline', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RN">Registered Nurse (RN)</SelectItem>
                    <SelectItem value="LPN">Licensed Practical Nurse (LPN)</SelectItem>
                    <SelectItem value="PT">Physical Therapy (PT)</SelectItem>
                    <SelectItem value="OT">Occupational Therapy (OT)</SelectItem>
                    <SelectItem value="ST">Speech Therapy (ST)</SelectItem>
                    <SelectItem value="MSW">Medical Social Worker (MSW)</SelectItem>
                    <SelectItem value="HHA">Home Health Aide (HHA)</SelectItem>
                    <SelectItem value="CNA">Certified Nursing Assistant (CNA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Visits Per Week <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="1"
                  max="7"
                  value={discipline.visits_per_week}
                  onChange={(e) => handleUpdate(index, 'visits_per_week', parseInt(e.target.value) || 0)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div>
                <Label>Frequency <span className="text-red-500">*</span></Label>
                <Select
                  value={discipline.frequency}
                  onValueChange={(value) => handleUpdate(index, 'frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="PRN">PRN (As Needed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Duration <span className="text-red-500">*</span></Label>
                <Select
                  value={discipline.duration}
                  onValueChange={(value) => handleUpdate(index, 'duration', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30 days">30 days</SelectItem>
                    <SelectItem value="60 days">60 days</SelectItem>
                    <SelectItem value="90 days">90 days</SelectItem>
                    <SelectItem value="120 days">120 days</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      {(data.disciplines || []).length > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm font-semibold text-green-900 mb-2">Disciplines Summary</p>
          <div className="space-y-1 text-sm text-green-800">
            {data.disciplines!.map((d, i) => (
              <p key={i}>
                <strong>{d.discipline}:</strong> {d.visits_per_week}x/week, {d.frequency}, {d.duration}
              </p>
            ))}
            <p className="mt-2 text-xs">
              Total: {data.disciplines!.length} discipline{data.disciplines!.length !== 1 ? 's' : ''}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}