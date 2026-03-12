/**
 * Clinical Settings Panel
 * 
 * Configure clinical workflows, documentation requirements, and assessment settings.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Stethoscope, FileText, ClipboardCheck, AlertCircle } from 'lucide-react';

export default function ClinicalSettingsPanel({ onConfigChange }: { onConfigChange: () => void }) {
  const [settings, setSettings] = useState({
    requireSignatures: true,
    allowBackdating: false,
    backdatingWindow: 24,
    requireSupervisorReview: true,
    autoCalculateOASIS: true,
    mandatoryCarePlan: true,
    medicationReconciliation: true,
    allowVoiceNotes: false,
    requirePhotoVerification: false,
  });

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
    onConfigChange();
  };

  return (
    <div className="space-y-6">
      {/* Documentation Settings */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Documentation Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="signatures">Require Electronic Signatures</Label>
              <p className="text-sm text-gray-600">All visit notes must be electronically signed</p>
            </div>
            <Switch
              id="signatures"
              checked={settings.requireSignatures}
              onCheckedChange={(v) => handleChange('requireSignatures', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="backdating">Allow Backdating</Label>
              <p className="text-sm text-gray-600">
                Permit documentation of visits in the past
              </p>
            </div>
            <Switch
              id="backdating"
              checked={settings.allowBackdating}
              onCheckedChange={(v) => handleChange('allowBackdating', v)}
            />
          </div>

          {settings.allowBackdating && (
            <div className="ml-6 flex items-center gap-3">
              <Label htmlFor="window" className="text-sm">
                Backdating Window (hours):
              </Label>
              <Input
                id="window"
                type="number"
                value={settings.backdatingWindow}
                onChange={(e) => handleChange('backdatingWindow', parseInt(e.target.value))}
                className="w-24"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="supervisor">Require Supervisor Review</Label>
              <p className="text-sm text-gray-600">
                New documentation requires supervisor approval
              </p>
            </div>
            <Switch
              id="supervisor"
              checked={settings.requireSupervisorReview}
              onCheckedChange={(v) => handleChange('requireSupervisorReview', v)}
            />
          </div>
        </div>
      </Card>

      {/* Assessment Settings */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-green-600" />
          Assessment & Care Planning
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="oasis">Auto-Calculate OASIS Scores</Label>
              <p className="text-sm text-gray-600">Automatically compute OASIS scoring</p>
            </div>
            <Switch
              id="oasis"
              checked={settings.autoCalculateOASIS}
              onCheckedChange={(v) => handleChange('autoCalculateOASIS', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="careplan">Mandatory Care Plan</Label>
              <p className="text-sm text-gray-600">Require care plan before first visit</p>
            </div>
            <Switch
              id="careplan"
              checked={settings.mandatoryCarePlan}
              onCheckedChange={(v) => handleChange('mandatoryCarePlan', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="medrec">Medication Reconciliation</Label>
              <p className="text-sm text-gray-600">Require med rec at each visit</p>
            </div>
            <Switch
              id="medrec"
              checked={settings.medicationReconciliation}
              onCheckedChange={(v) => handleChange('medicationReconciliation', v)}
            />
          </div>
        </div>
      </Card>

      {/* Advanced Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-purple-600" />
          Advanced Clinical Features
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="voice">Voice-to-Text Notes</Label>
              <p className="text-sm text-gray-600">Enable voice dictation for documentation</p>
            </div>
            <Switch
              id="voice"
              checked={settings.allowVoiceNotes}
              onCheckedChange={(v) => handleChange('allowVoiceNotes', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="photo">Photo Verification</Label>
              <p className="text-sm text-gray-600">Require photo uploads at visits</p>
            </div>
            <Switch
              id="photo"
              checked={settings.requirePhotoVerification}
              onCheckedChange={(v) => handleChange('requirePhotoVerification', v)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Clinical Settings Impact</p>
            <p>
              Changes to clinical settings affect compliance requirements and caregiver workflows.
              Ensure all staff are trained before enabling new requirements.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
