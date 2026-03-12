/**
 * PatientOrders Section
 * Admission-level orders (verbal orders, physician orders, etc.)
 */
import { useState, useEffect } from 'react';
import { FileText, Plus, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { orderGateway } from '../../../lib/dataGateway';
import NoAdmissionSelected from './NoAdmissionSelected';

interface PatientOrdersProps {
  patientId: string;
  admissionId?: string;
}

interface Order {
  id: string;
  type: string;
  status: string;
  order_date: string;
  ordering_physician?: string;
  description?: string;
  signature_status?: string;
  created_at: string;
}

export default function PatientOrders({ patientId, admissionId }: PatientOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (admissionId) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [admissionId, patientId]);

  const loadOrders = async () => {
    if (!admissionId) return;

    setLoading(true);
    try {
      const result = await orderGateway.search({
        filters: { patientId, admissionId },
        pagination: { page: 1, pageSize: 100 },
        sorting: { field: 'order_date', direction: 'desc' },
      });
      setOrders(result.data || []);
    } catch (err) {
      console.error('[PatientOrders] Load error:', err);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (!admissionId) {
    return (
      <NoAdmissionSelected 
        message="Select an admission to view its orders"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <Loader2 className="size-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'signed':
      case 'completed':
        return <CheckCircle2 className="size-4 text-green-600" />;
      case 'pending':
        return <Clock className="size-4 text-yellow-600" />;
      case 'requires_signature':
        return <AlertCircle className="size-4 text-orange-600" />;
      default:
        return <FileText className="size-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'signed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'requires_signature':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="size-6 text-gray-600" />
            Orders
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Orders for the selected admission
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </Badge>
          <Button size="sm">
            <Plus className="size-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <div className="bg-gray-100 rounded-full p-4 inline-flex">
                <FileText className="size-8 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">No orders found</p>
                <p className="text-xs text-gray-600 mt-1">
                  Create your first order for this admission
                </p>
              </div>
              <Button size="sm" variant="outline">
                <Plus className="size-4 mr-2" />
                Create Order
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {order.type || 'Order'}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {new Date(order.order_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} text-xs ml-auto`}>
                        {order.status}
                      </Badge>
                    </div>
                    {order.ordering_physician && (
                      <p className="text-sm text-gray-600 ml-7">
                        Physician: {order.ordering_physician}
                      </p>
                    )}
                    {order.description && (
                      <p className="text-sm text-gray-700 ml-7">
                        {order.description}
                      </p>
                    )}
                    {order.signature_status && (
                      <p className="text-xs text-gray-600 ml-7">
                        Signature: {order.signature_status}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
