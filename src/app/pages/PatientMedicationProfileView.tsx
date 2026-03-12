/**
 * Patient Medication Profile - Comprehensive View
 * 
 * Central medication record for patient with:
 * - Active medications
 * - Inactive medications
 * - PRN medications
 * - Allergies
 * - Pharmacy information
 * 
 * Optimized for fast scanning and clear organization.
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  ArrowLeft,
  Pill,
  Plus,
  Search,
  AlertTriangle,
  Building2,
  History,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  User,
  Calendar,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2,
  Ban,
  RefreshCw,
  GitCompare,
  Phone,
  MapPin,
  Star,
  Download,
  Filter,
  XCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  strength: string;
  dosage: string;
  route: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescriber: string;
  prescriberNPI?: string;
  status: 'active' | 'inactive' | 'discontinued' | 'held';
  isPRN: boolean;
  prnReason?: string;
  indication?: string;
  pharmacy?: string;
  refillsRemaining?: number;
  lastFilled?: string;
  notes?: string;
  isHighRisk?: boolean;
}

interface Allergy {
  id: string;
  allergen: string;
  allergenType: 'medication' | 'food' | 'environmental';
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  verificationStatus: 'confirmed' | 'unconfirmed' | 'patient-reported';
  onsetDate?: string;
  documentedBy: string;
  documentedDate: string;
}

interface Pharmacy {
  id: string;
  name: string;
  phone: string;
  fax?: string;
  address: string;
  isPrimary: boolean;
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
    dosage: '1 tablet',
    route: 'Oral',
    frequency: 'Twice daily (morning and evening)',
    startDate: '2023-01-15',
    prescriber: 'Dr. Sarah Johnson',
    prescriberNPI: '1234567890',
    status: 'active',
    isPRN: false,
    indication: 'Hypertension',
    pharmacy: 'Walgreens #1234',
    refillsRemaining: 2,
    lastFilled: '2024-02-15',
    isHighRisk: false,
  },
  {
    id: 'med-002',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    strength: '10mg',
    dosage: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily in the morning',
    startDate: '2023-01-15',
    prescriber: 'Dr. Sarah Johnson',
    prescriberNPI: '1234567890',
    status: 'active',
    isPRN: false,
    indication: 'Hypertension',
    pharmacy: 'Walgreens #1234',
    refillsRemaining: 3,
    lastFilled: '2024-02-20',
    isHighRisk: false,
  },
  {
    id: 'med-003',
    name: 'Warfarin Sodium',
    genericName: 'Warfarin Sodium',
    strength: '5mg',
    dosage: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily at 5pm',
    startDate: '2023-06-10',
    prescriber: 'Dr. Michael Chen',
    prescriberNPI: '9876543210',
    status: 'active',
    isPRN: false,
    indication: 'Atrial fibrillation',
    pharmacy: 'Walgreens #1234',
    refillsRemaining: 1,
    lastFilled: '2024-02-28',
    notes: 'INR monitoring required. Target INR 2.0-3.0',
    isHighRisk: true,
  },
  {
    id: 'med-004',
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    strength: '81mg',
    dosage: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily',
    startDate: '2022-08-01',
    prescriber: 'Dr. Sarah Johnson',
    prescriberNPI: '1234567890',
    status: 'active',
    isPRN: false,
    indication: 'Cardiovascular prophylaxis',
    pharmacy: 'Walgreens #1234',
    lastFilled: '2024-03-01',
    isHighRisk: false,
  },
  {
    id: 'med-005',
    name: 'Gabapentin',
    genericName: 'Gabapentin',
    strength: '300mg',
    dosage: '1 capsule',
    route: 'Oral',
    frequency: 'Three times daily',
    startDate: '2023-11-20',
    prescriber: 'Dr. Sarah Johnson',
    prescriberNPI: '1234567890',
    status: 'active',
    isPRN: false,
    indication: 'Neuropathic pain',
    pharmacy: 'Walgreens #1234',
    refillsRemaining: 2,
    lastFilled: '2024-02-25',
    isHighRisk: false,
  },
  {
    id: 'med-006',
    name: 'Oxycodone HCl',
    genericName: 'Oxycodone Hydrochloride',
    strength: '5mg',
    dosage: '1-2 tablets',
    route: 'Oral',
    frequency: 'Every 4-6 hours as needed',
    startDate: '2024-01-10',
    prescriber: 'Dr. Michael Chen',
    prescriberNPI: '9876543210',
    status: 'active',
    isPRN: true,
    prnReason: 'Moderate to severe pain',
    indication: 'Post-surgical pain',
    pharmacy: 'Walgreens #1234',
    refillsRemaining: 0,
    lastFilled: '2024-01-10',
    notes: 'Do not exceed 6 tablets in 24 hours. Monitor for sedation.',
    isHighRisk: true,
  },
  {
    id: 'med-007',
    name: 'Acetaminophen',
    genericName: 'Acetaminophen',
    strength: '500mg',
    dosage: '1-2 tablets',
    route: 'Oral',
    frequency: 'Every 6 hours as needed',
    startDate: '2024-01-10',
    prescriber: 'Dr. Sarah Johnson',
    prescriberNPI: '1234567890',
    status: 'active',
    isPRN: true,
    prnReason: 'Mild to moderate pain or fever',
    indication: 'Pain management',
    pharmacy: 'Walgreens #1234',
    lastFilled: '2024-02-15',
    notes: 'Do not exceed 4000mg (8 tablets) in 24 hours',
    isHighRisk: false,
  },
  {
    id: 'med-008',
    name: 'Atorvastatin Calcium',
    genericName: 'Atorvastatin Calcium',
    strength: '40mg',
    dosage: '1 tablet',
    route: 'Oral',
    frequency: 'Once daily at bedtime',
    startDate: '2022-03-01',
    endDate: '2023-12-15',
    prescriber: 'Dr. Sarah Johnson',
    prescriberNPI: '1234567890',
    status: 'discontinued',
    isPRN: false,
    indication: 'Hyperlipidemia',
    notes: 'Discontinued due to muscle pain. Changed to Rosuvastatin.',
    isHighRisk: false,
  },
  {
    id: 'med-009',
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    strength: '20mg',
    dosage: '1 capsule',
    route: 'Oral',
    frequency: 'Once daily before breakfast',
    startDate: '2023-05-10',
    endDate: '2024-01-20',
    prescriber: 'Dr. Sarah Johnson',
    prescriberNPI: '1234567890',
    status: 'inactive',
    isPRN: false,
    indication: 'GERD',
    notes: 'Completed therapy. Symptoms resolved.',
    isHighRisk: false,
  },
];

const MOCK_ALLERGIES: Allergy[] = [
  {
    id: 'allergy-001',
    allergen: 'Penicillin',
    allergenType: 'medication',
    reaction: 'Hives, difficulty breathing',
    severity: 'severe',
    verificationStatus: 'confirmed',
    onsetDate: '2015-03-15',
    documentedBy: 'Dr. Sarah Johnson',
    documentedDate: '2015-03-15',
  },
  {
    id: 'allergy-002',
    allergen: 'Sulfa drugs',
    allergenType: 'medication',
    reaction: 'Rash',
    severity: 'moderate',
    verificationStatus: 'patient-reported',
    onsetDate: '2018-07-20',
    documentedBy: 'Jennifer Lee, RN',
    documentedDate: '2024-01-10',
  },
  {
    id: 'allergy-003',
    allergen: 'Shellfish',
    allergenType: 'food',
    reaction: 'Anaphylaxis',
    severity: 'life-threatening',
    verificationStatus: 'confirmed',
    onsetDate: '2010-06-05',
    documentedBy: 'Dr. Robert Martinez',
    documentedDate: '2010-06-05',
  },
];

const MOCK_PHARMACIES: Pharmacy[] = [
  {
    id: 'pharm-001',
    name: 'Walgreens Pharmacy #1234',
    phone: '(555) 123-4567',
    fax: '(555) 123-4568',
    address: '123 Main Street, San Francisco, CA 94102',
    isPrimary: true,
  },
  {
    id: 'pharm-002',
    name: 'CVS Pharmacy #5678',
    phone: '(555) 987-6543',
    address: '456 Oak Avenue, San Francisco, CA 94103',
    isPrimary: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function PatientMedicationProfileView() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [medications] = useState(MOCK_MEDICATIONS);
  const [allergies] = useState(MOCK_ALLERGIES);
  const [pharmacies] = useState(MOCK_PHARMACIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMedicationDialog, setShowAddMedicationDialog] = useState(false);
  const [showInteractionsDialog, setShowInteractionsDialog] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  // Filter and categorize medications
  const activeMedications = useMemo(() =>
    medications.filter(m => m.status === 'active' && !m.isPRN),
    [medications]
  );

  const prnMedications = useMemo(() =>
    medications.filter(m => m.status === 'active' && m.isPRN),
    [medications]
  );

  const inactiveMedications = useMemo(() =>
    medications.filter(m => m.status === 'inactive' || m.status === 'discontinued'),
    [medications]
  );

  // Search filter
  const filteredActiveMedications = useMemo(() => {
    if (!searchQuery) return activeMedications;
    const query = searchQuery.toLowerCase();
    return activeMedications.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.genericName?.toLowerCase().includes(query) ||
      m.indication?.toLowerCase().includes(query)
    );
  }, [activeMedications, searchQuery]);

  const filteredPRNMedications = useMemo(() => {
    if (!searchQuery) return prnMedications;
    const query = searchQuery.toLowerCase();
    return prnMedications.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.genericName?.toLowerCase().includes(query) ||
      m.prnReason?.toLowerCase().includes(query)
    );
  }, [prnMedications, searchQuery]);

  const filteredInactiveMedications = useMemo(() => {
    if (!searchQuery) return inactiveMedications;
    const query = searchQuery.toLowerCase();
    return inactiveMedications.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.genericName?.toLowerCase().includes(query)
    );
  }, [inactiveMedications, searchQuery]);

  const primaryPharmacy = pharmacies.find(p => p.isPrimary);

  const handleStartReconciliation = () => {
    navigate('/medication-reconciliation');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Pill className="w-6 h-6 text-blue-600" />
                  Medication Profile
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Margaret Johnson • MRN-334455 • DOB: 05/12/1948
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowInteractionsDialog(true)}>
                <Activity className="w-4 h-4 mr-2" />
                View Interactions
              </Button>
              <Button variant="outline" size="sm" onClick={handleStartReconciliation}>
                <GitCompare className="w-4 h-4 mr-2" />
                Start Reconciliation
              </Button>
              <Button size="sm" onClick={() => setShowAddMedicationDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search medications by name, indication, or generic name..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Active Medications */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Active Medications</h2>
                      <p className="text-sm text-gray-600">
                        {filteredActiveMedications.length} scheduled medication{filteredActiveMedications.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {filteredActiveMedications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No active medications found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredActiveMedications.map((med) => (
                      <MedicationCard
                        key={med.id}
                        medication={med}
                        onEdit={() => setSelectedMedication(med)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* PRN Medications */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">PRN Medications</h2>
                      <p className="text-sm text-gray-600">
                        {filteredPRNMedications.length} as-needed medication{filteredPRNMedications.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {filteredPRNMedications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No PRN medications found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPRNMedications.map((med) => (
                      <MedicationCard
                        key={med.id}
                        medication={med}
                        onEdit={() => setSelectedMedication(med)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Inactive Medications */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Ban className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Inactive Medications</h2>
                      <p className="text-sm text-gray-600">
                        {filteredInactiveMedications.length} discontinued or completed medication{filteredInactiveMedications.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {filteredInactiveMedications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Ban className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No inactive medications found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredInactiveMedications.map((med) => (
                      <MedicationCard
                        key={med.id}
                        medication={med}
                        onEdit={() => setSelectedMedication(med)}
                        isInactive
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Summary Card */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
              <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-3">
                <SummaryItem
                  icon={CheckCircle2}
                  label="Active Medications"
                  value={activeMedications.length}
                  color="green"
                />
                <SummaryItem
                  icon={Clock}
                  label="PRN Medications"
                  value={prnMedications.length}
                  color="amber"
                />
                <SummaryItem
                  icon={Ban}
                  label="Inactive Medications"
                  value={inactiveMedications.length}
                  color="gray"
                />
                <Separator />
                <SummaryItem
                  icon={AlertTriangle}
                  label="Allergies"
                  value={allergies.length}
                  color="red"
                />
              </div>
            </Card>

            {/* Allergies */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Allergies
                </h3>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {allergies.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No known allergies
                </p>
              ) : (
                <div className="space-y-2">
                  {allergies.map((allergy) => (
                    <AllergyCard key={allergy.id} allergy={allergy} />
                  ))}
                </div>
              )}
            </Card>

            {/* Primary Pharmacy */}
            {primaryPharmacy && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Primary Pharmacy
                  </h3>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>

                <PharmacyCard pharmacy={primaryPharmacy} />
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowAddMedicationDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleStartReconciliation}
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  Start Reconciliation
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowInteractionsDialog(true)}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Check Interactions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export List
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Medication Dialog */}
      <Dialog open={showAddMedicationDialog} onOpenChange={setShowAddMedicationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
            <DialogDescription>
              Add a new medication to the patient's medication list
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">Add medication form would go here...</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMedicationDialog(false)}>
              Cancel
            </Button>
            <Button>Add Medication</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drug Interactions Dialog */}
      <Dialog open={showInteractionsDialog} onOpenChange={setShowInteractionsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Drug Interactions
            </DialogTitle>
            <DialogDescription>
              Potential drug-drug interactions for active medications
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <InteractionsContent medications={activeMedications.concat(prnMedications)} />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInteractionsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATION CARD
// ═══════════════════════════════════════════════════════════════════════════

interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
  isInactive?: boolean;
}

function MedicationCard({ medication, onEdit, isInactive }: MedicationCardProps) {
  return (
    <Card className={cn(
      'p-4 transition-all hover:shadow-md',
      isInactive && 'opacity-75',
      medication.isHighRisk && 'border-l-4 border-l-red-500'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900">{medication.name}</h3>
                {medication.isHighRisk && (
                  <Badge variant="destructive" className="text-xs">
                    High Risk
                  </Badge>
                )}
                {medication.isPRN && (
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                    PRN
                  </Badge>
                )}
              </div>
              {medication.genericName && (
                <p className="text-sm text-gray-600">{medication.genericName}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <History className="w-4 h-4 mr-2" />
                  View History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!isInactive && (
                  <DropdownMenuItem className="text-amber-600">
                    <Ban className="w-4 h-4 mr-2" />
                    Mark Inactive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3 text-sm">
            <MedicationDetailRow label="Strength" value={medication.strength} />
            <MedicationDetailRow label="Dosage" value={medication.dosage} />
            <MedicationDetailRow label="Route" value={medication.route} />
            <MedicationDetailRow label="Frequency" value={medication.frequency} />
          </div>

          {/* Additional Info */}
          <div className="space-y-2 text-sm">
            {medication.indication && (
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-600">Indication:</span>{' '}
                  <span className="text-gray-900">{medication.indication}</span>
                </div>
              </div>
            )}

            {medication.isPRN && medication.prnReason && (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-600">PRN Reason:</span>{' '}
                  <span className="text-gray-900">{medication.prnReason}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Prescriber:</span>{' '}
              <span className="text-gray-900">{medication.prescriber}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Started:</span>{' '}
              <span className="text-gray-900">
                {new Date(medication.startDate).toLocaleDateString()}
              </span>
              {medication.endDate && (
                <>
                  <span className="text-gray-500 mx-1">•</span>
                  <span className="text-gray-600">Ended:</span>{' '}
                  <span className="text-gray-900">
                    {new Date(medication.endDate).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>

            {!isInactive && medication.refillsRemaining !== undefined && (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Refills remaining:</span>{' '}
                <Badge variant={medication.refillsRemaining === 0 ? 'destructive' : 'outline'}>
                  {medication.refillsRemaining}
                </Badge>
                {medication.lastFilled && (
                  <>
                    <span className="text-gray-500 mx-1">•</span>
                    <span className="text-gray-600 text-xs">
                      Last filled: {new Date(medication.lastFilled).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          {medication.notes && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-900">
                <strong>Note:</strong> {medication.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function MedicationDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-600">{label}:</span>{' '}
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLERGY CARD
// ═══════════════════════════════════════════════════════════════════════════

function AllergyCard({ allergy }: { allergy: Allergy }) {
  const severityConfig = {
    'life-threatening': { color: 'bg-red-100 text-red-900 border-red-300', icon: XCircle },
    'severe': { color: 'bg-red-50 text-red-800 border-red-200', icon: AlertCircle },
    'moderate': { color: 'bg-amber-50 text-amber-800 border-amber-200', icon: AlertTriangle },
    'mild': { color: 'bg-yellow-50 text-yellow-800 border-yellow-200', icon: AlertCircle },
  };

  const config = severityConfig[allergy.severity];
  const Icon = config.icon;

  return (
    <Card className={cn('p-3 border-l-4', config.color)}>
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h4 className="font-semibold text-sm">{allergy.allergen}</h4>
              <Badge variant="outline" className="text-xs mt-1">
                {allergy.allergenType}
              </Badge>
            </div>
            <Badge variant="outline" className="text-xs">
              {allergy.severity}
            </Badge>
          </div>
          <p className="text-xs mt-2">
            <strong>Reaction:</strong> {allergy.reaction}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Documented by {allergy.documentedBy} on{' '}
            {new Date(allergy.documentedDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PHARMACY CARD
// ═══════════════════════════════════════════════════════════════════════════

function PharmacyCard({ pharmacy }: { pharmacy: Pharmacy }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{pharmacy.name}</h4>
          {pharmacy.isPrimary && (
            <Badge className="mt-1 text-xs bg-blue-100 text-blue-800">
              <Star className="w-3 h-3 mr-1" />
              Primary
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900">{pharmacy.phone}</span>
        </div>
        {pharmacy.fax && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Fax:</span>{' '}
            <span className="text-gray-900">{pharmacy.fax}</span>
          </div>
        )}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="text-gray-900">{pharmacy.address}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY ITEM
// ═══════════════════════════════════════════════════════════════════════════

function SummaryItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  color: 'red' | 'blue' | 'gray' | 'green' | 'amber';
}) {
  const colorConfig = {
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={cn('p-2 rounded-lg', colorConfig[color])}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERACTIONS CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function InteractionsContent({ medications }: { medications: Medication[] }) {
  // Mock interaction data
  const interactions = [
    {
      id: 'int-001',
      medications: ['Warfarin Sodium', 'Aspirin'],
      severity: 'high',
      description: 'Increased risk of bleeding when warfarin is combined with aspirin.',
      recommendation: 'Monitor INR closely. Watch for signs of bleeding. Consider proton pump inhibitor for GI protection.',
    },
    {
      id: 'int-002',
      medications: ['Warfarin Sodium', 'Gabapentin'],
      severity: 'moderate',
      description: 'Warfarin may interact with gabapentin, potentially affecting anticoagulation.',
      recommendation: 'Monitor INR when starting or stopping gabapentin.',
    },
  ];

  return (
    <div className="space-y-4">
      {interactions.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
          <p className="text-gray-900 font-medium">No Interactions Found</p>
          <p className="text-sm text-gray-600 mt-1">
            No significant drug-drug interactions detected for the current medication list.
          </p>
        </div>
      ) : (
        interactions.map((interaction) => (
          <Card key={interaction.id} className={cn(
            'p-4 border-l-4',
            interaction.severity === 'high' ? 'border-l-red-500 bg-red-50' :
            interaction.severity === 'moderate' ? 'border-l-amber-500 bg-amber-50' :
            'border-l-yellow-500 bg-yellow-50'
          )}>
            <div className="flex items-start gap-3">
              <AlertCircle className={cn(
                'w-5 h-5 flex-shrink-0 mt-0.5',
                interaction.severity === 'high' ? 'text-red-600' :
                interaction.severity === 'moderate' ? 'text-amber-600' :
                'text-yellow-600'
              )} />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {interaction.medications.join(' + ')}
                  </h4>
                  <Badge variant={
                    interaction.severity === 'high' ? 'destructive' :
                    interaction.severity === 'moderate' ? 'default' :
                    'outline'
                  }>
                    {interaction.severity} severity
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 mb-2">{interaction.description}</p>
                <div className="p-3 bg-white rounded border border-gray-200">
                  <p className="text-xs font-medium text-gray-900 mb-1">Recommendation:</p>
                  <p className="text-xs text-gray-700">{interaction.recommendation}</p>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
