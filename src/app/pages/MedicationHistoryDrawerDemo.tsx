/**
 * Medication History Drawer Demo Page
 * 
 * Demonstrates the medication history drawer opening from medication items.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  Pill,
  Clock,
  User,
  FileText,
  AlertTriangle,
  History,
} from 'lucide-react';
import MedicationHistoryDrawer, { type MedicationHistoryData, type DocumentReference } from '../components/MedicationHistoryDrawer';
import type { MedicationEvent } from '../services/medicationTimeline';
import type { MedicationAlert } from '../services/medicationAlerts';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_MEDICATION_LIST: Array<{
  id: string;
  name: string;
  genericName: string;
  strength: string;
  dose: string;
  frequency: string;
  isActive: boolean;
  isHighRisk?: boolean;
  eventCount: number;
  alertCount: number;
}> = [
  {
    id: 'med-001',
    name: 'Warfarin Sodium',
    genericName: 'Warfarin Sodium',
    strength: '7.5mg',
    dose: '1 tablet',
    frequency: 'Once daily at 5pm',
    isActive: true,
    isHighRisk: true,
    eventCount: 5,
    alertCount: 2,
  },
  {
    id: 'med-002',
    name: 'Gabapentin',
    genericName: 'Gabapentin',
    strength: '300mg',
    dose: '2 capsules',
    frequency: 'Twice daily',
    isActive: true,
    eventCount: 3,
    alertCount: 1,
  },
  {
    id: 'med-003',
    name: 'Furosemide',
    genericName: 'Furosemide',
    strength: '40mg',
    dose: '1 tablet',
    frequency: 'Twice daily',
    isActive: true,
    eventCount: 2,
    alertCount: 0,
  },
  {
    id: 'med-004',
    name: 'Oxycodone HCl',
    genericName: 'Oxycodone Hydrochloride',
    strength: '5mg',
    dose: '1-2 tablets',
    frequency: 'Every 4-6 hours PRN',
    isActive: false,
    isHighRisk: true,
    eventCount: 2,
    alertCount: 0,
  },
];

function getMedicationHistory(id: string): MedicationHistoryData {
  // This would fetch from API in real implementation
  const med = MOCK_MEDICATION_LIST.find(m => m.id === id)!;

  const events: MedicationEvent[] = [];
  const alerts: MedicationAlert[] = [];
  const documents: DocumentReference[] = [];

  // Mock data for Warfarin
  if (id === 'med-001') {
    events.push(
      {
        id: 'event-001',
        type: 'medication-added',
        timestamp: '2024-03-01T10:15:00Z',
        medicationName: 'Warfarin Sodium',
        medicationId: id,
        user: 'Dr. Sarah Johnson',
        userRole: 'Physician',
        description: 'Warfarin Sodium 5mg added',
        details: {
          strength: '5mg',
          dose: '1 tablet',
          route: 'Oral',
          frequency: 'Once daily at 5pm',
          indication: 'Atrial fibrillation',
          prescribingPhysician: 'Dr. Sarah Johnson',
        },
      },
      {
        id: 'event-002',
        type: 'alert-resolved',
        timestamp: '2024-03-01T10:20:00Z',
        medicationName: 'Warfarin Sodium',
        medicationId: id,
        user: 'Jennifer Lee, RN',
        userRole: 'Registered Nurse',
        description: 'Drug interaction alert resolved',
        details: {
          alertType: 'Drug Interaction',
          alertSeverity: 'High',
          resolutionNotes: 'Discussed with physician. Patient will be monitored closely for bleeding.',
        },
      },
      {
        id: 'event-003',
        type: 'refill-authorized',
        timestamp: '2024-03-10T11:00:00Z',
        medicationName: 'Warfarin Sodium',
        medicationId: id,
        user: 'Dr. Sarah Johnson',
        userRole: 'Physician',
        description: 'Refill authorized - 90 day supply',
        details: {
          notes: '90 day supply with 3 refills',
        },
      },
      {
        id: 'event-004',
        type: 'strength-changed',
        timestamp: '2024-03-12T13:30:00Z',
        medicationName: 'Warfarin Sodium',
        medicationId: id,
        user: 'Dr. Sarah Johnson',
        userRole: 'Physician',
        description: 'Strength changed from 5mg to 7.5mg',
        details: {
          previousValue: '5mg',
          newValue: '7.5mg',
          notes: 'Adjusted based on INR results',
        },
      },
      {
        id: 'event-005',
        type: 'reconciliation-completed',
        timestamp: '2024-03-14T09:00:00Z',
        medicationName: 'Warfarin Sodium',
        medicationId: id,
        user: 'Jennifer Lee, RN',
        userRole: 'Registered Nurse',
        description: 'Medication verified during reconciliation',
      }
    );

    alerts.push(
      {
        id: 'alert-001',
        type: 'drug-interaction',
        severity: 'high',
        title: 'Potential Drug Interaction',
        description: 'Warfarin Sodium + Aspirin: Increased risk of bleeding',
        suggestedAction: 'Monitor INR closely. Watch for signs of bleeding. Consider GI prophylaxis.',
        affectedMedicationIds: [id],
        affectedMedicationNames: ['Warfarin Sodium'],
        createdDate: '2024-03-01T10:15:00Z',
        status: 'resolved',
        resolvedBy: 'Jennifer Lee, RN',
        resolvedDate: '2024-03-01T10:20:00Z',
        resolutionNotes: 'Discussed with physician. Monitoring plan in place.',
      },
      {
        id: 'alert-002',
        type: 'monitoring-required',
        severity: 'warning',
        title: 'Lab Monitoring Required',
        description: 'Warfarin requires regular INR monitoring',
        suggestedAction: 'Ensure INR is monitored per protocol. Review most recent lab results.',
        affectedMedicationIds: [id],
        affectedMedicationNames: ['Warfarin Sodium'],
        createdDate: '2024-03-01T10:15:00Z',
        status: 'active',
      }
    );

    documents.push(
      {
        id: 'doc-001',
        type: 'order',
        title: 'Warfarin Order - Initial',
        date: '2024-03-01T10:15:00Z',
        author: 'Dr. Sarah Johnson',
        status: 'signed',
        description: 'Initial warfarin prescription for atrial fibrillation',
        url: '#',
      },
      {
        id: 'doc-002',
        type: 'visit-note',
        title: 'SN Visit Note - 3/5/2024',
        date: '2024-03-05T14:00:00Z',
        author: 'Jennifer Lee, RN',
        status: 'signed',
        description: 'Medication review documented, patient adherent',
        url: '#',
      },
      {
        id: 'doc-003',
        type: 'reconciliation',
        title: 'Admission Medication Reconciliation',
        date: '2024-03-01T09:30:00Z',
        author: 'Jennifer Lee, RN',
        status: 'locked',
        description: 'Comprehensive medication reconciliation on admission',
        url: '#',
      },
      {
        id: 'doc-004',
        type: 'order',
        title: 'Warfarin Dose Adjustment Order',
        date: '2024-03-12T13:30:00Z',
        author: 'Dr. Sarah Johnson',
        status: 'signed',
        description: 'Dose increased to 7.5mg based on INR',
        url: '#',
      }
    );
  }

  // Mock data for Gabapentin
  if (id === 'med-002') {
    events.push(
      {
        id: 'event-101',
        type: 'medication-added',
        timestamp: '2024-03-02T11:00:00Z',
        medicationName: 'Gabapentin',
        medicationId: id,
        user: 'Dr. Sarah Johnson',
        userRole: 'Physician',
        description: 'Gabapentin 300mg added',
        details: {
          strength: '300mg',
          dose: '1 capsule',
          route: 'Oral',
          frequency: 'Twice daily',
          indication: 'Neuropathic pain',
          prescribingPhysician: 'Dr. Sarah Johnson',
        },
      },
      {
        id: 'event-102',
        type: 'dose-changed',
        timestamp: '2024-03-05T14:30:00Z',
        medicationName: 'Gabapentin',
        medicationId: id,
        user: 'Dr. Sarah Johnson',
        userRole: 'Physician',
        description: 'Dose changed from 1 capsule to 2 capsules',
        details: {
          previousValue: '1 capsule',
          newValue: '2 capsules',
          notes: 'Increased dose for better pain control',
        },
      },
      {
        id: 'event-103',
        type: 'reconciliation-completed',
        timestamp: '2024-03-14T09:00:00Z',
        medicationName: 'Gabapentin',
        medicationId: id,
        user: 'Jennifer Lee, RN',
        userRole: 'Registered Nurse',
        description: 'Medication verified during reconciliation',
      }
    );

    alerts.push(
      {
        id: 'alert-101',
        type: 'drug-interaction',
        severity: 'warning',
        title: 'Monitor for Interaction',
        description: 'Gabapentin may interact with opioids - increased CNS depression risk',
        suggestedAction: 'Monitor for excessive sedation and respiratory depression.',
        affectedMedicationIds: [id],
        affectedMedicationNames: ['Gabapentin'],
        createdDate: '2024-03-02T11:00:00Z',
        status: 'active',
      }
    );

    documents.push(
      {
        id: 'doc-101',
        type: 'order',
        title: 'Gabapentin Order - Initial',
        date: '2024-03-02T11:00:00Z',
        author: 'Dr. Sarah Johnson',
        status: 'signed',
        description: 'Gabapentin prescribed for neuropathic pain',
        url: '#',
      },
      {
        id: 'doc-102',
        type: 'order',
        title: 'Gabapentin Dose Increase',
        date: '2024-03-05T14:30:00Z',
        author: 'Dr. Sarah Johnson',
        status: 'signed',
        description: 'Dose increased for better pain control',
        url: '#',
      }
    );
  }

  return {
    id: med.id,
    name: med.name,
    genericName: med.genericName,
    currentStrength: med.strength,
    currentDose: med.dose,
    currentRoute: 'Oral',
    currentFrequency: med.frequency,
    isPRN: med.frequency.includes('PRN'),
    prnReason: med.frequency.includes('PRN') ? 'Pain' : undefined,
    isActive: med.isActive,
    isHighRisk: med.isHighRisk,
    prescribingPhysician: 'Dr. Sarah Johnson',
    indication: id === 'med-001' ? 'Atrial fibrillation' : id === 'med-002' ? 'Neuropathic pain' : id === 'med-003' ? 'Fluid overload' : 'Moderate to severe pain',
    instructions: id === 'med-001' ? 'Take at the same time each day. Avoid alcohol and excessive vitamin K intake.' : undefined,
    startDate: id === 'med-001' ? '2024-03-01' : id === 'med-002' ? '2024-03-02' : id === 'med-003' ? '2024-03-08' : '2024-02-15',
    endDate: !med.isActive ? '2024-03-07' : undefined,
    lastModifiedDate: id === 'med-001' ? '2024-03-12' : id === 'med-002' ? '2024-03-05' : id === 'med-003' ? '2024-03-09' : '2024-03-07',
    events,
    alerts,
    documentReferences: documents,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function MedicationHistoryDrawerDemo() {
  const navigate = useNavigate();
  const [selectedMedicationId, setSelectedMedicationId] = useState<string | null>(null);
  const [medicationHistory, setMedicationHistory] = useState<MedicationHistoryData | null>(null);

  const handleOpenHistory = (id: string) => {
    const history = getMedicationHistory(id);
    setMedicationHistory(history);
    setSelectedMedicationId(id);
  };

  const handleCloseDrawer = () => {
    setSelectedMedicationId(null);
    setMedicationHistory(null);
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
                  <History className="w-6 h-6 text-blue-600" />
                  Medication History Drawer
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Click any medication to view its complete history
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Instructions */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <History className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
                  <p className="text-sm text-blue-700">
                    The Medication History Drawer provides complete context for any medication
                    without leaving the current screen. Click the "View History" button on any
                    medication card to open the drawer from the right side.
                  </p>
                </div>
              </div>
            </Card>

            {/* Active Medications */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Active Medications</h2>
              <div className="space-y-3">
                {MOCK_MEDICATION_LIST.filter(m => m.isActive).map(med => (
                  <MedicationCard
                    key={med.id}
                    medication={med}
                    onViewHistory={() => handleOpenHistory(med.id)}
                  />
                ))}
              </div>
            </div>

            {/* Discontinued Medications */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Discontinued Medications</h2>
              <div className="space-y-3">
                {MOCK_MEDICATION_LIST.filter(m => !m.isActive).map(med => (
                  <MedicationCard
                    key={med.id}
                    medication={med}
                    onViewHistory={() => handleOpenHistory(med.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Features */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Drawer Features</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Pill className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Complete medication summary with current regimen</span>
                </li>
                <li className="flex items-start gap-2">
                  <User className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Prescribing physician and indication</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Full timeline of all medication events</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Related alerts (active and resolved)</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Links to related documentation</span>
                </li>
              </ul>
            </Card>

            {/* Integration Points */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Integration Points</h3>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <h4 className="font-medium text-gray-900 mb-1">Patient Medication Profile</h4>
                  <p className="text-xs text-gray-600">
                    Opens from medication list items
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <h4 className="font-medium text-gray-900 mb-1">Visit Documentation</h4>
                  <p className="text-xs text-gray-600">
                    Quick access during medication review
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <h4 className="font-medium text-gray-900 mb-1">Care Plan</h4>
                  <p className="text-xs text-gray-600">
                    Review medication context
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <h4 className="font-medium text-gray-900 mb-1">Patient Chart</h4>
                  <p className="text-xs text-gray-600">
                    Access from medications section
                  </p>
                </div>
              </div>
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
                  onClick={() => navigate('/medication-timeline-demo')}
                >
                  Medication Timeline
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
                  onClick={() => navigate('/medication-change-tracking')}
                >
                  Change Tracking
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Medication History Drawer */}
      <MedicationHistoryDrawer
        open={!!selectedMedicationId}
        onOpenChange={handleCloseDrawer}
        medication={medicationHistory}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATION CARD
// ═══════════════════════════════════════════════════════════════════════════

function MedicationCard({
  medication,
  onViewHistory,
}: {
  medication: typeof MOCK_MEDICATION_LIST[0];
  onViewHistory: () => void;
}) {
  return (
    <Card className="p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900">{medication.name}</h4>
            {medication.isHighRisk && (
              <Badge variant="destructive" className="text-xs">High Risk</Badge>
            )}
            {!medication.isActive && (
              <Badge className="bg-gray-600 text-white text-xs">Discontinued</Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">
            Generic: {medication.genericName}
          </p>
          <p className="text-sm text-gray-700">
            {medication.strength} • {medication.dose} • {medication.frequency}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {medication.eventCount} events
          </div>
          {medication.alertCount > 0 && (
            <div className="flex items-center gap-1 text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              {medication.alertCount} alert{medication.alertCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={onViewHistory}>
          <History className="w-4 h-4 mr-2" />
          View History
        </Button>
      </div>
    </Card>
  );
}
