/**
 * Authorization Step
 * Step 6 of Admission Setup Wizard
 */

import { useEffect } from 'react';
import { FileCheck, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import type { WizardStepProps } from '../AdmissionSetupWizard';

export default function AuthorizationStep({ data, onChange, onValidationChange, onNext }: WizardStepProps) {
  useEffect(() => {
    // Validation: Either auth not required OR auth details provided
    const isValid = 
      !data.authorization_required ||
      (!!data.authorization_number && !!data.authorization_start_date);
    
    onValidationChange(isValid);
  }, [data, onValidationChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onNext) onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="size-4 text-blue-600 mt-0.5" />
          <p className="text-xs text-blue-800">
            Many payers require authorization before services can be provided. Indicate if this admission requires authorization and provide the necessary details.
          </p>
        </div>
      </Card>

      {/* Authorization Required Toggle */}
      <Card className="p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-start gap-3">
          <Checkbox
            id="auth_required"
            checked={data.authorization_required}
            onCheckedChange={(checked) => onChange({
              authorization_required: !!checked,
              authorization_status: checked ? 'pending' : 'not_required',
            })}
            className="mt-0.5"
          />
          <div className="flex-1">
            <Label htmlFor="auth_required" className="font-semibold cursor-pointer text-base">
              Authorization Required
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Check if this admission requires payer authorization before services can begin
            </p>
          </div>
        </div>
      </Card>

      {/* Authorization Details (if required) */}
      {data.authorization_required && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileCheck className="size-5 text-blue-600" />
              Authorization Details
            </h4>

            <div className="space-y-4">
              <div>
                <Label htmlFor="auth_status">
                  Authorization Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={data.authorization_status}
                  onValueChange={(value: any) => onChange({ authorization_status: value })}
                >
                  <SelectTrigger id="auth_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {data.authorization_status === 'approved' && (
                <>
                  <div>
                    <Label htmlFor="auth_number">
                      Authorization Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="auth_number"
                      placeholder="Enter authorization number (e.g., AUTH-2026-12345)"
                      value={data.authorization_number}
                      onChange={(e) => onChange({ authorization_number: e.target.value })}
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="auth_start_date">
                        Start Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="auth_start_date"
                        type="date"
                        value={data.authorization_start_date}
                        onChange={(e) => onChange({ authorization_start_date: e.target.value })}
                        onKeyDown={handleKeyDown}
                      />
                    </div>

                    <div>
                      <Label htmlFor="auth_end_date">End Date</Label>
                      <Input
                        id="auth_end_date"
                        type="date"
                        value={data.authorization_end_date}
                        onChange={(e) => onChange({ authorization_end_date: e.target.value })}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="authorized_visits">Authorized Visits</Label>
                    <Input
                      id="authorized_visits"
                      type="number"
                      min="0"
                      placeholder="Number of authorized visits (e.g., 30)"
                      value={data.authorized_visits || ''}
                      onChange={(e) => onChange({ authorized_visits: parseInt(e.target.value) || 0 })}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </>
              )}

              {data.authorization_status === 'denied' && (
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Authorization Denied</p>
                      <p className="text-sm text-red-800 mt-1">
                        This authorization has been denied by the payer. Consider filing an appeal, contacting the payer for clarification, or using an alternative payer if available.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {data.authorization_status === 'pending' && (
                <Card className="p-4 bg-amber-50 border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Authorization Pending</p>
                      <p className="text-sm text-amber-800 mt-1">
                        This admission is awaiting payer authorization. You can complete the setup and the admission will remain in "Pending Authorization" status until approved. Track authorization status in the Authorization Tracker.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Authorization Required */}
      {!data.authorization_required && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-900">No Authorization Required</p>
              <p className="text-sm text-green-800 mt-1">
                This admission does not require payer authorization and can proceed directly to care scheduling.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Authorization Summary */}
      {data.authorization_required && data.authorization_status === 'approved' && data.authorization_number && (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm font-semibold text-green-900 mb-2">Authorization Summary</p>
          <div className="space-y-1 text-sm text-green-800">
            <p><strong>Status:</strong> <Badge className="ml-2 bg-green-600">Approved</Badge></p>
            <p><strong>Authorization #:</strong> {data.authorization_number}</p>
            {data.authorization_start_date && (
              <p>
                <strong>Dates:</strong> {new Date(data.authorization_start_date).toLocaleDateString()}
                {data.authorization_end_date && ` - ${new Date(data.authorization_end_date).toLocaleDateString()}`}
              </p>
            )}
            {data.authorized_visits > 0 && (
              <p><strong>Authorized Visits:</strong> {data.authorized_visits}</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}