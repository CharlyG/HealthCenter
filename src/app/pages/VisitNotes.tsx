import { useState, useEffect, useMemo } from 'react';
import { supabase, publicAnonKey, supabaseUrl } from '../lib/supabaseClient';
import { useNavigate } from 'react-router';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  FileText,
  Search,
  Filter,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { PageLayout, PageHeader, EmptyState, LoadingState, ErrorState } from '../components/design-system';

// QA Status type
type QAStatus = 'in_progress' | 'completed' | 'returned' | 'corrected' | 'approved';

// Discipline types
const DISCIPLINES = [
  { value: 'rn', label: 'Registered Nurse (RN)' },
  { value: 'lpn', label: 'Licensed Practical Nurse (LPN)' },
  { value: 'pt', label: 'Physical Therapy (PT)' },
  { value: 'ot', label: 'Occupational Therapy (OT)' },
  { value: 'st', label: 'Speech Therapy (ST)' },
  { value: 'msw', label: 'Medical Social Worker (MSW)' },
  { value: 'hha', label: 'Home Health Aide (HHA)' },
  { value: 'cna', label: 'Certified Nursing Assistant (CNA)' },
] as const;

interface VisitNote {
  id: string;
  visitId: string;
  patientName: string;
  patientMrn: string;
  discipline: string;
  clinicianName: string;
  visitDate: string;
  serviceType: string;
  qaStatus: QAStatus;
  createdAt: string;
  lastModified: string;
  signedAt?: string;
  signedBy?: string;
}

// Mock data
const mockVisitNotes: VisitNote[] = [];

function getStatusInfo(status: QAStatus) {
  const statusMap = {
    in_progress: {
      label: 'In Progress',
      variant: 'secondary' as const,
      icon: Clock,
      color: 'text-gray-600',
    },
    completed: {
      label: 'Completed',
      variant: 'default' as const,
      icon: CheckCircle2,
      color: 'text-blue-600',
    },
    returned: {
      label: 'Returned for Correction',
      variant: 'destructive' as const,
      icon: AlertCircle,
      color: 'text-red-600',
    },
    corrected: {
      label: 'Corrected',
      variant: 'default' as const,
      icon: Edit3,
      color: 'text-amber-600',
    },
    approved: {
      label: 'Approved',
      variant: 'default' as const,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
  };
  return statusMap[status];
}

export default function VisitNotes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visitNotes, setVisitNotes] = useState<VisitNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch visit notes from backend
  const fetchVisitNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('[VisitNotes] Session exists:', !!session);
      console.log('[VisitNotes] Access token exists:', !!session?.access_token);
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/make-server-845bc545/clinical/visit-notes`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': session?.access_token || '',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[VisitNotes] Fetch failed:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to fetch visit notes');
      }

      const data = await response.json();
      console.log('[VisitNotes] Fetched visit notes:', data.visitNotes?.length || 0);
      setVisitNotes(data.visitNotes || []);
    } catch (err: any) {
      console.error('Error fetching visit notes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitNotes();
  }, []);

  // Filter and search
  const filteredNotes = useMemo(() => {
    return visitNotes.filter((note) => {
      const matchesSearch =
        note.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.patientMrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.clinicianName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDiscipline = disciplineFilter === 'all' || note.discipline === disciplineFilter;
      const matchesStatus = statusFilter === 'all' || note.qaStatus === statusFilter;

      return matchesSearch && matchesDiscipline && matchesStatus;
    });
  }, [searchTerm, disciplineFilter, statusFilter, visitNotes]);

  // Stats
  const stats = {
    inProgress: visitNotes.filter((n) => n.qaStatus === 'in_progress').length,
    completed: visitNotes.filter((n) => n.qaStatus === 'completed').length,
    returned: visitNotes.filter((n) => n.qaStatus === 'returned').length,
    approved: visitNotes.filter((n) => n.qaStatus === 'approved').length,
  };

  return (
    <PageLayout>
      <PageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/clinical')}>
              ← Back
            </Button>
            <FileText className="size-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Visit Notes</h1>
              <p className="text-gray-600">Discipline-specific clinical visit documentation</p>
            </div>
          </div>
          <Button onClick={() => navigate('/clinical/visit-notes/new')}>
            <Plus className="size-4 mr-2" />
            New Visit Note
          </Button>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Returned</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.returned}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search by patient name, MRN, or clinician..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
              <SelectTrigger>
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="All Disciplines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Disciplines</SelectItem>
                {DISCIPLINES.map((disc) => (
                  <SelectItem key={disc.value} value={disc.value}>
                    {disc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="corrected">Corrected</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visit Notes List */}
      <Card>
        <CardHeader>
          <CardTitle>Visit Notes ({filteredNotes.length})</CardTitle>
          <CardDescription>
            {filteredNotes.length === 0
              ? 'No visit notes found'
              : `Showing ${filteredNotes.length} visit note${filteredNotes.length === 1 ? '' : 's'}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState 
              message={error} 
              action={{
                label: 'Try Again',
                onClick: fetchVisitNotes,
              }}
            />
          ) : filteredNotes.length === 0 ? (
            <EmptyState
              icon={<FileText className="size-12" />}
              title="No visit notes yet"
              description="Create your first visit note to start documenting patient care"
              action={{
                label: 'Create Visit Note',
                onClick: () => navigate('/clinical/visit-notes/new'),
                icon: <Plus className="size-4" />,
              }}
            />
          ) : (
            <div className="space-y-3">
              {filteredNotes.map((note) => {
                const statusInfo = getStatusInfo(note.qaStatus);
                const StatusIcon = statusInfo.icon;
                const discipline = DISCIPLINES.find((d) => d.value === note.discipline);

                return (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/clinical/visit-notes/${note.id}`)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${statusInfo.color} bg-gray-50`}>
                        <StatusIcon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{note.patientName}</h3>
                          <Badge variant="outline" className="text-xs">
                            {note.patientMrn}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {discipline?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Visit: {new Date(note.visitDate).toLocaleDateString()}</span>
                          <span>Clinician: {note.clinicianName}</span>
                          <span>Service: {note.serviceType}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>Modified: {new Date(note.lastModified).toLocaleString()}</span>
                          {note.signedAt && (
                            <span>• Signed: {new Date(note.signedAt).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      <ChevronRight className="size-5 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}