/**
 * My Visits - Point of Care Workspace
 * List of visits assigned to the current caregiver
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  CheckCircle,
  AlertCircle,
  Home,
  Phone,
  Activity,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import * as dataGateway from '../lib/dataGateway';
import { formatDate } from '../lib/utils/dateUtils';
import { PageLayout, PageHeader } from '../components/design-system/PageLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

interface Visit {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_address: string;
  patient_phone: string;
  scheduled_date: string;
  scheduled_time: string;
  visit_type: string;
  discipline: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled';
  evv_status?: 'pending' | 'verified' | 'exception';
}

export default function PointOfCareWorkspace() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisits();
  }, [selectedDate, profile]);

  const loadVisits = async () => {
    if (!profile) return;

    try {
      setLoading(true);

      // Get visits for current user
      const visitsData = await dataGateway.evvGateway.getMyVisits(profile.id, selectedDate);

      // Resolve patient info from the patient gateway
      const patientResult = await dataGateway.patientGateway.search({
        pagination: { page: 1, pageSize: 50 },
      });
      const patientMap = new Map(
        patientResult.data.map(p => [p.id, p])
      );

      // Transform to UI format with resolved patient data
      const transformedVisits: Visit[] = visitsData.map(v => {
        const patient = patientMap.get(v.patientId);
        return {
          id: v.id,
          patient_id: v.patientId,
          patient_name: patient
            ? `${patient.firstName} ${patient.lastName}`
            : `Patient ${v.patientId}`,
          patient_address: patient
            ? `${patient.address}, ${patient.city}, ${patient.state} ${patient.zipCode}`
            : 'Address unavailable',
          patient_phone: patient?.phone || 'N/A',
          scheduled_date: v.scheduledDate,
          scheduled_time: v.scheduledTime || '09:00',
          visit_type: v.visitType,
          discipline: v.discipline,
          status: v.status,
          evv_status: v.evvStatus,
        };
      });

      // Sort by scheduled time
      transformedVisits.sort((a, b) => {
        const timeA = a.scheduled_time.split(':').map(Number);
        const timeB = b.scheduled_time.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      });

      setVisits(transformedVisits);
    } catch (error: any) {
      console.error('Error loading visits:', error);
      toast.error('Failed to load visits');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, evvStatus?: string) => {
    if (status === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="size-3 mr-1" />
          Completed
        </Badge>
      );
    }

    if (status === 'in_progress') {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Clock className="size-3 mr-1" />
          In Progress
        </Badge>
      );
    }

    if (status === 'cancelled' || status === 'missed') {
      return (
        <Badge className="bg-red-100 text-red-800">
          <AlertCircle className="size-3 mr-1" />
          {status}
        </Badge>
      );
    }

    return (
      <Badge className="bg-gray-100 text-gray-800">
        Scheduled
      </Badge>
    );
  };

  const getVisitsByStatus = () => {
    const upcoming = visits.filter(v => v.status === 'scheduled');
    const inProgress = visits.filter(v => v.status === 'in_progress');
    const completed = visits.filter(v => v.status === 'completed');

    return { upcoming, inProgress, completed };
  };

  const { upcoming, inProgress, completed } = getVisitsByStatus();

  return (
    <PageLayout>
      <PageHeader
        title="My Visits"
        subtitle="Point of Care - Caregiver Workspace"
        action={
          <div className="flex gap-2">
            {/* Supervisor/Admin Access to Monitor */}
            {(profile?.role === 'admin' || profile?.role === 'supervisor') && (
              <Button 
                variant="outline"
                onClick={() => navigate('/poc/monitor')}
              >
                <Activity className="size-4 mr-2" />
                Monitor Dashboard
              </Button>
            )}
            <Button onClick={() => navigate('/poc/manual-visit')}>
              <Plus className="size-4 mr-2" />
              Add Manual Visit
            </Button>
          </div>
        }
      />

      {/* Date Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 flex-1">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-900">{upcoming.length}</div>
                <div className="text-sm text-blue-600">Upcoming</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-900">{inProgress.length}</div>
                <div className="text-sm text-yellow-600">In Progress</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-900">{completed.length}</div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading visits...
        </div>
      ) : visits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Calendar className="size-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No visits scheduled</p>
            <p className="text-sm">You have no visits assigned for {formatDate(selectedDate)}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/poc/manual-visit')}
            >
              <Plus className="size-4 mr-2" />
              Create Manual Visit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* In Progress Visits */}
          {inProgress.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-900">In Progress</h3>
              <div className="space-y-3">
                {inProgress.map(visit => (
                  <VisitCard key={visit.id} visit={visit} navigate={navigate} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Visits */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Upcoming Visits</h3>
              <div className="space-y-3">
                {upcoming.map(visit => (
                  <VisitCard key={visit.id} visit={visit} navigate={navigate} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Visits */}
          {completed.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-900">Completed</h3>
              <div className="space-y-3">
                {completed.map(visit => (
                  <VisitCard key={visit.id} visit={visit} navigate={navigate} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}

interface VisitCardProps {
  visit: Visit;
  navigate: (path: string) => void;
}

function VisitCard({ visit, navigate }: VisitCardProps) {
  const getStatusBadge = (status: string, evvStatus?: string) => {
    if (status === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="size-3 mr-1" />
          Completed
        </Badge>
      );
    }

    if (status === 'in_progress') {
      return (
        <Badge className="bg-blue-100 text-blue-800 animate-pulse">
          <Clock className="size-3 mr-1" />
          In Progress
        </Badge>
      );
    }

    if (status === 'cancelled' || status === 'missed') {
      return (
        <Badge className="bg-red-100 text-red-800">
          <AlertCircle className="size-3 mr-1" />
          {status}
        </Badge>
      );
    }

    return (
      <Badge className="bg-gray-100 text-gray-800">
        Scheduled
      </Badge>
    );
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/poc/visit/${visit.id}`)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Time Badge */}
          <div className="bg-blue-50 rounded-lg p-3 text-center min-w-[80px]">
            <div className="text-2xl font-bold text-blue-900">
              {visit.scheduled_time}
            </div>
            <div className="text-xs text-blue-600 uppercase">
              {visit.discipline}
            </div>
          </div>

          {/* Visit Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-lg text-gray-900">
                  {visit.patient_name}
                </h4>
                <p className="text-sm text-gray-600">{visit.visit_type}</p>
              </div>
              {getStatusBadge(visit.status, visit.evv_status)}
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Home className="size-4" />
                <span>{visit.patient_address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4" />
                <span>{visit.patient_phone}</span>
              </div>
            </div>

            {visit.evv_status === 'exception' && (
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <AlertCircle className="size-4 inline mr-1" />
                EVV Exception - Requires attention
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-2">
            {visit.status === 'scheduled' && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/visit-preparation/${visit.id}?patientId=${visit.patient_id}`);
                }}
              >
                <ClipboardList className="size-4 mr-2" />
                Prepare
              </Button>
            )}
            <Button
              variant={visit.status === 'in_progress' ? 'default' : 'outline'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/poc/visit/${visit.id}`);
              }}
            >
              {visit.status === 'in_progress' ? 'Continue' : 
               visit.status === 'completed' ? 'View' : 'Start'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}