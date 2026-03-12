/**
 * Visit Detail - Point of Care
 * Full visit management with EVV features: Clock In/Out, Tasks, Signature
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  Clock, 
  CheckCircle, 
  FileSignature,
  User,
  Home,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import * as dataGateway from '../lib/dataGateway';
import { visitGateway } from '../lib/dataGateway';
import { formatDate } from '../lib/utils/dateUtils';
import { PageLayout, PageHeader } from '../components/design-system/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import SignaturePad from '../components/poc/SignaturePad';
import GPSCapture from '../components/poc/GPSCapture';

interface Visit {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_address: string;
  patient_phone: string;
  admission_id: string;
  scheduled_date: string;
  scheduled_time: string;
  visit_type: string;
  discipline: string;
  status: string;
  evv_status: string;
}

interface VisitTask {
  id: string;
  taskName: string;
  taskCategory: string;
  required: boolean;
  completed: boolean;
  notes?: string;
}

interface VisitEvent {
  id: string;
  eventType: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
}

export default function VisitDetail() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [visit, setVisit] = useState<Visit | null>(null);
  const [tasks, setTasks] = useState<VisitTask[]>([]);
  const [events, setEvents] = useState<VisitEvent[]>([]);
  const [hasGPSConsent, setHasGPSConsent] = useState(false);
  const [loading, setLoading] = useState(true);

  const [clockInData, setClockInData] = useState<{ time: string; gps?: any } | null>(null);
  const [clockOutData, setClockOutData] = useState<{ time: string; gps?: any } | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [visitNotes, setVisitNotes] = useState('');

  useEffect(() => {
    loadVisitData();
  }, [visitId]);

  const loadVisitData = async () => {
    try {
      setLoading(true);

      // Fetch visit from server via visitGateway
      const serverVisit = await visitGateway.getById(visitId || '');
      let visitData: Visit;

      if (serverVisit) {
        visitData = {
          id: serverVisit.id,
          patient_id: serverVisit.patientId,
          patient_name: serverVisit.patientName || 'Unknown Patient',
          patient_address: serverVisit.patientAddress || '',
          patient_phone: '',
          admission_id: serverVisit.admissionId,
          scheduled_date: serverVisit.scheduledDate,
          scheduled_time: serverVisit.scheduledTime || '',
          visit_type: serverVisit.visitType,
          discipline: serverVisit.discipline,
          status: serverVisit.status,
          evv_status: serverVisit.evvStatus || 'pending',
        };
      } else {
        // Fallback — visit not found on server, show empty state
        console.warn('[VisitDetail] Visit not found on server:', visitId);
        setLoading(false);
        return;
      }

      setVisit(visitData);

      // Load tasks
      const tasksData = await dataGateway.evvGateway.getVisitTasks(visitData.id);
      setTasks(tasksData.map(t => ({
        id: t.id,
        taskName: t.taskName,
        taskCategory: t.taskCategory,
        required: t.required,
        completed: t.completed,
        notes: t.notes,
      })));

      // Load events
      const eventsData = await dataGateway.evvGateway.getVisitEvents(visitData.id);
      setEvents(eventsData);

      // Check GPS consent
      const consent = await dataGateway.evvGateway.checkGPSConsent(visitData.patient_id);
      setHasGPSConsent(consent);

      // Check if already clocked in/out
      const clockInEvent = eventsData.find(e => e.eventType === 'clock_in');
      const clockOutEvent = eventsData.find(e => e.eventType === 'clock_out');
      const signatureEvent = eventsData.find(e => e.eventType === 'signature_captured');

      if (clockInEvent) {
        setClockInData({
          time: clockInEvent.timestamp,
          gps: clockInEvent.latitude && clockInEvent.longitude ? {
            latitude: clockInEvent.latitude,
            longitude: clockInEvent.longitude,
          } : null,
        });
      }

      if (clockOutEvent) {
        setClockOutData({
          time: clockOutEvent.timestamp,
          gps: clockOutEvent.latitude && clockOutEvent.longitude ? {
            latitude: clockOutEvent.latitude,
            longitude: clockOutEvent.longitude,
          } : null,
        });
      }

      if (signatureEvent && signatureEvent.data) {
        setSignatureData((signatureEvent.data as any).signatureDataUrl);
      }

    } catch (error: any) {
      console.error('Error loading visit:', error);
      toast.error('Failed to load visit details');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async (latitude?: number, longitude?: number, accuracy?: number) => {
    if (!visit || !profile) return;

    try {
      const event = await dataGateway.evvGateway.clockIn(
        visit.id,
        profile.id,
        latitude,
        longitude,
        accuracy
      );

      setClockInData({
        time: event.timestamp,
        gps: latitude && longitude ? { latitude, longitude, accuracy } : null,
      });

      setVisit({ ...visit, status: 'in_progress' });
      toast.success('Clocked in successfully');
    } catch (error: any) {
      console.error('Clock in error:', error);
      toast.error('Failed to clock in');
    }
  };

  const handleClockOut = async (latitude?: number, longitude?: number, accuracy?: number) => {
    if (!visit || !profile) return;

    // Check if all required tasks are completed
    const incompleteRequiredTasks = tasks.filter(t => t.required && !t.completed);
    if (incompleteRequiredTasks.length > 0) {
      toast.error('Please complete all required tasks before clocking out');
      return;
    }

    // Check if signature is captured
    if (!signatureData) {
      toast.error('Please capture patient signature before clocking out');
      return;
    }

    try {
      const event = await dataGateway.evvGateway.clockOut(
        visit.id,
        profile.id,
        latitude,
        longitude,
        accuracy
      );

      setClockOutData({
        time: event.timestamp,
        gps: latitude && longitude ? { latitude, longitude, accuracy } : null,
      });

      setVisit({ ...visit, status: 'completed', evv_status: 'verified' });
      toast.success('Clocked out successfully - Visit completed!');

      // Navigate back to My Visits after a short delay
      setTimeout(() => {
        navigate('/poc');
      }, 2000);
    } catch (error: any) {
      console.error('Clock out error:', error);
      toast.error('Failed to clock out');
    }
  };

  const handleCompleteTask = async (taskId: string, completed: boolean, notes?: string) => {
    if (!profile) return;

    try {
      if (completed) {
        await dataGateway.evvGateway.completeTask(taskId, profile.id, notes);
        toast.success('Task completed');
      }

      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, completed, notes } : t
      ));
    } catch (error: any) {
      console.error('Complete task error:', error);
      toast.error('Failed to update task');
    }
  };

  const handleSaveSignature = async (dataUrl: string) => {
    if (!visit || !profile) return;

    try {
      await dataGateway.evvGateway.captureSignature(visit.id, profile.id, dataUrl);
      setSignatureData(dataUrl);
      setShowSignaturePad(false);
      toast.success('Signature captured');
    } catch (error: any) {
      console.error('Save signature error:', error);
      toast.error('Failed to save signature');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading visit...</div>
        </div>
      </PageLayout>
    );
  }

  if (!visit) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Visit not found</div>
        </div>
      </PageLayout>
    );
  }

  const isInProgress = visit.status === 'in_progress';
  const isCompleted = visit.status === 'completed';
  const canClockIn = !clockInData && !isCompleted;
  const canClockOut = clockInData && !clockOutData && !isCompleted;

  return (
    <PageLayout>
      <PageHeader
        title="Visit Details"
        subtitle={`${visit.visit_type} - ${visit.discipline}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/poc')}>
            <ArrowLeft className="size-4 mr-1" />
            Back
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Patient Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{visit.patient_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="font-medium">{visit.patient_phone}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Home className="size-3" />
                  Address
                </div>
                <div className="font-medium">{visit.patient_address}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="size-3" />
                  Scheduled
                </div>
                <div className="font-medium">
                  {formatDate(visit.scheduled_date)} at {visit.scheduled_time}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <Badge className={
                  isCompleted ? 'bg-green-100 text-green-800' :
                  isInProgress ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {visit.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clock In/Out Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Visit Time Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Clock In Section */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">Clock In</div>
                {clockInData && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="size-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>

              {clockInData ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Time: {new Date(clockInData.time).toLocaleString()}</div>
                  {clockInData.gps && (
                    <div>Location: {clockInData.gps.latitude.toFixed(6)}, {clockInData.gps.longitude.toFixed(6)}</div>
                  )}
                </div>
              ) : (
                <div>
                  {hasGPSConsent ? (
                    <GPSCapture
                      patientId={visit.patient_id}
                      hasConsent={hasGPSConsent}
                      onCapture={(lat, lng, acc) => handleClockIn(lat, lng, acc)}
                      autoCapture={false}
                    />
                  ) : (
                    <div className="text-sm text-gray-500 mb-3">
                      GPS tracking is not required for this patient
                    </div>
                  )}

                  <Button
                    onClick={() => hasGPSConsent ? 
                      // Trigger GPS capture
                      document.dispatchEvent(new CustomEvent('capture-gps')) :
                      handleClockIn()
                    }
                    disabled={!canClockIn}
                    className="w-full"
                  >
                    <Clock className="size-4 mr-2" />
                    Clock In to Visit
                  </Button>
                </div>
              )}
            </div>

            {/* Clock Out Section */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">Clock Out</div>
                {clockOutData && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="size-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>

              {clockOutData ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Time: {new Date(clockOutData.time).toLocaleString()}</div>
                  {clockOutData.gps && (
                    <div>Location: {clockOutData.gps.latitude.toFixed(6)}, {clockOutData.gps.longitude.toFixed(6)}</div>
                  )}
                </div>
              ) : (
                <div>
                  {!clockInData && (
                    <div className="text-sm text-gray-500 mb-3">
                      Please clock in before clocking out
                    </div>
                  )}

                  {canClockOut && hasGPSConsent && (
                    <GPSCapture
                      patientId={visit.patient_id}
                      hasConsent={hasGPSConsent}
                      onCapture={(lat, lng, acc) => handleClockOut(lat, lng, acc)}
                      autoCapture={false}
                    />
                  )}

                  <Button
                    onClick={() => hasGPSConsent ?
                      // Trigger GPS capture for clock out
                      document.dispatchEvent(new CustomEvent('capture-gps-out')) :
                      handleClockOut()
                    }
                    disabled={!canClockOut}
                    variant={canClockOut ? 'default' : 'outline'}
                    className="w-full"
                  >
                    <Clock className="size-4 mr-2" />
                    Clock Out from Visit
                  </Button>
                </div>
              )}
            </div>

            {isInProgress && (
              <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                Visit in progress. Complete all tasks and capture signature before clocking out.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="size-5" />
              Visit Tasks
              <Badge variant="outline" className="ml-auto">
                {tasks.filter(t => t.completed).length} / {tasks.length} Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => handleCompleteTask(task.id, checked as boolean)}
                    disabled={!isInProgress}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{task.taskName}</span>
                      {task.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {task.taskCategory.replace('_', ' ')}
                      </Badge>
                    </div>
                    {task.completed && task.notes && (
                      <div className="text-sm text-gray-500 mt-1">
                        Notes: {task.notes}
                      </div>
                    )}
                  </div>
                </div>
                
                {isInProgress && !task.completed && (
                  <div className="mt-3 ml-8 space-y-2">
                    <Label htmlFor={`notes-${task.id}`} className="text-xs">Task Notes (Optional)</Label>
                    <Textarea
                      id={`notes-${task.id}`}
                      placeholder="Enter notes about this task..."
                      rows={2}
                      className="text-sm"
                      value={task.notes || ''}
                      onChange={(e) => {
                        setTasks(tasks.map(t =>
                          t.id === task.id ? { ...t, notes: e.target.value } : t
                        ));
                      }}
                    />
                  </div>
                )}
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No tasks assigned for this visit
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signature Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="size-5" />
              Patient Signature
            </CardTitle>
          </CardHeader>
          <CardContent>
            {signatureData ? (
              <div className="space-y-3">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img src={signatureData} alt="Patient signature" className="max-w-full" />
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="size-3 mr-1" />
                  Signature Captured
                </Badge>
              </div>
            ) : (
              <Button
                onClick={() => setShowSignaturePad(true)}
                disabled={!isInProgress}
                variant="outline"
                className="w-full"
              >
                <FileSignature className="size-4 mr-2" />
                Capture Patient Signature
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Visit Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Visit Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter visit notes, observations, or additional information..."
              rows={5}
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              disabled={!isInProgress}
            />
          </CardContent>
        </Card>
      </div>

      {/* Signature Dialog */}
      <Dialog open={showSignaturePad} onOpenChange={setShowSignaturePad}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Capture Patient Signature</DialogTitle>
            <DialogDescription>
              Please sign below to confirm the visit.
            </DialogDescription>
          </DialogHeader>
          <SignaturePad
            onSave={handleSaveSignature}
            onCancel={() => setShowSignaturePad(false)}
          />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}