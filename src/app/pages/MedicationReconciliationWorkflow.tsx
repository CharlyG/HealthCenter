/**
 * Medication Reconciliation Workflow
 * 
 * Comprehensive reconciliation process for home health:
 * 
 * WORKFLOW STAGES:
 * 1. Source Selection - Choose what to reconcile against
 * 2. Medication Matching - Auto-match similar medications
 * 3. Classification - Classify each medication
 * 4. Issue Resolution - Address discrepancies
 * 5. Final Review - Summary and confirmation
 * 6. Completion - Lock reconciled list
 * 
 * COMPARISON SOURCES:
 * - Patient's current medication profile
 * - Hospital discharge summary
 * - Physician referral
 * - Pharmacy records
 * - Previous admission
 * 
 * CLASSIFICATION OPTIONS:
 * - Continue (no changes)
 * - Continue with changes (dose/frequency modified)
 * - Discontinue (stopped)
 * - New (added)
 * - Needs clarification (unclear)
 * 
 * SAFETY FEATURES:
 * - Auto-detection of discrepancies
 * - Duplicate medication warnings
 * - Missing medication alerts
 * - Dosage change highlighting
 * - Physician notification tracking
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { Checkbox } from '../components/ui/checkbox';
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
  ArrowLeft,
  ArrowRight,
  GitCompare,
  Check,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit,
  Plus,
  Minus,
  HelpCircle,
  FileText,
  User,
  Building2,
  Calendar,
  Clock,
  Pill,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Loader2,
  Save,
  Send,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ReconciliationStage = 'source-selection' | 'matching' | 'classification' | 'review' | 'completion';

type MedicationSource = 'patient-profile' | 'hospital-discharge' | 'physician-referral' | 'pharmacy' | 'previous-admission';

type ReconciliationAction = 'continue' | 'continue-with-changes' | 'discontinue' | 'new' | 'needs-clarification';

interface SourceMedication {
  id: string;
  name: string;
  genericName?: string;
  strength: string;
  dose: string;
  route: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
  prescriber?: string;
  indication?: string;
  source: MedicationSource;
  sourceLabel: string;
}

interface ReconciliationItem {
  id: string;
  sourceMedication: SourceMedication;
  matchedMedication?: SourceMedication; // From comparison source
  action?: ReconciliationAction;
  isMatch: boolean;
  matchConfidence?: 'high' | 'medium' | 'low';
  discrepancies?: DiscrepancyType[];
  notes?: string;
  notifyPhysician: boolean;
  finalMedication?: SourceMedication; // After reconciliation
}

type DiscrepancyType = 'dose-different' | 'frequency-different' | 'route-different' | 'new-medication' | 'missing-medication' | 'duplicate';

interface ReconciliationSummary {
  total: number;
  continued: number;
  continuedWithChanges: number;
  discontinued: number;
  new: number;
  needsClarification: number;
  issues: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_PATIENT_MEDICATIONS: SourceMedication[] = [
  {
    id: 'pat-001',
    name: 'Metoprolol Succinate',
    genericName: 'Metoprolol Succinate ER',
    strength: '50mg',
    dose: '1 tablet',
    route: 'Oral',
    frequency: 'Twice daily',
    startDate: '2023-01-15',
    prescriber: 'Dr. Sarah Johnson',
    indication: 'Hypertension',
    source: 'patient-profile',
    sourceLabel: 'Patient Profile',
  },
  {
    id: 'pat-002',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    strength: '10mg',
    dose: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily',
    startDate: '2023-01-15',
    prescriber: 'Dr. Sarah Johnson',
    indication: 'Hypertension',
    source: 'patient-profile',
    sourceLabel: 'Patient Profile',
  },
  {
    id: 'pat-003',
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    strength: '81mg',
    dose: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily',
    startDate: '2022-08-01',
    prescriber: 'Dr. Sarah Johnson',
    indication: 'Cardiovascular prophylaxis',
    source: 'patient-profile',
    sourceLabel: 'Patient Profile',
  },
  {
    id: 'pat-004',
    name: 'Gabapentin',
    genericName: 'Gabapentin',
    strength: '300mg',
    dose: '1 capsule',
    route: 'Oral',
    frequency: 'Three times daily',
    startDate: '2023-11-20',
    prescriber: 'Dr. Sarah Johnson',
    indication: 'Neuropathic pain',
    source: 'patient-profile',
    sourceLabel: 'Patient Profile',
  },
];

const MOCK_HOSPITAL_MEDICATIONS: SourceMedication[] = [
  {
    id: 'hosp-001',
    name: 'Metoprolol Tartrate',
    genericName: 'Metoprolol Tartrate',
    strength: '25mg',
    dose: '1 tablet',
    route: 'Oral',
    frequency: 'Twice daily',
    startDate: '2024-03-01',
    prescriber: 'Dr. Michael Chen',
    indication: 'Hypertension',
    source: 'hospital-discharge',
    sourceLabel: 'Hospital Discharge',
  },
  {
    id: 'hosp-002',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    strength: '20mg',
    dose: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily',
    startDate: '2024-03-01',
    prescriber: 'Dr. Michael Chen',
    indication: 'Hypertension',
    source: 'hospital-discharge',
    sourceLabel: 'Hospital Discharge',
  },
  {
    id: 'hosp-003',
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    strength: '81mg',
    dose: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily',
    startDate: '2024-03-01',
    prescriber: 'Dr. Michael Chen',
    indication: 'Cardiovascular prophylaxis',
    source: 'hospital-discharge',
    sourceLabel: 'Hospital Discharge',
  },
  {
    id: 'hosp-004',
    name: 'Furosemide',
    genericName: 'Furosemide',
    strength: '40mg',
    dose: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily',
    startDate: '2024-03-01',
    prescriber: 'Dr. Michael Chen',
    indication: 'Fluid overload',
    source: 'hospital-discharge',
    sourceLabel: 'Hospital Discharge',
  },
  {
    id: 'hosp-005',
    name: 'Warfarin Sodium',
    genericName: 'Warfarin Sodium',
    strength: '5mg',
    dose: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily at 5pm',
    startDate: '2024-03-01',
    prescriber: 'Dr. Michael Chen',
    indication: 'Atrial fibrillation',
    source: 'hospital-discharge',
    sourceLabel: 'Hospital Discharge',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function MedicationReconciliationWorkflow() {
  const navigate = useNavigate();
  const { admissionId } = useParams<{ admissionId: string }>();

  const [stage, setStage] = useState<ReconciliationStage>('source-selection');
  const [selectedSource, setSelectedSource] = useState<MedicationSource>('hospital-discharge');
  const [reconciliationItems, setReconciliationItems] = useState<ReconciliationItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Perform automatic matching when source is selected
  useEffect(() => {
    if (stage === 'matching') {
      performAutoMatching();
    }
  }, [stage]);

  const performAutoMatching = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const items: ReconciliationItem[] = [];
      
      // Get comparison source medications
      const sourceMeds = selectedSource === 'hospital-discharge' 
        ? MOCK_HOSPITAL_MEDICATIONS 
        : MOCK_PATIENT_MEDICATIONS;

      // Match each patient medication with source
      MOCK_PATIENT_MEDICATIONS.forEach(patMed => {
        const match = sourceMeds.find(sourceMed => 
          isSameMedication(patMed.name, sourceMed.name)
        );

        if (match) {
          // Found a match - check for discrepancies
          const discrepancies = findDiscrepancies(patMed, match);
          const action = discrepancies.length > 0 ? 'continue-with-changes' : 'continue';
          
          items.push({
            id: `recon-${patMed.id}`,
            sourceMedication: patMed,
            matchedMedication: match,
            isMatch: true,
            matchConfidence: 'high',
            discrepancies,
            action,
            notifyPhysician: discrepancies.length > 0,
            finalMedication: match, // Default to using the new version
          });
        } else {
          // No match - might be discontinued
          items.push({
            id: `recon-${patMed.id}`,
            sourceMedication: patMed,
            isMatch: false,
            action: 'needs-clarification',
            discrepancies: ['missing-medication'],
            notifyPhysician: true,
          });
        }
      });

      // Find new medications in source that aren't in patient profile
      sourceMeds.forEach(sourceMed => {
        const exists = MOCK_PATIENT_MEDICATIONS.find(patMed =>
          isSameMedication(patMed.name, sourceMed.name)
        );

        if (!exists) {
          items.push({
            id: `recon-new-${sourceMed.id}`,
            sourceMedication: sourceMed,
            isMatch: false,
            action: 'new',
            discrepancies: ['new-medication'],
            notifyPhysician: false,
            finalMedication: sourceMed,
          });
        }
      });

      setReconciliationItems(items);
      setIsProcessing(false);
      setStage('classification');
    }, 1500);
  };

  const isSameMedication = (name1: string, name2: string): boolean => {
    const n1 = name1.toLowerCase().replace(/\s+/g, '');
    const n2 = name2.toLowerCase().replace(/\s+/g, '');
    return n1.includes(n2.split('(')[0].trim()) || n2.includes(n1.split('(')[0].trim());
  };

  const findDiscrepancies = (med1: SourceMedication, med2: SourceMedication): DiscrepancyType[] => {
    const discrepancies: DiscrepancyType[] = [];
    
    if (med1.strength !== med2.strength || med1.dose !== med2.dose) {
      discrepancies.push('dose-different');
    }
    if (med1.frequency !== med2.frequency) {
      discrepancies.push('frequency-different');
    }
    if (med1.route !== med2.route) {
      discrepancies.push('route-different');
    }
    
    return discrepancies;
  };

  const handleUpdateAction = (itemId: string, action: ReconciliationAction) => {
    setReconciliationItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, action } : item
      )
    );
  };

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setReconciliationItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, notes } : item
      )
    );
  };

  const handleToggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const summary: ReconciliationSummary = useMemo(() => {
    const total = reconciliationItems.length;
    const continued = reconciliationItems.filter(i => i.action === 'continue').length;
    const continuedWithChanges = reconciliationItems.filter(i => i.action === 'continue-with-changes').length;
    const discontinued = reconciliationItems.filter(i => i.action === 'discontinue').length;
    const newMeds = reconciliationItems.filter(i => i.action === 'new').length;
    const needsClarification = reconciliationItems.filter(i => i.action === 'needs-clarification').length;
    const issues = reconciliationItems.filter(i => 
      i.discrepancies && i.discrepancies.length > 0
    ).length;

    return {
      total,
      continued,
      continuedWithChanges,
      discontinued,
      new: newMeds,
      needsClarification,
      issues,
    };
  }, [reconciliationItems]);

  const canProceedToReview = useMemo(() => {
    return reconciliationItems.every(item => item.action !== undefined) &&
           summary.needsClarification === 0;
  }, [reconciliationItems, summary]);

  const handleComplete = () => {
    setStage('completion');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <GitCompare className="w-6 h-6 text-blue-600" />
                  Medication Reconciliation
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Margaret Johnson • MRN-334455 • Start of Care
                </p>
              </div>
            </div>

            {/* Stage Progress */}
            <div className="flex items-center gap-2">
              <StageIndicator
                current={stage}
                targetStage="source-selection"
                label="Source"
              />
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <StageIndicator
                current={stage}
                targetStage="matching"
                label="Match"
              />
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <StageIndicator
                current={stage}
                targetStage="classification"
                label="Classify"
              />
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <StageIndicator
                current={stage}
                targetStage="review"
                label="Review"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {stage === 'source-selection' && (
          <SourceSelectionStage
            selectedSource={selectedSource}
            onSelectSource={setSelectedSource}
            onProceed={() => setStage('matching')}
          />
        )}

        {stage === 'matching' && (
          <MatchingStage isProcessing={isProcessing} />
        )}

        {stage === 'classification' && (
          <ClassificationStage
            items={reconciliationItems}
            expandedItems={expandedItems}
            onUpdateAction={handleUpdateAction}
            onUpdateNotes={handleUpdateNotes}
            onToggleExpanded={handleToggleExpanded}
            summary={summary}
            onProceedToReview={() => setStage('review')}
            canProceed={canProceedToReview}
          />
        )}

        {stage === 'review' && (
          <ReviewStage
            items={reconciliationItems}
            summary={summary}
            onBack={() => setStage('classification')}
            onComplete={handleComplete}
          />
        )}

        {stage === 'completion' && (
          <CompletionStage
            summary={summary}
            onViewAdmission={() => navigate(`/admissions/${admissionId}`)}
            onViewMedications={() => navigate('/patient-medication-profile-view')}
          />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SOURCE SELECTION STAGE
// ═══════════════════════════════════════════════════════════════════════════

interface SourceSelectionStageProps {
  selectedSource: MedicationSource;
  onSelectSource: (source: MedicationSource) => void;
  onProceed: () => void;
}

function SourceSelectionStage({ selectedSource, onSelectSource, onProceed }: SourceSelectionStageProps) {
  const sources = [
    {
      id: 'hospital-discharge' as MedicationSource,
      icon: Building2,
      title: 'Hospital Discharge Summary',
      description: 'Medications from recent hospital discharge',
      badge: 'Most Common',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'physician-referral' as MedicationSource,
      icon: User,
      title: 'Physician Referral',
      description: 'Medications from referring physician',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'pharmacy' as MedicationSource,
      icon: Building2,
      title: 'Pharmacy Records',
      description: 'Current medications from patient\'s pharmacy',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'previous-admission' as MedicationSource,
      icon: FileText,
      title: 'Previous Admission',
      description: 'Medications from prior home health episode',
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Select Comparison Source</h2>
        <p className="text-sm text-gray-600 mb-6">
          Choose which medication list you want to compare against the patient's current profile
        </p>

        <div className="grid grid-cols-2 gap-4">
          {sources.map((source) => {
            const Icon = source.icon;
            const isSelected = selectedSource === source.id;
            
            return (
              <Card
                key={source.id}
                className={cn(
                  'p-4 cursor-pointer transition-all border-2',
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={() => onSelectSource(source.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    isSelected ? 'bg-blue-100' : 'bg-gray-100'
                  )}>
                    <Icon className={cn(
                      'w-5 h-5',
                      isSelected ? 'text-blue-600' : 'text-gray-600'
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{source.title}</h3>
                      {source.badge && (
                        <Badge className={source.badgeColor}>
                          {source.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{source.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="space-y-1 text-blue-800">
              <li>• We'll automatically match medications from both lists</li>
              <li>• You'll classify each medication (continue, discontinue, changed, etc.)</li>
              <li>• Discrepancies will be highlighted for your review</li>
              <li>• A final reconciled list will be created for the admission</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onProceed}>
          Start Reconciliation
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MATCHING STAGE
// ═══════════════════════════════════════════════════════════════════════════

function MatchingStage({ isProcessing }: { isProcessing: boolean }) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Matching Medications...
          </h2>
          <p className="text-gray-600 mb-6">
            Comparing patient profile with hospital discharge medications
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Loading patient medication profile</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Loading hospital discharge list</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Matching medications by name and strength...</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Detecting discrepancies</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CLASSIFICATION STAGE
// ═══════════════════════════════════════════════════════════════════════════

interface ClassificationStageProps {
  items: ReconciliationItem[];
  expandedItems: Set<string>;
  onUpdateAction: (itemId: string, action: ReconciliationAction) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onToggleExpanded: (itemId: string) => void;
  summary: ReconciliationSummary;
  onProceedToReview: () => void;
  canProceed: boolean;
}

function ClassificationStage({
  items,
  expandedItems,
  onUpdateAction,
  onUpdateNotes,
  onToggleExpanded,
  summary,
  onProceedToReview,
  canProceed,
}: ClassificationStageProps) {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Main Content */}
      <div className="col-span-8 space-y-4">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Classify Medications ({items.length})
          </h2>
          
          <div className="space-y-3">
            {items.map(item => (
              <ReconciliationItemCard
                key={item.id}
                item={item}
                isExpanded={expandedItems.has(item.id)}
                onUpdateAction={onUpdateAction}
                onUpdateNotes={onUpdateNotes}
                onToggleExpanded={onToggleExpanded}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="col-span-4 space-y-6">
        <ReconciliationSummaryCard summary={summary} />

        {!canProceed && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-medium mb-1">Action Required</p>
                <p className="text-amber-800">
                  {summary.needsClarification} medication{summary.needsClarification !== 1 ? 's' : ''} need{summary.needsClarification === 1 ? 's' : ''} clarification before you can proceed.
                </p>
              </div>
            </div>
          </Card>
        )}

        <Button
          className="w-full"
          onClick={onProceedToReview}
          disabled={!canProceed}
        >
          Proceed to Review
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RECONCILIATION ITEM CARD
// ═══════════════════════════════════════════════════════════════════════════

interface ReconciliationItemCardProps {
  item: ReconciliationItem;
  isExpanded: boolean;
  onUpdateAction: (itemId: string, action: ReconciliationAction) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onToggleExpanded: (itemId: string) => void;
}

function ReconciliationItemCard({
  item,
  isExpanded,
  onUpdateAction,
  onUpdateNotes,
  onToggleExpanded,
}: ReconciliationItemCardProps) {
  const hasDiscrepancies = item.discrepancies && item.discrepancies.length > 0;
  const isNew = item.discrepancies?.includes('new-medication');
  const isMissing = item.discrepancies?.includes('missing-medication');

  return (
    <Card className={cn(
      'p-4 transition-all',
      hasDiscrepancies && 'border-l-4 border-l-amber-500',
      item.action === 'needs-clarification' && 'border-l-4 border-l-red-500'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900">
              {item.sourceMedication.name}
            </h4>
            {isNew && (
              <Badge className="bg-green-100 text-green-800">
                <Plus className="w-3 h-3 mr-1" />
                New
              </Badge>
            )}
            {isMissing && (
              <Badge className="bg-red-100 text-red-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Missing
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {item.sourceMedication.strength} • {item.sourceMedication.frequency}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleExpanded(item.id)}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Comparison */}
      {item.matchedMedication && hasDiscrepancies && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <ArrowUpDown className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 mb-1">Changes Detected:</p>
              <div className="space-y-1 text-amber-800">
                {item.discrepancies?.includes('dose-different') && (
                  <p>• Dose changed: {item.sourceMedication.strength} → {item.matchedMedication.strength}</p>
                )}
                {item.discrepancies?.includes('frequency-different') && (
                  <p>• Frequency changed: {item.sourceMedication.frequency} → {item.matchedMedication.frequency}</p>
                )}
                {item.discrepancies?.includes('route-different') && (
                  <p>• Route changed: {item.sourceMedication.route} → {item.matchedMedication.route}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Selection */}
      <div className="mb-3">
        <Label className="text-sm font-medium mb-2 block">Classification</Label>
        <div className="grid grid-cols-3 gap-2">
          <ActionButton
            icon={CheckCircle2}
            label="Continue"
            isSelected={item.action === 'continue'}
            onClick={() => onUpdateAction(item.id, 'continue')}
            color="green"
          />
          <ActionButton
            icon={Edit}
            label="Changed"
            isSelected={item.action === 'continue-with-changes'}
            onClick={() => onUpdateAction(item.id, 'continue-with-changes')}
            color="blue"
          />
          <ActionButton
            icon={XCircle}
            label="Discontinue"
            isSelected={item.action === 'discontinue'}
            onClick={() => onUpdateAction(item.id, 'discontinue')}
            color="red"
          />
          {isNew && (
            <ActionButton
              icon={Plus}
              label="Add New"
              isSelected={item.action === 'new'}
              onClick={() => onUpdateAction(item.id, 'new')}
              color="green"
            />
          )}
          <ActionButton
            icon={HelpCircle}
            label="Clarify"
            isSelected={item.action === 'needs-clarification'}
            onClick={() => onUpdateAction(item.id, 'needs-clarification')}
            color="amber"
          />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-3 pt-3 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Patient Profile:</p>
              <p className="font-medium text-gray-900">
                {item.sourceMedication.strength} {item.sourceMedication.route}
              </p>
              <p className="text-gray-700">{item.sourceMedication.frequency}</p>
              {item.sourceMedication.prescriber && (
                <p className="text-xs text-gray-600 mt-1">
                  Prescribed by {item.sourceMedication.prescriber}
                </p>
              )}
            </div>
            {item.matchedMedication && (
              <div>
                <p className="text-gray-600 mb-1">Hospital Discharge:</p>
                <p className="font-medium text-gray-900">
                  {item.matchedMedication.strength} {item.matchedMedication.route}
                </p>
                <p className="text-gray-700">{item.matchedMedication.frequency}</p>
                {item.matchedMedication.prescriber && (
                  <p className="text-xs text-gray-600 mt-1">
                    Prescribed by {item.matchedMedication.prescriber}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm mb-2">Notes</Label>
            <Textarea
              placeholder="Add notes about this medication reconciliation..."
              value={item.notes || ''}
              onChange={(e) => onUpdateNotes(item.id, e.target.value)}
              rows={2}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

function ActionButton({
  icon: Icon,
  label,
  isSelected,
  onClick,
  color,
}: {
  icon: React.ComponentType<any>;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  color: 'green' | 'blue' | 'red' | 'amber';
}) {
  const colorConfig = {
    green: {
      selected: 'bg-green-100 border-green-500 text-green-900',
      unselected: 'bg-white border-gray-200 text-gray-700 hover:border-green-300',
    },
    blue: {
      selected: 'bg-blue-100 border-blue-500 text-blue-900',
      unselected: 'bg-white border-gray-200 text-gray-700 hover:border-blue-300',
    },
    red: {
      selected: 'bg-red-100 border-red-500 text-red-900',
      unselected: 'bg-white border-gray-200 text-gray-700 hover:border-red-300',
    },
    amber: {
      selected: 'bg-amber-100 border-amber-500 text-amber-900',
      unselected: 'bg-white border-gray-200 text-gray-700 hover:border-amber-300',
    },
  };

  const config = colorConfig[color];

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 p-3 border-2 rounded-lg transition-all text-xs font-medium',
        isSelected ? config.selected : config.unselected
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RECONCILIATION SUMMARY CARD
// ═══════════════════════════════════════════════════════════════════════════

function ReconciliationSummaryCard({ summary }: { summary: ReconciliationSummary }) {
  const progress = summary.total > 0
    ? ((summary.total - summary.needsClarification) / summary.total) * 100
    : 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
      <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-2">
        <SummaryRow
          icon={CheckCircle2}
          label="Continued"
          value={summary.continued}
          color="green"
        />
        <SummaryRow
          icon={Edit}
          label="Changed"
          value={summary.continuedWithChanges}
          color="blue"
        />
        <SummaryRow
          icon={XCircle}
          label="Discontinued"
          value={summary.discontinued}
          color="red"
        />
        <SummaryRow
          icon={Plus}
          label="New"
          value={summary.new}
          color="green"
        />
        <SummaryRow
          icon={HelpCircle}
          label="Needs Clarification"
          value={summary.needsClarification}
          color="amber"
        />
        <Separator className="my-2" />
        <SummaryRow
          icon={AlertTriangle}
          label="Issues to Review"
          value={summary.issues}
          color="amber"
        />
      </div>
    </Card>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  color: 'green' | 'blue' | 'red' | 'amber' | 'gray';
}) {
  const colorConfig = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={cn('p-1.5 rounded-lg', colorConfig[color])}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEW STAGE
// ═══════════════════════════════════════════════════════════════════════════

interface ReviewStageProps {
  items: ReconciliationItem[];
  summary: ReconciliationSummary;
  onBack: () => void;
  onComplete: () => void;
}

function ReviewStage({ items, summary, onBack, onComplete }: ReviewStageProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Final Review</h2>
        <p className="text-sm text-gray-600 mb-6">
          Review the reconciled medication list before completing
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-sm text-green-700 mb-1">Continued/New</div>
            <div className="text-2xl font-bold text-green-900">
              {summary.continued + summary.continuedWithChanges + summary.new}
            </div>
          </Card>
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="text-sm text-red-700 mb-1">Discontinued</div>
            <div className="text-2xl font-bold text-red-900">
              {summary.discontinued}
            </div>
          </Card>
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="text-sm text-amber-700 mb-1">Issues Reviewed</div>
            <div className="text-2xl font-bold text-amber-900">
              {summary.issues}
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          {items
            .filter(item => item.action !== 'discontinue')
            .map(item => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {item.finalMedication?.name || item.sourceMedication.name}
                      </h4>
                      <ActionBadge action={item.action!} />
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.finalMedication?.strength || item.sourceMedication.strength} •{' '}
                      {item.finalMedication?.frequency || item.sourceMedication.frequency}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-600 mt-2 italic">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Classification
        </Button>
        <Button onClick={onComplete}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Complete Reconciliation
        </Button>
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: ReconciliationAction }) {
  const config = {
    'continue': { label: 'Continued', color: 'bg-green-100 text-green-800' },
    'continue-with-changes': { label: 'Changed', color: 'bg-blue-100 text-blue-800' },
    'discontinue': { label: 'Discontinued', color: 'bg-red-100 text-red-800' },
    'new': { label: 'New', color: 'bg-green-100 text-green-800' },
    'needs-clarification': { label: 'Needs Clarification', color: 'bg-amber-100 text-amber-800' },
  };

  const { label, color } = config[action];

  return <Badge className={cn('text-xs', color)}>{label}</Badge>;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLETION STAGE
// ═══════════════════════════════════════════════════════════════════════════

interface CompletionStageProps {
  summary: ReconciliationSummary;
  onViewAdmission: () => void;
  onViewMedications: () => void;
}

function CompletionStage({ summary, onViewAdmission, onViewMedications }: CompletionStageProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Reconciliation Complete!
          </h2>
          <p className="text-gray-600 mb-8">
            The medication list has been successfully reconciled and added to the admission record.
          </p>

          <Card className="p-6 bg-gray-50 text-left mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Total Medications</div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.continued + summary.continuedWithChanges + summary.new}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Changes Made</div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.continuedWithChanges + summary.discontinued + summary.new}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Discontinued</div>
                <div className="text-lg font-semibold text-gray-900">
                  {summary.discontinued}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">New Medications</div>
                <div className="text-lg font-semibold text-gray-900">
                  {summary.new}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onViewMedications}>
              <Pill className="w-4 h-4 mr-2" />
              View Medication List
            </Button>
            <Button onClick={onViewAdmission}>
              Continue to Admission
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function StageIndicator({
  current,
  targetStage,
  label,
}: {
  current: ReconciliationStage;
  targetStage: ReconciliationStage;
  label: string;
}) {
  const stages: ReconciliationStage[] = ['source-selection', 'matching', 'classification', 'review', 'completion'];
  const currentIndex = stages.indexOf(current);
  const targetIndex = stages.indexOf(targetStage);

  const isActive = current === targetStage;
  const isComplete = currentIndex > targetIndex;

  return (
    <Badge
      variant={isActive ? 'default' : 'outline'}
      className={cn(
        'text-xs',
        isComplete && 'bg-green-100 text-green-800 border-green-300'
      )}
    >
      {isComplete && <Check className="w-3 h-3 mr-1" />}
      {label}
    </Badge>
  );
}
