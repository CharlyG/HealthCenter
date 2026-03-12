import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  FileSignature,
  Loader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { fetchPlansOfCare } from '../lib/clinicalApi';

// QA Status type
type QAStatus = 'in_progress' | 'completed' | 'returned' | 'corrected' | 'approved';

// POC Types
const POC_TYPES = [
  { value: 'initial', label: 'Initial POC' },
  { value: 'recertification', label: 'Recertification' },
  { value: 'revision', label: 'Revision' },
  { value: 'discharge', label: 'Discharge Summary' },
] as const;

interface Signature {
  role: string;
  name: string;
  signedAt?: string;
  status: 'pending' | 'signed' | 'declined';
}

interface PlanOfCare {
  id: string;
  admissionId: string;
  patientName: string;
  patientMrn: string;
  pocType: string;
  startDate: string;
  endDate: string;
  qaStatus: QAStatus;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  signatures: Signature[];
  requiredSignatures: number;
  completedSignatures: number;
}

// Mock data
const mockPOCs: PlanOfCare[] = [];

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

export default function PlansOfCare() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [plansOfCare, setPlansOfCare] = useState<PlanOfCare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchPlansOfCare();
        setPlansOfCare(data);
      } catch (error) {
        console.error('Error fetching plans of care:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and search
  const filteredPOCs = useMemo(() => {
    return plansOfCare.filter((poc) => {
      const matchesSearch =
        poc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poc.patientMrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poc.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || poc.pocType === typeFilter;
      const matchesStatus = statusFilter === 'all' || poc.qaStatus === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchTerm, typeFilter, statusFilter, plansOfCare]);

  // Stats
  const stats = {
    inProgress: plansOfCare.filter((p) => p.qaStatus === 'in_progress').length,
    pendingSignatures: plansOfCare.filter(
      (p) => p.completedSignatures < p.requiredSignatures
    ).length,
    returned: plansOfCare.filter((p) => p.qaStatus === 'returned').length,
    approved: plansOfCare.filter((p) => p.qaStatus === 'approved').length,
  };

  return (
    <div className="size-full bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/clinical')}>
                ← Back
              </Button>
              <ClipboardList className="size-8 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Plans of Care</h1>
                <p className="text-gray-600">POC creation, updates, and signature tracking</p>
              </div>
            </div>
            <Button onClick={() => navigate('/clinical/plans-of-care/new')}>
              <Plus className="size-4 mr-2" />
              New Plan of Care
            </Button>
          </div>
        </div>

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
              <CardDescription>Pending Signatures</CardDescription>
              <CardTitle className="text-3xl text-amber-600">{stats.pendingSignatures}</CardTitle>
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
                  placeholder="Search by patient name, MRN, or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Filter className="size-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {POC_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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

        {/* POC List */}
        <Card>
          <CardHeader>
            <CardTitle>Plans of Care ({filteredPOCs.length})</CardTitle>
            <CardDescription>
              {filteredPOCs.length === 0
                ? 'No plans of care found'
                : `Showing ${filteredPOCs.length} plan${filteredPOCs.length === 1 ? '' : 's'} of care`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="size-12 mx-auto mb-4 text-gray-400 animate-spin" />
                <p className="text-lg font-medium text-gray-900 mb-2">Loading plans of care</p>
                <p className="text-sm text-gray-500 mb-4">
                  Please wait while we fetch the plans of care
                </p>
              </div>
            ) : filteredPOCs.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="size-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">No plans of care yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Create your first plan of care to begin documentation
                </p>
                <Button onClick={() => navigate('/clinical/plans-of-care/new')}>
                  <Plus className="size-4 mr-2" />
                  Create Plan of Care
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPOCs.map((poc) => {
                  const statusInfo = getStatusInfo(poc.qaStatus);
                  const StatusIcon = statusInfo.icon;
                  const pocType = POC_TYPES.find((t) => t.value === poc.pocType);
                  const signatureProgress = `${poc.completedSignatures}/${poc.requiredSignatures}`;

                  return (
                    <div
                      key={poc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/clinical/plans-of-care/${poc.id}`)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${statusInfo.color} bg-gray-50`}>
                          <StatusIcon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{poc.patientName}</h3>
                            <Badge variant="outline" className="text-xs">
                              {poc.patientMrn}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {pocType?.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              Period: {new Date(poc.startDate).toLocaleDateString()} -{' '}
                              {new Date(poc.endDate).toLocaleDateString()}
                            </span>
                            <span>Created by: {poc.createdBy}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>Modified: {new Date(poc.lastModified).toLocaleString()}</span>
                            <span className="flex items-center gap-1">
                              <FileSignature className="size-3" />
                              Signatures: {signatureProgress}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        {poc.completedSignatures < poc.requiredSignatures && (
                          <Badge variant="outline" className="text-amber-600">
                            Pending Signatures
                          </Badge>
                        )}
                        <ChevronRight className="size-5 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}