/**
 * PatientScheduling Section - Admission-Based
 * 
 * Displays scheduled visits filtered by admission with:
 * - Admission context (start date, payer, disciplines, authorization)
 * - Authorization alerts
 * - Visit creation with auto-association to active admission
 * - Admission information on each visit card
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, User, Shield, FileCheck, CreditCard, Clock, AlertTriangle, Plus, Filter, RefreshCw, CheckCircle2, UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { visitGateway, admissionGateway } from '../../../lib/dataGateway';
import { VisitForm } from '../../scheduling/VisitForm';
import { PredictiveVisitBadges } from '../../scheduling/PredictiveVisitBadges';
import NoAdmissionSelected from './NoAdmissionSelected';

interface PatientSchedulingProps {
  patientId: string;
  admissionId?: string;
}

interface Visit {
  id: string;
  scheduled_date: string;
  scheduled_time?: string;
  status: string;
  discipline?: string;
  caregiver_name?: string;
  visit_type?: string;
  duration?: number;
  admissionId?: string;
}

interface AdmissionInfo {
  id: string;
  startDate: string;
  status: string;
  primaryPayer: string;
  disciplines: string[];
  caseManager: string;
  authorizationStatus: 'active' | 'pending' | 'expired' | 'not_required';
  authorizationDetails?: {
    totalVisits: number;
    usedVisits: number;
    remainingVisits: number;
    expirationDate?: string;
    disciplines: {
      [key: string]: {
        authorized: number;
        used: number;
        remaining: number;
      };
    };
  };
}

// Mock admission data generator
function generateMockAdmission(admissionId: string): AdmissionInfo {
  return {
    id: admissionId,
    startDate: '2026-02-15T00:00:00Z',
    status: 'active',
    primaryPayer: 'Medicare Part A',
    disciplines: ['Nursing', 'Physical Therapy', 'Occupational Therapy'],
    caseManager: 'Jennifer Martinez, RN',
    authorizationStatus: 'active',
    authorizationDetails: {
      totalVisits: 60,
      usedVisits: 42,
      remainingVisits: 18,
      expirationDate: '2026-05-15T00:00:00Z',
      disciplines: {
        Nursing: { authorized: 30, used: 22, remaining: 8 },
        'Physical Therapy': { authorized: 20, used: 15, remaining: 5 },
        'Occupational Therapy': { authorized: 10, used: 5, remaining: 5 },
      },
    },
  };
}

// Mock visits generator
function generateMockVisits(patientId: string, admissionId: string): Visit[] {
  const visits: Visit[] = [];
  const now = new Date();
  const disciplines = ['Nursing', 'Physical Therapy', 'Occupational Therapy', 'Speech Therapy'];
  const caregivers = [
    'Sarah Johnson, RN',
    'Mike Chen, PT',
    'Lisa Davis, OT',
    'John Smith, RN',
    'Emily Brown, PT',
  ];
  const visitTypes = [
    'Initial Evaluation',
    'Skilled Nursing',
    'Wound Care',
    'Medication Management',
    'Physical Therapy',
    'Occupational Therapy',
    'Reassessment',
  ];
  const statuses = ['scheduled', 'confirmed', 'completed', 'in_progress'];

  // Generate upcoming visits (next 14 days)
  for (let i = 0; i < 12; i++) {
    const daysOffset = Math.floor(i / 2);
    const date = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    const discipline = disciplines[i % disciplines.length];
    
    visits.push({
      id: `visit-upcoming-${i}`,
      scheduled_date: date.toISOString().split('T')[0],
      scheduled_time: ['09:00', '10:30', '13:00', '14:30', '16:00'][i % 5],
      status: i < 2 ? 'confirmed' : 'scheduled',
      discipline,
      caregiver_name: caregivers[i % caregivers.length],
      visit_type: visitTypes[i % visitTypes.length],
      duration: 60,
      admissionId,
    });
  }

  // Generate past visits (last 30 days)
  for (let i = 0; i < 25; i++) {
    const date = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000);
    const discipline = disciplines[i % disciplines.length];
    
    visits.push({
      id: `visit-past-${i}`,
      scheduled_date: date.toISOString().split('T')[0],
      scheduled_time: ['09:00', '10:30', '13:00', '14:30'][i % 4],
      status: i % 8 === 0 ? 'missed' : 'completed',
      discipline,
      caregiver_name: caregivers[i % caregivers.length],
      visit_type: visitTypes[i % visitTypes.length],
      duration: 60,
      admissionId,
    });
  }

  return visits;
}

export default function PatientScheduling({ patientId, admissionId }: PatientSchedulingProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [admission, setAdmission] = useState<AdmissionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewVisit, setShowNewVisit] = useState(false);

  useEffect(() => {
    if (admissionId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [admissionId, patientId]);

  const loadData = async () => {
    if (!admissionId) return;

    setLoading(true);
    try {
      // TODO: Replace with real API calls
      // const [visitResult, admissionResult] = await Promise.all([
      //   visitGateway.search({
      //     filters: { patientId, admissionId },
      //     pagination: { page: 1, pageSize: 100 },
      //     sorting: { field: 'scheduled_date', direction: 'asc' },
      //   }),
      //   admissionGateway.getById(admissionId),
      // ]);

      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockVisits = generateMockVisits(patientId, admissionId);
      const mockAdmission = generateMockAdmission(admissionId);
      
      setVisits(mockVisits);
      setAdmission(mockAdmission);
    } catch (err) {
      console.error('[PatientScheduling] Load error:', err);
      toast.error('Failed to load scheduled visits');
      setVisits([]);
      setAdmission(null);
    } finally {
      setLoading(false);
    }
  };

  // Calculate authorization warnings
  const authWarnings = useMemo(() => {
    if (!admission?.authorizationDetails) return null;

    const warnings: { discipline: string; message: string; severity: 'warning' | 'critical' }[] = [];
    
    Object.entries(admission.authorizationDetails.disciplines).forEach(([discipline, auth]) => {
      const percentage = (auth.remaining / auth.authorized) * 100;
      
      if (auth.remaining === 0) {
        warnings.push({
          discipline,
          message: `${discipline}: All ${auth.authorized} authorized visits used`,
          severity: 'critical',
        });
      } else if (percentage <= 20) {
        warnings.push({
          discipline,
          message: `${discipline}: Only ${auth.remaining} of ${auth.authorized} visits remaining`,
          severity: 'warning',
        });
      }
    });

    return warnings.length > 0 ? warnings : null;
  }, [admission]);

  const upcomingVisits = useMemo(() => 
    visits.filter(v => 
      new Date(v.scheduled_date) >= new Date() && 
      (v.status === 'scheduled' || v.status === 'confirmed')
    ),
    [visits]
  );

  const pastVisits = useMemo(() => 
    visits.filter(v => 
      new Date(v.scheduled_date) < new Date() || 
      (v.status !== 'scheduled' && v.status !== 'confirmed')
    ),
    [visits]
  );

  if (!admissionId) {
    return (
      <NoAdmissionSelected 
        message="Select an admission to view its scheduled visits"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <Loader2 className="size-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-600">Loading scheduled visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="size-6 text-gray-600" />
            Scheduling
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Scheduled visits for the selected admission
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={loadData}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowNewVisit(true)}>
            <Plus className="size-4 mr-2" />
            Schedule Visit
          </Button>
        </div>
      </div>

      {/* Admission Context Card */}
      {admission && (
        <Card className="border-2 border-blue-100 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileCheck className="size-4 text-blue-600" />
              Admission Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Admission Info Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-gray-500 font-medium">Start Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(admission.startDate).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-gray-500 font-medium">Primary Payer</p>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="size-3.5 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-900">{admission.primaryPayer}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-gray-500 font-medium">Case Manager</p>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="size-3.5 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-900">{admission.caseManager}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-gray-500 font-medium">Authorization</p>
                <div className="flex items-center gap-1.5">
                  {admission.authorizationStatus === 'active' ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-green-600" />
                      <p className="text-sm font-semibold text-green-700">Active</p>
                    </>
                  ) : admission.authorizationStatus === 'expired' ? (
                    <>
                      <AlertTriangle className="size-3.5 text-red-600" />
                      <p className="text-sm font-semibold text-red-700">Expired</p>
                    </>
                  ) : (
                    <>
                      <Clock className="size-3.5 text-amber-600" />
                      <p className="text-sm font-semibold text-amber-700">Pending</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Disciplines */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase text-gray-500 font-medium">Authorized Disciplines</p>
              <div className="flex flex-wrap gap-1.5">
                {admission.disciplines.map((discipline) => (
                  <Badge key={discipline} variant="outline" className="bg-white text-xs">
                    {discipline}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Authorization Details */}
            {admission.authorizationDetails && (
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-700">Visit Authorization Status</p>
                  {admission.authorizationDetails.expirationDate && (
                    <p className="text-[10px] text-gray-500">
                      Expires: {new Date(admission.authorizationDetails.expirationDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Overall Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Total Visits</span>
                    <span className="font-semibold text-gray-900">
                      {admission.authorizationDetails.usedVisits} / {admission.authorizationDetails.totalVisits}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        (admission.authorizationDetails.usedVisits / admission.authorizationDetails.totalVisits) > 0.8
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min((admission.authorizationDetails.usedVisits / admission.authorizationDetails.totalVisits) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {admission.authorizationDetails.remainingVisits} visits remaining
                  </p>
                </div>

                {/* By Discipline */}
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(admission.authorizationDetails.disciplines).map(([discipline, auth]) => {
                    const percentage = (auth.used / auth.authorized) * 100;
                    const isLow = auth.remaining <= 2;
                    const isCritical = auth.remaining === 0;

                    return (
                      <div key={discipline} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-medium text-gray-700">{discipline}</p>
                          {(isLow || isCritical) && (
                            <AlertTriangle className={`size-3 ${isCritical ? 'text-red-600' : 'text-amber-600'}`} />
                          )}
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-600">
                          {auth.used} / {auth.authorized}
                          <span className={`ml-1 ${isCritical ? 'text-red-600 font-medium' : isLow ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                            ({auth.remaining} left)
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Authorization Warnings */}
      {authWarnings && (
        <div className="space-y-2">
          {authWarnings.map((warning, idx) => (
            <Card
              key={idx}
              className={`border-2 ${
                warning.severity === 'critical'
                  ? 'border-red-200 bg-red-50'
                  : 'border-amber-200 bg-amber-50'
              }`}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <AlertTriangle
                  className={`size-5 flex-shrink-0 ${
                    warning.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      warning.severity === 'critical' ? 'text-red-900' : 'text-amber-900'
                    }`}
                  >
                    Authorization Alert
                  </p>
                  <p
                    className={`text-xs ${
                      warning.severity === 'critical' ? 'text-red-700' : 'text-amber-700'
                    }`}
                  >
                    {warning.message}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className={
                    warning.severity === 'critical'
                      ? 'border-red-300 text-red-700 hover:bg-red-100'
                      : 'border-amber-300 text-amber-700 hover:bg-amber-100'
                  }
                >
                  Request Extension
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{upcomingVisits.length}</p>
            <p className="text-xs text-gray-600 mt-1">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {pastVisits.filter(v => v.status === 'completed').length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {pastVisits.filter(v => v.status === 'missed').length}
            </p>
            <p className="text-xs text-gray-600 mt-1">Missed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{visits.length}</p>
            <p className="text-xs text-gray-600 mt-1">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* No visits */}
      {visits.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <div className="bg-gray-100 rounded-full p-4 inline-flex">
                <Calendar className="size-8 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">No visits scheduled</p>
                <p className="text-xs text-gray-600 mt-1">
                  Schedule your first visit for this admission
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowNewVisit(true)}>
                <Plus className="size-4 mr-2" />
                Schedule Visit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Visits */}
      {upcomingVisits.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="size-4" />
            Upcoming Visits ({upcomingVisits.length})
          </h3>
          {upcomingVisits.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              admission={admission}
              isUpcoming
            />
          ))}
        </div>
      )}

      {/* Past Visits */}
      {pastVisits.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Past Visits ({pastVisits.length})
          </h3>
          {pastVisits.slice(0, 10).map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              admission={admission}
              isUpcoming={false}
            />
          ))}
          {pastVisits.length > 10 && (
            <Button variant="outline" size="sm" className="w-full">
              View All Past Visits ({pastVisits.length - 10} more)
            </Button>
          )}
        </div>
      )}

      {/* New Visit Dialog */}
      <NewVisitDialog
        open={showNewVisit}
        onClose={() => setShowNewVisit(false)}
        patientId={patientId}
        admissionId={admissionId}
        admission={admission}
        onCreated={loadData}
      />
    </div>
  );
}

// Visit Card Component
interface VisitCardProps {
  visit: Visit;
  admission: AdmissionInfo | null;
  isUpcoming: boolean;
}

function VisitCard({ visit, admission, isUpcoming }: VisitCardProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'missed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Check if this visit type is low on authorization
  const authWarning = useMemo(() => {
    if (!admission?.authorizationDetails || !visit.discipline) return null;

    const disciplineAuth = admission.authorizationDetails.disciplines[visit.discipline];
    if (!disciplineAuth) return null;

    if (disciplineAuth.remaining === 0) {
      return { severity: 'critical' as const, message: 'No visits remaining' };
    } else if (disciplineAuth.remaining <= 2) {
      return { severity: 'warning' as const, message: `${disciplineAuth.remaining} visits left` };
    }

    return null;
  }, [admission, visit.discipline]);

  return (
    <Card className={`hover:shadow-md transition-shadow ${isUpcoming ? '' : 'opacity-75'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Date Icon */}
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${isUpcoming ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <Calendar className={`size-5 ${isUpcoming ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Date and Status */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className={`font-medium ${isUpcoming ? 'text-gray-900' : 'text-gray-700'} text-sm`}>
                  {new Date(visit.scheduled_date).toLocaleDateString('en-US', {
                    weekday: isUpcoming ? 'long' : undefined,
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h4>
                {visit.scheduled_time && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    {visit.scheduled_time}
                    {visit.duration && ` • ${visit.duration} min`}
                  </p>
                )}
              </div>
              <Badge className={`${getStatusColor(visit.status)} text-xs border flex-shrink-0 ml-2`}>
                {visit.status}
              </Badge>
            </div>

            {/* Visit Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {visit.discipline && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Shield className="size-3.5" />
                  <div>
                    <p className="text-[10px] text-gray-500">Discipline</p>
                    <p className="font-medium">{visit.discipline}</p>
                  </div>
                </div>
              )}
              {visit.caregiver_name && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <User className="size-3.5" />
                  <div>
                    <p className="text-[10px] text-gray-500">Caregiver</p>
                    <p className="font-medium">{visit.caregiver_name}</p>
                  </div>
                </div>
              )}
              {visit.visit_type && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <FileCheck className="size-3.5" />
                  <div>
                    <p className="text-[10px] text-gray-500">Visit Type</p>
                    <p className="font-medium">{visit.visit_type}</p>
                  </div>
                </div>
              )}
              {admission && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <CreditCard className="size-3.5" />
                  <div>
                    <p className="text-[10px] text-gray-500">Payer</p>
                    <p className="font-medium">{admission.primaryPayer}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Authorization Warning */}
            {authWarning && (
              <div
                className={`flex items-center gap-2 p-2 rounded-md ${
                  authWarning.severity === 'critical'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-amber-50 border border-amber-200'
                }`}
              >
                <AlertTriangle
                  className={`size-3.5 flex-shrink-0 ${
                    authWarning.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                  }`}
                />
                <p
                  className={`text-[10px] font-medium ${
                    authWarning.severity === 'critical' ? 'text-red-700' : 'text-amber-700'
                  }`}
                >
                  Authorization Alert: {authWarning.message}
                </p>
              </div>
            )}

            {/* AI-Powered Predictive Badges */}
            {isUpcoming && (
              <div className="pt-1 border-t border-gray-100">
                <PredictiveVisitBadges
                  visit={{
                    ...visit,
                    patient_id: visit.id.split('-')[0], // Mock patient ID from visit ID
                    patientAcuity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
                    isFirstVisit: visit.visit_type === 'Initial Evaluation',
                    requiresSupervision: false,
                    complexityFactors: visit.visit_type === 'Wound Care' ? ['wound care', 'infection risk'] : [],
                  }}
                  previousVisitLocation={
                    Math.random() > 0.5
                      ? {
                          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
                          lng: -74.006 + (Math.random() - 0.5) * 0.1,
                        }
                      : undefined
                  }
                  currentVisitLocation={{
                    lat: 40.7128 + (Math.random() - 0.5) * 0.1,
                    lng: -74.006 + (Math.random() - 0.5) * 0.1,
                    streetAddress: '123 Main St, New York, NY',
                  }}
                  variant="compact"
                  showLabels={false}
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            {isUpcoming ? 'Edit' : 'View'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// New Visit Dialog Component
interface NewVisitDialogProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  admissionId: string;
  admission: AdmissionInfo | null;
  onCreated: () => void;
}

function NewVisitDialog({ open, onClose, patientId, admissionId, admission, onCreated }: NewVisitDialogProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [discipline, setDiscipline] = useState('');
  const [visitType, setVisitType] = useState('');
  const [caregiver, setCaregiver] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = useCallback(() => {
    setDate('');
    setTime('09:00');
    setDiscipline('');
    setVisitType('');
    setCaregiver('');
    setDuration('60');
    setNotes('');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!date || !discipline || !visitType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      // TODO: Replace with real API call
      // await visitGateway.create({
      //   patientId,
      //   admissionId,
      //   scheduled_date: date,
      //   scheduled_time: time,
      //   discipline,
      //   visit_type: visitType,
      //   caregiver_name: caregiver,
      //   duration: parseInt(duration),
      //   notes,
      //   status: 'scheduled',
      // });

      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Visit scheduled successfully');
      resetForm();
      onCreated();
      onClose();
    } catch (err) {
      console.error('[NewVisitDialog] Error:', err);
      toast.error('Failed to schedule visit');
    } finally {
      setSaving(false);
    }
  }, [date, time, discipline, visitType, caregiver, duration, notes, patientId, admissionId, onCreated, onClose, resetForm]);

  // Check authorization for selected discipline
  const authStatus = useMemo(() => {
    if (!admission?.authorizationDetails || !discipline) return null;

    const disciplineAuth = admission.authorizationDetails.disciplines[discipline];
    if (!disciplineAuth) return null;

    return disciplineAuth;
  }, [admission, discipline]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); resetForm(); } }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5 text-blue-600" />
            Schedule New Visit
          </DialogTitle>
          <DialogDescription>
            This visit will be automatically associated with the active admission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Admission Info Banner */}
          {admission && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
              <p className="font-semibold text-blue-900 mb-1">Admission Context</p>
              <div className="grid grid-cols-2 gap-2 text-blue-700">
                <span>Payer: {admission.primaryPayer}</span>
                <span>Start: {new Date(admission.startDate).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="visit-date" className="text-xs font-medium">Date *</Label>
              <Input
                id="visit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visit-time" className="text-xs font-medium">Time *</Label>
              <Input
                id="visit-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Discipline and Visit Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="discipline" className="text-xs font-medium">Discipline *</Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger id="discipline">
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  {admission?.disciplines.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {authStatus && (
                <p className={`text-[10px] ${authStatus.remaining <= 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                  {authStatus.remaining} of {authStatus.authorized} visits remaining
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visit-type" className="text-xs font-medium">Visit Type *</Label>
              <Select value={visitType} onValueChange={setVisitType}>
                <SelectTrigger id="visit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Initial Evaluation">Initial Evaluation</SelectItem>
                  <SelectItem value="Skilled Nursing">Skilled Nursing</SelectItem>
                  <SelectItem value="Wound Care">Wound Care</SelectItem>
                  <SelectItem value="Medication Management">Medication Management</SelectItem>
                  <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
                  <SelectItem value="Occupational Therapy">Occupational Therapy</SelectItem>
                  <SelectItem value="Reassessment">Reassessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Caregiver and Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="caregiver" className="text-xs font-medium">Caregiver</Label>
              <Input
                id="caregiver"
                placeholder="e.g., Sarah Johnson, RN"
                value={caregiver}
                onChange={(e) => setCaregiver(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration" className="text-xs font-medium">Duration (minutes)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-medium">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes or special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          {/* Authorization Warning */}
          {authStatus && authStatus.remaining === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-600 flex-shrink-0" />
              <div className="text-xs text-red-700">
                <p className="font-semibold">Authorization Exceeded</p>
                <p>All authorized {discipline} visits have been used. This visit will require additional authorization.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); resetForm(); }} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !date || !discipline || !visitType}>
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Scheduling...
              </>
            ) : (
              <>
                <Plus className="size-4 mr-2" />
                Schedule Visit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}