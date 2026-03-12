import { useState, useEffect } from 'react';
import * as dataGateway from '../lib/dataGateway';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Plus, CreditCard, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Insurance {
  id: string;
  admission_id: string;
  payer_id: string;
  payer_name?: string;
  priority: number;
  policy_number: string;
  group_number?: string;
  effective_date?: string;
  termination_date?: string;
}

interface Payer {
  id: string;
  name: string;
  type: string;
  allowed_offices?: string[];
}

interface AdmissionInsuranceProps {
  admissionId: string;
}

export default function AdmissionInsurance({ admissionId }: AdmissionInsuranceProps) {
  const { profile } = useAuth();
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);
  const [formData, setFormData] = useState({
    payer_id: '',
    priority: 1,
    policy_number: '',
    group_number: '',
    effective_date: '',
    termination_date: '',
  });

  useEffect(() => {
    loadData();
  }, [admissionId, profile?.org_id]);

  const loadData = async () => {
    if (!profile?.org_id) return;

    try {
      setLoading(true);
      const [insuranceRes, payersRes] = await Promise.all([
        dataGateway.getInsuranceForAdmission(admissionId),
        dataGateway.getPayers(profile.org_id),
      ]);

      setInsurances(insuranceRes.insurances || []);
      setPayers(payersRes.payers || []);
    } catch (error: any) {
      console.error('Error loading insurance data:', error);
      toast.error(error.message || 'Failed to load insurance');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (insurance?: Insurance) => {
    if (insurance) {
      setEditingInsurance(insurance);
      setFormData({
        payer_id: insurance.payer_id,
        priority: insurance.priority,
        policy_number: insurance.policy_number,
        group_number: insurance.group_number || '',
        effective_date: insurance.effective_date || '',
        termination_date: insurance.termination_date || '',
      });
    } else {
      setEditingInsurance(null);
      // Auto-select next priority based on existing insurances
      const nextPriority = insurances.length + 1;
      setFormData({
        payer_id: '',
        priority: nextPriority,
        policy_number: '',
        group_number: '',
        effective_date: '',
        termination_date: '',
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      // Validate: Cannot have two primaries unless payers are different
      const existingPrimaries = insurances.filter(ins => ins.priority === 1);
      if (formData.priority === 1 && existingPrimaries.length > 0 && !editingInsurance) {
        const haveSamePayer = existingPrimaries.some(ins => ins.payer_id === formData.payer_id);
        if (haveSamePayer) {
          toast.error('Cannot have two primary insurances with the same payer');
          return;
        }
        // Allow two different payers as primary (special scenario)
        toast.info('Adding second primary insurance with different payer');
      }

      if (editingInsurance) {
        await dataGateway.updateInsurance(admissionId, editingInsurance.id, formData);
        toast.success('Insurance updated successfully');
      } else {
        await dataGateway.createInsurance(
          admissionId,
          formData.payer_id,
          formData.priority,
          formData.policy_number,
          formData.group_number,
          formData.effective_date,
          formData.termination_date
        );
        toast.success('Insurance added successfully');
      }
      setShowDialog(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving insurance:', error);
      toast.error(error.message || 'Failed to save insurance');
    }
  };

  const handleDelete = async (insuranceId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this insurance?');
    if (!confirmed) return;

    try {
      await dataGateway.deleteInsurance(admissionId, insuranceId);
      toast.success('Insurance deleted successfully');
      loadData();
    } catch (error: any) {
      console.error('Error deleting insurance:', error);
      toast.error(error.message || 'Failed to delete insurance');
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'Primary';
      case 2:
        return 'Secondary';
      case 3:
        return 'Tertiary';
      default:
        return `Priority ${priority}`;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 2:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const hasTwoPrimaries = insurances.filter(ins => ins.priority === 1).length >= 2;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading insurance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Insurance Information</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="size-4 mr-2" />
              Add Insurance
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hasTwoPrimaries && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="size-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">Two Primary Insurances</p>
                <p>This admission has two primary insurances with different payers.</p>
              </div>
            </div>
          )}

          {insurances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No insurance information</p>
              <p className="text-sm">Add insurance coverage for this admission</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insurances
                .sort((a, b) => a.priority - b.priority)
                .map((insurance) => (
                  <div
                    key={insurance.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CreditCard className="size-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {payers.find(p => p.id === insurance.payer_id)?.name || 'Unknown Payer'}
                          </h3>
                          <Badge className={getPriorityColor(insurance.priority)}>
                            {getPriorityLabel(insurance.priority)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Policy Number:</span>
                            <p className="text-gray-900 font-medium font-mono">
                              {insurance.policy_number}
                            </p>
                          </div>
                          {insurance.group_number && (
                            <div>
                              <span className="text-gray-500">Group Number:</span>
                              <p className="text-gray-900 font-medium font-mono">
                                {insurance.group_number}
                              </p>
                            </div>
                          )}
                          {insurance.effective_date && (
                            <div>
                              <span className="text-gray-500">Effective Date:</span>
                              <p className="text-gray-900 font-medium">
                                {formatDate(insurance.effective_date)}
                              </p>
                            </div>
                          )}
                          {insurance.termination_date && (
                            <div>
                              <span className="text-gray-500">Termination Date:</span>
                              <p className="text-gray-900 font-medium text-red-600">
                                {formatDate(insurance.termination_date)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(insurance)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(insurance.id)}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInsurance ? 'Edit Insurance' : 'Add Insurance'}
            </DialogTitle>
            <DialogDescription>
              {editingInsurance
                ? 'Update the insurance details'
                : 'Add insurance coverage for this admission'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payer_id">Payer *</Label>
              <Select
                value={formData.payer_id}
                onValueChange={(val) => setFormData({ ...formData, payer_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent>
                  {payers.map((payer) => (
                    <SelectItem key={payer.id} value={payer.id}>
                      {payer.name} ({payer.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(val) => setFormData({ ...formData, priority: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Primary (1)</SelectItem>
                  <SelectItem value="2">Secondary (2)</SelectItem>
                  <SelectItem value="3">Tertiary (3)</SelectItem>
                  <SelectItem value="4">Quaternary (4)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="policy_number">Policy Number *</Label>
              <Input
                id="policy_number"
                value={formData.policy_number}
                onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="group_number">Group Number</Label>
              <Input
                id="group_number"
                value={formData.group_number}
                onChange={(e) => setFormData({ ...formData, group_number: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="effective_date">Effective Date</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="termination_date">Termination Date</Label>
                <Input
                  id="termination_date"
                  type="date"
                  value={formData.termination_date}
                  onChange={(e) => setFormData({ ...formData, termination_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.payer_id || !formData.policy_number}
            >
              {editingInsurance ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
