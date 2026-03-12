/**
 * Physician Orders Module
 * 
 * Comprehensive order management system for home health
 * Supports verbal orders, physician orders, and care plan updates
 * with dual signature tracking and timeline integration
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../components/ui/dialog';
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  Plus,
  Filter,
  Search,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  PenTool,
  Phone,
  ClipboardCheck,
  Stethoscope,
  Eye,
  Edit,
  X,
  ChevronRight,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type OrderType = 'verbal_order' | 'physician_order' | 'care_plan_update';

type SignatureStatus = 'unsigned' | 'clinician_signed' | 'physician_signed' | 'fully_signed';

interface PhysicianOrder {
  id: string;
  orderType: OrderType;
  
  // Basic Info
  orderDate: string;
  orderTime: string;
  effectiveDate: string;
  expirationDate?: string;
  
  // Ordering Physician
  orderingPhysician: string;
  physicianNPI?: string;
  physicianPhone?: string;
  
  // Order Details
  orderDescription: string;
  orderCategory: string;
  priority: 'routine' | 'urgent' | 'stat';
  
  // Verbal Order Specific
  verbalOrderReceivedBy?: string;
  verbalOrderReceivedDate?: string;
  verbalOrderReadBack?: string;
  
  // Care Plan Specific
  carePlanChanges?: string;
  reasonForChange?: string;
  
  // Clinical Details
  diagnosis?: string;
  medicationsAffected?: string[];
  disciplinesAffected?: string[];
  frequencyDuration?: string;
  specialInstructions?: string;
  
  // Signature Tracking
  clinicianSignature?: string;
  clinicianSignatureDate?: string;
  clinicianCredentials?: string;
  
  physicianSignature?: string;
  physicianSignatureDate?: string;
  physicianSignatureMethod?: 'electronic' | 'wet_signature' | 'verbal' | 'fax';
  
  signatureStatus: SignatureStatus;
  
  // Status
  orderStatus: 'active' | 'discontinued' | 'completed' | 'expired' | 'pending';
  discontinuedDate?: string;
  discontinuedReason?: string;
  discontinuedBy?: string;
  
  // Metadata
  patientId: string;
  admissionId: string;
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_PATIENT = {
  id: 'pat-99888',
  name: 'Dorothy Williams',
  mrn: 'MRN-778899',
  admissionId: 'adm-55443',
};

const MOCK_ORDERS: PhysicianOrder[] = [
  {
    id: 'ord-001',
    orderType: 'physician_order',
    orderDate: '2026-03-01',
    orderTime: '10:30',
    effectiveDate: '2026-03-01',
    orderingPhysician: 'Dr. Robert Martinez, MD',
    physicianNPI: '1234567890',
    physicianPhone: '(555) 123-4567',
    orderDescription: 'Skilled nursing visits 3x/week for wound care, medication management, and vital signs monitoring. PT 2x/week for gait training and strengthening.',
    orderCategory: 'home_health_services',
    priority: 'routine',
    diagnosis: 'Stage 3 pressure injury, diabetes mellitus type 2, hypertension',
    disciplinesAffected: ['SN', 'PT'],
    frequencyDuration: 'SN 3x/week, PT 2x/week for 60 days',
    specialInstructions: 'Monitor blood glucose and blood pressure at each visit. Report any signs of wound infection immediately.',
    clinicianSignature: 'Maria Santos, RN, BSN',
    clinicianSignatureDate: '2026-03-01T14:30:00Z',
    clinicianCredentials: 'RN, BSN',
    physicianSignature: 'Dr. Robert Martinez, MD',
    physicianSignatureDate: '2026-03-01T10:30:00Z',
    physicianSignatureMethod: 'electronic',
    signatureStatus: 'fully_signed',
    orderStatus: 'active',
    patientId: 'pat-99888',
    admissionId: 'adm-55443',
    createdBy: 'Maria Santos, RN',
    createdDate: '2026-03-01T10:00:00Z',
  },
  {
    id: 'ord-002',
    orderType: 'verbal_order',
    orderDate: '2026-03-05',
    orderTime: '14:15',
    effectiveDate: '2026-03-05',
    orderingPhysician: 'Dr. Robert Martinez, MD',
    physicianPhone: '(555) 123-4567',
    orderDescription: 'Increase frequency of skilled nursing visits to daily for wound assessment and treatment due to increased drainage and size of pressure injury.',
    orderCategory: 'service_frequency_change',
    priority: 'urgent',
    verbalOrderReceivedBy: 'Maria Santos, RN, BSN',
    verbalOrderReceivedDate: '2026-03-05T14:15:00Z',
    verbalOrderReadBack: 'Increase SN visits to daily for wound care',
    disciplinesAffected: ['SN'],
    frequencyDuration: 'Daily for 2 weeks, then reassess',
    specialInstructions: 'Continue current wound care protocol. Take photos at each visit.',
    clinicianSignature: 'Maria Santos, RN, BSN',
    clinicianSignatureDate: '2026-03-05T14:30:00Z',
    clinicianCredentials: 'RN, BSN',
    signatureStatus: 'clinician_signed',
    orderStatus: 'active',
    patientId: 'pat-99888',
    admissionId: 'adm-55443',
    createdBy: 'Maria Santos, RN',
    createdDate: '2026-03-05T14:15:00Z',
  },
  {
    id: 'ord-003',
    orderType: 'care_plan_update',
    orderDate: '2026-03-08',
    orderTime: '09:00',
    effectiveDate: '2026-03-08',
    orderingPhysician: 'Dr. Robert Martinez, MD',
    physicianNPI: '1234567890',
    orderDescription: 'Add OT services for ADL training and adaptive equipment assessment. Modify PT goals to include transfers and functional mobility.',
    orderCategory: 'care_plan_modification',
    priority: 'routine',
    carePlanChanges: 'Add OT 2x/week for ADL training. Modify PT goals to focus on functional mobility and transfers.',
    reasonForChange: 'Patient showing decreased independence in ADLs. Family requesting additional support for safe transfers.',
    disciplinesAffected: ['OT', 'PT'],
    frequencyDuration: 'OT 2x/week for 30 days',
    clinicianSignature: 'Maria Santos, RN, BSN',
    clinicianSignatureDate: '2026-03-08T11:00:00Z',
    clinicianCredentials: 'RN, BSN',
    physicianSignature: 'Dr. Robert Martinez, MD',
    physicianSignatureDate: '2026-03-08T15:30:00Z',
    physicianSignatureMethod: 'fax',
    signatureStatus: 'fully_signed',
    orderStatus: 'active',
    patientId: 'pat-99888',
    admissionId: 'adm-55443',
    createdBy: 'Maria Santos, RN',
    createdDate: '2026-03-08T09:00:00Z',
  },
  {
    id: 'ord-004',
    orderType: 'physician_order',
    orderDate: '2026-02-15',
    orderTime: '11:00',
    effectiveDate: '2026-02-15',
    expirationDate: '2026-03-01',
    orderingPhysician: 'Dr. Sarah Chen, MD',
    orderDescription: 'Home health aide services 3x/week for personal care assistance.',
    orderCategory: 'home_health_services',
    priority: 'routine',
    disciplinesAffected: ['HHA'],
    clinicianSignature: 'Jennifer Adams, RN',
    clinicianSignatureDate: '2026-02-15T12:00:00Z',
    physicianSignature: 'Dr. Sarah Chen, MD',
    physicianSignatureDate: '2026-02-15T11:00:00Z',
    physicianSignatureMethod: 'electronic',
    signatureStatus: 'fully_signed',
    orderStatus: 'expired',
    patientId: 'pat-99888',
    admissionId: 'adm-55443',
    createdBy: 'Jennifer Adams, RN',
    createdDate: '2026-02-15T10:30:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function PhysicianOrdersModule() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedOrder, setSelectedOrder] = useState<PhysicianOrder | null>(null);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [signatureType, setSignatureType] = useState<'clinician' | 'physician'>('clinician');

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setSelectedView('create');
  };

  const handleViewOrder = (order: PhysicianOrder) => {
    setSelectedOrder(order);
    setSelectedView('detail');
  };

  const handleEditOrder = (order: PhysicianOrder) => {
    setSelectedOrder(order);
    setSelectedView('create');
  };

  const handleBackToList = () => {
    setSelectedView('list');
    setSelectedOrder(null);
  };

  const handleSign = (type: 'clinician' | 'physician') => {
    setSignatureType(type);
    setShowSignDialog(true);
  };

  if (selectedView === 'list') {
    return (
      <OrdersListView
        orders={MOCK_ORDERS}
        onCreateOrder={handleCreateOrder}
        onViewOrder={handleViewOrder}
        onEditOrder={handleEditOrder}
        onSign={handleSign}
        onClose={() => navigate(-1)}
      />
    );
  }

  if (selectedView === 'detail' && selectedOrder) {
    return (
      <OrderDetailView
        order={selectedOrder}
        onBack={handleBackToList}
        onEdit={() => handleEditOrder(selectedOrder)}
        onSign={handleSign}
      />
    );
  }

  if (selectedView === 'create') {
    return (
      <OrderEditor
        order={selectedOrder}
        onClose={handleBackToList}
      />
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDERS LIST VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface OrdersListViewProps {
  orders: PhysicianOrder[];
  onCreateOrder: () => void;
  onViewOrder: (order: PhysicianOrder) => void;
  onEditOrder: (order: PhysicianOrder) => void;
  onSign: (type: 'clinician' | 'physician') => void;
  onClose: () => void;
}

function OrdersListView({ orders, onCreateOrder, onViewOrder, onEditOrder, onSign, onClose }: OrdersListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSignature, setFilterSignature] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!order.orderDescription.toLowerCase().includes(query) &&
            !order.orderingPhysician.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Type filter
      if (filterType !== 'all' && order.orderType !== filterType) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all' && order.orderStatus !== filterStatus) {
        return false;
      }

      // Signature filter
      if (filterSignature !== 'all' && order.signatureStatus !== filterSignature) {
        return false;
      }

      return true;
    });
  }, [orders, searchQuery, filterType, filterStatus, filterSignature]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: orders.length,
      active: orders.filter(o => o.orderStatus === 'active').length,
      needsSignature: orders.filter(o => o.signatureStatus !== 'fully_signed' && o.orderStatus === 'active').length,
      verbalOrders: orders.filter(o => o.orderType === 'verbal_order' && o.signatureStatus === 'clinician_signed').length,
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Physician Orders
                  </h1>
                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300">
                    Orders
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{MOCK_PATIENT.name}</span>
                  <span>•</span>
                  <span>MRN: {MOCK_PATIENT.mrn}</span>
                  <span>•</span>
                  <span>{stats.total} Total Orders</span>
                </div>
              </div>
            </div>

            <Button size="sm" onClick={onCreateOrder}>
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="Total Orders"
              value={stats.total}
              icon={FileText}
              color="blue"
            />
            <StatCard
              label="Active Orders"
              value={stats.active}
              icon={CheckCircle2}
              color="green"
            />
            <StatCard
              label="Need Signature"
              value={stats.needsSignature}
              icon={AlertCircle}
              color="amber"
            />
            <StatCard
              label="Verbal Orders Pending"
              value={stats.verbalOrders}
              icon={Phone}
              color="purple"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Order Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="verbal_order">Verbal Order</SelectItem>
              <SelectItem value="physician_order">Physician Order</SelectItem>
              <SelectItem value="care_plan_update">Care Plan Update</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>

          {/* Signature Filter */}
          <Select value={filterSignature} onValueChange={setFilterSignature}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Signature" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Signatures</SelectItem>
              <SelectItem value="unsigned">Unsigned</SelectItem>
              <SelectItem value="clinician_signed">Clinician Signed</SelectItem>
              <SelectItem value="physician_signed">Physician Signed</SelectItem>
              <SelectItem value="fully_signed">Fully Signed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">
                Active Orders ({orders.filter(o => o.orderStatus === 'active').length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All Orders ({filteredOrders.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                Order History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <div className="space-y-3">
                {filteredOrders
                  .filter(o => o.orderStatus === 'active')
                  .map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onView={() => onViewOrder(order)}
                      onEdit={() => onEditOrder(order)}
                      onSign={onSign}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-3">
                {filteredOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onView={() => onViewOrder(order)}
                    onEdit={() => onEditOrder(order)}
                    onSign={onSign}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="space-y-3">
                {orders
                  .filter(o => o.orderStatus !== 'active')
                  .map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onView={() => onViewOrder(order)}
                      onEdit={() => onEditOrder(order)}
                      onSign={onSign}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER CARD
// ═══════════════════════════════════════════════════════════════════════════

interface OrderCardProps {
  order: PhysicianOrder;
  onView: () => void;
  onEdit: () => void;
  onSign: (type: 'clinician' | 'physician') => void;
}

function OrderCard({ order, onView, onEdit, onSign }: OrderCardProps) {
  const orderTypeConfig = {
    verbal_order: {
      label: 'Verbal Order',
      icon: Phone,
      color: 'bg-purple-100 text-purple-700 border-purple-300',
    },
    physician_order: {
      label: 'Physician Order',
      icon: ClipboardCheck,
      color: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    care_plan_update: {
      label: 'Care Plan Update',
      icon: FileText,
      color: 'bg-green-100 text-green-700 border-green-300',
    },
  };

  const statusConfig = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-300' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    discontinued: { label: 'Discontinued', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    expired: { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-300' },
  };

  const signatureConfig = {
    unsigned: { label: 'Unsigned', icon: AlertCircle, color: 'text-red-600' },
    clinician_signed: { label: 'Clinician Signed', icon: Clock, color: 'text-amber-600' },
    physician_signed: { label: 'Physician Signed', icon: Clock, color: 'text-amber-600' },
    fully_signed: { label: 'Fully Signed', icon: CheckCircle2, color: 'text-green-600' },
  };

  const typeConfig = orderTypeConfig[order.orderType];
  const TypeIcon = typeConfig.icon;
  const signatureInfo = signatureConfig[order.signatureStatus];
  const SignatureIcon = signatureInfo.icon;

  return (
    <Card className="p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn('p-3 rounded-lg', typeConfig.color)}>
          <TypeIcon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn('border', typeConfig.color)}>
                  {typeConfig.label}
                </Badge>
                <Badge className={cn('border', statusConfig[order.orderStatus].color)}>
                  {statusConfig[order.orderStatus].label}
                </Badge>
                {order.priority === 'urgent' && (
                  <Badge className="bg-red-100 text-red-700 border-red-300">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Urgent
                  </Badge>
                )}
                {order.priority === 'stat' && (
                  <Badge className="bg-red-600 text-white">
                    STAT
                  </Badge>
                )}
              </div>
              <p className="text-gray-900 font-medium mb-1">
                {order.orderDescription}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
            <div>
              <span className="text-gray-500">Order Date:</span>
              <div className="font-medium text-gray-900">
                {new Date(order.orderDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Effective:</span>
              <div className="font-medium text-gray-900">
                {new Date(order.effectiveDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Physician:</span>
              <div className="font-medium text-gray-900 truncate">
                {order.orderingPhysician}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Disciplines:</span>
              <div className="font-medium text-gray-900">
                {order.disciplinesAffected?.join(', ') || 'N/A'}
              </div>
            </div>
          </div>

          {/* Signature Status */}
          <div className="flex items-center gap-4 pb-3 mb-3 border-b">
            <div className={cn('flex items-center gap-2', signatureInfo.color)}>
              <SignatureIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{signatureInfo.label}</span>
            </div>

            {order.clinicianSignature && (
              <div className="text-xs text-gray-600">
                <span className="font-medium">Clinician:</span> {order.clinicianSignature}
                <span className="ml-2">
                  ({new Date(order.clinicianSignatureDate!).toLocaleDateString()})
                </span>
              </div>
            )}

            {order.physicianSignature && (
              <div className="text-xs text-gray-600">
                <span className="font-medium">Physician:</span> {order.physicianSignature}
                <span className="ml-2">
                  ({new Date(order.physicianSignatureDate!).toLocaleDateString()})
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onView}>
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>

            {order.orderStatus === 'active' && order.signatureStatus !== 'fully_signed' && (
              <>
                {!order.clinicianSignature && (
                  <Button size="sm" onClick={() => onSign('clinician')}>
                    <PenTool className="w-4 h-4 mr-1" />
                    Sign as Clinician
                  </Button>
                )}
                {order.clinicianSignature && !order.physicianSignature && (
                  <Button size="sm" onClick={() => onSign('physician')}>
                    <PenTool className="w-4 h-4 mr-1" />
                    Sign as Physician
                  </Button>
                )}
              </>
            )}

            {order.orderType === 'verbal_order' && order.signatureStatus === 'clinician_signed' && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                <AlertCircle className="w-3 h-3 mr-1" />
                Pending MD Signature
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface OrderDetailViewProps {
  order: PhysicianOrder;
  onBack: () => void;
  onEdit: () => void;
  onSign: (type: 'clinician' | 'physician') => void;
}

function OrderDetailView({ order, onBack, onEdit, onSign }: OrderDetailViewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Order Details
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{MOCK_PATIENT.name}</span>
                  <span>•</span>
                  <span>Order #{order.id}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              {order.orderStatus === 'active' && (
                <Button size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Order Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
            
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <Label className="text-gray-500">Order Type</Label>
                <div className="font-medium mt-1">
                  {order.orderType === 'verbal_order' && 'Verbal Order'}
                  {order.orderType === 'physician_order' && 'Physician Order'}
                  {order.orderType === 'care_plan_update' && 'Care Plan Update'}
                </div>
              </div>
              <div>
                <Label className="text-gray-500">Order Date</Label>
                <div className="font-medium mt-1">
                  {new Date(order.orderDate).toLocaleDateString()} {order.orderTime}
                </div>
              </div>
              <div>
                <Label className="text-gray-500">Effective Date</Label>
                <div className="font-medium mt-1">
                  {new Date(order.effectiveDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <Label className="text-gray-500">Status</Label>
                <div className="font-medium mt-1">{order.orderStatus}</div>
              </div>
              <div>
                <Label className="text-gray-500">Priority</Label>
                <div className="font-medium mt-1">{order.priority}</div>
              </div>
              {order.expirationDate && (
                <div>
                  <Label className="text-gray-500">Expiration Date</Label>
                  <div className="font-medium mt-1">
                    {new Date(order.expirationDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <Label className="text-gray-500">Order Description</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                {order.orderDescription}
              </div>
            </div>

            {order.specialInstructions && (
              <div>
                <Label className="text-gray-500">Special Instructions</Label>
                <div className="mt-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  {order.specialInstructions}
                </div>
              </div>
            )}
          </Card>

          {/* Physician Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Ordering Physician
            </h2>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <Label className="text-gray-500">Physician Name</Label>
                <div className="font-medium mt-1">{order.orderingPhysician}</div>
              </div>
              {order.physicianNPI && (
                <div>
                  <Label className="text-gray-500">NPI</Label>
                  <div className="font-medium mt-1">{order.physicianNPI}</div>
                </div>
              )}
              {order.physicianPhone && (
                <div>
                  <Label className="text-gray-500">Phone</Label>
                  <div className="font-medium mt-1">{order.physicianPhone}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Verbal Order Details */}
          {order.orderType === 'verbal_order' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Verbal Order Details
              </h2>
              
              <Alert className="mb-4 border-purple-300 bg-purple-50">
                <AlertCircle className="h-4 w-4 text-purple-600" />
                <AlertTitle className="text-purple-800">Verbal Order</AlertTitle>
                <AlertDescription className="text-xs text-purple-700">
                  Verbal orders must be signed by the physician within 30 days per Medicare guidelines.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-500">Received By</Label>
                  <div className="font-medium mt-1">{order.verbalOrderReceivedBy}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Received Date</Label>
                  <div className="font-medium mt-1">
                    {order.verbalOrderReceivedDate && 
                      new Date(order.verbalOrderReceivedDate).toLocaleString()}
                  </div>
                </div>
              </div>

              {order.verbalOrderReadBack && (
                <div className="mt-4">
                  <Label className="text-gray-500">Read Back Verification</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    {order.verbalOrderReadBack}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Signature Status */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              Signature Status
            </h2>
            
            <div className="space-y-4">
              {/* Clinician Signature */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">Clinician Signature</div>
                  {order.clinicianSignature ? (
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{order.clinicianSignature}</span>
                      </div>
                      <div className="text-xs">
                        Signed: {new Date(order.clinicianSignatureDate!).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <Clock className="w-4 h-4" />
                      <span>Pending signature</span>
                    </div>
                  )}
                </div>
                {!order.clinicianSignature && order.orderStatus === 'active' && (
                  <Button size="sm" onClick={() => onSign('clinician')}>
                    <PenTool className="w-4 h-4 mr-1" />
                    Sign
                  </Button>
                )}
              </div>

              {/* Physician Signature */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">Physician Signature</div>
                  {order.physicianSignature ? (
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{order.physicianSignature}</span>
                      </div>
                      <div className="text-xs">
                        Signed: {new Date(order.physicianSignatureDate!).toLocaleString()}
                      </div>
                      <div className="text-xs">
                        Method: {order.physicianSignatureMethod}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <Clock className="w-4 h-4" />
                      <span>Pending signature</span>
                    </div>
                  )}
                </div>
                {!order.physicianSignature && order.clinicianSignature && order.orderStatus === 'active' && (
                  <Button size="sm" onClick={() => onSign('physician')}>
                    <PenTool className="w-4 h-4 mr-1" />
                    Sign
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Clinical Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Details</h2>
            
            <div className="space-y-4">
              {order.diagnosis && (
                <div>
                  <Label className="text-gray-500">Diagnosis</Label>
                  <div className="mt-1">{order.diagnosis}</div>
                </div>
              )}

              {order.disciplinesAffected && order.disciplinesAffected.length > 0 && (
                <div>
                  <Label className="text-gray-500">Disciplines Affected</Label>
                  <div className="flex gap-2 mt-2">
                    {order.disciplinesAffected.map(disc => (
                      <Badge key={disc} variant="outline">{disc}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {order.frequencyDuration && (
                <div>
                  <Label className="text-gray-500">Frequency & Duration</Label>
                  <div className="mt-1">{order.frequencyDuration}</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER EDITOR
// ═══════════════════════════════════════════════════════════════════════════

interface OrderEditorProps {
  order: PhysicianOrder | null;
  onClose: () => void;
}

function OrderEditor({ order, onClose }: OrderEditorProps) {
  const [orderType, setOrderType] = useState<OrderType>(order?.orderType || 'physician_order');
  const [formData, setFormData] = useState({
    orderDate: order?.orderDate || new Date().toISOString().split('T')[0],
    orderTime: order?.orderTime || '09:00',
    effectiveDate: order?.effectiveDate || new Date().toISOString().split('T')[0],
    orderingPhysician: order?.orderingPhysician || '',
    physicianNPI: order?.physicianNPI || '',
    physicianPhone: order?.physicianPhone || '',
    orderDescription: order?.orderDescription || '',
    orderCategory: order?.orderCategory || '',
    priority: order?.priority || 'routine',
    specialInstructions: order?.specialInstructions || '',
    diagnosis: order?.diagnosis || '',
    frequencyDuration: order?.frequencyDuration || '',
  });

  const handleSubmit = () => {
    console.log('Saving order...', { orderType, ...formData });
    alert('Order saved successfully!');
    onClose();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {order ? 'Edit Order' : 'New Order'}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{MOCK_PATIENT.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                <Save className="w-4 h-4 mr-2" />
                Save Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Order Type Selection */}
            <Card className="p-6">
              <Label className="mb-3 block">Order Type *</Label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setOrderType('physician_order')}
                  className={cn(
                    'p-4 border-2 rounded-lg text-left transition-all',
                    orderType === 'physician_order'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <ClipboardCheck className="w-6 h-6 mb-2 text-indigo-600" />
                  <div className="font-semibold">Physician Order</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Written order from physician
                  </div>
                </button>

                <button
                  onClick={() => setOrderType('verbal_order')}
                  className={cn(
                    'p-4 border-2 rounded-lg text-left transition-all',
                    orderType === 'verbal_order'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Phone className="w-6 h-6 mb-2 text-purple-600" />
                  <div className="font-semibold">Verbal Order</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Order received by phone
                  </div>
                </button>

                <button
                  onClick={() => setOrderType('care_plan_update')}
                  className={cn(
                    'p-4 border-2 rounded-lg text-left transition-all',
                    orderType === 'care_plan_update'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <FileText className="w-6 h-6 mb-2 text-green-600" />
                  <div className="font-semibold">Care Plan Update</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Modify existing care plan
                  </div>
                </button>
              </div>
            </Card>

            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Order Date" required>
                  <Input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  />
                </FormField>

                <FormField label="Order Time" required>
                  <Input
                    type="time"
                    value={formData.orderTime}
                    onChange={(e) => setFormData({ ...formData, orderTime: e.target.value })}
                  />
                </FormField>

                <FormField label="Effective Date" required>
                  <Input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  />
                </FormField>

                <FormField label="Priority" required>
                  <Select value={formData.priority} onValueChange={(v: any) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </Card>

            {/* Physician Information */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ordering Physician</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Physician Name" required>
                  <Input
                    value={formData.orderingPhysician}
                    onChange={(e) => setFormData({ ...formData, orderingPhysician: e.target.value })}
                    placeholder="Dr. John Doe, MD"
                  />
                </FormField>

                <FormField label="Physician NPI">
                  <Input
                    value={formData.physicianNPI}
                    onChange={(e) => setFormData({ ...formData, physicianNPI: e.target.value })}
                    placeholder="1234567890"
                  />
                </FormField>

                <FormField label="Physician Phone">
                  <Input
                    value={formData.physicianPhone}
                    onChange={(e) => setFormData({ ...formData, physicianPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </FormField>
              </div>
            </Card>

            {/* Order Description */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Description</h3>
              <FormField label="Order Description" required>
                <Textarea
                  value={formData.orderDescription}
                  onChange={(e) => setFormData({ ...formData, orderDescription: e.target.value })}
                  rows={4}
                  placeholder="Enter detailed order description..."
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField label="Order Category">
                  <Select value={formData.orderCategory} onValueChange={(v) => setFormData({ ...formData, orderCategory: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home_health_services">Home Health Services</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="dme">Durable Medical Equipment</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="service_frequency_change">Service Frequency Change</SelectItem>
                      <SelectItem value="care_plan_modification">Care Plan Modification</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Frequency & Duration">
                  <Input
                    value={formData.frequencyDuration}
                    onChange={(e) => setFormData({ ...formData, frequencyDuration: e.target.value })}
                    placeholder="e.g., 3x/week for 60 days"
                  />
                </FormField>
              </div>
            </Card>

            {/* Clinical Information */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Clinical Information</h3>
              <div className="space-y-4">
                <FormField label="Diagnosis">
                  <Textarea
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    rows={2}
                    placeholder="Primary and secondary diagnoses..."
                  />
                </FormField>

                <FormField label="Special Instructions">
                  <Textarea
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                    rows={3}
                    placeholder="Any special instructions or precautions..."
                  />
                </FormField>
              </div>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className={cn('p-4 rounded-lg border', colorClasses[color])}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">{label}</span>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({ label, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
