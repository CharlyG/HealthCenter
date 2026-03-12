/**
 * Insurance Step
 * Step 2 of Admission Setup Wizard
 */

import { useEffect, useState } from 'react';
import { Shield, Plus, X, AlertCircle } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import type { WizardStepProps } from '../AdmissionSetupWizard';

interface Payer {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'tertiary';
  policy_number: string;
  group_number: string;
}

export default function InsuranceStep({ data, onChange, onValidationChange, onNext }: WizardStepProps) {
  // Store multiple payers
  const [payers, setPayers] = useState<Payer[]>([]);
  
  // Initialize from data if exists
  useEffect(() => {
    const initialPayers: Payer[] = [];
    if (data.primary_payer_id) {
      initialPayers.push({
        id: data.primary_payer_id,
        name: data.primary_payer_name,
        type: 'primary',
        policy_number: data.primary_policy_number,
        group_number: data.primary_group_number,
      });
    }
    if (data.secondary_payer_id) {
      initialPayers.push({
        id: data.secondary_payer_id,
        name: data.secondary_payer_name,
        type: 'secondary',
        policy_number: data.secondary_policy_number,
        group_number: data.secondary_group_number,
      });
    }
    if (initialPayers.length > 0) {
      setPayers(initialPayers);
    }
  }, []);
  
  // Validate step - at least one primary payer required
  useEffect(() => {
    const hasPrimaryPayer = payers.some(p => p.type === 'primary' && p.policy_number);
    onValidationChange(hasPrimaryPayer);
    
    // Update parent data
    const primary = payers.find(p => p.type === 'primary');
    const secondary = payers.find(p => p.type === 'secondary');
    
    onChange({
      primary_payer_id: primary?.id || '',
      primary_payer_name: primary?.name || '',
      primary_policy_number: primary?.policy_number || '',
      primary_group_number: primary?.group_number || '',
      secondary_payer_id: secondary?.id || '',
      secondary_payer_name: secondary?.name || '',
      secondary_policy_number: secondary?.policy_number || '',
      secondary_group_number: secondary?.group_number || '',
    });
  }, [payers, onValidationChange]);

  const handleAddPayer = () => {
    const nextType = !payers.some(p => p.type === 'primary') 
      ? 'primary' 
      : !payers.some(p => p.type === 'secondary')
      ? 'secondary'
      : 'tertiary';
    
    setPayers([...payers, {
      id: '',
      name: '',
      type: nextType,
      policy_number: '',
      group_number: '',
    }]);
  };

  const handleRemovePayer = (index: number) => {
    setPayers(payers.filter((_, i) => i !== index));
  };

  const handleUpdatePayer = (index: number, field: keyof Payer, value: string) => {
    const updated = [...payers];
    if (field === 'id') {
      // Extract name from value
      const [id, name] = value.split('|');
      updated[index] = { ...updated[index], id, name };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPayers(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onNext) onNext();
    }
  };

  const getPayerTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const canAddMore = payers.length < 3;

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="size-5 text-blue-600" />
          Insurance / Payers <span className="text-red-500">*</span>
        </h4>
        {canAddMore && (
          <Button onClick={handleAddPayer} size="sm" variant="outline">
            <Plus className="size-4 mr-2" />
            Add Payer
          </Button>
        )}
      </div>

      {/* Info Alert */}
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="size-4 text-blue-600 mt-0.5" />
          <p className="text-xs text-blue-800">
            At least one primary payer is required. You can add up to 3 payers (primary, secondary, tertiary).
          </p>
        </div>
      </Card>

      {/* No payers state */}
      {payers.length === 0 && (
        <Card className="p-6 text-center border-dashed">
          <p className="text-sm text-gray-600 mb-3">No insurance payers added yet</p>
          <Button onClick={handleAddPayer} variant="outline" size="sm">
            <Plus className="size-4 mr-2" />
            Add Primary Payer
          </Button>
        </Card>
      )}

      {/* Payers List */}
      <div className="space-y-4">
        {payers.map((payer, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant={payer.type === 'primary' ? 'default' : 'secondary'}>
                  {getPayerTypeLabel(payer.type)}
                </Badge>
                {payer.type === 'primary' && (
                  <span className="text-xs text-red-500">* Required</span>
                )}
              </div>
              {payer.type !== 'primary' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemovePayer(index)}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor={`payer_${index}`}>
                  Insurance Provider {payer.type === 'primary' && <span className="text-red-500">*</span>}
                </Label>
                <Select
                  value={payer.id ? `${payer.id}|${payer.name}` : ''}
                  onValueChange={(value) => handleUpdatePayer(index, 'id', value)}
                >
                  <SelectTrigger id={`payer_${index}`}>
                    <SelectValue placeholder="Select insurance provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAY-001|Medicare Part A">Medicare Part A</SelectItem>
                    <SelectItem value="PAY-002|Medicare Part B">Medicare Part B</SelectItem>
                    <SelectItem value="PAY-003|Medicaid">Medicaid</SelectItem>
                    <SelectItem value="PAY-004|Blue Cross Blue Shield">Blue Cross Blue Shield</SelectItem>
                    <SelectItem value="PAY-005|United Healthcare">United Healthcare</SelectItem>
                    <SelectItem value="PAY-006|Aetna">Aetna</SelectItem>
                    <SelectItem value="PAY-007|Humana">Humana</SelectItem>
                    <SelectItem value="PAY-008|Cigna">Cigna</SelectItem>
                    <SelectItem value="PAY-009|Kaiser Permanente">Kaiser Permanente</SelectItem>
                    <SelectItem value="PAY-010|Anthem">Anthem</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`policy_${index}`}>
                    Policy Number {payer.type === 'primary' && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id={`policy_${index}`}
                    placeholder="Policy/Member ID"
                    value={payer.policy_number}
                    onChange={(e) => handleUpdatePayer(index, 'policy_number', e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                <div>
                  <Label htmlFor={`group_${index}`}>Group Number</Label>
                  <Input
                    id={`group_${index}`}
                    placeholder="Group ID (if applicable)"
                    value={payer.group_number}
                    onChange={(e) => handleUpdatePayer(index, 'group_number', e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      {payers.length > 0 && payers.some(p => p.name) && (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm font-semibold text-green-900 mb-2">Insurance Summary</p>
          <div className="space-y-1 text-sm text-green-800">
            {payers.filter(p => p.name).map((payer, i) => (
              <p key={i}>
                <strong>{getPayerTypeLabel(payer.type)}:</strong> {payer.name}
                {payer.policy_number && ` • Policy: ${payer.policy_number}`}
              </p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}