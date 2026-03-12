/**
 * Add Medication Workflow Component
 * 
 * Complete workflow for searching and adding medications to patient profile.
 * 
 * WORKFLOW:
 * 1. Search for medication (or select manual entry)
 * 2. Select from search results
 * 3. Fill in details (strength, dose, route, frequency, etc.)
 * 4. Review alerts
 * 5. Confirm and add
 * 
 * FEATURES:
 * - Autocomplete search
 * - Manual entry fallback
 * - Smart field suggestions
 * - Alert detection
 * - Validation
 */

import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Search,
  Plus,
  AlertCircle,
  Check,
  X,
  Pill,
  AlertTriangle,
  Edit,
  Calendar,
  User,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  medicationSearchService,
  COMMON_ROUTES,
  COMMON_FREQUENCIES,
  COMMON_PRN_REASONS,
  type MedicationSearchResult,
  type MedicationToAdd,
} from '../services/medicationSearch';
import { InlineAlert } from './MedicationAlerts';
import { medicationAlertService, type MedicationAlert, type Medication } from '../services/medicationAlerts';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface AddMedicationWorkflowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (medication: MedicationToAdd) => void;
  existingMedications?: Medication[];
  patientAllergies?: any[];
}

type WorkflowStep = 'search' | 'details' | 'review';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AddMedicationWorkflow({
  open,
  onOpenChange,
  onAdd,
  existingMedications = [],
  patientAllergies = [],
}: AddMedicationWorkflowProps) {
  const [step, setStep] = useState<WorkflowStep>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MedicationSearchResult[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<MedicationSearchResult | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  
  const [formData, setFormData] = useState<Partial<MedicationToAdd>>({
    name: '',
    genericName: '',
    strength: '',
    dose: '',
    route: '',
    frequency: '',
    isPRN: false,
    prnReason: '',
    startDate: new Date().toISOString().split('T')[0],
    prescribingPhysician: '',
    indication: '',
    instructions: '',
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<MedicationAlert[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setStep('search');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedMedication(null);
      setIsManualEntry(false);
      setFormData({
        name: '',
        genericName: '',
        strength: '',
        dose: '',
        route: '',
        frequency: '',
        isPRN: false,
        prnReason: '',
        startDate: new Date().toISOString().split('T')[0],
        prescribingPhysician: '',
        indication: '',
        instructions: '',
      });
      setErrors([]);
      setAlerts([]);
    }
  }, [open]);

  // Search medications
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = medicationSearchService.search(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSelectMedication = (med: MedicationSearchResult) => {
    setSelectedMedication(med);
    setIsManualEntry(false);
    setFormData({
      ...formData,
      medicationId: med.id,
      name: med.brandName,
      genericName: med.genericName,
      // Pre-fill with first common option if available
      strength: med.commonStrengths[0] || '',
      route: med.commonRoutes[0] || '',
      frequency: med.commonFrequencies[0] || '',
    });
    setStep('details');
    setShowSearchPopover(false);
  };

  const handleManualEntry = () => {
    setIsManualEntry(true);
    setSelectedMedication(null);
    setStep('details');
  };

  const handleUpdateField = (field: keyof MedicationToAdd, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleContinueToReview = () => {
    // Validate
    const validationErrors = medicationSearchService.validateMedication(formData as MedicationToAdd);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Generate alerts
    const newMedication: Medication = {
      id: `temp-${Date.now()}`,
      name: formData.name!,
      genericName: formData.genericName,
      strength: formData.strength!,
      isHighRisk: selectedMedication?.isHighRisk,
      isReconciled: true,
    };

    const generatedAlerts = medicationAlertService.generateAlerts(
      [...existingMedications, newMedication],
      patientAllergies
    );

    // Filter to only alerts involving the new medication
    const relevantAlerts = generatedAlerts.filter(alert =>
      alert.affectedMedicationNames.includes(formData.name!)
    );

    setAlerts(relevantAlerts);
    setStep('review');
  };

  const handleConfirmAdd = () => {
    onAdd(formData as MedicationToAdd);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === 'review') {
      setStep('details');
    } else if (step === 'details') {
      setStep('search');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            Add Medication
          </DialogTitle>
          <DialogDescription>
            Search for a medication or enter manually
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          <StepIndicator
            step={1}
            label="Search"
            isActive={step === 'search'}
            isComplete={step === 'details' || step === 'review'}
          />
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <StepIndicator
            step={2}
            label="Details"
            isActive={step === 'details'}
            isComplete={step === 'review'}
          />
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <StepIndicator
            step={3}
            label="Review"
            isActive={step === 'review'}
            isComplete={false}
          />
        </div>

        <Separator />

        {/* Step Content */}
        {step === 'search' && (
          <SearchStep
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            searchResults={searchResults}
            onSelectMedication={handleSelectMedication}
            onManualEntry={handleManualEntry}
          />
        )}

        {step === 'details' && (
          <DetailsStep
            formData={formData}
            selectedMedication={selectedMedication}
            isManualEntry={isManualEntry}
            onUpdateField={handleUpdateField}
            errors={errors}
          />
        )}

        {step === 'review' && (
          <ReviewStep
            formData={formData as MedicationToAdd}
            selectedMedication={selectedMedication}
            alerts={alerts}
          />
        )}

        <DialogFooter>
          {step !== 'search' && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {step === 'details' && (
            <Button onClick={handleContinueToReview}>
              Continue to Review
            </Button>
          )}
          {step === 'review' && (
            <Button onClick={handleConfirmAdd}>
              <Check className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH STEP
// ═══════════════════════════════════════════════════════════════════════════

interface SearchStepProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: MedicationSearchResult[];
  onSelectMedication: (med: MedicationSearchResult) => void;
  onManualEntry: () => void;
}

function SearchStep({
  searchQuery,
  onSearchQueryChange,
  searchResults,
  onSelectMedication,
  onManualEntry,
}: SearchStepProps) {
  return (
    <div className="space-y-4 py-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Search Medication</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by drug name, brand name, or generic name..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Start typing to see suggestions (e.g., "warfarin", "lopressor", "metoprolol")
        </p>
      </div>

      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <Card className="border">
          {searchResults.length > 0 ? (
            <div className="divide-y max-h-96 overflow-y-auto">
              {searchResults.map(med => (
                <button
                  key={med.id}
                  onClick={() => onSelectMedication(med)}
                  className="w-full p-4 hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">{med.brandName}</h4>
                        {med.isHighRisk && (
                          <Badge variant="destructive" className="text-xs">High Risk</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Generic: {med.genericName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {med.drugClass}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-4">No medications found for "{searchQuery}"</p>
              <Button variant="outline" onClick={onManualEntry}>
                <Edit className="w-4 h-4 mr-2" />
                Enter Manually
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Manual Entry Option */}
      {searchQuery.length === 0 && (
        <Card className="p-6 bg-gray-50 border-dashed">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <h4 className="font-semibold text-gray-900 mb-2">
              Medication Database Unavailable?
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              If you cannot find the medication in our database, you can enter it manually.
            </p>
            <Button variant="outline" onClick={onManualEntry}>
              <Edit className="w-4 h-4 mr-2" />
              Manual Entry
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DETAILS STEP
// ═══════════════════════════════════════════════════════════════════════════

interface DetailsStepProps {
  formData: Partial<MedicationToAdd>;
  selectedMedication: MedicationSearchResult | null;
  isManualEntry: boolean;
  onUpdateField: (field: keyof MedicationToAdd, value: any) => void;
  errors: string[];
}

function DetailsStep({
  formData,
  selectedMedication,
  isManualEntry,
  onUpdateField,
  errors,
}: DetailsStepProps) {
  return (
    <div className="space-y-6 py-4">
      {/* Errors */}
      {errors.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 mb-2">Please fix the following errors:</p>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Selected Medication Info */}
      {selectedMedication && !isManualEntry && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Pill className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-blue-900">{selectedMedication.brandName}</h4>
              <p className="text-sm text-blue-700">
                Generic: {selectedMedication.genericName} • {selectedMedication.drugClass}
              </p>
              {selectedMedication.warnings && selectedMedication.warnings.length > 0 && (
                <div className="mt-2 text-xs text-blue-700">
                  <strong>Warnings:</strong> {selectedMedication.warnings.join(', ')}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Manual Entry Name */}
      {isManualEntry && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Medication Name *
            </Label>
            <Input
              placeholder="e.g., Metoprolol"
              value={formData.name || ''}
              onChange={(e) => onUpdateField('name', e.target.value)}
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Generic Name
            </Label>
            <Input
              placeholder="e.g., Metoprolol Succinate"
              value={formData.genericName || ''}
              onChange={(e) => onUpdateField('genericName', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Strength */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Strength *
          </Label>
          {selectedMedication?.commonStrengths && selectedMedication.commonStrengths.length > 0 ? (
            <Select
              value={formData.strength}
              onValueChange={(value) => onUpdateField('strength', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select strength" />
              </SelectTrigger>
              <SelectContent>
                {selectedMedication.commonStrengths.map(strength => (
                  <SelectItem key={strength} value={strength}>
                    {strength}
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">Custom...</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder="e.g., 50mg"
              value={formData.strength || ''}
              onChange={(e) => onUpdateField('strength', e.target.value)}
            />
          )}
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">
            Dose *
          </Label>
          <Input
            placeholder="e.g., 1 tablet, 2 capsules"
            value={formData.dose || ''}
            onChange={(e) => onUpdateField('dose', e.target.value)}
          />
        </div>
      </div>

      {/* Route */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Route *
          </Label>
          <Select
            value={formData.route}
            onValueChange={(value) => onUpdateField('route', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select route" />
            </SelectTrigger>
            <SelectContent>
              {(selectedMedication?.commonRoutes || COMMON_ROUTES).map(route => (
                <SelectItem key={route} value={route}>
                  {route}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">
            Frequency *
          </Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => onUpdateField('frequency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {(selectedMedication?.commonFrequencies || COMMON_FREQUENCIES).map(freq => (
                <SelectItem key={freq} value={freq}>
                  {freq}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* PRN */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Checkbox
            id="isPRN"
            checked={formData.isPRN}
            onCheckedChange={(checked) => onUpdateField('isPRN', checked === true)}
          />
          <Label htmlFor="isPRN" className="text-sm font-medium cursor-pointer">
            PRN (As Needed) Medication
          </Label>
        </div>
        {formData.isPRN && (
          <Select
            value={formData.prnReason}
            onValueChange={(value) => onUpdateField('prnReason', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select PRN reason" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_PRN_REASONS.map(reason => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Start Date & Physician */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Start Date *
          </Label>
          <Input
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => onUpdateField('startDate', e.target.value)}
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <User className="w-4 h-4" />
            Prescribing Physician *
          </Label>
          <Input
            placeholder="e.g., Dr. Smith"
            value={formData.prescribingPhysician || ''}
            onChange={(e) => onUpdateField('prescribingPhysician', e.target.value)}
          />
        </div>
      </div>

      {/* Indication */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Indication
        </Label>
        {selectedMedication?.indications && selectedMedication.indications.length > 0 ? (
          <Select
            value={formData.indication}
            onValueChange={(value) => onUpdateField('indication', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select indication" />
            </SelectTrigger>
            <SelectContent>
              {selectedMedication.indications.map(indication => (
                <SelectItem key={indication} value={indication}>
                  {indication}
                </SelectItem>
              ))}
              <SelectItem value="__other__">Other...</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Input
            placeholder="e.g., Hypertension, Pain management"
            value={formData.indication || ''}
            onChange={(e) => onUpdateField('indication', e.target.value)}
          />
        )}
      </div>

      {/* Additional Instructions */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Additional Instructions
        </Label>
        <Textarea
          placeholder="e.g., Take with food, Avoid grapefruit juice"
          value={formData.instructions || ''}
          onChange={(e) => onUpdateField('instructions', e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEW STEP
// ═══════════════════════════════════════════════════════════════════════════

interface ReviewStepProps {
  formData: MedicationToAdd;
  selectedMedication: MedicationSearchResult | null;
  alerts: MedicationAlert[];
}

function ReviewStep({ formData, selectedMedication, alerts }: ReviewStepProps) {
  return (
    <div className="space-y-6 py-4">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Medication Alerts ({alerts.length})
          </h4>
          <div className="space-y-2">
            {alerts.map(alert => (
              <InlineAlert key={alert.id} alert={alert} />
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Please review these alerts before adding the medication. You can proceed if clinically appropriate.
          </p>
        </div>
      )}

      {/* Medication Summary */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Medication Summary</h4>
        <Card className="p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Medication</p>
              <p className="font-semibold text-gray-900">{formData.name}</p>
              {formData.genericName && (
                <p className="text-xs text-gray-600">({formData.genericName})</p>
              )}
            </div>
            <div>
              <p className="text-gray-600 mb-1">Strength</p>
              <p className="font-semibold text-gray-900">{formData.strength}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Dose</p>
              <p className="font-semibold text-gray-900">{formData.dose}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Route</p>
              <p className="font-semibold text-gray-900">{formData.route}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Frequency</p>
              <p className="font-semibold text-gray-900">{formData.frequency}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">PRN Status</p>
              <p className="font-semibold text-gray-900">
                {formData.isPRN ? `Yes - ${formData.prnReason}` : 'No'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Start Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(formData.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Prescribing Physician</p>
              <p className="font-semibold text-gray-900">{formData.prescribingPhysician}</p>
            </div>
            {formData.indication && (
              <div className="col-span-2">
                <p className="text-gray-600 mb-1">Indication</p>
                <p className="font-semibold text-gray-900">{formData.indication}</p>
              </div>
            )}
            {formData.instructions && (
              <div className="col-span-2">
                <p className="text-gray-600 mb-1">Instructions</p>
                <p className="font-semibold text-gray-900">{formData.instructions}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Warnings */}
      {selectedMedication?.warnings && selectedMedication.warnings.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Medication Warnings
          </h4>
          <Card className="p-4 bg-blue-50 border-blue-200">
            <ul className="text-sm text-blue-900 space-y-1">
              {selectedMedication.warnings.map((warning, idx) => (
                <li key={idx}>• {warning}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Confirmation Message */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 mb-1">Ready to Add</p>
            <p className="text-sm text-green-700">
              Click "Add Medication" to add this medication to the patient's profile.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP INDICATOR
// ═══════════════════════════════════════════════════════════════════════════

function StepIndicator({
  step,
  label,
  isActive,
  isComplete,
}: {
  step: number;
  label: string;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
          isComplete && 'bg-green-600 text-white',
          isActive && !isComplete && 'bg-blue-600 text-white',
          !isActive && !isComplete && 'bg-gray-200 text-gray-600'
        )}
      >
        {isComplete ? <Check className="w-4 h-4" /> : step}
      </div>
      <span
        className={cn(
          'text-sm font-medium',
          (isActive || isComplete) ? 'text-gray-900' : 'text-gray-500'
        )}
      >
        {label}
      </span>
    </div>
  );
}
