/**
 * Admission Frequency Tab
 * Define visit frequency per discipline
 */
import { useState } from 'react';
import { Calendar, Edit2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';

interface AdmissionFrequencyTabProps {
  admissionId?: string;
}

interface FrequencyPlan {
  discipline_code: string;
  discipline_name: string;
  frequency: number;
  period: 'day' | 'week' | 'month' | '60-day';
  duration_weeks: number;
}

export default function AdmissionFrequencyTab({ admissionId }: AdmissionFrequencyTabProps) {
  const [frequencies, setFrequencies] = useState<FrequencyPlan[]>([
    {
      discipline_code: 'RN',
      discipline_name: 'Registered Nurse',
      frequency: 3,
      period: 'week',
      duration_weeks: 8,
    },
    {
      discipline_code: 'PT',
      discipline_name: 'Physical Therapy',
      frequency: 2,
      period: 'week',
      duration_weeks: 6,
    },
  ]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSave = (index: number) => {
    setEditingIndex(null);
    toast.success('Frequency updated');
  };

  const handleFieldChange = (index: number, field: keyof FrequencyPlan, value: any) => {
    setFrequencies(prev => prev.map((freq, i) => 
      i === index ? { ...freq, [field]: value } : freq
    ));
  };

  const getDisciplineColor = (code: string) => {
    const colors: Record<string, string> = {
      RN: 'bg-blue-100 text-blue-800',
      PT: 'bg-green-100 text-green-800',
      OT: 'bg-purple-100 text-purple-800',
      ST: 'bg-pink-100 text-pink-800',
      MSW: 'bg-orange-100 text-orange-800',
      AIDE: 'bg-gray-100 text-gray-800',
    };
    return colors[code] || 'bg-gray-100 text-gray-800';
  };

  const calculateTotalVisits = (freq: FrequencyPlan) => {
    const multiplier = freq.period === 'week' ? freq.duration_weeks : 
                      freq.period === 'month' ? Math.ceil(freq.duration_weeks / 4) :
                      freq.period === '60-day' ? Math.ceil(freq.duration_weeks / 8.5) : 
                      freq.duration_weeks * 7;
    return freq.frequency * multiplier;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Visit Frequency</h3>
          <p className="text-sm text-gray-600">Define visit frequency for each ordered discipline</p>
        </div>
      </div>

      {frequencies.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Calendar className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No disciplines ordered</p>
              <p className="text-sm">Add disciplines in the Disciplines tab first</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {frequencies.map((freq, index) => {
            const isEditing = editingIndex === index;
            const totalVisits = calculateTotalVisits(freq);

            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getDisciplineColor(freq.discipline_code)}>
                        {freq.discipline_code}
                      </Badge>
                      <CardTitle className="text-base">{freq.discipline_name}</CardTitle>
                    </div>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setEditingIndex(index)}>
                        <Edit2 className="size-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingIndex(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleSave(index)}>
                          <Save className="size-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`frequency-${index}`}>Frequency</Label>
                        <Input
                          id={`frequency-${index}`}
                          type="number"
                          min="1"
                          value={freq.frequency}
                          onChange={(e) => handleFieldChange(index, 'frequency', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`period-${index}`}>Period</Label>
                        <Select
                          value={freq.period}
                          onValueChange={(value: any) => handleFieldChange(index, 'period', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day">Per Day</SelectItem>
                            <SelectItem value="week">Per Week</SelectItem>
                            <SelectItem value="month">Per Month</SelectItem>
                            <SelectItem value="60-day">Per 60 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`duration-${index}`}>Duration (weeks)</Label>
                        <Input
                          id={`duration-${index}`}
                          type="number"
                          min="1"
                          value={freq.duration_weeks}
                          onChange={(e) => handleFieldChange(index, 'duration_weeks', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label className="text-gray-600">Frequency</Label>
                        <p className="text-lg font-semibold text-gray-900">
                          {freq.frequency}x per {freq.period}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Duration</Label>
                        <p className="text-lg font-semibold text-gray-900">
                          {freq.duration_weeks} weeks
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Total Visits</Label>
                        <p className="text-lg font-semibold text-blue-600">
                          {totalVisits} visits
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Status</Label>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {frequencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plan of Care Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-1">Total Disciplines</p>
                <p className="text-3xl font-bold text-blue-900">{frequencies.length}</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 mb-1">Total Visits Planned</p>
                <p className="text-3xl font-bold text-green-900">
                  {frequencies.reduce((sum, freq) => sum + calculateTotalVisits(freq), 0)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800 mb-1">Average Duration</p>
                <p className="text-3xl font-bold text-purple-900">
                  {Math.round(frequencies.reduce((sum, freq) => sum + freq.duration_weeks, 0) / frequencies.length)} weeks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
