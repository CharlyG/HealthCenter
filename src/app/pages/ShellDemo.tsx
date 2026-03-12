/**
 * Shell Architecture Demo
 * 
 * Interactive demonstration of all 5 shell components with live examples.
 * Navigate between shells to see them in action.
 */

import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Layout,
  Briefcase,
  List,
  Clock,
  User,
  FileText,
  Pill,
  Calendar,
  Activity,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Filter,
  Download,
  Plus,
} from 'lucide-react';

// Import all shells
import {
  ApplicationShell,
  WorkspacePageShell,
  ListPageShell,
  QueuePageShell,
  PatientChartShell,
} from '../components/shells';

type ShellType = 'application' | 'workspace' | 'list' | 'queue' | 'patient';

export default function ShellDemo() {
  const [activeShell, setActiveShell] = useState<ShellType>('workspace');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock data
  const mockPatient = {
    id: 'P-001',
    name: 'Sarah Johnson',
    mrn: 'MRN-123456',
    dob: '1945-03-15',
    age: 79,
    office: 'Central Office',
    phone: '(555) 123-4567',
  };

  const mockAdmission = {
    id: 'A-001',
    startDate: '2024-01-15',
    status: 'active' as const,
    primaryPayer: 'Medicare',
    disciplines: ['Nursing', 'PT', 'OT'],
    caseManager: 'Jane Smith, RN',
    authorizationStatus: 'approved' as const,
  };

  const mockAlerts = [
    { id: '1', type: 'allergy' as const, message: 'Penicillin allergy' },
    { id: '2', type: 'fall-risk' as const, message: 'High fall risk' },
  ];

  // Shell selector component
  const ShellSelector = () => (
    <div className="bg-white border-b p-4">
      <div className="max-w-[1800px] mx-auto">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Select Shell to Preview:
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeShell === 'workspace' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveShell('workspace')}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Workspace Shell
          </Button>
          <Button
            variant={activeShell === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveShell('list')}
          >
            <List className="w-4 h-4 mr-2" />
            List Shell
          </Button>
          <Button
            variant={activeShell === 'queue' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveShell('queue')}
          >
            <Clock className="w-4 h-4 mr-2" />
            Queue Shell
          </Button>
          <Button
            variant={activeShell === 'patient' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveShell('patient')}
          >
            <User className="w-4 h-4 mr-2" />
            Patient Chart Shell
          </Button>
        </div>
      </div>
    </div>
  );

  // Render workspace shell demo
  const renderWorkspaceShell = () => (
    <WorkspacePageShell
      title="Admissions Workspace"
      subtitle="Manage admission pipeline and today's critical tasks"
      headerActions={
        <>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Admission
          </Button>
          <Button variant="outline" size="sm">
            Reports
          </Button>
        </>
      }
      criticalIssues={
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 bg-white rounded border border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm text-gray-900">
                Authorization Expiring Tomorrow - Patient: Johnson, Sarah
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Medicare authorization expires 03/11/2026. Action required.
              </div>
            </div>
            <Button size="sm" variant="outline" className="ml-auto">
              Review
            </Button>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white rounded border border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm text-gray-900">
                Missing SOC Documentation - Patient: Williams, Robert
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Start of Care visit completed 3 days ago but documentation incomplete.
              </div>
            </div>
            <Button size="sm" variant="outline" className="ml-auto">
              Complete
            </Button>
          </div>
        </div>
      }
      criticalIssuesCount={3}
      todaysWork={
        <div className="space-y-2">
          {[
            { patient: 'Martinez, Maria', task: 'Complete admission assessment', priority: 'high' },
            { patient: 'Davis, James', task: 'Schedule initial RN visit', priority: 'medium' },
            { patient: 'Anderson, Lisa', task: 'Verify insurance eligibility', priority: 'high' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
              <div className={`w-2 h-2 rounded-full ${item.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{item.patient}</div>
                <div className="text-xs text-gray-600">{item.task}</div>
              </div>
              <Button size="sm" variant="ghost">Start</Button>
            </div>
          ))}
        </div>
      }
      todaysWorkCount={8}
      queues={
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Pending Approval</h3>
              <Badge>12</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                View admissions awaiting clinical approval
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Not Ready</h3>
              <Badge variant="secondary">5</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                Admissions missing required documentation
              </div>
            </div>
          </div>
        </div>
      }
      quickActions={
        <div className="space-y-2">
          <Button className="w-full justify-start" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Quick Admit
          </Button>
          <Button className="w-full justify-start" variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button className="w-full justify-start" variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule SOC
          </Button>
        </div>
      }
      insights={
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-900">Admission Rate</span>
            </div>
            <div className="text-xl font-bold text-blue-900">↑ 15%</div>
            <div className="text-xs text-blue-700">vs. last week</div>
          </div>
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-900">Avg. Time to Admit</span>
            </div>
            <div className="text-xl font-bold text-green-900">2.3 hrs</div>
            <div className="text-xs text-green-700">↓ 0.5 hrs improvement</div>
          </div>
        </div>
      }
    />
  );

  // Render list shell demo
  const renderListShell = () => (
    <ListPageShell
      title="Active Patients"
      subtitle="All patients currently receiving care"
      totalCount={1247}
      primaryAction={{
        label: 'Add Patient',
        onClick: () => alert('Add patient clicked')
      }}
      summaryChips={[
        { id: 'total', label: 'Total Patients', value: 1247, variant: 'default' },
        { id: 'active', label: 'Active', value: 892, variant: 'success' },
        { id: 'pending', label: 'Pending Admission', value: 45, variant: 'warning' },
        { id: 'discharged', label: 'Recently Discharged', value: 310, variant: 'info' },
      ]}
      searchPlaceholder="Search by name, MRN, or phone..."
      filterPanel={
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Office</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>All Offices</option>
              <option>Central Office</option>
              <option>North Branch</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payer</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>All Payers</option>
              <option>Medicare</option>
              <option>Medicaid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>Active</option>
              <option>Discharged</option>
              <option>Pending</option>
            </select>
          </div>
        </div>
      }
      selectedCount={selectedItems.length}
      onClearSelection={() => setSelectedItems([])}
      bulkActions={
        <>
          <Button size="sm">Assign Caregiver</Button>
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </>
      }
      onExport={() => alert('Export patients')}
    >
      {/* Mock table */}
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Patient</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">MRN</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Age</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[
              { name: 'Johnson, Sarah', mrn: 'MRN-123456', age: 79, payer: 'Medicare', status: 'Active' },
              { name: 'Williams, Robert', mrn: 'MRN-123457', age: 65, payer: 'Medicare', status: 'Active' },
              { name: 'Martinez, Maria', mrn: 'MRN-123458', age: 72, payer: 'Medicaid', status: 'Pending' },
            ].map((patient, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600 font-mono">{patient.mrn}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{patient.age}y</td>
                <td className="px-4 py-3 text-sm text-gray-600">{patient.payer}</td>
                <td className="px-4 py-3">
                  <Badge variant={patient.status === 'Active' ? 'default' : 'secondary'}>
                    {patient.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListPageShell>
  );

  // Render queue shell demo
  const renderQueueShell = () => (
    <QueuePageShell
      title="EVV Errors Queue"
      subtitle="Electronic Visit Verification exceptions requiring resolution"
      queueType="operational"
      prioritySummary={{
        critical: 12,
        high: 28,
        medium: 45,
        low: 67,
        overdue: 5,
      }}
      quickFilters={[
        { id: 'all', label: 'All Items', count: 152, active: true, onClick: () => {} },
        { id: 'mine', label: 'My Items', count: 23, onClick: () => {} },
        { id: 'overdue', label: 'Overdue', count: 5, onClick: () => {} },
        { id: 'today', label: 'Due Today', count: 18, onClick: () => {} },
      ]}
      selectedCount={selectedItems.length}
      onClearSelection={() => setSelectedItems([])}
      triageActions={
        <>
          <Button size="sm">Assign to Me</Button>
          <Button size="sm" variant="outline">Mark Resolved</Button>
          <Button size="sm" variant="outline">Escalate</Button>
        </>
      }
      showSlaIndicators={true}
    >
      <div className="space-y-2">
        {[
          { patient: 'Johnson, Sarah', error: 'Clock-in time missing', priority: 'critical', age: '2h' },
          { patient: 'Williams, Robert', error: 'GPS coordinates invalid', priority: 'high', age: '5h' },
          { patient: 'Martinez, Maria', error: 'Visit duration mismatch', priority: 'medium', age: '1d' },
          { patient: 'Davis, James', error: 'Signature not captured', priority: 'high', age: '8h' },
        ].map((item, idx) => {
          const priorityColors = {
            critical: 'border-red-300 bg-red-50',
            high: 'border-orange-300 bg-orange-50',
            medium: 'border-amber-300 bg-amber-50',
            low: 'border-blue-300 bg-blue-50',
          };

          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border-l-4 bg-white border ${priorityColors[item.priority as keyof typeof priorityColors]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <input type="checkbox" className="mt-1 rounded" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{item.patient}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{item.error}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Age: {item.age}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">Review</Button>
                  <Button size="sm">Resolve</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </QueuePageShell>
  );

  // Render patient chart shell demo
  const renderPatientChartShell = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const navigationTabs = [
      {
        id: 'overview',
        label: 'Overview',
        icon: <FileText className="w-4 h-4" />,
        level: 'patient' as const,
        onClick: () => setActiveTab('overview'),
        active: activeTab === 'overview',
      },
      {
        id: 'medications',
        label: 'Medications',
        icon: <Pill className="w-4 h-4" />,
        level: 'patient' as const,
        badge: 12,
        onClick: () => setActiveTab('medications'),
        active: activeTab === 'medications',
      },
      {
        id: 'visits',
        label: 'Visit Notes',
        icon: <Calendar className="w-4 h-4" />,
        level: 'admission' as const,
        badge: 3,
        onClick: () => setActiveTab('visits'),
        active: activeTab === 'visits',
      },
      {
        id: 'assessments',
        label: 'Assessments',
        icon: <CheckCircle className="w-4 h-4" />,
        level: 'admission' as const,
        onClick: () => setActiveTab('assessments'),
        active: activeTab === 'assessments',
      },
    ];

    return (
      <PatientChartShell
        patient={mockPatient}
        alerts={mockAlerts}
        admission={mockAdmission}
        navigationTabs={navigationTabs}
        rightDrawer={
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent Activity</h4>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Visit Completed</div>
                  <div className="text-xs text-gray-600">RN - Sarah Chen • 2h ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Medication Added</div>
                  <div className="text-xs text-gray-600">Lisinopril 10mg • 1d ago</div>
                </div>
              </div>
            </div>
          </div>
        }
        quickActions={
          <>
            <Button size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              New Visit
            </Button>
            <Button size="sm" variant="outline" className="w-full">
              Add Order
            </Button>
          </>
        }
        onClose={() => setActiveShell('workspace')}
      >
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {activeTab === 'overview' && 'Patient Overview'}
              {activeTab === 'medications' && 'Medications'}
              {activeTab === 'visits' && 'Visit Notes'}
              {activeTab === 'assessments' && 'Assessments'}
            </h3>
            <div className="text-gray-600">
              <p>This is the main content area for the {activeTab} tab.</p>
              <p className="mt-2">
                Content would be rendered here based on the selected navigation item.
              </p>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Demographics</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">DOB:</dt>
                    <dd className="font-medium">03/15/1945</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Age:</dt>
                    <dd className="font-medium">79 years</dd>
                  </div>
                </dl>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Current Admission</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Start Date:</dt>
                    <dd className="font-medium">01/15/2024</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Payer:</dt>
                    <dd className="font-medium">Medicare</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </PatientChartShell>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ShellSelector />
      
      {activeShell === 'workspace' && renderWorkspaceShell()}
      {activeShell === 'list' && renderListShell()}
      {activeShell === 'queue' && renderQueueShell()}
      {activeShell === 'patient' && renderPatientChartShell()}
    </div>
  );
}
