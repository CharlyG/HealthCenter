/**
 * Episode Progress Indicator
 * 
 * Shows the patient's progress within the certification period with visual timeline,
 * key milestones, and alerts for critical dates. Helps staff understand where
 * the patient is within the episode of care.
 */
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Flag,
  RefreshCw,
  Activity,
  FileText,
  UserCheck,
  ArrowRight,
  Milestone,
  PlayCircle,
  StopCircle,
} from 'lucide-react';

export interface EpisodeMilestone {
  id: string;
  type: 'soc' | 'recert' | 'discharge' | 'oasis' | 'poc_update' | 'visit' | 'authorization' | 'custom';
  title: string;
  date: string;
  description?: string;
  status: 'completed' | 'upcoming' | 'overdue';
  isOptional?: boolean;
}

export interface EpisodeProgressData {
  admissionId: string;
  patientName: string;
  admissionDate: string; // Episode start
  certificationEndDate: string; // Episode end
  currentDate?: string; // Defaults to today
  episodeDays: number; // Total days in episode (typically 60)
  recertificationDate?: string; // Next recert date if applicable
  dischargeDate?: string; // Actual discharge if completed
  status: 'active' | 'pending_recert' | 'discharged' | 'expired';
  milestones?: EpisodeMilestone[];
}

interface EpisodeProgressIndicatorProps {
  episode: EpisodeProgressData;
  showMilestones?: boolean;
  compact?: boolean;
  onMilestoneClick?: (milestone: EpisodeMilestone) => void;
}

export function EpisodeProgressIndicator({
  episode,
  showMilestones = true,
  compact = false,
  onMilestoneClick,
}: EpisodeProgressIndicatorProps) {
  const calculations = useMemo(() => {
    const admissionDate = new Date(episode.admissionDate);
    const certEndDate = new Date(episode.certificationEndDate);
    const currentDate = episode.currentDate ? new Date(episode.currentDate) : new Date();
    
    // Calculate days
    const totalDays = Math.ceil(
      (certEndDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysElapsed = Math.min(
      Math.ceil((currentDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24)),
      totalDays
    );
    const daysRemaining = Math.max(totalDays - daysElapsed, 0);
    
    // Calculate percentage
    const progressPercentage = Math.min(Math.round((daysElapsed / totalDays) * 100), 100);
    
    // Determine phase of episode
    let phase: 'early' | 'mid' | 'late' | 'critical' | 'complete';
    if (episode.status === 'discharged') {
      phase = 'complete';
    } else if (daysRemaining <= 7) {
      phase = 'critical';
    } else if (progressPercentage >= 75) {
      phase = 'late';
    } else if (progressPercentage >= 40) {
      phase = 'mid';
    } else {
      phase = 'early';
    }
    
    // Alert status
    const needsRecertification = daysRemaining <= 14 && episode.status === 'active';
    const isExpiringSoon = daysRemaining <= 7 && episode.status === 'active';
    const hasExpired = daysRemaining <= 0 && episode.status !== 'discharged';
    
    return {
      totalDays,
      daysElapsed,
      daysRemaining,
      progressPercentage,
      phase,
      needsRecertification,
      isExpiringSoon,
      hasExpired,
      admissionDate,
      certEndDate,
      currentDate,
    };
  }, [episode]);

  const statusConfig = {
    active: {
      label: 'Active Episode',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: Activity,
    },
    pending_recert: {
      label: 'Pending Recertification',
      color: 'text-amber-700',
      bgColor: 'bg-amber-100',
      icon: RefreshCw,
    },
    discharged: {
      label: 'Discharged',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      icon: CheckCircle2,
    },
    expired: {
      label: 'Episode Expired',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      icon: AlertTriangle,
    },
  };

  const phaseConfig = {
    early: { color: 'bg-blue-500', label: 'Early Episode', textColor: 'text-blue-700' },
    mid: { color: 'bg-green-500', label: 'Mid Episode', textColor: 'text-green-700' },
    late: { color: 'bg-amber-500', label: 'Late Episode', textColor: 'text-amber-700' },
    critical: { color: 'bg-red-500', label: 'Critical Period', textColor: 'text-red-700' },
    complete: { color: 'bg-gray-500', label: 'Complete', textColor: 'text-gray-700' },
  };

  const config = statusConfig[episode.status];
  const StatusIcon = config.icon;
  const phaseInfo = phaseConfig[calculations.phase];

  if (compact) {
    return <CompactEpisodeProgress episode={episode} calculations={calculations} />;
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-6 text-blue-600" />
            Episode Progress
          </CardTitle>
          <Badge className={`${config.bgColor} ${config.color} border-0`}>
            <StatusIcon className="size-3 mr-1.5" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Critical Alerts */}
        {calculations.hasExpired && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="size-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-900 text-sm">Episode Has Expired</p>
              <p className="text-xs text-red-700 mt-1">
                Certification period ended on {calculations.certEndDate.toLocaleDateString()}.
                {episode.status !== 'discharged' && ' Recertification or discharge required immediately.'}
              </p>
            </div>
          </div>
        )}

        {calculations.isExpiringSoon && !calculations.hasExpired && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="size-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-orange-900 text-sm">Episode Ending Soon</p>
              <p className="text-xs text-orange-700 mt-1">
                Only {calculations.daysRemaining} day{calculations.daysRemaining !== 1 ? 's' : ''} remaining
                in certification period. Prepare discharge or recertification documentation now.
              </p>
            </div>
          </div>
        )}

        {calculations.needsRecertification &&
          !calculations.isExpiringSoon &&
          !calculations.hasExpired && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 flex items-start gap-3">
              <Clock className="size-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-yellow-900 text-sm">Recertification Window</p>
                <p className="text-xs text-yellow-700 mt-1">
                  {calculations.daysRemaining} days until certification expires. Begin recertification
                  process if continuing care.
                </p>
              </div>
            </div>
          )}

        {/* Main Progress Visualization */}
        <div className="space-y-4">
          {/* Date Headers */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">Admission Date</p>
                <p className="text-xs text-gray-600">
                  {calculations.admissionDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${phaseInfo.textColor} border-current font-semibold`}
              >
                Day {calculations.daysElapsed} of {calculations.totalDays}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-right">
              <div>
                <p className="font-semibold text-gray-900">Certification End</p>
                <p className="text-xs text-gray-600">
                  {calculations.certEndDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div
                className={`size-3 rounded-full ${
                  calculations.hasExpired ? 'bg-red-600' : 'bg-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Progress Bar with Timeline */}
          <div className="relative">
            {/* Background track */}
            <div className="h-8 bg-gray-200 rounded-full relative overflow-hidden">
              {/* Colored progress fill */}
              <div
                className={`h-full ${phaseInfo.color} transition-all duration-500 ease-out relative`}
                style={{ width: `${calculations.progressPercentage}%` }}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>

              {/* Current position marker */}
              <div
                className="absolute top-0 bottom-0 flex items-center transition-all duration-500"
                style={{ left: `${calculations.progressPercentage}%` }}
              >
                <div className="size-10 bg-white rounded-full border-4 border-blue-600 shadow-lg flex items-center justify-center -ml-5">
                  <Clock className="size-5 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Today's date label */}
            <div
              className="absolute -bottom-8 transform -translate-x-1/2 transition-all duration-500"
              style={{ left: `${calculations.progressPercentage}%` }}
            >
              <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                Today: {calculations.currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 text-center">
              <PlayCircle className="size-6 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-900">{calculations.daysElapsed}</p>
              <p className="text-xs text-gray-700 font-medium">Days Elapsed</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200 text-center">
              <TrendingUp className="size-6 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-900">{calculations.progressPercentage}%</p>
              <p className="text-xs text-gray-700 font-medium">Episode Complete</p>
            </div>

            <div
              className={`rounded-lg p-4 border-2 text-center ${
                calculations.daysRemaining <= 7
                  ? 'bg-red-50 border-red-200'
                  : calculations.daysRemaining <= 14
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <StopCircle
                className={`size-6 mx-auto mb-2 ${
                  calculations.daysRemaining <= 7
                    ? 'text-red-600'
                    : calculations.daysRemaining <= 14
                    ? 'text-amber-600'
                    : 'text-green-600'
                }`}
              />
              <p
                className={`text-3xl font-bold ${
                  calculations.daysRemaining <= 7
                    ? 'text-red-900'
                    : calculations.daysRemaining <= 14
                    ? 'text-amber-900'
                    : 'text-green-900'
                }`}
              >
                {calculations.daysRemaining}
              </p>
              <p className="text-xs text-gray-700 font-medium">Days Remaining</p>
            </div>
          </div>

          {/* Phase Indicator */}
          <div className="flex items-center gap-2 justify-center pt-2">
            <Badge
              variant="outline"
              className={`${phaseInfo.textColor} border-current text-sm font-semibold px-4 py-1.5`}
            >
              <Flag className="size-3.5 mr-2" />
              {phaseInfo.label}
            </Badge>
          </div>
        </div>

        {/* Milestones Timeline */}
        {showMilestones && episode.milestones && episode.milestones.length > 0 && (
          <div className="space-y-3 pt-4 border-t-2">
            <div className="flex items-center gap-2">
              <Milestone className="size-5 text-gray-700" />
              <h4 className="font-semibold text-gray-900">Episode Milestones</h4>
            </div>
            <div className="space-y-2">
              {episode.milestones
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((milestone) => (
                  <MilestoneItem
                    key={milestone.id}
                    milestone={milestone}
                    currentDate={calculations.currentDate}
                    onClick={onMilestoneClick}
                  />
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CompactEpisodeProgressProps {
  episode: EpisodeProgressData;
  calculations: {
    daysElapsed: number;
    daysRemaining: number;
    progressPercentage: number;
    totalDays: number;
    phase: 'early' | 'mid' | 'late' | 'critical' | 'complete';
  };
}

function CompactEpisodeProgress({ episode, calculations }: CompactEpisodeProgressProps) {
  const phaseConfig = {
    early: { color: 'bg-blue-500', textColor: 'text-blue-700' },
    mid: { color: 'bg-green-500', textColor: 'text-green-700' },
    late: { color: 'bg-amber-500', textColor: 'text-amber-700' },
    critical: { color: 'bg-red-500', textColor: 'text-red-700' },
    complete: { color: 'bg-gray-500', textColor: 'text-gray-700' },
  };

  const phaseInfo = phaseConfig[calculations.phase];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">Episode Progress</span>
        <span className={`font-bold ${phaseInfo.textColor}`}>
          Day {calculations.daysElapsed} of {calculations.totalDays}
        </span>
      </div>
      <Progress value={calculations.progressPercentage} className="h-2" />
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{new Date(episode.admissionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span className="font-semibold">{calculations.progressPercentage}% Complete</span>
        <span>{new Date(episode.certificationEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
      {calculations.daysRemaining <= 7 && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertTriangle className="size-3" />
          {calculations.daysRemaining} days remaining
        </div>
      )}
    </div>
  );
}

interface MilestoneItemProps {
  milestone: EpisodeMilestone;
  currentDate: Date;
  onClick?: (milestone: EpisodeMilestone) => void;
}

function MilestoneItem({ milestone, currentDate, onClick }: MilestoneItemProps) {
  const milestoneDate = new Date(milestone.date);
  const isPast = milestoneDate < currentDate;
  const isToday =
    milestoneDate.toDateString() === currentDate.toDateString();

  const typeConfig: Record<
    EpisodeMilestone['type'],
    { icon: React.ComponentType<{ className?: string }>; label: string; color: string }
  > = {
    soc: { icon: PlayCircle, label: 'Start of Care', color: 'text-blue-600' },
    recert: { icon: RefreshCw, label: 'Recertification', color: 'text-purple-600' },
    discharge: { icon: StopCircle, label: 'Discharge', color: 'text-gray-600' },
    oasis: { icon: FileText, label: 'OASIS', color: 'text-teal-600' },
    poc_update: { icon: FileText, label: 'POC Update', color: 'text-amber-600' },
    visit: { icon: Activity, label: 'Visit', color: 'text-green-600' },
    authorization: { icon: UserCheck, label: 'Authorization', color: 'text-cyan-600' },
    custom: { icon: Flag, label: 'Milestone', color: 'text-indigo-600' },
  };

  const config = typeConfig[milestone.type];
  const Icon = config.icon;

  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    upcoming: { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    overdue: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  };

  const statusStyle = statusConfig[milestone.status];
  const StatusIcon = statusStyle.icon;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border-2 ${statusStyle.borderColor} ${statusStyle.bgColor} ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      } ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
      onClick={() => onClick?.(milestone)}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div className={`size-8 rounded-full ${statusStyle.bgColor} border-2 ${statusStyle.borderColor} flex items-center justify-center`}>
          <Icon className={`size-4 ${config.color}`} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm text-gray-900">{milestone.title}</p>
            {milestone.description && (
              <p className="text-xs text-gray-600 mt-0.5">{milestone.description}</p>
            )}
          </div>
          <StatusIcon className={`size-4 ${statusStyle.color} flex-shrink-0`} />
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            {milestoneDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          {isToday && (
            <Badge variant="outline" className="text-[10px] bg-blue-600 text-white border-blue-600">
              Today
            </Badge>
          )}
          {milestone.isOptional && (
            <Badge variant="outline" className="text-[10px]">
              Optional
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// Mock data generator
export function generateMockEpisodeData(admissionId: string): EpisodeProgressData {
  const admissionDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000); // 35 days ago
  const certificationEndDate = new Date(admissionDate.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 day episode

  return {
    admissionId,
    patientName: 'Johnson, Mary',
    admissionDate: admissionDate.toISOString(),
    certificationEndDate: certificationEndDate.toISOString(),
    episodeDays: 60,
    status: 'active',
    milestones: [
      {
        id: 'ms-001',
        type: 'soc',
        title: 'Start of Care Visit',
        description: 'Initial comprehensive assessment and admission',
        date: admissionDate.toISOString(),
        status: 'completed',
      },
      {
        id: 'ms-002',
        type: 'oasis',
        title: 'OASIS-E SOC Assessment',
        description: 'Complete start of care OASIS assessment',
        date: admissionDate.toISOString(),
        status: 'completed',
      },
      {
        id: 'ms-003',
        type: 'poc_update',
        title: '30-Day Plan of Care Review',
        description: 'Review and update plan of care at 30 days',
        date: new Date(admissionDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: 'ms-004',
        type: 'authorization',
        title: 'Authorization Renewal',
        description: 'Renew authorization for continued services',
        date: new Date(admissionDate.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
      },
      {
        id: 'ms-005',
        type: 'recert',
        title: 'Recertification Due',
        description: 'Physician recertification for next 60-day period',
        date: new Date(admissionDate.getTime() + 58 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
      },
      {
        id: 'ms-006',
        type: 'oasis',
        title: 'OASIS Recertification',
        description: 'Complete recertification OASIS assessment',
        date: new Date(admissionDate.getTime() + 58 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
      },
    ],
  };
}
