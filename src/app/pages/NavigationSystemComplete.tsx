/**
 * Complete Navigation System Demo
 * 
 * Comprehensive demonstration of all navigation patterns:
 * - Breadcrumbs
 * - Context Drawer
 * - Navigation Badges
 * - Focus Mode
 * - Recent & Pinned
 * - Cross-Module Jump Links
 * - Navigation Blueprint
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import BreadcrumbTrail, {
  useClinicalDocBreadcrumb,
} from '../components/navigation/BreadcrumbTrail';
import {
  PatientSummaryDrawer,
  AdmissionSummaryDrawer,
  MedicationDetailsDrawer,
  CaregiverProfileDrawer,
} from '../components/navigation/ContextDrawer';
import { NavigationBadgesDemo } from '../components/navigation/NavigationBadges';
import { FocusModeDemo } from '../components/navigation/FocusMode';
import { RecentAndPinnedDemo } from '../components/navigation/RecentAndPinned';
import { CrossModuleJumpLinksDemo } from '../components/navigation/CrossModuleJumpLinks';
import { NavigationBlueprint } from '../components/navigation/NavigationBlueprint';
import { User, FileText, Pill, Heart } from 'lucide-react';

export default function NavigationSystemComplete() {
  const [activeTab, setActiveTab] = useState('breadcrumbs');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Navigation System
          </h1>
          <p className="text-gray-600">
            Comprehensive navigation architecture for healthcare platform
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="breadcrumbs">Breadcrumbs</TabsTrigger>
            <TabsTrigger value="context-drawer">Context Drawer</TabsTrigger>
            <TabsTrigger value="badges">Navigation Badges</TabsTrigger>
            <TabsTrigger value="focus-mode">Focus Mode</TabsTrigger>
            <TabsTrigger value="recent-pinned">Recent & Pinned</TabsTrigger>
            <TabsTrigger value="jump-links">Jump Links</TabsTrigger>
            <TabsTrigger value="blueprint">Blueprint</TabsTrigger>
          </TabsList>

          {/* Breadcrumbs Demo */}
          <TabsContent value="breadcrumbs">
            <BreadcrumbsDemo />
          </TabsContent>

          {/* Context Drawer Demo */}
          <TabsContent value="context-drawer">
            <ContextDrawerDemo />
          </TabsContent>

          {/* Badges Demo */}
          <TabsContent value="badges">
            <NavigationBadgesDemo />
          </TabsContent>

          {/* Focus Mode Demo */}
          <TabsContent value="focus-mode">
            <FocusModeDemo />
          </TabsContent>

          {/* Recent & Pinned Demo */}
          <TabsContent value="recent-pinned">
            <RecentAndPinnedDemo />
          </TabsContent>

          {/* Jump Links Demo */}
          <TabsContent value="jump-links">
            <CrossModuleJumpLinksDemo />
          </TabsContent>

          {/* Blueprint */}
          <TabsContent value="blueprint">
            <NavigationBlueprint />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BREADCRUMBS DEMO
// ═══════════════════════════════════════════════════════════════════════════

function BreadcrumbsDemo() {
  const clinicalDocBreadcrumb = useClinicalDocBreadcrumb(
    'Sarah Johnson',
    '1',
    '03/01/2024',
    'adm-1',
    'Physical Therapy Visit Note'
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Breadcrumb Trail Examples</h2>
        <p className="text-sm text-gray-600 mb-6">
          Breadcrumbs help users understand their location in deep navigation hierarchies
        </p>

        <div className="space-y-6">
          <Example
            title="Simple Patient Navigation"
            breadcrumb={
              <BreadcrumbTrail
                items={[
                  { id: 'patients', label: 'Patients', path: '/patient' },
                  { id: 'patient', label: 'Sarah Johnson', current: true },
                ]}
                onNavigate={(path) => console.log('Navigate to:', path)}
              />
            }
          />

          <Example
            title="Admission Navigation"
            breadcrumb={
              <BreadcrumbTrail
                items={[
                  { id: 'patients', label: 'Patients', path: '/patient' },
                  { id: 'patient', label: 'Sarah Johnson', path: '/patient/1' },
                  { id: 'admission', label: 'Admission 03/01/2024', current: true },
                ]}
                onNavigate={(path) => console.log('Navigate to:', path)}
              />
            }
          />

          <Example
            title="Deep Clinical Documentation Navigation"
            breadcrumb={
              <BreadcrumbTrail
                items={clinicalDocBreadcrumb}
                onNavigate={(path) => console.log('Navigate to:', path)}
              />
            }
          />

          <Example
            title="Without Home Icon"
            breadcrumb={
              <BreadcrumbTrail
                items={[
                  { id: 'qa', label: 'QA Workspace', path: '/qa-workspace' },
                  { id: 'queue', label: 'Pending Review', path: '/qa-workspace?queue=pending' },
                  { id: 'document', label: 'PT Visit Note - 03/15/2024', current: true },
                ]}
                showHome={false}
                onNavigate={(path) => console.log('Navigate to:', path)}
              />
            }
          />
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2">Usage Guidelines</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Use breadcrumbs for navigation depth &gt; 2 levels</li>
          <li>• All items except last should be clickable</li>
          <li>• Include Home icon by default (showHome prop)</li>
          <li>• Keep labels concise (truncate if needed)</li>
          <li>• Use helper hooks (usePatientBreadcrumb, useAdmissionBreadcrumb, etc.)</li>
        </ul>
      </Card>
    </div>
  );
}

function Example({
  title,
  breadcrumb,
}: {
  title: string;
  breadcrumb: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-700 mb-2">{title}</div>
      <div className="p-4 bg-gray-50 rounded-lg border">{breadcrumb}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT DRAWER DEMO
// ═══════════════════════════════════════════════════════════════════════════

function ContextDrawerDemo() {
  const [patientDrawer, setPatientDrawer] = useState(false);
  const [admissionDrawer, setAdmissionDrawer] = useState(false);
  const [medicationDrawer, setMedicationDrawer] = useState(false);
  const [caregiverDrawer, setCaregiverDrawer] = useState(false);

  const patient = {
    name: 'Sarah Johnson',
    mrn: '123456',
    dob: '01/15/1965',
    age: 59,
    gender: 'Female',
    phone: '(555) 123-4567',
    address: '123 Main St, Springfield, IL 62701',
    alerts: [
      { id: '1', message: 'Penicillin Allergy' },
      { id: '2', message: 'Fall Risk' },
    ],
  };

  const admission = {
    startDate: '03/01/2024',
    status: 'Active',
    primaryPayer: 'Medicare',
    caseManager: 'Jane Smith, RN',
    disciplines: ['SN', 'PT', 'OT'],
    authStatus: 'Approved',
    visitsAuth: '30',
    visitsUsed: '12',
    patientName: 'Sarah Johnson',
  };

  const medication = {
    name: 'Lisinopril',
    dose: '10mg',
    route: 'Oral',
    frequency: 'Daily',
    prescriber: 'Dr. Smith',
    instructions: 'Take once daily in the morning with or without food',
    alerts: ['Monitor blood pressure', 'Check potassium levels'],
  };

  const caregiver = {
    name: 'Jane Smith, RN',
    discipline: 'Skilled Nursing',
    phone: '(555) 987-6543',
    email: 'jane.smith@agency.com',
    license: 'RN123456',
    licenseExpiry: '12/31/2025',
    status: 'Active',
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Context Drawer Examples</h2>
        <p className="text-sm text-gray-600 mb-6">
          View related information without leaving the current screen
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => setPatientDrawer(true)}>
            <User className="w-4 h-4 mr-2" />
            Open Patient Summary
          </Button>
          <Button variant="outline" onClick={() => setAdmissionDrawer(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Open Admission Summary
          </Button>
          <Button variant="outline" onClick={() => setMedicationDrawer(true)}>
            <Pill className="w-4 h-4 mr-2" />
            Open Medication Details
          </Button>
          <Button variant="outline" onClick={() => setCaregiverDrawer(true)}>
            <Heart className="w-4 h-4 mr-2" />
            Open Caregiver Profile
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2">When to Use Context Drawers</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>✓ Viewing related information without navigation</li>
          <li>✓ Patient/admission summaries while working in other modules</li>
          <li>✓ Medication/order details during documentation</li>
          <li>✓ Caregiver profiles during scheduling</li>
          <li>✓ Quick reference information that doesn't require full page</li>
          <li>✗ Primary workflow interactions (use full page instead)</li>
          <li>✗ Complex forms or multi-step processes</li>
        </ul>
      </Card>

      {/* Drawers */}
      <PatientSummaryDrawer
        isOpen={patientDrawer}
        onClose={() => setPatientDrawer(false)}
        patient={patient}
      />
      <AdmissionSummaryDrawer
        isOpen={admissionDrawer}
        onClose={() => setAdmissionDrawer(false)}
        admission={admission}
      />
      <MedicationDetailsDrawer
        isOpen={medicationDrawer}
        onClose={() => setMedicationDrawer(false)}
        medication={medication}
      />
      <CaregiverProfileDrawer
        isOpen={caregiverDrawer}
        onClose={() => setCaregiverDrawer(false)}
        caregiver={caregiver}
      />
    </div>
  );
}