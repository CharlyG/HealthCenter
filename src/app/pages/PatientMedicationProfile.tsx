/**
 * Patient Medication Profile
 * 
 * Master medication profile at patient level:
 * - Lifetime allergy registry
 * - Historical medications across all admissions
 * - Pharmacy information
 * - Medication preferences
 * 
 * This is the permanent, cross-admission medication record.
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  AlertTriangle,
  Pill,
  Plus,
  Edit,
  Trash2,
  History,
  Building2,
  Star,
  Phone,
  MapPin,
  Clock,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { 
  PatientMedicationProfile,
  Allergy,
  HistoricalMedication,
  Pharmacy 
} from '../services/medicationArchitecture';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_PROFILE: PatientMedicationProfile = {
  patientId: 'PAT-001',
  allergies: [
    {
      id: 'allergy-001',
      allergen: 'Penicillin',
      allergenType: 'medication',
      reaction: 'Hives, difficulty breathing',
      severity: 'severe',
      onsetDate: '2015-03-15',
      status: 'active',
      verificationStatus: 'confirmed',
      documentedBy: 'Dr. Sarah Johnson',
      documentedDate: '2015-03-15',
      notes: 'Patient experienced severe allergic reaction requiring emergency treatment',
    },
    {
      id: 'allergy-002',
      allergen: 'Sulfa drugs',
      allergenType: 'medication',
      reaction: 'Rash',
      severity: 'moderate',
      onsetDate: '2018-07-20',
      status: 'active',
      verificationStatus: 'patient-reported',
      documentedBy: 'Jennifer Lee, RN',
      documentedDate: '2024-01-10',
      notes: 'Patient reports rash when taking sulfa medications',
    },
  ],
  intolerances: [
    {
      id: 'intol-001',
      substance: 'Codeine',
      reaction: 'Nausea, vomiting',
      severity: 'mild',
      status: 'active',
      notes: 'Patient prefers to avoid codeine due to GI side effects',
    },
  ],
  historicalMedications: [
    {
      id: 'hist-001',
      medicationName: 'Metoprolol',
      genericName: 'Metoprolol Succinate',
      dose: '50mg',
      route: 'oral',
      frequency: 'twice daily',
      indication: 'Hypertension',
      prescriber: 'Dr. James Anderson',
      startDate: '2020-05-01',
      status: 'current',
    },
    {
      id: 'hist-002',
      medicationName: 'Lisinopril',
      genericName: 'Lisinopril',
      dose: '10mg',
      route: 'oral',
      frequency: 'once daily',
      indication: 'Hypertension',
      prescriber: 'Dr. James Anderson',
      startDate: '2020-05-01',
      status: 'current',
    },
    {
      id: 'hist-003',
      medicationName: 'Aspirin',
      genericName: 'Acetylsalicylic Acid',
      dose: '81mg',
      route: 'oral',
      frequency: 'once daily',
      indication: 'Cardiovascular prophylaxis',
      prescriber: 'Dr. James Anderson',
      startDate: '2019-01-15',
      status: 'current',
    },
    {
      id: 'hist-004',
      medicationName: 'Gabapentin',
      genericName: 'Gabapentin',
      dose: '300mg',
      route: 'oral',
      frequency: 'three times daily',
      indication: 'Neuropathic pain',
      prescriber: 'Dr. James Anderson',
      startDate: '2023-06-10',
      status: 'current',
    },
    {
      id: 'hist-005',
      medicationName: 'Atorvastatin',
      genericName: 'Atorvastatin Calcium',
      dose: '40mg',
      route: 'oral',
      frequency: 'once daily at bedtime',
      indication: 'Hyperlipidemia',
      prescriber: 'Dr. James Anderson',
      startDate: '2021-02-01',
      endDate: '2023-12-15',
      discontinuedReason: 'Changed to Rosuvastatin',
      status: 'discontinued',
    },
  ],
  pharmacies: [
    {
      id: 'pharm-001',
      name: 'Walgreens Pharmacy #1234',
      type: 'retail',
      phone: '(555) 123-4567',
      fax: '(555) 123-4568',
      address: {
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
      },
      isPrimary: true,
      isActive: true,
    },
    {
      id: 'pharm-002',
      name: 'CVS Pharmacy #5678',
      type: 'retail',
      phone: '(555) 987-6543',
      address: {
        street: '456 Oak Avenue',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
      },
      isPrimary: false,
      isActive: true,
    },
  ],
  preferences: {
    preferredPharmacyId: 'pharm-001',
    pillOrganizer: true,
    needsAssistance: false,
    administrationNotes: 'Patient uses daily pill organizer. Independent with medication administration.',
  },
  lastUpdated: new Date().toISOString(),
  updatedBy: 'Jennifer Lee, RN',
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function PatientMedicationProfile() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  const [profile] = useState(MOCK_PROFILE);
  const [showAddAllergyDialog, setShowAddAllergyDialog] = useState(false);
  const [showAddPharmacyDialog, setShowAddPharmacyDialog] = useState(false);

  const currentMedications = useMemo(() => 
    profile.historicalMedications.filter(m => m.status === 'current'),
    [profile.historicalMedications]
  );

  const discontinuedMedications = useMemo(() =>
    profile.historicalMedications.filter(m => m.status === 'discontinued'),
    [profile.historicalMedications]
  );

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
                  <Pill className="w-5 h-5 text-blue-600" />
                  Patient Medication Profile
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Master medication record • Margaret Johnson • MRN-334455
                </p>
              </div>
            </div>

            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              <FileText className="w-3 h-3 mr-1" />
              Patient Level
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8">
            <Tabs defaultValue="allergies">
              <TabsList>
                <TabsTrigger value="allergies">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Allergies & Intolerances
                </TabsTrigger>
                <TabsTrigger value="medications">
                  <Pill className="w-4 h-4 mr-2" />
                  Medication History
                </TabsTrigger>
                <TabsTrigger value="pharmacies">
                  <Building2 className="w-4 h-4 mr-2" />
                  Pharmacies
                </TabsTrigger>
              </TabsList>

              {/* Allergies Tab */}
              <TabsContent value="allergies" className="mt-6 space-y-6">
                {/* Active Allergies */}
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Active Allergies</h3>
                      <Button size="sm" onClick={() => setShowAddAllergyDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Allergy
                      </Button>
                    </div>

                    {profile.allergies.filter(a => a.status === 'active').length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No known allergies documented</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {profile.allergies.filter(a => a.status === 'active').map(allergy => (
                          <AllergyCard key={allergy.id} allergy={allergy} />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Intolerances */}
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Intolerances</h3>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Intolerance
                      </Button>
                    </div>

                    {profile.intolerances.filter(i => i.status === 'active').length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No intolerances documented
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {profile.intolerances.filter(i => i.status === 'active').map(intolerance => (
                          <IntoleranceCard key={intolerance.id} intolerance={intolerance} />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Medications Tab */}
              <TabsContent value="medications" className="mt-6 space-y-6">
                {/* Current Medications */}
                <Card>
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Current Medications ({currentMedications.length})
                    </h3>
                    {currentMedications.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No current medications
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {currentMedications.map(med => (
                          <HistoricalMedicationCard key={med.id} medication={med} />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Discontinued Medications */}
                <Card>
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Discontinued Medications ({discontinuedMedications.length})
                    </h3>
                    {discontinuedMedications.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No discontinued medications
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {discontinuedMedications.map(med => (
                          <HistoricalMedicationCard key={med.id} medication={med} />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Pharmacies Tab */}
              <TabsContent value="pharmacies" className="mt-6 space-y-6">
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Pharmacies</h3>
                      <Button size="sm" onClick={() => setShowAddPharmacyDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Pharmacy
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {profile.pharmacies.filter(p => p.isActive).map(pharmacy => (
                        <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Summary Card */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
              <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-3">
                <SummaryItem
                  icon={AlertTriangle}
                  label="Active Allergies"
                  value={profile.allergies.filter(a => a.status === 'active').length}
                  color="red"
                />
                <SummaryItem
                  icon={Pill}
                  label="Current Medications"
                  value={currentMedications.length}
                  color="blue"
                />
                <SummaryItem
                  icon={History}
                  label="Historical Medications"
                  value={discontinuedMedications.length}
                  color="gray"
                />
                <SummaryItem
                  icon={Building2}
                  label="Pharmacies"
                  value={profile.pharmacies.length}
                  color="green"
                />
              </div>
            </Card>

            {/* Preferences Card */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Medication Preferences</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Uses pill organizer</p>
                    <p className="text-gray-600 text-xs">Daily medication organizer setup</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Independent</p>
                    <p className="text-gray-600 text-xs">Self-administers medications</p>
                  </div>
                </div>
              </div>
              {profile.preferences.administrationNotes && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
                  {profile.preferences.administrationNotes}
                </div>
              )}
            </Card>

            {/* Last Updated */}
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <div>
                  <p className="text-xs">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(profile.lastUpdated).toLocaleDateString()}
                  </p>
                  <p className="text-xs">{profile.updatedBy}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Allergy Dialog */}
      <Dialog open={showAddAllergyDialog} onOpenChange={setShowAddAllergyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Allergy</DialogTitle>
            <DialogDescription>
              Document a new allergy to the patient's permanent record
            </DialogDescription>
          </DialogHeader>
          {/* Add form here */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAllergyDialog(false)}>
              Cancel
            </Button>
            <Button>Add Allergy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function AllergyCard({ allergy }: { allergy: Allergy }) {
  const severityConfig = {
    'life-threatening': { color: 'bg-red-100 text-red-900 border-red-300', icon: AlertCircle },
    'severe': { color: 'bg-red-50 text-red-800 border-red-200', icon: AlertTriangle },
    'moderate': { color: 'bg-amber-50 text-amber-800 border-amber-200', icon: AlertTriangle },
    'mild': { color: 'bg-yellow-50 text-yellow-800 border-yellow-200', icon: AlertCircle },
  };

  const config = severityConfig[allergy.severity];
  const Icon = config.icon;

  return (
    <Card className={cn('p-4 border-l-4', config.color)}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">{allergy.allergen}</h4>
            <p className="text-sm mt-1">Reaction: {allergy.reaction}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {allergy.severity}
        </Badge>
      </div>
      {allergy.notes && (
        <p className="text-xs text-gray-600 mt-2">{allergy.notes}</p>
      )}
      <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
        <span>Documented: {new Date(allergy.documentedDate).toLocaleDateString()}</span>
        <span>•</span>
        <span>{allergy.documentedBy}</span>
      </div>
    </Card>
  );
}

function IntoleranceCard({ intolerance }: { intolerance: any }) {
  return (
    <Card className="p-3 bg-amber-50 border-amber-200">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{intolerance.substance}</h4>
          <p className="text-sm text-gray-700 mt-1">{intolerance.reaction}</p>
          {intolerance.notes && (
            <p className="text-xs text-gray-600 mt-2">{intolerance.notes}</p>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          {intolerance.severity}
        </Badge>
      </div>
    </Card>
  );
}

function HistoricalMedicationCard({ medication }: { medication: HistoricalMedication }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-gray-900">{medication.medicationName}</h4>
          {medication.genericName && (
            <p className="text-sm text-gray-600">{medication.genericName}</p>
          )}
        </div>
        <Badge variant={medication.status === 'current' ? 'default' : 'outline'}>
          {medication.status}
        </Badge>
      </div>
      <div className="text-sm text-gray-700 space-y-1">
        <p><span className="font-medium">Dose:</span> {medication.dose} {medication.route}</p>
        <p><span className="font-medium">Frequency:</span> {medication.frequency}</p>
        {medication.indication && (
          <p><span className="font-medium">Indication:</span> {medication.indication}</p>
        )}
        {medication.prescriber && (
          <p><span className="font-medium">Prescriber:</span> {medication.prescriber}</p>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
        <Calendar className="w-3 h-3" />
        <span>Started: {medication.startDate ? new Date(medication.startDate).toLocaleDateString() : 'Unknown'}</span>
        {medication.endDate && (
          <>
            <span>•</span>
            <span>Ended: {new Date(medication.endDate).toLocaleDateString()}</span>
          </>
        )}
      </div>
      {medication.discontinuedReason && (
        <p className="text-xs text-gray-600 mt-2 italic">
          Reason: {medication.discontinuedReason}
        </p>
      )}
    </Card>
  );
}

function PharmacyCard({ pharmacy }: { pharmacy: Pharmacy }) {
  return (
    <Card className={cn('p-4', pharmacy.isPrimary && 'border-blue-500 border-2')}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{pharmacy.name}</h4>
            <Badge variant="outline" className="text-xs mt-1">
              {pharmacy.type}
            </Badge>
          </div>
        </div>
        {pharmacy.isPrimary && (
          <Badge className="bg-blue-100 text-blue-800">
            <Star className="w-3 h-3 mr-1" />
            Primary
          </Badge>
        )}
      </div>
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{pharmacy.phone}</span>
        </div>
        {pharmacy.fax && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>Fax: {pharmacy.fax}</span>
          </div>
        )}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span>
            {pharmacy.address.street}<br />
            {pharmacy.address.city}, {pharmacy.address.state} {pharmacy.address.zipCode}
          </span>
        </div>
      </div>
    </Card>
  );
}

function SummaryItem({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ComponentType<any>; 
  label: string; 
  value: number; 
  color: 'red' | 'blue' | 'gray' | 'green';
}) {
  const colorConfig = {
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-green-100 text-green-600',
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

function Calendar({ className }: { className?: string }) {
  return <Clock className={className} />;
}
