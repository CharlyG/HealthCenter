/**
 * Care Episode Dashboard
 * 
 * Comprehensive overview of a patient's admission/episode of care.
 * Provides staff with immediate understanding of admission status.
 * 
 * Zones:
 * 1. Episode Status - Key admission metrics
 * 2. Care Team - Assigned team members with quick actions
 * 3. Upcoming Visits - Next scheduled visits
 * 4. Documentation Status - Required documentation progress
 * 5. Authorization Tracker - Authorization limits and usage
 * 6. Alerts - Admission-level alerts
 */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  UserPlus,
  Stethoscope,
  Activity,
  ClipboardCheck,
  AlertTriangle,
  Phone,
  ArrowRight,
  MapPin,
  DollarSign,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface CareEpisodeDashboardProps {
  patientId: string;
  admissionId: string;
}

interface AdmissionContext {
  startDate: string;
  status: 'active' | 'pending' | 'discharge-planned' | 'discharged';
  primaryPayer: string;
  disciplines: string[];
  caseManager: string;
  authorizationStatus: 'approved' | 'pending' | 'expiring-soon' | 'expired';
  certificationPeriod: string;
  episodeProgress: number; // 0-100
}

interface EpisodeMetrics {
  visitsScheduledThisWeek: number;
  visitsCompleted: number;
  visitsMissingDocumentation: number;
  authorizationUsagePercent: number;
  certificationProgressPercent: number;
}

interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  discipline?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  isPrimary?: boolean;
}

interface UpcomingVisit {
  id: string;
  date: string;
  time: string;
  discipline: string;
  caregiver: string;
  caregiverAvatar?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'missed';
  location?: string;
}

interface DocumentationItem {
  type: string;
  label: string;
  completed: number;
  total: number;
  overdue: number;
  status: 'complete' | 'in-progress' | 'overdue' | 'missing';
}

interface AuthorizationInfo {
  totalAuthorized: number;
  completed: number;
  remaining: number;
  expirationDate: string;
  daysUntilExpiration: number;
}

interface AdmissionAlert {
  id: string;
  type: 'critical' | 'high' | 'warning' | 'info';
  category: 'documentation' | 'visit' | 'authorization' | 'evv' | 'clinical';
  title: string;
  description: string;
  timestamp: string;
}

export default function CareEpisodeDashboard({
  patientId,
  admissionId,
}: CareEpisodeDashboardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is properly mounted before rendering heavy content
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data - TODO: Replace with real API calls
  const context: AdmissionContext = useMemo(() => ({
    startDate: '2026-02-08',
    status: 'active' as const,
    primaryPayer: 'Medicare Part A',
    disciplines: ['Skilled Nursing', 'Physical Therapy', 'Occupational Therapy'],
    caseManager: 'Sarah Martinez',
    authorizationStatus: 'approved' as const,
    certificationPeriod: '02/08/26 - 04/08/26 (60 days)',
    episodeProgress: 45,
  }), []);

  const metrics: EpisodeMetrics = useMemo(() => ({
    visitsScheduledThisWeek: 8,
    visitsCompleted: 12,
    visitsMissingDocumentation: 2,
    authorizationUsagePercent: 45,
    certificationProgressPercent: 50,
  }), []);

  const careTeam: CareTeamMember[] = useMemo(() => [
    {
      id: 'ct-1',
      name: 'Jennifer Lee, RN',
      role: 'Primary Nurse',
      discipline: 'Skilled Nursing',
      phone: '(555) 123-4567',
      email: 'jlee@agency.com',
      isPrimary: true,
    },
    {
      id: 'ct-2',
      name: 'Michael Chen, PT',
      role: 'Physical Therapist',
      discipline: 'Physical Therapy',
      phone: '(555) 234-5678',
      email: 'mchen@agency.com',
    },
    {
      id: 'ct-3',
      name: 'Amanda Rodriguez, OT',
      role: 'Occupational Therapist',
      discipline: 'Occupational Therapy',
      phone: '(555) 345-6789',
      email: 'arodriguez@agency.com',
    },
    {
      id: 'ct-4',
      name: 'Sarah Martinez',
      role: 'Case Manager',
      phone: '(555) 456-7890',
      email: 'smartinez@agency.com',
    },
    {
      id: 'ct-5',
      name: 'Dr. James Anderson',
      role: 'Medical Director',
      phone: '(555) 567-8901',
      email: 'janderson@agency.com',
    },
  ], []);

  const upcomingVisits: UpcomingVisit[] = useMemo(() => [
    {
      id: 'v-1',
      date: '2026-03-09',
      time: '10:00 AM',
      discipline: 'Skilled Nursing',
      caregiver: 'Jennifer Lee, RN',
      status: 'scheduled' as const,
      location: 'Patient Home',
    },
    {
      id: 'v-2',
      date: '2026-03-10',
      time: '2:00 PM',
      discipline: 'Physical Therapy',
      caregiver: 'Michael Chen, PT',
      status: 'confirmed' as const,
      location: 'Patient Home',
    },
    {
      id: 'v-3',
      date: '2026-03-11',
      time: '11:00 AM',
      discipline: 'Skilled Nursing',
      caregiver: 'Jennifer Lee, RN',
      status: 'scheduled' as const,
      location: 'Patient Home',
    },
    {
      id: 'v-4',
      date: '2026-03-12',
      time: '3:00 PM',
      discipline: 'Occupational Therapy',
      caregiver: 'Amanda Rodriguez, OT',
      status: 'scheduled' as const,
      location: 'Patient Home',
    },
  ], []);

  const documentation: DocumentationItem[] = useMemo(() => [
    {
      type: 'plan-of-care',
      label: 'Plans of Care',
      completed: 1,
      total: 1,
      overdue: 0,
      status: 'complete' as const,
    },
    {
      type: 'visit-notes',
      label: 'Visit Notes',
      completed: 10,
      total: 12,
      overdue: 2,
      status: 'overdue' as const,
    },
    {
      type: 'orders',
      label: 'Physician Orders',
      completed: 2,
      total: 3,
      overdue: 0,
      status: 'in-progress' as const,
    },
    {
      type: 'assessments',
      label: 'Assessments (OASIS)',
      completed: 1,
      total: 1,
      overdue: 0,
      status: 'complete' as const,
    },
  ], []);

  const authorization: AuthorizationInfo = useMemo(() => ({
    totalAuthorized: 60,
    completed: 27,
    remaining: 33,
    expirationDate: '2026-05-15',
    daysUntilExpiration: 68,
  }), []);

  const alerts: AdmissionAlert[] = useMemo(() => [
    {
      id: 'a-1',
      type: 'high' as const,
      category: 'documentation' as const,
      title: '2 Visit Notes Overdue',
      description: 'Visit notes from 03/05 and 03/07 require documentation',
      timestamp: '2026-03-08T10:30:00Z',
    },
    {
      id: 'a-2',
      type: 'warning' as const,
      category: 'authorization' as const,
      title: 'Authorization 45% Used',
      description: '27 of 60 authorized visits have been completed',
      timestamp: '2026-03-08T09:00:00Z',
    },
    {
      id: 'a-3',
      type: 'info' as const,
      category: 'visit' as const,
      title: 'Visit Scheduled Tomorrow',
      description: 'Skilled nursing visit scheduled for 03/09 at 10:00 AM',
      timestamp: '2026-03-08T08:00:00Z',
    },
  ], []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'discharge-planned':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'discharged':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAuthStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'expiring-soon':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'expired':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getVisitStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDocStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-700';
      case 'in-progress':
        return 'text-blue-700';
      case 'overdue':
        return 'text-red-700';
      case 'missing':
        return 'text-gray-700';
      default:
        return 'text-gray-700';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
      case 'high':
        return <AlertCircle className="size-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="size-5 text-yellow-600" />;
      case 'info':
        return <Activity className="size-5 text-blue-600" />;
      default:
        return <Activity className="size-5 text-gray-600" />;
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admission Context Header */}
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Episode of Care Overview
              </h2>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(context.status)} border capitalize`}>
                  {context.status.replace('-', ' ')}
                </Badge>
                <Badge className={`${getAuthStatusColor(context.authorizationStatus)} border capitalize`}>
                  {context.authorizationStatus.replace('-', ' ')}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLoading(!loading)}>
              <RefreshCw className="size-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Calendar className="size-4" />
                <span>Start Date</span>
              </div>
              <p className="font-semibold text-gray-900">
                {new Date(context.startDate).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <DollarSign className="size-4" />
                <span>Primary Payer</span>
              </div>
              <p className="font-semibold text-gray-900">{context.primaryPayer}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Stethoscope className="size-4" />
                <span>Disciplines</span>
              </div>
              <p className="font-semibold text-gray-900">{context.disciplines.length}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Users className="size-4" />
                <span>Case Manager</span>
              </div>
              <p className="font-semibold text-gray-900">{context.caseManager}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Certification Period: {context.certificationPeriod}</span>
              <span className="font-semibold text-gray-900">{context.episodeProgress}% Complete</span>
            </div>
            <Progress value={context.episodeProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Zone 1: Episode Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5 text-blue-600" />
            Episode Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <Calendar className="size-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-700">{metrics.visitsScheduledThisWeek}</p>
              <p className="text-xs text-blue-700 mt-1">Visits This Week</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle2 className="size-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-700">{metrics.visitsCompleted}</p>
              <p className="text-xs text-green-700 mt-1">Visits Completed</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <FileText className="size-8 text-red-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-700">{metrics.visitsMissingDocumentation}</p>
              <p className="text-xs text-red-700 mt-1">Missing Docs</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <ShieldCheck className="size-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-700">{metrics.authorizationUsagePercent}%</p>
              <p className="text-xs text-purple-700 mt-1">Auth Usage</p>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
              <TrendingUp className="size-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-indigo-700">{metrics.certificationProgressPercent}%</p>
              <p className="text-xs text-indigo-700 mt-1">Cert Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Zone 2: Care Team */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-blue-600" />
                Care Team
              </div>
              <Button variant="ghost" size="sm">
                <UserPlus className="size-4 mr-2" />
                Add Member
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {careTeam.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                        {member.isPrimary && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{member.role}</p>
                      {member.discipline && (
                        <p className="text-xs text-gray-500">{member.discipline}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MessageSquare className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Phone className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Zone 3: Upcoming Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-blue-600" />
                Upcoming Visits
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/patient/${patientId}/chart?section=scheduling&admission=${admissionId}`)}
              >
                View All
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/poc/visit/${visit.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {new Date(visit.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <span className="text-sm text-gray-600">at {visit.time}</span>
                      <Badge className={`${getVisitStatusColor(visit.status)} border text-[10px] h-4 px-1.5 capitalize`}>
                        {visit.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{visit.discipline}</p>
                    <p className="text-xs text-gray-500">{visit.caregiver}</p>
                    {visit.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="size-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{visit.location}</span>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Zone 4: Documentation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-blue-600" />
              Documentation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentation.map((doc) => (
                <div key={doc.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className={`size-4 ${getDocStatusColor(doc.status)}`} />
                      <span className="text-sm font-medium text-gray-900">{doc.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {doc.completed} / {doc.total}
                      </span>
                      {doc.overdue > 0 && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] h-5 px-1.5">
                          {doc.overdue} overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={(doc.completed / doc.total) * 100}
                    className={`h-2 ${doc.overdue > 0 ? '[&>div]:bg-red-500' : ''}`}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => navigate(`/patient/${patientId}/chart?section=clinical-documentation&admission=${admissionId}`)}
              >
                View All Documentation
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Zone 5: Authorization Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-blue-600" />
              Authorization Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{authorization.totalAuthorized}</p>
                  <p className="text-xs text-blue-700 mt-1">Authorized</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{authorization.completed}</p>
                  <p className="text-xs text-green-700 mt-1">Completed</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700">{authorization.remaining}</p>
                  <p className="text-xs text-purple-700 mt-1">Remaining</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Authorization Usage</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round((authorization.completed / authorization.totalAuthorized) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(authorization.completed / authorization.totalAuthorized) * 100}
                  className="h-3"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Clock className="size-4 text-amber-700 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Expires {new Date(authorization.expirationDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      {authorization.daysUntilExpiration} days remaining
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/authorization-tracker?admission=${admissionId}`)}
              >
                View Full Authorization Tracker
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zone 6: Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="size-5 text-red-600" />
            Admission Alerts
            <Badge variant="outline" className="ml-2">
              {alerts.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="size-12 text-green-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900">No Active Alerts</p>
              <p className="text-xs text-gray-600 mt-1">This admission is progressing smoothly</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg ${getAlertColor(alert.type)}`}
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900">{alert.title}</p>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize">
                        {alert.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-700">{alert.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}