/**
 * Medication Search and Add Workflow Demo
 * 
 * Demonstrates the complete workflow for searching and adding medications.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Pill,
  CheckCircle2,
  Calendar,
  User,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import AddMedicationWorkflow from '../components/AddMedicationWorkflow';
import { MedicationAlertBanner } from '../components/MedicationAlerts';
import type { MedicationToAdd } from '../services/medicationSearch';
import type { Medication, Allergy } from '../services/medicationAlerts';
import { medicationAlertService } from '../services/medicationAlerts';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_ALLERGIES: Allergy[] = [
  {
    id: 'allergy-001',
    allergen: 'Penicillin',
    allergenType: 'medication',
    severity: 'severe',
    status: 'active',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function MedicationSearchAddDemo() {
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [medications, setMedications] = useState<(Medication & { addedData?: MedicationToAdd })[]>([
    {
      id: 'med-001',
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      strength: '20mg',
      isReconciled: true,
      addedData: {
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        strength: '20mg',
        dose: '1 tablet',
        route: 'Oral',
        frequency: 'Once daily',
        isPRN: false,
        startDate: '2024-01-15',
        prescribingPhysician: 'Dr. Sarah Johnson',
        indication: 'Hypertension',
      },
    },
    {
      id: 'med-002',
      name: 'Metoprolol Succinate ER',
      genericName: 'Metoprolol Succinate ER',
      strength: '50mg',
      isReconciled: true,
      addedData: {
        name: 'Toprol XL',
        genericName: 'Metoprolol Succinate ER',
        strength: '50mg',
        dose: '1 tablet',
        route: 'Oral',
        frequency: 'Once daily',
        isPRN: false,
        startDate: '2024-02-01',
        prescribingPhysician: 'Dr. Sarah Johnson',
        indication: 'Hypertension',
      },
    },
  ]);

  const handleAddMedication = (medicationData: MedicationToAdd) => {
    const newMedication: Medication & { addedData: MedicationToAdd } = {
      id: `med-${Date.now()}`,
      name: medicationData.name,
      genericName: medicationData.genericName,
      strength: medicationData.strength,
      isReconciled: true,
      isHighRisk: medicationData.medicationId ? 
        medicationAlertService.getAlertCounts([]).critical > 0 : false,
      addedData: medicationData,
    };

    setMedications(prev => [...prev, newMedication]);
    toast.success('Medication added successfully', {
      description: `${medicationData.name} has been added to the patient's profile.`,
    });
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    toast.success('Medication removed');
  };

  // Generate alerts for current medications
  const alerts = medicationAlertService.generateAlerts(medications, MOCK_ALLERGIES);

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
                  <Pill className="w-6 h-6 text-blue-600" />
                  Medication Search & Add Workflow
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Margaret Johnson • MRN-334455 • DOB: 03/15/1945
                </p>
              </div>
            </div>

            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Alert Banner */}
            {alerts.length > 0 && (
              <MedicationAlertBanner
                alerts={alerts}
                onViewAll={() => navigate('/medication-alerts-demo')}
              />
            )}

            {/* Medication List */}
            <Card>
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Active Medications</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {medications.length} medication{medications.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="divide-y">
                {medications.length > 0 ? (
                  medications.map(med => (
                    <MedicationCard
                      key={med.id}
                      medication={med}
                      onDelete={() => handleDeleteMedication(med.id)}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Pill className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600 mb-4">No medications added yet</p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Medication
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Workflow Features */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Workflow Features</h3>
              <div className="grid grid-cols-2 gap-4">
                <FeatureCard
                  title="Smart Search"
                  description="Search by drug name, brand name, or generic name with autocomplete"
                  icon={<Pill className="w-5 h-5 text-blue-600" />}
                />
                <FeatureCard
                  title="Manual Entry"
                  description="Fallback to structured manual entry if medication not found"
                  icon={<Plus className="w-5 h-5 text-green-600" />}
                />
                <FeatureCard
                  title="Alert Detection"
                  description="Automatic detection of interactions, allergies, and duplicates"
                  icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
                />
                <FeatureCard
                  title="Validation"
                  description="Comprehensive validation before adding to patient profile"
                  icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Patient Info */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
              <h3 className="font-semibold text-gray-900 mb-4">Patient Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">Name</div>
                  <div className="font-medium text-gray-900">Margaret Johnson</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Age</div>
                  <div className="font-medium text-gray-900">79 years</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Allergies</div>
                  <div>
                    <Badge variant="destructive" className="text-xs">
                      Penicillin (Severe)
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* How to Use */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">How to Use</h3>
              <ol className="text-sm text-gray-700 space-y-3">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>Click "Add Medication" button</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>Search for medication or select manual entry</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>Fill in required details (strength, dose, route, etc.)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span>Review alerts and warnings</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    5
                  </span>
                  <span>Confirm and add medication</span>
                </li>
              </ol>
            </Card>

            {/* Related Pages */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Related Pages</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/patient-medication-profile-view')}
                >
                  Medication Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/medication-alerts-demo')}
                >
                  Medication Alerts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/medication-reconciliation-workflow')}
                >
                  Reconciliation
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Medication Dialog */}
      <AddMedicationWorkflow
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddMedication}
        existingMedications={medications}
        patientAllergies={MOCK_ALLERGIES}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATION CARD
// ═══════════════════════════════════════════════════════════════════════════

interface MedicationCardProps {
  medication: Medication & { addedData?: MedicationToAdd };
  onDelete: () => void;
}

function MedicationCard({ medication, onDelete }: MedicationCardProps) {
  const data = medication.addedData;

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900">{medication.name}</h4>
            {medication.isHighRisk && (
              <Badge variant="destructive" className="text-xs">High Risk</Badge>
            )}
            {data?.isPRN && (
              <Badge variant="outline" className="text-xs bg-amber-50">PRN</Badge>
            )}
          </div>
          {medication.genericName && medication.genericName !== medication.name && (
            <p className="text-sm text-gray-600 mb-1">Generic: {medication.genericName}</p>
          )}
          {data && (
            <p className="text-sm text-gray-700">
              {data.strength} • {data.dose} • {data.route} • {data.frequency}
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </div>

      {data && (
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-3 h-3" />
            Started {new Date(data.startDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-3 h-3" />
            {data.prescribingPhysician}
          </div>
          {data.indication && (
            <div className="text-gray-600">
              For: {data.indication}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE CARD
// ═══════════════════════════════════════════════════════════════════════════

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h4 className="font-semibold text-sm text-gray-900 mb-1">{title}</h4>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}
