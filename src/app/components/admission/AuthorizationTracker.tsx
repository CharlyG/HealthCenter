/**
 * Authorization Tracker Component
 * 
 * Visual tracker for authorization limits and usage across patient admissions.
 * Helps staff avoid authorization violations with clear visual indicators and alerts.
 * 
 * Features:
 * - Real-time authorization usage tracking
 * - Visual progress indicators (bars and charts)
 * - Automatic alerts at 80% usage, exceeded, and expiring soon
 * - Authorization history view
 * - Discipline-level breakdown
 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
} from 'lucide-react';

interface AuthorizationTrackerProps {
  patientId: string;
  admissionId: string;
}

interface AuthorizationData {
  id: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  startDate: string;
  endDate: string;
  totalVisits: number;
  completedVisits: number;
  remainingVisits: number;
  usagePercent: number;
  payer: string;
  authorizationNumber: string;
  disciplines: DisciplineAuthorization[];
}

interface DisciplineAuthorization {
  discipline: string;
  authorized: number;
  completed: number;
  remaining: number;
  usagePercent: number;
}

interface AuthorizationAlert {
  type: 'exceeded' | 'warning-80' | 'expiring-soon' | 'expired';
  message: string;
  severity: 'critical' | 'high' | 'warning';
}

interface HistoricalAuthorization {
  id: string;
  period: string;
  totalVisits: number;
  completedVisits: number;
  status: 'completed' | 'expired' | 'cancelled';
  endDate: string;
}

export default function AuthorizationTracker({
  patientId,
  admissionId,
}: AuthorizationTrackerProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [expandedDisciplines, setExpandedDisciplines] = useState(true);

  // Current active authorization - Mock data
  const currentAuth: AuthorizationData = useMemo(() => ({
    id: 'auth-001',
    status: 'active',
    startDate: '2026-02-08',
    endDate: '2026-05-15',
    totalVisits: 60,
    completedVisits: 27,
    remainingVisits: 33,
    usagePercent: 45,
    payer: 'Medicare Part A',
    authorizationNumber: 'AUTH-2026-123456',
    disciplines: [
      {
        discipline: 'Skilled Nursing',
        authorized: 30,
        completed: 14,
        remaining: 16,
        usagePercent: 47,
      },
      {
        discipline: 'Physical Therapy',
        authorized: 20,
        completed: 9,
        remaining: 11,
        usagePercent: 45,
      },
      {
        discipline: 'Occupational Therapy',
        authorized: 10,
        completed: 4,
        remaining: 6,
        usagePercent: 40,
      },
    ],
  }), []);

  // Historical authorizations - Mock data
  const history: HistoricalAuthorization[] = useMemo(() => [
    {
      id: 'auth-000',
      period: '11/08/25 - 02/08/26',
      totalVisits: 60,
      completedVisits: 58,
      status: 'completed',
      endDate: '2026-02-08',
    },
    {
      id: 'auth-prev-1',
      period: '08/08/25 - 11/08/25',
      totalVisits: 60,
      completedVisits: 60,
      status: 'completed',
      endDate: '2025-11-08',
    },
  ], []);

  // Calculate alerts based on current authorization
  const alerts: AuthorizationAlert[] = useMemo(() => {
    const alertList: AuthorizationAlert[] = [];
    
    // Check if exceeded
    if (currentAuth.completedVisits > currentAuth.totalVisits) {
      alertList.push({
        type: 'exceeded',
        message: `Authorization exceeded by ${currentAuth.completedVisits - currentAuth.totalVisits} visits`,
        severity: 'critical',
      });
    }
    
    // Check if 80% or more used
    if (currentAuth.usagePercent >= 80 && currentAuth.completedVisits <= currentAuth.totalVisits) {
      alertList.push({
        type: 'warning-80',
        message: `Authorization is ${currentAuth.usagePercent}% used - consider requesting renewal`,
        severity: currentAuth.usagePercent >= 90 ? 'high' : 'warning',
      });
    }
    
    // Check if expiring soon (within 14 days)
    const daysUntilExpiration = Math.ceil(
      (new Date(currentAuth.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilExpiration <= 14 && daysUntilExpiration > 0) {
      alertList.push({
        type: 'expiring-soon',
        message: `Authorization expires in ${daysUntilExpiration} days`,
        severity: daysUntilExpiration <= 7 ? 'high' : 'warning',
      });
    }
    
    if (daysUntilExpiration <= 0) {
      alertList.push({
        type: 'expired',
        message: 'Authorization has expired',
        severity: 'critical',
      });
    }
    
    return alertList;
  }, [currentAuth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-300 text-red-900';
      case 'high':
        return 'bg-orange-50 border-orange-300 text-orange-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-300 text-yellow-900';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-900';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="size-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="size-5 text-orange-600" />;
      case 'warning':
        return <AlertCircle className="size-5 text-yellow-600" />;
      default:
        return <AlertCircle className="size-5 text-gray-600" />;
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return '[&>div]:bg-red-600';
    if (percent >= 90) return '[&>div]:bg-orange-500';
    if (percent >= 80) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-green-600';
  };

  const daysRemaining = Math.ceil(
    (new Date(currentAuth.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg ${getAlertColor(alert.severity)}`}
            >
              {getAlertIcon(alert.severity)}
              <div className="flex-1">
                <p className="font-semibold text-sm">{alert.message}</p>
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                Take Action
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Current Authorization Card */}
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-6 text-blue-600" />
              Current Authorization
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(currentAuth.status)} border capitalize`}>
                {currentAuth.status}
              </Badge>
              <Button variant="outline" size="sm">
                <RefreshCw className="size-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authorization Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Authorization Period</p>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-gray-500" />
                  <p className="font-semibold text-gray-900">
                    {new Date(currentAuth.startDate).toLocaleDateString()} - {new Date(currentAuth.endDate).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Primary Payer</p>
                <p className="font-semibold text-gray-900">{currentAuth.payer}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Authorization Number</p>
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {currentAuth.authorizationNumber}
                </p>
              </div>
            </div>

            {/* Visit Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <FileText className="size-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">{currentAuth.totalVisits}</p>
                <p className="text-xs text-blue-700 mt-1">Authorized</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle2 className="size-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">{currentAuth.completedVisits}</p>
                <p className="text-xs text-green-700 mt-1">Completed</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <Activity className="size-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-700">{currentAuth.remainingVisits}</p>
                <p className="text-xs text-purple-700 mt-1">Remaining</p>
              </div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Overall Authorization Usage</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{currentAuth.usagePercent}%</span>
            </div>
            <Progress 
              value={currentAuth.usagePercent} 
              className={`h-4 ${getProgressColor(currentAuth.usagePercent)}`}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{currentAuth.completedVisits} of {currentAuth.totalVisits} visits used</span>
              <span>{currentAuth.remainingVisits} visits remaining</span>
            </div>
          </div>

          {/* Visual Usage Chart - Segmented Bar */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Authorization Status</p>
            <div className="flex h-12 rounded-lg overflow-hidden border-2 border-gray-200">
              {/* Completed portion */}
              <div
                className="bg-green-500 flex items-center justify-center text-white font-semibold text-xs"
                style={{ width: `${(currentAuth.completedVisits / currentAuth.totalVisits) * 100}%` }}
              >
                {currentAuth.completedVisits > 0 && currentAuth.usagePercent > 10 && 'Completed'}
              </div>
              {/* Remaining portion */}
              <div
                className="bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-xs"
                style={{ width: `${(currentAuth.remainingVisits / currentAuth.totalVisits) * 100}%` }}
              >
                {currentAuth.remainingVisits > 0 && (100 - currentAuth.usagePercent) > 10 && 'Available'}
              </div>
            </div>
          </div>

          {/* Discipline Breakdown */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setExpandedDisciplines(!expandedDisciplines)}
            >
              <span className="font-semibold text-gray-900">Authorization by Discipline</span>
              {expandedDisciplines ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>

            {expandedDisciplines && (
              <div className="space-y-4 pt-2">
                {currentAuth.disciplines.map((disc) => (
                  <div key={disc.discipline} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-900">{disc.discipline}</span>
                      <span className="text-sm font-bold text-gray-900">{disc.usagePercent}%</span>
                    </div>
                    <Progress 
                      value={disc.usagePercent} 
                      className={`h-3 ${getProgressColor(disc.usagePercent)}`}
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{disc.completed} / {disc.authorized} visits</span>
                      <span>{disc.remaining} remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button variant="default" className="flex-1">
              <FileText className="size-4 mr-2" />
              Request Authorization Extension
            </Button>
            <Button variant="outline" className="flex-1">
              <Eye className="size-4 mr-2" />
              View Authorization Document
            </Button>
            <Button variant="outline">
              <Download className="size-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Authorization History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-gray-600" />
              Authorization History
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide' : 'Show'} History
              {showHistory ? (
                <ChevronUp className="size-4 ml-2" />
              ) : (
                <ChevronDown className="size-4 ml-2" />
              )}
            </Button>
          </div>
        </CardHeader>
        {showHistory && (
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="size-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900">No Previous Authorizations</p>
                <p className="text-xs text-gray-600 mt-1">This is the first authorization for this admission</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((auth) => (
                  <div
                    key={auth.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-sm text-gray-900">{auth.period}</p>
                        <Badge
                          variant="outline"
                          className={`${
                            auth.status === 'completed'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : auth.status === 'expired'
                              ? 'bg-gray-100 text-gray-800 border-gray-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          } capitalize text-[10px]`}
                        >
                          {auth.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>
                          {auth.completedVisits} / {auth.totalVisits} visits completed
                        </span>
                        <span>•</span>
                        <span>Ended {new Date(auth.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2">
                        <Progress
                          value={(auth.completedVisits / auth.totalVisits) * 100}
                          className="h-1.5"
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-4">
                      <Eye className="size-4 mr-2" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Tips and Best Practices */}
      <Card className="border-blue-100 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="size-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-sm text-blue-900">
                Authorization Management Tips
              </p>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Request authorization extension when reaching 75% usage</li>
                <li>Review discipline-specific usage weekly to avoid overages</li>
                <li>Ensure all visits are documented to maintain accurate counts</li>
                <li>Contact payer 2-3 weeks before authorization expiration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
