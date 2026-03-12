/**
 * Admission Insurance Tab
 * Support multiple payers with primary/secondary designation
 * Authorization tracking (total + recurrence)
 */
import { useState } from 'react';
import { Plus, CreditCard, FileCheck, Edit2, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../ui/dialog';
import { FormSection, FormFieldGroup } from '../../design-system/FormSection';
import { Progress } from '../../ui/progress';

interface AdmissionInsuranceTabProps {
  admissionId?: string;
}

interface Payer {
  id: string;
  designation: 'primary' | 'secondary' | 'tertiary';
  payer_name: string;
  policy_number: string;
  group_number: string;
  effective_date: string;
  termination_date: string;
  subscriber_name: string;
  subscriber_relationship: string;
  authorization?: Authorization;
}

interface Authorization {
  id: string;
  auth_number: string;
  total_visits: number;
  used_visits: number;
  recurrence_period: 'daily' | 'weekly' | 'monthly' | '60-day' | 'none';
  recurrence_visits: number;
  effective_date: string;
  expiration_date: string;
  status: 'active' | 'pending' | 'expired';
}

export default function AdmissionInsuranceTab({ admissionId }: AdmissionInsuranceTabProps) {
  const [payers, setPayers] = useState<Payer[]>([
    {
      id: '1',
      designation: 'primary',
      payer_name: 'Medicare',
      policy_number: 'MC123456789A',
      group_number: '',
      effective_date: '2024-01-01',
      termination_date: '',
      subscriber_name: 'Smith, John',
      subscriber_relationship: 'self',
      authorization: {
        id: 'auth-1',
        auth_number: 'AUTH-2024-001',
        total_visits: 60,
        used_visits: 12,
        recurrence_period: '60-day',
        recurrence_visits: 60,
        effective_date: '2024-03-01',
        expiration_date: '2024-04-30',
        status: 'active',
      },
    },
    {
      id: '2',
      designation: 'secondary',
      payer_name: 'Blue Cross Blue Shield',
      policy_number: 'BCBS987654321',
      group_number: 'GRP12345',
      effective_date: '2024-01-01',
      termination_date: '',
      subscriber_name: 'Smith, John',
      subscriber_relationship: 'self',
    },
  ]);

  const [editingPayer, setEditingPayer] = useState<Payer | null>(null);
  const [isAddingPayer, setIsAddingPayer] = useState(false);
  const [editingAuth, setEditingAuth] = useState<string | null>(null);

  const handleAddPayer = () => {
    // Open dialog to add new payer
    setIsAddingPayer(true);
  };

  const handleSavePayer = (payer: Payer) => {
    if (payer.id) {
      setPayers(prev => prev.map(p => p.id === payer.id ? payer : p));
    } else {
      setPayers(prev => [...prev, { ...payer, id: `payer-${Date.now()}` }]);
    }
    setIsAddingPayer(false);
    setEditingPayer(null);
    toast.success('Payer saved successfully');
  };

  const handleDeletePayer = (payerId: string) => {
    setPayers(prev => prev.filter(p => p.id !== payerId));
    toast.success('Payer removed');
  };

  const getDesignationColor = (designation: string) => {
    switch (designation) {
      case 'primary':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'secondary':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'tertiary':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAuthStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Insurance & Authorization</h3>
          <p className="text-sm text-gray-600">Manage payers and authorization details</p>
        </div>
        <Button onClick={handleAddPayer}>
          <Plus className="size-4 mr-2" />
          Add Payer
        </Button>
      </div>

      {/* Payers List */}
      {payers.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <CreditCard className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No insurance payers added</p>
              <p className="text-sm mb-4">Add at least a primary payer to continue</p>
              <Button onClick={handleAddPayer}>
                <Plus className="size-4 mr-2" />
                Add First Payer
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payers.map((payer) => (
            <Card key={payer.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="size-5" />
                      {payer.payer_name}
                    </CardTitle>
                    <Badge className={getDesignationColor(payer.designation)}>
                      {payer.designation}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingPayer(payer)}>
                      <Edit2 className="size-4 mr-2" />
                      Edit
                    </Button>
                    {payer.designation !== 'primary' && (
                      <Button variant="outline" size="sm" onClick={() => handleDeletePayer(payer.id)}>
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label className="text-gray-600">Policy Number</Label>
                    <p className="font-medium text-gray-900">{payer.policy_number}</p>
                  </div>
                  {payer.group_number && (
                    <div>
                      <Label className="text-gray-600">Group Number</Label>
                      <p className="font-medium text-gray-900">{payer.group_number}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-600">Effective Date</Label>
                    <p className="font-medium text-gray-900">{payer.effective_date}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Subscriber</Label>
                    <p className="font-medium text-gray-900">
                      {payer.subscriber_name} ({payer.subscriber_relationship})
                    </p>
                  </div>
                </div>

                {/* Authorization */}
                {payer.authorization ? (
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileCheck className="size-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">Authorization</h4>
                        <Badge className={getAuthStatusColor(payer.authorization.status)}>
                          {payer.authorization.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit2 className="size-4 mr-2" />
                        Update Auth
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div>
                        <Label className="text-gray-600">Authorization Number</Label>
                        <p className="font-medium text-gray-900">{payer.authorization.auth_number}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Period</Label>
                        <p className="font-medium text-gray-900">
                          {payer.authorization.effective_date} - {payer.authorization.expiration_date}
                        </p>
                      </div>
                    </div>

                    {/* Total Authorization */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Total Authorization</span>
                        <span className="font-medium text-gray-900">
                          {payer.authorization.used_visits} / {payer.authorization.total_visits} visits used
                        </span>
                      </div>
                      <Progress 
                        value={(payer.authorization.used_visits / payer.authorization.total_visits) * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* Recurrence Authorization */}
                    {payer.authorization.recurrence_period !== 'none' && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileCheck className="size-4 text-blue-700" />
                          <span className="text-sm font-medium text-blue-900">
                            Recurrence: {payer.authorization.recurrence_visits} visits per {payer.authorization.recurrence_period}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700">
                          Authorization automatically renews every {payer.authorization.recurrence_period}
                        </p>
                      </div>
                    )}

                    {/* Expiration Warning */}
                    {(() => {
                      const daysUntilExpiration = Math.ceil(
                        (new Date(payer.authorization.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );
                      if (daysUntilExpiration <= 14 && daysUntilExpiration > 0) {
                        return (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                            <AlertTriangle className="size-4 text-orange-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-orange-900">Authorization expiring soon</p>
                              <p className="text-xs text-orange-700">
                                Expires in {daysUntilExpiration} days. Request renewal to avoid service interruption.
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                ) : (
                  <div className="pt-6 border-t">
                    <div className="text-center py-4 text-gray-500">
                      <FileCheck className="size-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm mb-3">No authorization on file</p>
                      <Button variant="outline" size="sm">
                        <Plus className="size-4 mr-2" />
                        Add Authorization
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Payer Dialog */}
      {/* TODO: Implement full payer dialog with form */}
    </div>
  );
}
