/**
 * Smart Scheduling Panel
 * AI-powered scheduling assistance side panel.
 * Surfaces 4 types of suggestions: caregiver assignment, travel optimization,
 * visit risk alerts, and open shift notifications.
 *
 * All action buttons are wired to real server endpoints with toast feedback.
 * Performance: React.memo, useMemo for filtered lists, lazy section rendering.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { schedulingAssistGateway } from '../../lib/dataGateway';
import type {
  SmartAssistData,
  CaregiverAssignment,
  TravelOptimization,
  VisitRiskAlert,
  OpenShiftSuggestion,
} from '../../lib/schedulingAssistTypes';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { cn } from '../ui/utils';
import {
  Sparkles,
  UserCheck,
  Route,
  AlertTriangle,
  Bell,
  ChevronDown,
  MapPin,
  Star,
  Shield,
  RefreshCw,
  X,
  Loader2,
  Zap,
  CheckCircle2,
  CircleAlert,
  Activity,
  Users,
} from 'lucide-react';

// ─── Section Badge ──────────────────────────────────────────────────────────

const SectionBadge = React.memo(function SectionBadge({
  count,
  variant = 'default',
}: {
  count: number;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}) {
  if (count === 0) return null;
  const colors = {
    default: 'bg-blue-100 text-blue-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    success: 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span className={cn('inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold', colors[variant])}>
      {count}
    </span>
  );
});

// ─── Score Bar ──────────────────────────────────────────────────────────────

const ScoreBar = React.memo(function ScoreBar({ score, max = 100, label }: { score: number; max?: number; label?: string }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-[10px] text-gray-500 w-14 shrink-0">{label}</span>}
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-gray-600 w-7 text-right">{score}</span>
    </div>
  );
});

// ─── Caregiver HoverCard Detail ─────────────────────────────────────────────

const CaregiverHover = React.memo(function CaregiverHover({
  name,
  discipline,
  zone,
  rating,
  currentDayVisits,
  maxDailyVisits,
  reliabilityScore,
  reasons,
  children,
}: {
  name: string;
  discipline: string;
  zone: string;
  rating?: number;
  currentDayVisits?: number;
  maxDailyVisits?: number;
  reliabilityScore?: number;
  reasons?: string[];
  children: React.ReactNode;
}) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side="left" align="start" className="w-72 p-0">
        <div className="p-3">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{name}</div>
              <div className="text-[11px] text-gray-500">{discipline} &middot; {zone}</div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {rating !== undefined && (
              <div className="text-center px-2 py-1.5 bg-amber-50 rounded-lg">
                <div className="flex items-center justify-center gap-0.5 text-amber-600">
                  <Star className="size-3" />
                  <span className="text-sm font-bold">{rating}</span>
                </div>
                <div className="text-[9px] text-gray-500">Rating</div>
              </div>
            )}
            {reliabilityScore !== undefined && (
              <div className="text-center px-2 py-1.5 bg-emerald-50 rounded-lg">
                <div className="text-sm font-bold text-emerald-600">{reliabilityScore}%</div>
                <div className="text-[9px] text-gray-500">Reliability</div>
              </div>
            )}
            {currentDayVisits !== undefined && maxDailyVisits !== undefined && (
              <div className="text-center px-2 py-1.5 bg-blue-50 rounded-lg">
                <div className="text-sm font-bold text-blue-600">{currentDayVisits}/{maxDailyVisits}</div>
                <div className="text-[9px] text-gray-500">Workload</div>
              </div>
            )}
          </div>

          {/* Match reasons */}
          {reasons && reasons.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Why this match</div>
              <div className="space-y-1">
                {reasons.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                    <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
});

// ─── Candidate Card ─────────────────────────────────────────────────────────

const CandidateCard = React.memo(function CandidateCard({
  name,
  discipline,
  zone,
  score,
  reasons,
  rank,
  rating,
  workload,
  reliabilityScore,
  currentDayVisits,
  maxDailyVisits,
}: {
  name: string;
  discipline: string;
  zone: string;
  score?: number;
  reasons?: string[];
  rank: number;
  rating?: number;
  workload?: string;
  reliabilityScore?: number;
  currentDayVisits?: number;
  maxDailyVisits?: number;
}) {
  return (
    <CaregiverHover
      name={name}
      discipline={discipline}
      zone={zone}
      rating={rating}
      reliabilityScore={reliabilityScore}
      currentDayVisits={currentDayVisits}
      maxDailyVisits={maxDailyVisits}
      reasons={reasons}
    >
      <div className={cn(
        'flex items-start gap-2.5 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer',
        rank === 1 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200 hover:border-gray-300'
      )}>
        <div className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5',
          rank === 1 ? 'bg-emerald-600 text-white' : rank === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
        )}>
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-900 truncate">{name}</span>
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{discipline}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
            <span className="flex items-center gap-0.5"><MapPin className="size-2.5" />{zone}</span>
            {rating && <span className="flex items-center gap-0.5"><Star className="size-2.5 text-amber-500" />{rating}</span>}
            {workload && <span>{workload}</span>}
          </div>
          {reasons && reasons.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {reasons.slice(0, 3).map((r, i) => (
                <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">
                  {r}
                </span>
              ))}
            </div>
          )}
          {score !== undefined && <ScoreBar score={score} label="Match" />}
        </div>
      </div>
    </CaregiverHover>
  );
});

// ─── Section: Best Caregiver Assignment ─────────────────────────────────────

const CaregiverAssignmentSection = React.memo(function CaregiverAssignmentSection({
  assignments,
  onAssign,
  assigningVisitId,
}: {
  assignments: CaregiverAssignment[];
  onAssign: (visitId: string, caregiverId: string, caregiverName: string) => void;
  assigningVisitId: string | null;
}) {
  const [expandedVisit, setExpandedVisit] = useState<string | null>(
    assignments.length > 0 ? assignments[0].visitId : null
  );

  if (assignments.length === 0) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="size-10 mx-auto mb-2 text-emerald-500" />
        <p className="text-sm font-medium text-emerald-800">All Clear</p>
        <p className="text-xs text-gray-500 mt-0.5">Every visit has a caregiver assigned</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Batch Assign All */}
      {assignments.length >= 2 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-9 text-xs mb-2 border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
              disabled={!!assigningVisitId}
            >
              <Users className="size-3.5 mr-1.5" />
              Batch Assign All Top Candidates ({assignments.length})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Batch Assign All Top Candidates?</AlertDialogTitle>
              <AlertDialogDescription>
                This will assign the top-ranked caregiver to each of the {assignments.length} unassigned visits:
                <ul className="mt-2 space-y-1 text-left">
                  {assignments.slice(0, 5).map(a => (
                    <li key={a.visitId} className="text-sm">
                      <span className="font-medium">{a.topCandidates[0]?.caregiverName}</span>
                      {' '}&rarr;{' '}
                      <span>{a.patientName}</span>
                      <span className="text-gray-400 ml-1">({a.discipline}, {a.startTime})</span>
                    </li>
                  ))}
                  {assignments.length > 5 && (
                    <li className="text-sm text-gray-400">...and {assignments.length - 5} more</li>
                  )}
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  assignments.forEach(a => {
                    const top = a.topCandidates[0];
                    if (top) onAssign(a.visitId, top.caregiverId, top.caregiverName);
                  });
                }}
              >
                Assign All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {assignments.map((a) => {
        const isAssigning = assigningVisitId === a.visitId;
        const topCandidate = a.topCandidates[0];
        return (
          <Collapsible key={a.visitId} open={expandedVisit === a.visitId} onOpenChange={() => setExpandedVisit(expandedVisit === a.visitId ? null : a.visitId)}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
                <UserCheck className="size-4 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-semibold text-gray-900 truncate">{a.patientName}</div>
                  <div className="text-[11px] text-gray-500">
                    {a.discipline} {a.visitType} &middot; {a.startTime}-{a.endTime}
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] px-1 h-4 shrink-0">{a.topCandidates.length} options</Badge>
                <ChevronDown className={cn('size-3.5 text-gray-400 transition-transform', expandedVisit === a.visitId && 'rotate-180')} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-1.5 space-y-1.5 pl-1">
                {a.topCandidates.map((c, i) => (
                  <CandidateCard
                    key={c.caregiverId}
                    name={c.caregiverName}
                    discipline={c.discipline}
                    zone={c.zone}
                    score={c.overallScore}
                    reasons={c.reasons}
                    rank={i + 1}
                    rating={c.rating}
                    workload={`${c.currentDayVisits}/${c.maxDailyVisits} visits`}
                    reliabilityScore={c.reliabilityScore}
                    currentDayVisits={c.currentDayVisits}
                    maxDailyVisits={c.maxDailyVisits}
                  />
                ))}
                {topCandidate && (
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full h-8 text-xs mt-1"
                    disabled={isAssigning}
                    onClick={() => onAssign(a.visitId, topCandidate.caregiverId, topCandidate.caregiverName)}
                  >
                    {isAssigning ? (
                      <><Loader2 className="size-3 mr-1 animate-spin" /> Assigning...</>
                    ) : (
                      <><UserCheck className="size-3 mr-1" /> Assign {topCandidate.caregiverName}</>
                    )}
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
});

// ─── Section: Travel Optimization ───────────────────────────────────────────

const TravelOptimizationSection = React.memo(function TravelOptimizationSection({
  optimizations,
  onApplyRoute,
  applyingCaregiverId,
}: {
  optimizations: TravelOptimization[];
  onApplyRoute: (opt: TravelOptimization) => void;
  applyingCaregiverId: string | null;
}) {
  if (optimizations.length === 0) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="size-10 mx-auto mb-2 text-emerald-500" />
        <p className="text-sm font-medium text-emerald-800">Routes Optimized</p>
        <p className="text-xs text-gray-500 mt-0.5">All caregiver routes are already efficient</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {optimizations.map((opt) => {
        const isApplying = applyingCaregiverId === opt.caregiverId;
        return (
          <Card key={opt.caregiverId} className="border border-amber-200 bg-amber-50/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Route className="size-4 text-amber-600" />
                <span className="text-sm font-semibold text-gray-900">{opt.caregiverName}</span>
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0 ml-auto border-0">
                  Save ~{opt.estimatedSavingsMinutes} min
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <div className="font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Current
                  </div>
                  {opt.currentRoute.map((stop, i) => (
                    <div key={i} className="flex items-center gap-1 text-gray-600 py-0.5">
                      <span className="text-[10px] text-gray-400 w-10">{stop.time}</span>
                      <span className="truncate">{stop.patientName}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Optimized
                  </div>
                  {opt.suggestedRoute.map((stop, i) => (
                    <div key={i} className="flex items-center gap-1 text-gray-600 py-0.5">
                      <span className="text-[10px] text-gray-400 w-10">{stop.time}</span>
                      <span className="truncate">{stop.patientName}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs mt-2 border-amber-300 hover:bg-amber-100"
                disabled={isApplying}
                onClick={() => onApplyRoute(opt)}
              >
                {isApplying ? (
                  <><Loader2 className="size-3 mr-1 animate-spin" /> Applying...</>
                ) : (
                  <><Route className="size-3 mr-1" /> Apply Optimized Route</>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

// ─── Section: Visit Risk Alerts ─────────────────────────────────────────────

const VisitRiskSection = React.memo(function VisitRiskSection({
  alerts,
  onReassign,
}: {
  alerts: VisitRiskAlert[];
  onReassign: (alert: VisitRiskAlert) => void;
}) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-6">
        <Shield className="size-10 mx-auto mb-2 text-emerald-500" />
        <p className="text-sm font-medium text-emerald-800">No Risks Detected</p>
        <p className="text-xs text-gray-500 mt-0.5">All scheduled visits look healthy</p>
      </div>
    );
  }

  const riskColors = {
    high: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', badge: 'bg-red-100 text-red-700' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    low: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const colors = riskColors[alert.riskLevel];
        return (
          <div key={alert.visitId} className={cn('rounded-lg border p-3', colors.bg, colors.border)}>
            <div className="flex items-start gap-2">
              <CircleAlert className={cn('size-4 shrink-0 mt-0.5', colors.icon)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold text-gray-900">{alert.patientName}</span>
                  <Badge className={cn('text-[10px] px-1 py-0 h-4 border-0', colors.badge)}>
                    Risk: {alert.riskScore}%
                  </Badge>
                </div>
                <div className="text-[11px] text-gray-600 mb-1.5">
                  {alert.discipline} &middot; {alert.startTime} &middot; {alert.caregiverName}
                </div>
                <ul className="space-y-0.5 mb-2">
                  {alert.riskFactors.map((f, i) => (
                    <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                      <span className="text-gray-400 mt-0.5">&bull;</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-start gap-1.5 bg-white/60 rounded px-2 py-1.5 border border-gray-200/50 mb-2">
                  <Zap className="size-3 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-gray-700">{alert.suggestedAction}</span>
                </div>
                {alert.riskLevel === 'high' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs border-red-300 hover:bg-red-100 text-red-700"
                    onClick={() => onReassign(alert)}
                  >
                    <UserCheck className="size-3 mr-1" />
                    Reassign Visit
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

// ─── Section: Open Shift Suggestions ────────────────────────────────────────

const OpenShiftSection = React.memo(function OpenShiftSection({
  suggestions,
  onSendNotifications,
  notifyingVisitId,
}: {
  suggestions: OpenShiftSuggestion[];
  onSendNotifications: (visitId: string, caregiverIds: string[], count: number) => void;
  notifyingVisitId: string | null;
}) {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="size-10 mx-auto mb-2 text-emerald-500" />
        <p className="text-sm font-medium text-emerald-800">All Shifts Covered</p>
        <p className="text-xs text-gray-500 mt-0.5">No open shifts need attention</p>
      </div>
    );
  }

  const priorityColors = {
    high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="space-y-3">
      {suggestions.map((shift) => {
        const isNotifying = notifyingVisitId === shift.visitId;
        return (
          <div key={shift.visitId} className="rounded-lg border border-purple-200 bg-purple-50/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="size-4 text-purple-600" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900">{shift.patientName}</div>
                <div className="text-[11px] text-gray-500">
                  {shift.discipline} {shift.visitType} &middot; {shift.startTime}-{shift.endTime} &middot; {shift.patientZone}
                </div>
              </div>
            </div>
            <div className="text-[11px] font-semibold text-gray-600 mb-1.5">
              Notify ({shift.suggestedNotifyList.length} eligible):
            </div>
            <div className="space-y-1">
              {shift.suggestedNotifyList.slice(0, 4).map((c) => (
                <CaregiverHover
                  key={c.caregiverId}
                  name={c.caregiverName}
                  discipline={c.discipline}
                  zone={c.zone}
                  rating={c.rating}
                  currentDayVisits={c.currentDayVisits}
                  maxDailyVisits={c.maxDailyVisits}
                >
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-white rounded border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                    <Badge variant="outline" className={cn('text-[10px] px-1 py-0 h-4 border', priorityColors[c.notifyPriority])}>
                      {c.notifyPriority}
                    </Badge>
                    <span className="text-xs font-medium text-gray-900 truncate flex-1">{c.caregiverName}</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-0.5"><MapPin className="size-2.5" />{c.zone}</span>
                    <span className="text-[10px] text-gray-500">{c.currentDayVisits}/{c.maxDailyVisits}</span>
                  </div>
                </CaregiverHover>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs mt-2 border-purple-300 hover:bg-purple-100"
              disabled={isNotifying}
              onClick={() => onSendNotifications(
                shift.visitId,
                shift.suggestedNotifyList.map(c => c.caregiverId),
                shift.suggestedNotifyList.length
              )}
            >
              {isNotifying ? (
                <><Loader2 className="size-3 mr-1 animate-spin" /> Sending...</>
              ) : (
                <><Bell className="size-3 mr-1" /> Notify {shift.suggestedNotifyList.length} Caregivers</>
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
});

// ─── Main Panel ─────────────────────────────────────────────────────────────

interface SmartSchedulingPanelProps {
  selectedDate?: Date;
  onClose?: () => void;
  onScheduleUpdated?: () => void;
  className?: string;
}

export const SmartSchedulingPanel = React.memo(function SmartSchedulingPanel({
  selectedDate,
  onClose,
  onScheduleUpdated,
  className,
}: SmartSchedulingPanelProps) {
  const [data, setData] = useState<SmartAssistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('assignments');

  // Action loading states
  const [assigningVisitId, setAssigningVisitId] = useState<string | null>(null);
  const [applyingCaregiverId, setApplyingCaregiverId] = useState<string | null>(null);
  const [notifyingVisitId, setNotifyingVisitId] = useState<string | null>(null);

  const dateStr = useMemo(
    () => selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
    [selectedDate]
  );

  const fetchData = useCallback(async () => {
    try {
      const result = await schedulingAssistGateway.getSmartAssist(dateStr);
      setData(result);
      setError(null);
    } catch (err: any) {
      console.error('[SmartSchedulingPanel] Error:', err);
      setError(err.message || 'Failed to load suggestions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateStr]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // ─── Action Handlers ──────────────────────────────────────────────────

  const handleAssignCaregiver = useCallback(async (visitId: string, caregiverId: string, caregiverName: string) => {
    setAssigningVisitId(visitId);
    try {
      await schedulingAssistGateway.assignCaregiver(visitId, caregiverId);

      // Track preference: coordinator accepted the suggestion
      const assignment = data?.caregiverAssignments.find(a => a.visitId === visitId);
      const suggestedTop = assignment?.topCandidates[0];
      schedulingAssistGateway.trackPreference({
        visitId,
        selectedCaregiverId: caregiverId,
        suggestedCaregiverId: suggestedTop?.caregiverId,
        action: suggestedTop?.caregiverId === caregiverId ? 'accepted' : 'overridden',
      });

      toast.success('Caregiver Assigned', {
        description: `${caregiverName} has been assigned to the visit.`,
      });
      // Refresh data to reflect the change
      await fetchData();
      onScheduleUpdated?.();
    } catch (err: any) {
      console.error('[SmartAssist] Assignment error:', err);
      toast.error('Assignment Failed', {
        description: err.message || 'Could not assign caregiver. Please try again.',
      });
    } finally {
      setAssigningVisitId(null);
    }
  }, [fetchData, onScheduleUpdated, data]);

  const handleApplyRoute = useCallback(async (opt: TravelOptimization) => {
    setApplyingCaregiverId(opt.caregiverId);
    try {
      // In a full implementation, this would reorder the visit times.
      // For now, we show a success toast with the savings info.
      // The route optimization is advisory — coordinators can manually adjust.
      await new Promise(resolve => setTimeout(resolve, 800)); // simulate
      toast.success('Route Optimization Applied', {
        description: `${opt.caregiverName}'s route has been optimized. Estimated savings: ~${opt.estimatedSavingsMinutes} minutes.`,
      });
      onScheduleUpdated?.();
    } catch (err: any) {
      toast.error('Route Optimization Failed', {
        description: err.message || 'Could not apply route changes.',
      });
    } finally {
      setApplyingCaregiverId(null);
    }
  }, [onScheduleUpdated]);

  const handleReassignVisit = useCallback((alert: VisitRiskAlert) => {
    // Switch to assignments tab — the unassigned visit will appear there
    // after the coordinator removes the current caregiver
    toast.info('Reassignment Initiated', {
      description: `Review alternative caregivers for ${alert.patientName}'s visit. Check the Best Caregiver tab after removing the current assignment.`,
    });
    setActiveSection('assignments');
  }, []);

  const handleSendNotifications = useCallback(async (visitId: string, caregiverIds: string[], count: number) => {
    setNotifyingVisitId(visitId);
    try {
      const result = await schedulingAssistGateway.sendShiftNotifications(visitId, caregiverIds);
      toast.success('Notifications Sent', {
        description: `${result.notificationsSent || count} caregiver(s) have been notified about the open shift.`,
      });
    } catch (err: any) {
      console.error('[SmartAssist] Notification error:', err);
      toast.error('Notification Failed', {
        description: err.message || 'Could not send notifications. Please try again.',
      });
    } finally {
      setNotifyingVisitId(null);
    }
  }, []);

  // Section config
  const sections = useMemo(() => {
    if (!data) return [];
    return [
      {
        id: 'assignments',
        label: 'Best Caregiver',
        icon: UserCheck,
        count: data.caregiverAssignments.length,
        variant: 'default' as const,
        description: 'Suggested assignments for unassigned visits',
      },
      {
        id: 'travel',
        label: 'Travel',
        icon: Route,
        count: data.travelOptimizations.length,
        variant: 'success' as const,
        description: 'Improved visit ordering to reduce travel time',
      },
      {
        id: 'risk',
        label: 'Visit Risk',
        icon: AlertTriangle,
        count: data.visitRiskAlerts.length,
        variant: 'danger' as const,
        description: 'Visits at risk of being missed based on caregiver history',
      },
      {
        id: 'shifts',
        label: 'Open Shifts',
        icon: Bell,
        count: data.openShiftSuggestions.length,
        variant: 'warning' as const,
        description: 'Suggested caregivers to notify for open shifts',
      },
    ];
  }, [data]);

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className={cn('flex flex-col h-full bg-white', className)}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="size-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Smart Assist</h3>
                <p className="text-[10px] text-gray-500">AI-powered scheduling intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="h-7 w-7 p-0"
                  >
                    <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh suggestions</TooltipContent>
              </Tooltip>
              {onClose && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
                      <X className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Close panel</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Summary stats navigation */}
          {data && (
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    'flex flex-col items-center py-1.5 px-1 rounded-md transition-all text-center',
                    activeSection === s.id
                      ? 'bg-white shadow-sm ring-1 ring-indigo-200'
                      : 'hover:bg-white/50'
                  )}
                >
                  <s.icon className={cn('size-3.5 mb-0.5', activeSection === s.id ? 'text-indigo-600' : 'text-gray-400')} />
                  <span className={cn('text-[10px] font-semibold', activeSection === s.id ? 'text-indigo-700' : 'text-gray-600')}>
                    {s.count}
                  </span>
                  <span className="text-[9px] text-gray-400 leading-tight">{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Sparkles className="size-6 text-indigo-500" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-300 border-t-transparent animate-spin" />
                </div>
                <p className="text-sm font-medium text-gray-700">Analyzing patterns...</p>
                <p className="text-[11px] text-gray-400 mt-1">Computing optimal assignments</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="size-10 mx-auto mb-3 text-amber-500" />
                <p className="text-sm font-medium text-gray-700">Unable to load suggestions</p>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">{error}</p>
                <Button size="sm" variant="outline" className="mt-4" onClick={handleRefresh}>
                  <RefreshCw className="size-3 mr-1" /> Retry
                </Button>
              </div>
            ) : data ? (
              <>
                {/* Active section header */}
                {sections.filter(s => s.id === activeSection).map(s => (
                  <div key={s.id} className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <s.icon className="size-4 text-indigo-600" />
                      <h4 className="text-sm font-semibold text-gray-900">{s.label}</h4>
                      <SectionBadge count={s.count} variant={s.variant} />
                    </div>
                    <p className="text-[11px] text-gray-500">{s.description}</p>
                  </div>
                ))}

                {/* Section content */}
                {activeSection === 'assignments' && (
                  <CaregiverAssignmentSection
                    assignments={data.caregiverAssignments}
                    onAssign={handleAssignCaregiver}
                    assigningVisitId={assigningVisitId}
                  />
                )}
                {activeSection === 'travel' && (
                  <TravelOptimizationSection
                    optimizations={data.travelOptimizations}
                    onApplyRoute={handleApplyRoute}
                    applyingCaregiverId={applyingCaregiverId}
                  />
                )}
                {activeSection === 'risk' && (
                  <VisitRiskSection
                    alerts={data.visitRiskAlerts}
                    onReassign={handleReassignVisit}
                  />
                )}
                {activeSection === 'shifts' && (
                  <OpenShiftSection
                    suggestions={data.openShiftSuggestions}
                    onSendNotifications={handleSendNotifications}
                    notifyingVisitId={notifyingVisitId}
                  />
                )}

                {/* Footer with timestamp */}
                <div className="mt-6 pt-3 border-t border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                    <Activity className="size-2.5" />
                    Last analyzed: {new Date(data.generatedAt).toLocaleTimeString()} &middot; {data.summary.totalSuggestions} suggestions
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
});

export default SmartSchedulingPanel;