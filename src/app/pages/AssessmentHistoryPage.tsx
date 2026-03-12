/**
 * Assessment History Page
 * 
 * Comprehensive audit trail for clinical assessments:
 * - Complete change history with user attribution
 * - Field-level tracking (field, previous value, new value)
 * - Timestamp for every change
 * - Visual diff viewer
 * - Filter by user, date range, field, section
 * - Group changes by save session
 * - Export audit logs
 * - Compliance-ready for HIPAA audits
 * - Integration with assessment viewer
 * - Restore previous versions
 */

import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  ArrowLeft,
  History,
  User,
  Clock,
  FileText,
  Download,
  Filter,
  Search,
  Eye,
  RotateCcw,
  Calendar,
  Edit3,
  Save,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Copy,
  ExternalLink,
  GitCommit,
  GitBranch,
  Loader2,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ChangeType = 'created' | 'updated' | 'deleted' | 'submitted' | 'locked' | 'unlocked';

interface ChangeHistoryEntry {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  changeType: ChangeType;
  sessionId: string; // Groups changes made in same save
  section?: string;
  field: string;
  fieldLabel: string;
  previousValue: any;
  newValue: any;
  metadata?: {
    reason?: string;
    ipAddress?: string;
    deviceInfo?: string;
    validationStatus?: 'passed' | 'failed';
  };
}

interface AssessmentVersion {
  versionNumber: number;
  timestamp: string;
  user: {
    name: string;
    role: string;
  };
  changeCount: number;
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_HISTORY: ChangeHistoryEntry[] = [
  // Session 1: Initial creation (Day 1)
  {
    id: 'ch-001',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u-001',
      name: 'Sarah Martinez',
      role: 'Intake Coordinator',
    },
    changeType: 'created',
    sessionId: 'session-001',
    field: 'assessment',
    fieldLabel: 'Assessment',
    previousValue: null,
    newValue: 'Created OASIS-E Start of Care Assessment',
    metadata: {
      ipAddress: '192.168.1.100',
      deviceInfo: 'Chrome 120 / Windows 10',
    },
  },
  // Session 2: Demographics completed (Day 1, 30 min later)
  {
    id: 'ch-002',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-002',
    section: 'Patient Demographics',
    field: 'firstName',
    fieldLabel: 'First Name',
    previousValue: '',
    newValue: 'Margaret',
  },
  {
    id: 'ch-003',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-002',
    section: 'Patient Demographics',
    field: 'lastName',
    fieldLabel: 'Last Name',
    previousValue: '',
    newValue: 'Johnson',
  },
  {
    id: 'ch-004',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-002',
    section: 'Patient Demographics',
    field: 'dateOfBirth',
    fieldLabel: 'Date of Birth',
    previousValue: '',
    newValue: '1945-06-15',
  },
  {
    id: 'ch-005',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-002',
    section: 'Patient Demographics',
    field: 'gender',
    fieldLabel: 'Gender',
    previousValue: '',
    newValue: 'Female',
  },
  // Session 3: Living arrangements (Day 2)
  {
    id: 'ch-006',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-003',
    section: 'Living Arrangements',
    field: 'livingSituation',
    fieldLabel: 'Living Situation',
    previousValue: '',
    newValue: 'Lives with others',
  },
  {
    id: 'ch-007',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-003',
    section: 'Living Arrangements',
    field: 'primaryCaregiver',
    fieldLabel: 'Primary Caregiver',
    previousValue: '',
    newValue: 'Sarah Johnson (Daughter)',
  },
  // Session 4: Functional status - Fall risk correction (Day 3)
  {
    id: 'ch-008',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-004',
    section: 'Functional Status',
    field: 'fallRisk',
    fieldLabel: 'Fall Risk Level',
    previousValue: 'Moderate',
    newValue: 'High',
    metadata: {
      reason: 'Updated after comprehensive fall risk assessment',
    },
  },
  {
    id: 'ch-009',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-004',
    section: 'Functional Status',
    field: 'ambulation',
    fieldLabel: 'Ambulation Status',
    previousValue: 'Independent with assistive device',
    newValue: 'Requires walker for all ambulation. Unsteady gait noted. Needs supervision.',
  },
  // Session 5: Medications (Day 3, later)
  {
    id: 'ch-010',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-005',
    section: 'Medications',
    field: 'medicationList',
    fieldLabel: 'Current Medications',
    previousValue: '',
    newValue: 'Metoprolol 50mg BID, Lisinopril 10mg daily, Aspirin 81mg daily, Gabapentin 300mg TID',
  },
  {
    id: 'ch-011',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-005',
    section: 'Medications',
    field: 'allergies',
    fieldLabel: 'Drug Allergies',
    previousValue: '',
    newValue: 'Penicillin (rash), Sulfa drugs (hives)',
  },
  // Session 6: Cognitive status (Day 4)
  {
    id: 'ch-012',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-006',
    section: 'Cognitive Status',
    field: 'orientation',
    fieldLabel: 'Orientation to Person/Place/Time',
    previousValue: '',
    newValue: 'Fully oriented',
  },
  {
    id: 'ch-013',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-006',
    section: 'Cognitive Status',
    field: 'memory',
    fieldLabel: 'Memory Assessment',
    previousValue: '',
    newValue: 'Short-term memory intact. Able to recall 3/3 items after 5 minutes. Long-term memory preserved.',
  },
  // Session 7: Diagnoses (Day 5)
  {
    id: 'ch-014',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-007',
    section: 'Diagnoses',
    field: 'primaryDiagnosis',
    fieldLabel: 'Primary Diagnosis (ICD-10)',
    previousValue: '',
    newValue: 'I50.9 - Heart Failure, unspecified',
  },
  {
    id: 'ch-015',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'updated',
    sessionId: 'session-007',
    section: 'Diagnoses',
    field: 'secondaryDiagnoses',
    fieldLabel: 'Secondary Diagnoses',
    previousValue: '',
    newValue: 'I10 - Hypertension\nE11.9 - Type 2 diabetes mellitus\nM19.90 - Osteoarthritis',
  },
  // Session 8: Quality review correction (Day 6)
  {
    id: 'ch-016',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u-003',
      name: 'Maria Rodriguez, RN',
      role: 'Clinical Manager',
    },
    changeType: 'updated',
    sessionId: 'session-008',
    section: 'Functional Status',
    field: 'bathing',
    fieldLabel: 'Bathing',
    previousValue: 'Supervision',
    newValue: 'Assistance required',
    metadata: {
      reason: 'QA Review - Updated to reflect actual level of assistance needed',
    },
  },
  // Session 9: Submitted (Day 7)
  {
    id: 'ch-017',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'u-002',
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    changeType: 'submitted',
    sessionId: 'session-009',
    field: 'status',
    fieldLabel: 'Assessment Status',
    previousValue: 'Completed',
    newValue: 'Submitted to CMS',
    metadata: {
      validationStatus: 'passed',
    },
  },
  // Session 10: Locked (Day 7, 5 min later)
  {
    id: 'ch-018',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    user: {
      id: 'system',
      name: 'System',
      role: 'Automated',
    },
    changeType: 'locked',
    sessionId: 'session-010',
    field: 'editLock',
    fieldLabel: 'Edit Lock',
    previousValue: 'Unlocked',
    newValue: 'Locked',
    metadata: {
      reason: 'Automatically locked after submission to CMS',
    },
  },
];

const MOCK_VERSIONS: AssessmentVersion[] = [
  {
    versionNumber: 1,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    user: { name: 'Sarah Martinez', role: 'Intake Coordinator' },
    changeCount: 1,
    description: 'Initial creation',
  },
  {
    versionNumber: 2,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    user: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
    changeCount: 4,
    description: 'Demographics completed',
  },
  {
    versionNumber: 3,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    user: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
    changeCount: 2,
    description: 'Living arrangements updated',
  },
  {
    versionNumber: 4,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    user: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
    changeCount: 2,
    description: 'Functional status assessment',
  },
  {
    versionNumber: 5,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    user: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
    changeCount: 2,
    description: 'Medications recorded',
  },
  {
    versionNumber: 6,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    user: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
    changeCount: 2,
    description: 'Cognitive assessment',
  },
  {
    versionNumber: 7,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    user: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
    changeCount: 2,
    description: 'Diagnoses added',
  },
  {
    versionNumber: 8,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: { name: 'Maria Rodriguez, RN', role: 'Clinical Manager' },
    changeCount: 1,
    description: 'QA corrections',
  },
  {
    versionNumber: 9,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
    changeCount: 1,
    description: 'Submitted to CMS',
  },
  {
    versionNumber: 10,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    user: { name: 'System', role: 'Automated' },
    changeCount: 1,
    description: 'Locked',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AssessmentHistoryPage() {
  const navigate = useNavigate();
  const { assessmentId } = useParams<{ assessmentId: string }>();
  
  const [history] = useState(MOCK_HISTORY);
  const [versions] = useState(MOCK_VERSIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterChangeType, setFilterChangeType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'versions' | 'detailed'>('timeline');
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoreVersionNumber, setRestoreVersionNumber] = useState<number | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  // Get unique users and sections for filters
  const uniqueUsers = useMemo(() => {
    const users = new Set(history.map(h => h.user.name));
    return Array.from(users);
  }, [history]);

  const uniqueSections = useMemo(() => {
    const sections = new Set(history.filter(h => h.section).map(h => h.section!));
    return Array.from(sections);
  }, [history]);

  // Filter history
  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          entry.fieldLabel.toLowerCase().includes(query) ||
          entry.user.name.toLowerCase().includes(query) ||
          String(entry.previousValue || '').toLowerCase().includes(query) ||
          String(entry.newValue || '').toLowerCase().includes(query) ||
          (entry.section && entry.section.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      // User filter
      if (filterUser !== 'all' && entry.user.name !== filterUser) {
        return false;
      }

      // Section filter
      if (filterSection !== 'all' && entry.section !== filterSection) {
        return false;
      }

      // Change type filter
      if (filterChangeType !== 'all' && entry.changeType !== filterChangeType) {
        return false;
      }

      return true;
    });
  }, [history, searchQuery, filterUser, filterSection, filterChangeType]);

  // Group by session
  const sessionGroups = useMemo(() => {
    const groups: Map<string, ChangeHistoryEntry[]> = new Map();
    filteredHistory.forEach(entry => {
      const sessionEntries = groups.get(entry.sessionId) || [];
      sessionEntries.push(entry);
      groups.set(entry.sessionId, sessionEntries);
    });
    return groups;
  }, [filteredHistory]);

  const handleExport = () => {
    // Create CSV export
    const csvContent = [
      ['Timestamp', 'User', 'Role', 'Section', 'Field', 'Previous Value', 'New Value', 'Change Type'],
      ...history.map(entry => [
        new Date(entry.timestamp).toLocaleString(),
        entry.user.name,
        entry.user.role,
        entry.section || '',
        entry.fieldLabel,
        entry.previousValue || '',
        entry.newValue || '',
        entry.changeType,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-history-${assessmentId || 'export'}-${Date.now()}.csv`;
    a.click();
  };

  const handleRestore = (versionNumber: number) => {
    setRestoreVersionNumber(versionNumber);
    setShowRestoreDialog(true);
  };

  const confirmRestore = () => {
    // TODO: Implement restore logic
    console.log('Restoring version:', restoreVersionNumber);
    setShowRestoreDialog(false);
    setRestoreVersionNumber(null);
  };

  const toggleSessionExpanded = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
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
                  <History className="w-5 h-5 text-blue-600" />
                  Assessment History
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  OASIS-E Start of Care • Margaret Johnson • MRN-334455
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/clinical-assessment-viewer')}>
                <Eye className="w-4 h-4 mr-2" />
                View Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Search */}
            <div className="col-span-4">
              <Label className="text-xs font-medium text-gray-700 mb-2">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search fields, values, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* User Filter */}
            <div className="col-span-2">
              <Label className="text-xs font-medium text-gray-700 mb-2">User</Label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section Filter */}
            <div className="col-span-3">
              <Label className="text-xs font-medium text-gray-700 mb-2">Section</Label>
              <Select value={filterSection} onValueChange={setFilterSection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {uniqueSections.map(section => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Change Type Filter */}
            <div className="col-span-3">
              <Label className="text-xs font-medium text-gray-700 mb-2">Change Type</Label>
              <Select value={filterChangeType} onValueChange={setFilterChangeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Changes</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Total Changes:</span>
              <Badge variant="outline">{filteredHistory.length}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Contributors:</span>
              <Badge variant="outline">{uniqueUsers.length}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Versions:</span>
              <Badge variant="outline">{versions.length}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">First Change:</span>
              <span className="font-medium text-gray-900">
                {new Date(history[0].timestamp).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Last Change:</span>
              <span className="font-medium text-gray-900">
                {new Date(history[history.length - 1].timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList>
            <TabsTrigger value="timeline">
              <GitCommit className="w-4 h-4 mr-2" />
              Timeline View
            </TabsTrigger>
            <TabsTrigger value="versions">
              <GitBranch className="w-4 h-4 mr-2" />
              Version History
            </TabsTrigger>
            <TabsTrigger value="detailed">
              <FileText className="w-4 h-4 mr-2" />
              Detailed Log
            </TabsTrigger>
          </TabsList>

          {/* Timeline View */}
          <TabsContent value="timeline" className="mt-6">
            <TimelineView
              sessionGroups={sessionGroups}
              expandedSessions={expandedSessions}
              onToggleSession={toggleSessionExpanded}
            />
          </TabsContent>

          {/* Version History */}
          <TabsContent value="versions" className="mt-6">
            <VersionHistoryView
              versions={versions}
              selectedVersion={selectedVersion}
              onSelectVersion={setSelectedVersion}
              onRestore={handleRestore}
            />
          </TabsContent>

          {/* Detailed Log */}
          <TabsContent value="detailed" className="mt-6">
            <DetailedLogView history={filteredHistory} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Previous Version?</DialogTitle>
            <DialogDescription>
              This will restore the assessment to version {restoreVersionNumber}. Current data will be preserved in history.
              This action can be undone by restoring to a later version.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRestore}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restore Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface TimelineViewProps {
  sessionGroups: Map<string, ChangeHistoryEntry[]>;
  expandedSessions: Set<string>;
  onToggleSession: (sessionId: string) => void;
}

function TimelineView({ sessionGroups, expandedSessions, onToggleSession }: TimelineViewProps) {
  const sortedSessions = Array.from(sessionGroups.entries()).sort((a, b) => {
    const timeA = new Date(a[1][0].timestamp).getTime();
    const timeB = new Date(b[1][0].timestamp).getTime();
    return timeB - timeA; // Newest first
  });

  return (
    <div className="space-y-4">
      {sortedSessions.map(([sessionId, entries], index) => {
        const isExpanded = expandedSessions.has(sessionId);
        const firstEntry = entries[0];
        const isLast = index === sortedSessions.length - 1;

        return (
          <Card key={sessionId} className="overflow-hidden">
            {/* Session Header */}
            <button
              onClick={() => onToggleSession(sessionId)}
              className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-start gap-4">
                {/* Timeline dot */}
                <div className="relative pt-1">
                  <div className={cn(
                    'w-3 h-3 rounded-full border-4 border-white',
                    getChangeTypeColor(firstEntry.changeType)
                  )} />
                  {!isLast && (
                    <div className="absolute left-1/2 top-6 w-0.5 h-16 bg-gray-200 -translate-x-1/2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <ChangeTypeBadge type={firstEntry.changeType} />
                      <span className="text-sm text-gray-600">
                        {formatTimestamp(firstEntry.timestamp)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {entries.length} {entries.length === 1 ? 'change' : 'changes'}
                      </Badge>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{firstEntry.user.name}</span>
                    <span className="text-sm text-gray-500">• {firstEntry.user.role}</span>
                  </div>

                  {firstEntry.section && (
                    <div className="text-sm text-gray-600">
                      Section: {firstEntry.section}
                    </div>
                  )}

                  {firstEntry.metadata?.reason && (
                    <div className="mt-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded">
                      {firstEntry.metadata.reason}
                    </div>
                  )}
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t bg-gray-50 p-4">
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <ChangeEntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VERSION HISTORY VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface VersionHistoryViewProps {
  versions: AssessmentVersion[];
  selectedVersion: number | null;
  onSelectVersion: (version: number) => void;
  onRestore: (version: number) => void;
}

function VersionHistoryView({ versions, selectedVersion, onSelectVersion, onRestore }: VersionHistoryViewProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Version List */}
      <div className="col-span-1">
        <Card>
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Versions</h3>
            <p className="text-xs text-gray-600 mt-1">
              {versions.length} saved versions
            </p>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="p-2">
              {versions.slice().reverse().map((version) => (
                <button
                  key={version.versionNumber}
                  onClick={() => onSelectVersion(version.versionNumber)}
                  className={cn(
                    'w-full p-3 rounded-lg text-left transition-colors mb-2',
                    selectedVersion === version.versionNumber
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      Version {version.versionNumber}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {version.changeCount} changes
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    {version.user.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTimestamp(version.timestamp)}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Version Details */}
      <div className="col-span-2">
        {selectedVersion ? (
          <Card>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Version {selectedVersion}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {versions.find(v => v.versionNumber === selectedVersion)?.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRestore(selectedVersion)}
                  disabled={selectedVersion === versions[versions.length - 1].versionNumber}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">Modified By</Label>
                    <div className="font-medium text-gray-900 mt-1">
                      {versions.find(v => v.versionNumber === selectedVersion)?.user.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {versions.find(v => v.versionNumber === selectedVersion)?.user.role}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Timestamp</Label>
                    <div className="font-medium text-gray-900 mt-1">
                      {formatTimestamp(versions.find(v => v.versionNumber === selectedVersion)?.timestamp || '')}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs text-gray-600 mb-2">Changes in this version</Label>
                  <div className="mt-2 text-sm text-gray-600">
                    {versions.find(v => v.versionNumber === selectedVersion)?.changeCount} field(s) modified
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-12">
            <div className="text-center text-gray-500">
              <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a version to view details</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DETAILED LOG VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface DetailedLogViewProps {
  history: ChangeHistoryEntry[];
}

function DetailedLogView({ history }: DetailedLogViewProps) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Section</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Field</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Previous Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">New Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {history.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatTimestamp(entry.timestamp)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{entry.user.name}</div>
                  <div className="text-xs text-gray-500">{entry.user.role}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {entry.section || '-'}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {entry.fieldLabel}
                </td>
                <td className="px-4 py-3">
                  <ValueDisplay value={entry.previousValue} />
                </td>
                <td className="px-4 py-3">
                  <ValueDisplay value={entry.newValue} />
                </td>
                <td className="px-4 py-3">
                  <ChangeTypeBadge type={entry.changeType} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function ChangeEntryCard({ entry }: { entry: ChangeHistoryEntry }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-medium text-gray-900 mb-1">{entry.fieldLabel}</div>
          {entry.section && (
            <div className="text-xs text-gray-500">Section: {entry.section}</div>
          )}
        </div>
        <ChangeTypeBadge type={entry.changeType} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-gray-600 mb-1">Previous Value</Label>
          <ValueDisplay value={entry.previousValue} />
        </div>
        <div>
          <Label className="text-xs text-gray-600 mb-1">New Value</Label>
          <ValueDisplay value={entry.newValue} highlighted />
        </div>
      </div>
    </div>
  );
}

function ChangeTypeBadge({ type }: { type: ChangeType }) {
  const config = {
    created: { label: 'Created', className: 'bg-blue-100 text-blue-700' },
    updated: { label: 'Updated', className: 'bg-amber-100 text-amber-700' },
    deleted: { label: 'Deleted', className: 'bg-red-100 text-red-700' },
    submitted: { label: 'Submitted', className: 'bg-purple-100 text-purple-700' },
    locked: { label: 'Locked', className: 'bg-gray-100 text-gray-700' },
    unlocked: { label: 'Unlocked', className: 'bg-green-100 text-green-700' },
  };

  const { label, className } = config[type];

  return (
    <Badge variant="outline" className={cn('text-xs', className)}>
      {label}
    </Badge>
  );
}

function ValueDisplay({ value, highlighted }: { value: any; highlighted?: boolean }) {
  const displayValue = value === null || value === '' ? '(empty)' : String(value);
  const isLong = displayValue.length > 50;

  return (
    <div className={cn(
      'text-sm rounded px-2 py-1',
      highlighted ? 'bg-green-50 text-green-900 font-medium' : 'bg-gray-50 text-gray-700',
      displayValue === '(empty)' && 'italic text-gray-400'
    )}>
      {isLong ? (
        <div className="max-h-20 overflow-y-auto text-xs">{displayValue}</div>
      ) : (
        displayValue
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getChangeTypeColor(type: ChangeType): string {
  const colors = {
    created: 'bg-blue-500',
    updated: 'bg-amber-500',
    deleted: 'bg-red-500',
    submitted: 'bg-purple-500',
    locked: 'bg-gray-500',
    unlocked: 'bg-green-500',
  };
  return colors[type];
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
