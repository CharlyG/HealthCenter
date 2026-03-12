/**
 * Navigation Architecture Demo
 * 
 * Complete demonstration of the unified navigation system including:
 * - Sidebar navigation with role-based views
 * - Quick access bar
 * - Command palette
 * - Patient context header
 * - Admission context bar
 * - Workspace dashboard
 */

import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import UnifiedSidebar from '../components/navigation/UnifiedSidebar';
import QuickAccessBar from '../components/navigation/QuickAccessBar';
import CommandPalette from '../components/navigation/CommandPalette';
import PatientContextHeader from '../components/navigation/PatientContextHeader';
import AdmissionContextBar from '../components/navigation/AdmissionContextBar';
import WorkspaceDashboard from '../components/navigation/WorkspaceDashboard';
import { Menu, X } from 'lucide-react';

export default function NavigationArchitectureDemo() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('admin');
  const [patientContext, setPatientContext] = useState(true);
  const [admissionContext, setAdmissionContext] = useState(true);

  // Mock data
  const patient = {
    id: '1',
    name: 'Sarah Johnson',
    mrn: '123456',
    dob: '01/15/1965',
    age: 59,
    office: 'Main Office',
    phone: '(555) 123-4567',
    address: '123 Main St, Springfield, IL',
  };

  const alerts = [
    { id: '1', type: 'allergy' as const, message: 'Penicillin Allergy' },
    { id: '2', type: 'fall-risk' as const, message: 'Fall Risk' },
  ];

  const admission = {
    id: 'adm-1',
    startDate: '03/01/2024',
    status: 'active' as const,
    primaryPayer: 'Medicare',
    disciplines: ['SN', 'PT'],
    caseManager: 'Jane Smith, RN',
    authorizationStatus: 'approved' as const,
  };

  const availableAdmissions = [
    admission,
    {
      id: 'adm-2',
      startDate: '01/15/2024',
      status: 'discharged' as const,
      primaryPayer: 'Medicare',
      disciplines: ['SN'],
      caseManager: 'Jane Smith, RN',
      authorizationStatus: 'approved' as const,
    },
  ];

  const roles = ['admin', 'clinician', 'scheduler', 'qa', 'billing', 'hospice', 'admissions'];

  // Keyboard shortcut handler
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <UnifiedSidebar userRole={userRole} collapsed={sidebarCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Quick Access Bar */}
        <QuickAccessBar
          onSearch={() => setCommandPaletteOpen(true)}
          onCommandPalette={() => setCommandPaletteOpen(true)}
          notificationCount={12}
          userName="John Smith"
          userRole={userRole}
        />

        {/* Patient Context Header (conditional) */}
        {patientContext && (
          <PatientContextHeader
            patient={patient}
            alerts={alerts}
            onClose={() => setPatientContext(false)}
          />
        )}

        {/* Admission Context Bar (conditional) */}
        {patientContext && admissionContext && (
          <AdmissionContextBar
            admission={admission}
            availableAdmissions={availableAdmissions}
            onAdmissionChange={(id) => console.log('Switch admission:', id)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Demo Controls */}
          <div className="sticky top-0 z-10 bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-gray-900">Navigation Architecture Demo</h1>
                <Badge variant="outline">Live Preview</Badge>
              </div>

              <div className="flex items-center gap-3">
                {/* Role Selector */}
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm"
                >
                  {roles.map((role) => (
                    <option key={role} value={role} className="capitalize">
                      {role}
                    </option>
                  ))}
                </select>

                {/* Context Toggles */}
                <Button
                  variant={patientContext ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPatientContext(!patientContext)}
                >
                  {patientContext ? 'Hide' : 'Show'} Patient Context
                </Button>

                <Button
                  variant={admissionContext ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAdmissionContext(!admissionContext)}
                  disabled={!patientContext}
                >
                  {admissionContext ? 'Hide' : 'Show'} Admission Context
                </Button>

                {/* Sidebar Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </Button>

                {/* Command Palette */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommandPaletteOpen(true)}
                >
                  Open Command Palette
                  <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 rounded border">
                    Ctrl K
                  </kbd>
                </Button>
              </div>
            </div>
          </div>

          {/* Workspace Dashboard */}
          <WorkspaceDashboard userRole={userRole} userName="John Smith" />
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(path) => console.log('Navigate to:', path)}
      />
    </div>
  );
}
