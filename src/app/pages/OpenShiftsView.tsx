/**
 * Open Shifts View
 * Displays visits without assigned caregivers.
 * Connected to openShiftGateway.list(), caregiverGateway.list(), openShiftGateway.notify() — no inline mock data.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, MapPin, User, DollarSign, Bell, CheckCircle, UserPlus, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { PageLayout, PageHeader, PageSection } from '../components/design-system/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  openShiftGateway,
  caregiverGateway,
  type OpenShift,
  type Caregiver,
} from '../lib/dataGateway';

export default function OpenShiftsView() {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');

  const [openShifts, setOpenShifts] = useState<OpenShift[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [shifts, cgs] = await Promise.all([
        openShiftGateway.list(),
        caregiverGateway.list(),
      ]);
      setOpenShifts(shifts);
      setCaregivers(cgs);
    } catch (err: any) {
      console.error('[OpenShiftsView] fetch error:', err);
      setError(err.message || 'Failed to load open shifts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisciplineColor = (discipline: string) => {
    const colors: Record<string, string> = {
      RN: 'bg-blue-100 text-blue-800',
      PT: 'bg-green-100 text-green-800',
      OT: 'bg-purple-100 text-purple-800',
      ST: 'bg-pink-100 text-pink-800',
      MSW: 'bg-orange-100 text-orange-800',
      AIDE: 'bg-gray-100 text-gray-800',
    };
    return colors[discipline] || 'bg-gray-100 text-gray-800';
  };

  const handleNotifyAll = async (shiftId: string) => {
    try {
      setNotifyingId(shiftId);
      // Get all caregivers matching the shift's discipline
      const shift = openShifts.find(s => s.id === shiftId);
      const matchingCaregivers = shift
        ? caregivers.filter(c => c.discipline === shift.discipline || !shift.discipline)
        : caregivers;

      if (matchingCaregivers.length === 0) {
        toast.error('No matching caregivers found to notify');
        return;
      }

      const result = await openShiftGateway.notify(
        shiftId,
        matchingCaregivers.map(c => c.id),
      );

      if (result.success) {
        toast.success(`Notifications sent to ${result.notificationsSent} caregivers`);
        // Update the local count
        setOpenShifts(prev =>
          prev.map(s =>
            s.id === shiftId
              ? { ...s, notificationsSent: s.notificationsSent + result.notificationsSent }
              : s,
          ),
        );
      } else {
        toast.error('Failed to send notifications');
      }
    } catch (err) {
      console.error('[OpenShiftsView] notify error:', err);
      toast.error('Failed to send notifications');
    } finally {
      setNotifyingId(null);
    }
  };

  const handleAssignCaregiver = async (shiftId: string) => {
    // For now, show a toast — full assignment dialog is a future enhancement
    toast.info('Caregiver assignment dialog coming soon');
  };

  const filteredShifts = useMemo(() => {
    return openShifts.filter(shift => {
      if (selectedDiscipline !== 'all' && shift.discipline !== selectedDiscipline) return false;
      if (selectedUrgency !== 'all' && shift.urgency !== selectedUrgency) return false;
      return true;
    });
  }, [openShifts, selectedDiscipline, selectedUrgency]);

  if (loading) {
    return (
      <PageLayout maxWidth="2xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-8 animate-spin text-blue-500" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout maxWidth="2xl">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="size-10 text-red-400 mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="2xl">
      <PageHeader
        icon={<UserPlus className="size-8" />}
        title="Open Shifts"
        subtitle="Unassigned visits available for caregivers to claim"
      />

      {/* Summary Stats */}
      <PageSection>
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Open</p>
                  <p className="text-3xl font-bold text-blue-600">{openShifts.length}</p>
                </div>
                <UserPlus className="size-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Urgency</p>
                  <p className="text-3xl font-bold text-red-600">
                    {openShifts.filter(s => s.urgency === 'high').length}
                  </p>
                </div>
                <Bell className="size-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">RN Needed</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {openShifts.filter(s => s.discipline === 'RN').length}
                  </p>
                </div>
                <User className="size-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">PT Needed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {openShifts.filter(s => s.discipline === 'PT').length}
                  </p>
                </div>
                <User className="size-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      {/* Filters */}
      <PageSection>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Discipline</label>
                <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Disciplines</SelectItem>
                    <SelectItem value="RN">RN</SelectItem>
                    <SelectItem value="PT">PT</SelectItem>
                    <SelectItem value="OT">OT</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                    <SelectItem value="MSW">MSW</SelectItem>
                    <SelectItem value="AIDE">AIDE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Urgency</label>
                <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Urgency Levels</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button className="w-full" onClick={() => {
                  const allIds = caregivers.map(c => c.id);
                  if (allIds.length === 0) {
                    toast.error('No caregivers available to notify');
                    return;
                  }
                  // Notify for each open shift
                  openShifts.forEach(s => handleNotifyAll(s.id));
                }}>
                  <Bell className="size-4 mr-2" />
                  Notify All Caregivers
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Open Shifts List */}
      <PageSection>
        <div className="space-y-4">
          {filteredShifts.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <CheckCircle className="size-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">No open shifts</p>
                  <p className="text-sm">All visits have been assigned to caregivers</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredShifts.map((shift) => (
              <Card key={shift.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">{shift.patientName}</CardTitle>
                      <Badge className={getDisciplineColor(shift.discipline)}>
                        {shift.discipline}
                      </Badge>
                      <Badge className={getUrgencyColor(shift.urgency)}>
                        {shift.urgency} urgency
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleNotifyAll(shift.id)}
                        disabled={notifyingId === shift.id}
                      >
                        {notifyingId === shift.id ? (
                          <Loader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                          <Bell className="size-4 mr-2" />
                        )}
                        Notify ({shift.notificationsSent})
                      </Button>
                      <Button size="sm" onClick={() => handleAssignCaregiver(shift.id)}>
                        <UserPlus className="size-4 mr-2" />
                        Assign Caregiver
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{shift.visitDate}</p>
                          <p className="text-sm text-gray-600">
                            {shift.startTime} - {shift.endTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Location</p>
                      <div className="flex items-start gap-2">
                        <MapPin className="size-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-900">{shift.patientAddress || '—'}</p>
                          <p className="text-sm text-gray-600">{shift.patientPhone || '—'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Billing</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="size-4 text-gray-400" />
                        <p className="font-medium text-gray-900">{shift.billingCode || '—'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Posted</p>
                      <div>
                        <p className="text-sm text-gray-900">{shift.postedBy || '—'}</p>
                        <p className="text-xs text-gray-500">{shift.postedAt || '—'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </PageSection>
    </PageLayout>
  );
}
