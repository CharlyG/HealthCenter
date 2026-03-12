/**
 * Visit Medication Review Component
 * 
 * Structured medication review section for visit documentation.
 * 
 * FEATURES:
 * - Quick medication review workflow
 * - Adherence documentation
 * - Side effects tracking
 * - Teaching documentation
 * - Patient/caregiver concerns
 * - Change reporting
 * - Connection to patient medication profile
 * - Connection to admission medication history
 * 
 * WORKFLOW:
 * 1. Load active medications from admission
 * 2. Review each medication with structured checkboxes
 * 3. Document adherence, side effects, teaching
 * 4. Report any changes needed
 * 5. Save to visit note
 * 
 * INTEGRATION:
 * - Links to Patient Medication Profile
 * - Links to Medication Change Tracking
 * - Creates change requests for physician
 * - Updates medication compliance tracking
 */

import { useState, useMemo } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Pill,
  User,
  Book,
  Edit,
  Plus,
  AlertCircle,
  Clock,
  ChevronRight,
  Eye,
  Link as LinkIcon,
  MessageSquare,
  Save,
  Check,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type AdherenceLevel = 'fully-compliant' | 'partially-compliant' | 'non-compliant' | 'unable-to-assess';

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  strength: string;
  dose: string;
  route: string;
  frequency: string;
  indication?: string;
  isPRN: boolean;
  prnReason?: string;
  isHighRisk?: boolean;
}

interface MedicationReview {
  medicationId: string;
  reviewed: boolean;
  adherence?: AdherenceLevel;
  adherenceNotes?: string;
  sideEffectsReported: boolean;
  sideEffectsDetails?: string;
  teachingProvided: boolean;
  teachingTopics?: string[];
  teachingNotes?: string;
  concernsReported: boolean;
  concernsDetails?: string;
  changeRequested: boolean;
  changeDetails?: string;
  evidenceOfCompliance?: string;
  barriersIdentified?: string[];
}

interface VisitMedicationReviewData {
  visitId: string;
  reviewPerformed: boolean;
  reviewMethod: 'visual-inspection' | 'verbal-confirmation' | 'medication-list' | 'combined';
  medicationReviews: MedicationReview[];
  generalNotes?: string;
  completedAt?: string;
  completedBy?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_MEDICATIONS: Medication[] = [
  {
    id: 'med-001',
    name: 'Metoprolol Succinate',
    genericName: 'Metoprolol Succinate ER',
    strength: '50mg',
    dose: '1 tablet',
    route: 'Oral',
    frequency: 'Twice daily',
    indication: 'Hypertension',
    isPRN: false,
    isHighRisk: false,
  },
  {
    id: 'med-002',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    strength: '20mg',
    dose: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily',
    indication: 'Hypertension',
    isPRN: false,
    isHighRisk: false,
  },
  {
    id: 'med-003',
    name: 'Warfarin Sodium',
    genericName: 'Warfarin Sodium',
    strength: '5mg',
    dose: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily at 5pm',
    indication: 'Atrial fibrillation',
    isPRN: false,
    isHighRisk: true,
  },
  {
    id: 'med-004',
    name: 'Furosemide',
    genericName: 'Furosemide',
    strength: '40mg',
    dose: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily',
    indication: 'Fluid overload',
    isPRN: false,
    isHighRisk: false,
  },
  {
    id: 'med-005',
    name: 'Gabapentin',
    genericName: 'Gabapentin',
    strength: '300mg',
    dose: '1 capsule',
    route: 'Oral',
    frequency: 'Twice daily',
    indication: 'Neuropathic pain',
    isPRN: false,
    isHighRisk: false,
  },
  {
    id: 'med-006',
    name: 'Oxycodone HCl',
    genericName: 'Oxycodone Hydrochloride',
    strength: '5mg',
    dose: '1-2 tablets',
    route: 'Oral',
    frequency: 'Every 4-6 hours as needed',
    indication: 'Moderate to severe pain',
    isPRN: true,
    prnReason: 'Pain',
    isHighRisk: true,
  },
];

const TEACHING_TOPICS = [
  'Purpose and indication',
  'Proper dosage and timing',
  'Administration technique',
  'Side effects to watch for',
  'Drug interactions',
  'Storage requirements',
  'What to report to physician',
  'Importance of adherence',
];

const COMMON_BARRIERS = [
  'Cost/affordability',
  'Forgetfulness',
  'Side effects',
  'Difficulty swallowing',
  'Complex regimen',
  'Transportation to pharmacy',
  'Caregiver unavailable',
  'Patient refusal',
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function VisitMedicationReview() {
  const [medications] = useState(MOCK_MEDICATIONS);
  const [reviewData, setReviewData] = useState<VisitMedicationReviewData>({
    visitId: 'visit-001',
    reviewPerformed: false,
    reviewMethod: 'combined',
    medicationReviews: [],
  });

  const [selectedMedicationId, setSelectedMedicationId] = useState<string | null>(null);
  const [showTeachingDialog, setShowTeachingDialog] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [showConcernDialog, setShowConcernDialog] = useState(false);

  // Initialize reviews for all medications
  const initializeReviews = () => {
    const reviews = medications.map(med => ({
      medicationId: med.id,
      reviewed: false,
      sideEffectsReported: false,
      teachingProvided: false,
      concernsReported: false,
      changeRequested: false,
    }));
    setReviewData(prev => ({ ...prev, medicationReviews: reviews, reviewPerformed: true }));
  };

  const getMedicationReview = (medicationId: string): MedicationReview | undefined => {
    return reviewData.medicationReviews.find(r => r.medicationId === medicationId);
  };

  const updateMedicationReview = (medicationId: string, updates: Partial<MedicationReview>) => {
    setReviewData(prev => ({
      ...prev,
      medicationReviews: prev.medicationReviews.map(review =>
        review.medicationId === medicationId
          ? { ...review, ...updates }
          : review
      ),
    }));
  };

  const handleQuickReview = (medicationId: string, adherence: AdherenceLevel) => {
    updateMedicationReview(medicationId, {
      reviewed: true,
      adherence,
      sideEffectsReported: false,
      teachingProvided: false,
      concernsReported: false,
      changeRequested: false,
    });
  };

  const progress = useMemo(() => {
    const total = reviewData.medicationReviews.length;
    const reviewed = reviewData.medicationReviews.filter(r => r.reviewed).length;
    return total > 0 ? Math.round((reviewed / total) * 100) : 0;
  }, [reviewData.medicationReviews]);

  const summary = useMemo(() => {
    const reviews = reviewData.medicationReviews;
    return {
      total: reviews.length,
      reviewed: reviews.filter(r => r.reviewed).length,
      compliant: reviews.filter(r => r.adherence === 'fully-compliant').length,
      nonCompliant: reviews.filter(r => r.adherence === 'non-compliant').length,
      sideEffects: reviews.filter(r => r.sideEffectsReported).length,
      teaching: reviews.filter(r => r.teachingProvided).length,
      concerns: reviews.filter(r => r.concernsReported).length,
      changes: reviews.filter(r => r.changeRequested).length,
    };
  }, [reviewData.medicationReviews]);

  if (!reviewData.reviewPerformed) {
    return (
      <Card className="p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Pill className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Medication Review</h3>
          <p className="text-sm text-gray-600 mb-6">
            Review the patient's medications during this visit. Document adherence, side effects,
            teaching, and any concerns or changes needed.
          </p>
          <Button onClick={initializeReviews} size="lg">
            Start Medication Review
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600" />
              Medication Review
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {medications.length} active medications • {summary.reviewed} reviewed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <LinkIcon className="w-4 h-4 mr-2" />
              View Full Profile
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Change History
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Review Progress</span>
            <span className="font-semibold text-gray-900">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Review Method */}
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium">Review Method:</Label>
          <div className="flex gap-2">
            {[
              { value: 'visual-inspection', label: 'Visual Inspection', icon: Eye },
              { value: 'verbal-confirmation', label: 'Verbal', icon: MessageSquare },
              { value: 'medication-list', label: 'List Review', icon: Pill },
              { value: 'combined', label: 'Combined', icon: CheckCircle2 },
            ].map(method => {
              const Icon = method.icon;
              const isSelected = reviewData.reviewMethod === method.value;
              return (
                <button
                  key={method.value}
                  onClick={() => setReviewData(prev => ({ ...prev, reviewMethod: method.value as any }))}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {method.label}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle2}
          label="Reviewed"
          value={`${summary.reviewed}/${summary.total}`}
          color="blue"
        />
        <StatCard
          icon={AlertTriangle}
          label="Issues"
          value={summary.nonCompliant + summary.sideEffects + summary.concerns}
          color="amber"
        />
        <StatCard
          icon={Book}
          label="Teaching"
          value={summary.teaching}
          color="green"
        />
        <StatCard
          icon={Edit}
          label="Changes"
          value={summary.changes}
          color="purple"
        />
      </div>

      {/* Medication List */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Medications</h3>
        <div className="space-y-3">
          {medications.map(medication => {
            const review = getMedicationReview(medication.id);
            return (
              <MedicationReviewCard
                key={medication.id}
                medication={medication}
                review={review}
                onQuickReview={(adherence) => handleQuickReview(medication.id, adherence)}
                onOpenTeaching={() => {
                  setSelectedMedicationId(medication.id);
                  setShowTeachingDialog(true);
                }}
                onOpenConcern={() => {
                  setSelectedMedicationId(medication.id);
                  setShowConcernDialog(true);
                }}
                onOpenChange={() => {
                  setSelectedMedicationId(medication.id);
                  setShowChangeDialog(true);
                }}
                onUpdateReview={(updates) => updateMedicationReview(medication.id, updates)}
              />
            );
          })}
        </div>
      </Card>

      {/* General Notes */}
      <Card className="p-6">
        <Label className="text-sm font-medium mb-2 block">General Medication Notes</Label>
        <Textarea
          placeholder="Add any additional notes about the medication review..."
          value={reviewData.generalNotes || ''}
          onChange={(e) => setReviewData(prev => ({ ...prev, generalNotes: e.target.value }))}
          rows={3}
        />
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Medication Review
        </Button>
      </div>

      {/* Dialogs */}
      {selectedMedicationId && (
        <>
          <TeachingDialog
            open={showTeachingDialog}
            onOpenChange={setShowTeachingDialog}
            medication={medications.find(m => m.id === selectedMedicationId)!}
            review={getMedicationReview(selectedMedicationId)}
            onSave={(data) => {
              updateMedicationReview(selectedMedicationId, {
                teachingProvided: true,
                teachingTopics: data.topics,
                teachingNotes: data.notes,
              });
              setShowTeachingDialog(false);
            }}
          />

          <ConcernDialog
            open={showConcernDialog}
            onOpenChange={setShowConcernDialog}
            medication={medications.find(m => m.id === selectedMedicationId)!}
            onSave={(data) => {
              updateMedicationReview(selectedMedicationId, {
                concernsReported: true,
                concernsDetails: data.details,
              });
              setShowConcernDialog(false);
            }}
          />

          <ChangeDialog
            open={showChangeDialog}
            onOpenChange={setShowChangeDialog}
            medication={medications.find(m => m.id === selectedMedicationId)!}
            onSave={(data) => {
              updateMedicationReview(selectedMedicationId, {
                changeRequested: true,
                changeDetails: data.details,
              });
              setShowChangeDialog(false);
            }}
          />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATION REVIEW CARD
// ═══════════════════════════════════════════════════════════════════════════

interface MedicationReviewCardProps {
  medication: Medication;
  review?: MedicationReview;
  onQuickReview: (adherence: AdherenceLevel) => void;
  onOpenTeaching: () => void;
  onOpenConcern: () => void;
  onOpenChange: () => void;
  onUpdateReview: (updates: Partial<MedicationReview>) => void;
}

function MedicationReviewCard({
  medication,
  review,
  onQuickReview,
  onOpenTeaching,
  onOpenConcern,
  onOpenChange,
  onUpdateReview,
}: MedicationReviewCardProps) {
  const isReviewed = review?.reviewed || false;

  return (
    <Card className={cn(
      'p-4 transition-all',
      isReviewed && 'border-green-300 bg-green-50',
      medication.isHighRisk && !isReviewed && 'border-l-4 border-l-red-500'
    )}>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn(
                'p-2 rounded-lg',
                isReviewed ? 'bg-green-100' : 'bg-gray-100'
              )}>
                {isReviewed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-900">{medication.name}</h4>
                  {medication.isHighRisk && (
                    <Badge variant="destructive" className="text-xs">High Risk</Badge>
                  )}
                  {medication.isPRN && (
                    <Badge variant="outline" className="text-xs bg-amber-50">PRN</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {medication.strength} {medication.dose} • {medication.frequency}
                </p>
                {medication.indication && (
                  <p className="text-xs text-gray-500 mt-1">For: {medication.indication}</p>
                )}
              </div>
            </div>
            <AccordionTrigger className="hover:no-underline">
              <ChevronRight className="w-5 h-5 text-gray-400 transition-transform" />
            </AccordionTrigger>
          </div>

          {/* Quick Actions - Always Visible */}
          {!isReviewed && (
            <div className="mb-3">
              <Label className="text-xs text-gray-600 mb-2 block">Quick Review:</Label>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickReview('fully-compliant')}
                  className="text-xs"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Compliant
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickReview('partially-compliant')}
                  className="text-xs"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Partial
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickReview('non-compliant')}
                  className="text-xs"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Non-Compliant
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickReview('unable-to-assess')}
                  className="text-xs"
                >
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Unable
                </Button>
              </div>
            </div>
          )}

          {/* Status Badges - If Reviewed */}
          {isReviewed && (
            <div className="flex flex-wrap gap-2 mb-3">
              {review.adherence && (
                <Badge className={cn(
                  'text-xs',
                  review.adherence === 'fully-compliant' && 'bg-green-100 text-green-800',
                  review.adherence === 'partially-compliant' && 'bg-amber-100 text-amber-800',
                  review.adherence === 'non-compliant' && 'bg-red-100 text-red-800',
                  review.adherence === 'unable-to-assess' && 'bg-gray-100 text-gray-800'
                )}>
                  {review.adherence.replace('-', ' ')}
                </Badge>
              )}
              {review.sideEffectsReported && (
                <Badge className="bg-red-100 text-red-800 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Side Effects
                </Badge>
              )}
              {review.teachingProvided && (
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  <Book className="w-3 h-3 mr-1" />
                  Teaching Done
                </Badge>
              )}
              {review.concernsReported && (
                <Badge className="bg-amber-100 text-amber-800 text-xs">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Concerns
                </Badge>
              )}
              {review.changeRequested && (
                <Badge className="bg-purple-100 text-purple-800 text-xs">
                  <Edit className="w-3 h-3 mr-1" />
                  Change Requested
                </Badge>
              )}
            </div>
          )}

          {/* Expanded Details */}
          <AccordionContent>
            <div className="pt-3 border-t space-y-4">
              {/* Adherence Section */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Adherence</Label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[
                    { value: 'fully-compliant', label: 'Fully Compliant', icon: CheckCircle2, color: 'green' },
                    { value: 'partially-compliant', label: 'Partially Compliant', icon: AlertTriangle, color: 'amber' },
                    { value: 'non-compliant', label: 'Non-Compliant', icon: XCircle, color: 'red' },
                    { value: 'unable-to-assess', label: 'Unable to Assess', icon: HelpCircle, color: 'gray' },
                  ].map(option => {
                    const Icon = option.icon;
                    const isSelected = review?.adherence === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => onUpdateReview({ reviewed: true, adherence: option.value as AdherenceLevel })}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded border text-sm transition-all',
                          isSelected
                            ? `bg-${option.color}-50 border-${option.color}-500 text-${option.color}-900`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <Textarea
                  placeholder="Evidence of compliance or barriers identified..."
                  value={review?.adherenceNotes || ''}
                  onChange={(e) => onUpdateReview({ adherenceNotes: e.target.value })}
                  rows={2}
                  className="text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenTeaching}
                  className={review?.teachingProvided ? 'border-blue-500 bg-blue-50' : ''}
                >
                  <Book className="w-4 h-4 mr-2" />
                  Teaching
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenConcern}
                  className={review?.concernsReported ? 'border-amber-500 bg-amber-50' : ''}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Concerns
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenChange}
                  className={review?.changeRequested ? 'border-purple-500 bg-purple-50' : ''}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Report Change
                </Button>
              </div>

              {/* Side Effects Toggle */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  id={`side-effects-${medication.id}`}
                  checked={review?.sideEffectsReported || false}
                  onCheckedChange={(checked) =>
                    onUpdateReview({ sideEffectsReported: checked === true })
                  }
                />
                <div className="flex-1">
                  <label
                    htmlFor={`side-effects-${medication.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Patient reporting side effects
                  </label>
                  {review?.sideEffectsReported && (
                    <Textarea
                      placeholder="Describe side effects..."
                      value={review.sideEffectsDetails || ''}
                      onChange={(e) => onUpdateReview({ sideEffectsDetails: e.target.value })}
                      rows={2}
                      className="mt-2 text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEACHING DIALOG
// ═══════════════════════════════════════════════════════════════════════════

interface TeachingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication;
  review?: MedicationReview;
  onSave: (data: { topics: string[]; notes: string }) => void;
}

function TeachingDialog({ open, onOpenChange, medication, review, onSave }: TeachingDialogProps) {
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(
    new Set(review?.teachingTopics || [])
  );
  const [notes, setNotes] = useState(review?.teachingNotes || '');

  const handleToggleTopic = (topic: string) => {
    setSelectedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      return next;
    });
  };

  const handleSave = () => {
    onSave({
      topics: Array.from(selectedTopics),
      notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="w-5 h-5 text-blue-600" />
            Medication Teaching
          </DialogTitle>
          <DialogDescription>
            Document patient/caregiver education for {medication.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Topics Covered:</Label>
            <div className="grid grid-cols-2 gap-2">
              {TEACHING_TOPICS.map(topic => (
                <div
                  key={topic}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded border cursor-pointer transition-all',
                    selectedTopics.has(topic)
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  )}
                  onClick={() => handleToggleTopic(topic)}
                >
                  <Checkbox checked={selectedTopics.has(topic)} />
                  <span className="text-sm">{topic}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Teaching Notes:</Label>
            <Textarea
              placeholder="Document teaching methods, patient response, areas needing reinforcement..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Teaching
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ════════════════════════════════════════════════════════════��══════════════
// CONCERN DIALOG
// ═══════════════════════════════════════════════════════════════════════════

interface ConcernDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication;
  onSave: (data: { details: string }) => void;
}

function ConcernDialog({ open, onOpenChange, medication, onSave }: ConcernDialogProps) {
  const [details, setDetails] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            Patient/Caregiver Concerns
          </DialogTitle>
          <DialogDescription>
            Document concerns about {medication.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="What concerns did the patient or caregiver express about this medication?"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave({ details })}>
            Save Concern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHANGE DIALOG
// ═══════════════════════════════════════════════════════════════════════════

interface ChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication;
  onSave: (data: { details: string }) => void;
}

function ChangeDialog({ open, onOpenChange, medication, onSave }: ChangeDialogProps) {
  const [details, setDetails] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-purple-600" />
            Report Medication Change
          </DialogTitle>
          <DialogDescription>
            Document needed change for {medication.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="p-3 bg-amber-50 border-amber-200">
            <p className="text-xs text-amber-900">
              <strong>Note:</strong> This will create a change request that requires physician review and authorization.
            </p>
          </Card>

          <Textarea
            placeholder="Describe the medication change needed (dose, frequency, discontinuation, etc.) and the clinical rationale..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave({ details })}>
            Create Change Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: number | string;
  color: 'blue' | 'amber' | 'green' | 'purple';
}) {
  const colorConfig = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
  };

  return (
    <Card className={cn('p-4', colorConfig[color])}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs opacity-80">{label}</div>
        </div>
      </div>
    </Card>
  );
}
