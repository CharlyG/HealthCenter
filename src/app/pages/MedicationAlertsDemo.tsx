/**
 * Medication Alerts System Demo
 * 
 * Demonstrates the complete medication alerts system with:
 * - Alert generation
 * - Multiple display formats
 * - Integration examples
 * - Alert management
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Pill,
  AlertTriangle,
  Activity,
  FileText,
  RefreshCw,
} from 'lucide-react';
import {
  MedicationAlertBanner,
  MedicationAlertList,
  MedicationAlertSummary,
  InlineAlert,
} from '../components/MedicationAlerts';
import {
  medicationAlertService,
  type Medication,
  type Allergy,
  type MedicationAlert,
  type AlertSeverity,
} from '../services/medicationAlerts';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_MEDICATIONS: Medication[] = [
  {
    id: 'med-001',
    name: 'Warfarin Sodium',
    genericName: 'Warfarin Sodium',
    strength: '5mg',
    drugClass: 'anticoagulant',
    isHighRisk: true,
    lastChangedDate: '2024-03-12T11:00:00Z',
    isReconciled: true,
    refillsRemaining: 2,
  },
  {
    id: 'med-002',
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    strength: '81mg',
    drugClass: 'antiplatelet',
    isHighRisk: false,
    isReconciled: true,
    refillsRemaining: 5,
  },
  {
    id: 'med-003',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    strength: '20mg',
    drugClass: 'ace-inhibitor',
    isHighRisk: false,
    lastChangedDate: '2024-03-08T14:15:00Z',
    isReconciled: true,
    refillsRemaining: 3,
  },
  {
    id: 'med-004',
    name: 'Metoprolol Succinate',
    genericName: 'Metoprolol Succinate ER',
    strength: '50mg',
    drugClass: 'beta-blocker',
    isHighRisk: false,
    isReconciled: false,
    refillsRemaining: 1,
  },
  {
    id: 'med-005',
    name: 'Oxycodone HCl',
    genericName: 'Oxycodone Hydrochloride',
    strength: '5mg',
    drugClass: 'opioid',
    isHighRisk: true,
    isReconciled: true,
    refillsRemaining: 0,
  },
  {
    id: 'med-006',
    name: 'Gabapentin',
    genericName: 'Gabapentin',
    strength: '300mg',
    drugClass: 'gabapentinoid',
    isHighRisk: false,
    isReconciled: true,
    refillsRemaining: 2,
  },
  {
    id: 'med-007',
    name: 'Penicillin VK',
    genericName: 'Penicillin V Potassium',
    strength: '500mg',
    drugClass: 'antibiotic',
    isHighRisk: false,
    isReconciled: true,
    refillsRemaining: 1,
  },
];

const MOCK_ALLERGIES: Allergy[] = [
  {
    id: 'allergy-001',
    allergen: 'Penicillin',
    allergenType: 'medication',
    severity: 'severe',
    status: 'active',
  },
  {
    id: 'allergy-002',
    allergen: 'Sulfa drugs',
    allergenType: 'medication',
    severity: 'moderate',
    status: 'active',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function MedicationAlertsDemo() {
  const navigate = useNavigate();
  
  const [medications] = useState(MOCK_MEDICATIONS);
  const [allergies] = useState(MOCK_ALLERGIES);
  const [managedAlerts, setManagedAlerts] = useState<MedicationAlert[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | null>(null);

  // Generate alerts
  const generatedAlerts = useMemo(() => {
    return medicationAlertService.generateAlerts(medications, allergies);
  }, [medications, allergies]);

  // Merge with managed alerts (for demonstration)
  const allAlerts = useMemo(() => {
    if (managedAlerts.length === 0) {
      return generatedAlerts;
    }
    return managedAlerts;
  }, [generatedAlerts, managedAlerts]);

  // Filter by severity
  const filteredAlerts = useMemo(() => {
    if (!selectedSeverity) return allAlerts;
    return allAlerts.filter(a => a.severity === selectedSeverity);
  }, [allAlerts, selectedSeverity]);

  const handleAcknowledge = (alertId: string) => {
    setManagedAlerts(prev => {
      const alert = prev.find(a => a.id === alertId) || allAlerts.find(a => a.id === alertId);
      if (!alert) return prev;
      
      const updated = medicationAlertService.acknowledgeAlert(alert, 'Jennifer Lee, RN');
      return [...prev.filter(a => a.id !== alertId), updated];
    });
  };

  const handleResolve = (alertId: string, notes: string) => {
    setManagedAlerts(prev => {
      const alert = prev.find(a => a.id === alertId) || allAlerts.find(a => a.id === alertId);
      if (!alert) return prev;
      
      const updated = medicationAlertService.resolveAlert(alert, 'Jennifer Lee, RN', notes);
      return [...prev.filter(a => a.id !== alertId), updated];
    });
  };

  const handleReset = () => {
    setManagedAlerts([]);
    setSelectedSeverity(null);
  };

  const alertCounts = medicationAlertService.getAlertCounts(allAlerts);

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
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  Medication Alerts System
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive medication safety alert system
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Alert Banner Example */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Alert Banner</h2>
              <p className="text-sm text-gray-600 mb-4">
                Compact summary view - used in dashboards and patient headers
              </p>
              <MedicationAlertBanner 
                alerts={allAlerts}
                onViewAll={() => console.log('View all alerts')}
              />
            </div>

            {/* Alert Summary */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Alert Summary</h2>
              <p className="text-sm text-gray-600 mb-4">
                Filterable severity cards - click to filter alerts
              </p>
              <MedicationAlertSummary
                alerts={allAlerts}
                selectedSeverity={selectedSeverity}
                onFilterBySeverity={setSelectedSeverity}
              />
            </div>

            {/* Tabs for different views */}
            <Card>
              <Tabs defaultValue="list">
                <div className="border-b px-6 pt-6">
                  <TabsList>
                    <TabsTrigger value="list">
                      <FileText className="w-4 h-4 mr-2" />
                      Alert List
                    </TabsTrigger>
                    <TabsTrigger value="inline">
                      <Activity className="w-4 h-4 mr-2" />
                      Inline Alerts
                    </TabsTrigger>
                    <TabsTrigger value="integration">
                      <Pill className="w-4 h-4 mr-2" />
                      Integration Examples
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="list" className="p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Full Alert List</h3>
                    <p className="text-sm text-gray-600">
                      Expandable cards with full details and action buttons
                    </p>
                  </div>
                  <MedicationAlertList
                    alerts={filteredAlerts}
                    onAcknowledge={handleAcknowledge}
                    onResolve={handleResolve}
                    showActions={true}
                  />
                </TabsContent>

                <TabsContent value="inline" className="p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Inline Alerts</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Compact inline version for visit preparation, assessments, etc.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {filteredAlerts.slice(0, 5).map(alert => (
                      <InlineAlert
                        key={alert.id}
                        alert={alert}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="integration" className="p-6">
                  <div className="space-y-6">
                    <IntegrationExample
                      title="Patient Medication Profile"
                      description="Alerts appear at the top of the medication profile, warning clinicians before they prescribe or modify medications."
                      alerts={allAlerts.filter(a => 
                        a.type === 'allergy-conflict' || 
                        a.type === 'drug-interaction' ||
                        a.type === 'duplicate-therapy'
                      )}
                    />

                    <IntegrationExample
                      title="Admission Dashboard"
                      description="Summary of all medication alerts for the admission, prioritized by severity."
                      alerts={allAlerts}
                    />

                    <IntegrationExample
                      title="Visit Preparation Panel"
                      description="Alerts relevant to the upcoming visit, including recently changed medications and high-risk meds."
                      alerts={allAlerts.filter(a =>
                        a.type === 'recently-changed' ||
                        a.type === 'high-risk-medication' ||
                        a.type === 'monitoring-required'
                      )}
                    />

                    <IntegrationExample
                      title="Assessment Workflows"
                      description="Contextual alerts when documenting OASIS assessments or medication reconciliation."
                      alerts={allAlerts.filter(a =>
                        a.type === 'not-reconciled' ||
                        a.type === 'allergy-conflict'
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Statistics */}
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-white">
              <h3 className="font-semibold text-gray-900 mb-4">Alert Statistics</h3>
              <div className="space-y-3">
                <StatRow label="Total Active" value={alertCounts.total} color="gray" />
                <StatRow label="Critical" value={alertCounts.critical} color="red" />
                <StatRow label="High Priority" value={alertCounts.high} color="orange" />
                <StatRow label="Warnings" value={alertCounts.warning} color="amber" />
                <StatRow label="Informational" value={alertCounts.info} color="blue" />
              </div>
            </Card>

            {/* Alert Types */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Alert Types Detected</h3>
              <div className="space-y-2">
                {Array.from(new Set(allAlerts.map(a => a.type))).map(type => {
                  const count = allAlerts.filter(a => a.type === type).length;
                  return (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 capitalize">
                        {type.replace('-', ' ')}
                      </span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Quick Links */}
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
                  onClick={() => navigate('/medication-reconciliation-workflow')}
                >
                  Reconciliation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/medication-change-tracking')}
                >
                  Change Tracking
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/visit-documentation-medication-demo')}
                >
                  Visit Documentation
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function IntegrationExample({
  title,
  description,
  alerts,
}: {
  title: string;
  description: string;
  alerts: MedicationAlert[];
}) {
  return (
    <Card className="p-4 bg-gray-50">
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      {alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.slice(0, 2).map(alert => (
            <InlineAlert key={alert.id} alert={alert} />
          ))}
          {alerts.length > 2 && (
            <p className="text-xs text-gray-500 text-center">
              +{alerts.length - 2} more alert{alerts.length - 2 !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No relevant alerts</p>
      )}
    </Card>
  );
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'red' | 'orange' | 'amber' | 'blue' | 'gray';
}) {
  const colorConfig = {
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <Badge className={colorConfig[color]}>{value}</Badge>
    </div>
  );
}
