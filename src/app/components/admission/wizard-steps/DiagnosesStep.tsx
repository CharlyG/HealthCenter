/**
 * Diagnoses Step
 * Step 4 of Admission Setup Wizard
 */

import { useEffect, useState } from 'react';
import { Activity, Search, Plus, X, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import type { WizardStepProps } from '../AdmissionSetupWizard';

export default function DiagnosesStep({ data, onChange, onValidationChange, onNext }: WizardStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [diagnosisList, setDiagnosisList] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const isValid = !!data.primary_diagnosis_code;
    onValidationChange(isValid);
  }, [data, onValidationChange]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setDiagnosisList([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Mock ICD-10 codes - expanded list
      const mockDiagnoses = [
        { code: 'I50.9', description: 'Heart failure, unspecified' },
        { code: 'I50.1', description: 'Left ventricular failure' },
        { code: 'I50.20', description: 'Unspecified systolic heart failure' },
        { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
        { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia' },
        { code: 'E11.22', description: 'Type 2 diabetes mellitus with diabetic chronic kidney disease' },
        { code: 'I10', description: 'Essential (primary) hypertension' },
        { code: 'I11.0', description: 'Hypertensive heart disease with heart failure' },
        { code: 'J44.9', description: 'Chronic obstructive pulmonary disease, unspecified' },
        { code: 'J44.1', description: 'COPD with acute exacerbation' },
        { code: 'N18.9', description: 'Chronic kidney disease, unspecified' },
        { code: 'N18.3', description: 'Chronic kidney disease, stage 3' },
        { code: 'N18.4', description: 'Chronic kidney disease, stage 4' },
        { code: 'M79.3', description: 'Panniculitis, unspecified' },
        { code: 'M79.1', description: 'Myalgia' },
        { code: 'Z99.81', description: 'Dependence on supplemental oxygen' },
        { code: 'Z93.0', description: 'Tracheostomy status' },
        { code: 'G30.9', description: 'Alzheimer disease, unspecified' },
        { code: 'F03.90', description: 'Unspecified dementia without behavioral disturbance' },
        { code: 'I63.9', description: 'Cerebral infarction, unspecified' },
      ];

      const filtered = mockDiagnoses.filter(d =>
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setDiagnosisList(filtered);
      setIsSearching(false);
    }, 300);
  };

  const handleSelectPrimary = (diagnosis: any) => {
    onChange({
      primary_diagnosis_code: diagnosis.code,
      primary_diagnosis_description: diagnosis.description,
    });
    setDiagnosisList([]);
    setSearchQuery('');
  };

  const handleAddSecondary = (diagnosis: any) => {
    const existing = data.secondary_diagnoses || [];
    if (!existing.find(d => d.code === diagnosis.code)) {
      onChange({
        secondary_diagnoses: [...existing, diagnosis],
      });
    }
    setDiagnosisList([]);
    setSearchQuery('');
  };

  const handleRemoveSecondary = (code: string) => {
    onChange({
      secondary_diagnoses: (data.secondary_diagnoses || []).filter(d => d.code !== code),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (diagnosisList.length === 0 && searchQuery) {
        handleSearch();
      } else if (onNext) {
        onNext();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="size-4 text-blue-600 mt-0.5" />
          <p className="text-xs text-blue-800">
            <strong>Demo Mode:</strong> This search uses mock ICD-10 data. In production, this would connect to a real ICD-10 code database.
          </p>
        </div>
      </Card>

      {/* Primary Diagnosis */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="size-5 text-blue-600" />
          Primary Diagnosis <span className="text-red-500">*</span>
        </h4>

        {!data.primary_diagnosis_code && (
          <>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search ICD-10 code or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="size-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {diagnosisList.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {diagnosisList.length} result{diagnosisList.length !== 1 ? 's' : ''} found
                </p>
                {diagnosisList.map((diagnosis) => (
                  <Card
                    key={diagnosis.code}
                    className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-gray-200 hover:border-blue-300"
                    onClick={() => handleSelectPrimary(diagnosis)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm font-mono">{diagnosis.code}</p>
                        <p className="text-sm text-gray-700 mt-0.5">{diagnosis.description}</p>
                      </div>
                      <Button size="sm" variant="outline">Select</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {diagnosisList.length === 0 && searchQuery && !isSearching && (
              <Card className="p-4 text-center border-dashed">
                <p className="text-sm text-gray-600">
                  No results found for "{searchQuery}". Try searching with different terms.
                </p>
              </Card>
            )}
          </>
        )}

        {data.primary_diagnosis_code && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge className="bg-green-600 mb-2">Primary</Badge>
                <p className="text-sm font-semibold font-mono text-green-900">
                  {data.primary_diagnosis_code}
                </p>
                <p className="text-sm text-green-800 mt-1">
                  {data.primary_diagnosis_description}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onChange({
                  primary_diagnosis_code: '',
                  primary_diagnosis_description: '',
                })}
              >
                <X className="size-4" />
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Secondary Diagnoses */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Secondary Diagnoses (Optional)</h4>

        {(data.secondary_diagnoses || []).length > 0 && (
          <div className="space-y-2 mb-4">
            {data.secondary_diagnoses!.map((diagnosis, idx) => (
              <Card key={diagnosis.code} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">Secondary {idx + 1}</Badge>
                    </div>
                    <p className="font-semibold text-sm font-mono">{diagnosis.code}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{diagnosis.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveSecondary(diagnosis.code)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Add secondary diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} variant="outline" disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Plus className="size-4 mr-2" />
            )}
            Add
          </Button>
        </div>

        {diagnosisList.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Click to add as secondary diagnosis
            </p>
            {diagnosisList.map((diagnosis) => (
              <Card
                key={diagnosis.code}
                className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-gray-200 hover:border-blue-300"
                onClick={() => handleAddSecondary(diagnosis)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm font-mono">{diagnosis.code}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{diagnosis.description}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="size-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {data.primary_diagnosis_code && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">Diagnoses Summary</p>
          <div className="space-y-1 text-sm text-gray-800">
            <p>
              <strong>Primary:</strong> {data.primary_diagnosis_code} - {data.primary_diagnosis_description}
            </p>
            {(data.secondary_diagnoses || []).length > 0 && (
              <p>
                <strong>Secondary:</strong> {data.secondary_diagnoses!.length} diagnosis(es)
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}