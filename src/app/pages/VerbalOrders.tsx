import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  FileSignature,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  UserCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { fetchVerbalOrders } from '../lib/clinicalApi';

// QA Status type
type QAStatus = 'in_progress' | 'completed' | 'returned' | 'corrected' | 'approved';

// Order types
const ORDER_TYPES = [
  { value: 'medication', label: 'Medication Order' },
  { value: 'treatment', label: 'Treatment Order' },
  { value: 'diagnostic', label: 'Diagnostic Test' },
  { value: 'therapy', label: 'Therapy Order' },
  { value: 'equipment', label: 'Equipment Order' },
  { value: 'other', label: 'Other' },
] as const;

interface VerbalOrder {
  id: string;
  admissionId: string;
  patientName: string;
  patientMrn: string;
  orderType: string;
  orderDescription: string;
  orderedBy: string; // Physician name
  receivedBy: string; // Nurse/clinician who received the order
  orderDate: string;
  qaStatus: QAStatus;
  physicianSignedAt?: string;
  nurseSignedAt?: string;
  createdAt: string;
  lastModified: string;
  daysUntilExpiry?: number;
  requiresFollowup: boolean;
}

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

export default function VerbalOrders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [signatureFilter, setSignatureFilter] = useState<string>('all');
  const [orders, setOrders] = useState<VerbalOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await fetchVerbalOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching verbal orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter and search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.patientMrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderDescription.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || order.orderType === typeFilter;
      const matchesStatus = statusFilter === 'all' || order.qaStatus === statusFilter;

      let matchesSignature = true;
      if (signatureFilter === 'pending_physician') {
        matchesSignature = !order.physicianSignedAt;
      } else if (signatureFilter === 'pending_nurse') {
        matchesSignature = !order.nurseSignedAt;
      } else if (signatureFilter === 'fully_signed') {
        matchesSignature = !!order.physicianSignedAt && !!order.nurseSignedAt;
      }

      return matchesSearch && matchesType && matchesStatus && matchesSignature;
    });
  }, [searchTerm, typeFilter, statusFilter, signatureFilter, orders]);

  // Stats
  const stats = {
    pendingPhysician: orders.filter((o) => !o.physicianSignedAt).length,
    pendingNurse: orders.filter((o) => !o.nurseSignedAt).length,
    expiringSoon: orders.filter(
      (o) => o.daysUntilExpiry !== undefined && o.daysUntilExpiry <= 3
    ).length,
    approved: orders.filter((o) => o.qaStatus === 'approved').length,
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
              <FileSignature className="size-8 text-amber-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Verbal Orders</h1>
                <p className="text-gray-600">Track verbal orders and physician signatures</p>
              </div>
            </div>
            <Button onClick={() => navigate('/clinical/verbal-orders/new')}>
              <Plus className="size-4 mr-2" />
              New Verbal Order
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Physician Signature</CardDescription>
              <CardTitle className="text-3xl text-amber-600">{stats.pendingPhysician}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Nurse Signature</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.pendingNurse}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Expiring Soon</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.expiringSoon}</CardTitle>
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
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
                  {ORDER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={signatureFilter} onValueChange={setSignatureFilter}>
                <SelectTrigger>
                  <Filter className="size-4 mr-2" />
                  <SelectValue placeholder="All Signatures" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Signatures</SelectItem>
                  <SelectItem value="pending_physician">Pending Physician</SelectItem>
                  <SelectItem value="pending_nurse">Pending Nurse</SelectItem>
                  <SelectItem value="fully_signed">Fully Signed</SelectItem>
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

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Verbal Orders ({filteredOrders.length})</CardTitle>
            <CardDescription>
              {filteredOrders.length === 0
                ? 'No verbal orders found'
                : `Showing ${filteredOrders.length} verbal order${filteredOrders.length === 1 ? '' : 's'}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="size-12 mx-auto mb-4 text-gray-400 animate-spin" />
                <p className="text-lg font-medium text-gray-900 mb-2">Loading verbal orders</p>
                <p className="text-sm text-gray-500 mb-4">Please wait while we fetch the data</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <FileSignature className="size-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">No verbal orders yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Document verbal orders received from physicians
                </p>
                <Button onClick={() => navigate('/clinical/verbal-orders/new')}>
                  <Plus className="size-4 mr-2" />
                  Create Verbal Order
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.qaStatus);
                  const StatusIcon = statusInfo.icon;
                  const orderType = ORDER_TYPES.find((t) => t.value === order.orderType);
                  const isExpiring = order.daysUntilExpiry !== undefined && order.daysUntilExpiry <= 3;

                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/clinical/verbal-orders/${order.id}`)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${statusInfo.color} bg-gray-50`}>
                          <StatusIcon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{order.patientName}</h3>
                            <Badge variant="outline" className="text-xs">
                              {order.patientMrn}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {orderType?.label}
                            </Badge>
                            {isExpiring && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="size-3 mr-1" />
                                Expires in {order.daysUntilExpiry} days
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-900 mb-1">{order.orderDescription}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Ordered by: {order.orderedBy}</span>
                            <span>Received by: {order.receivedBy}</span>
                            <span>Date: {new Date(order.orderDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <UserCheck className="size-3" />
                              Physician: {order.physicianSignedAt ? '✓ Signed' : 'Pending'}
                            </span>
                            <span className="flex items-center gap-1">
                              <UserCheck className="size-3" />
                              Nurse: {order.nurseSignedAt ? '✓ Signed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        {order.requiresFollowup && (
                          <Badge variant="outline" className="text-amber-600">
                            Follow-up Required
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