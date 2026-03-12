/**
 * Correction History Tracker Component
 * 
 * Displays complete correction history for clinical documents including
 * return details, correction timeline, iteration tracking, and audit trail.
 * Provides visibility into document quality improvement over time.
 */

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  History,
  XCircle,
  CheckCircle,
  Send,
  User,
  Clock,
  AlertTriangle,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { CorrectionHistoryEntry } from './ReturnForCorrectionWorkflow';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CorrectionHistoryData {
  documentId: string;
  patientName: string;
  documentType: string;
  admissionId: string;
  clinicianName: string;
  history: CorrectionHistoryEntry[];
  currentStatus: 'in-correction' | 'completed' | 'approved';
  totalReturns: number;
  totalDaysInCorrection: number;
  averageCorrectionTime: number; // hours
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CorrectionHistoryTrackerProps {
  data: CorrectionHistoryData;
}

export default function CorrectionHistoryTracker({ data }: CorrectionHistoryTrackerProps) {
  const hasMultipleReturns = data.totalReturns > 1;
  const latestEntry = data.history[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <History className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Correction History</h2>
            <p className="text-sm text-gray-600">
              {data.patientName} • {data.documentType} • {data.admissionId}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Total Returns"
            value={data.totalReturns}
            icon={RefreshCw}
            color={data.totalReturns > 2 ? 'red' : data.totalReturns > 1 ? 'amber' : 'blue'}
            trend={hasMultipleReturns ? 'up' : undefined}
          />
          <StatCard
            label="Days in Correction"
            value={data.totalDaysInCorrection}
            icon={Clock}
            color={data.totalDaysInCorrection > 7 ? 'red' : 'blue'}
          />
          <StatCard
            label="Avg Correction Time"
            value={`${data.averageCorrectionTime}h`}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            label="Current Status"
            value={data.currentStatus.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            icon={
              data.currentStatus === 'approved'
                ? CheckCircle
                : data.currentStatus === 'in-correction'
                ? Clock
                : RefreshCw
            }
            color={
              data.currentStatus === 'approved'
                ? 'green'
                : data.currentStatus === 'in-correction'
                ? 'amber'
                : 'blue'
            }
          />
        </div>
      </Card>

      {/* Quality Trend Alert */}
      {hasMultipleReturns && (
        <Card className="p-4 bg-amber-50 border-amber-300">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-amber-900">Quality Improvement Needed</span>
          </div>
          <p className="text-sm text-amber-800">
            This document has been returned <strong>{data.totalReturns} times</strong>.
            Additional training or support may be beneficial for {data.clinicianName}.
          </p>
        </Card>
      )}

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          Correction Timeline
        </h3>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Timeline Entries */}
          <div className="space-y-6">
            {data.history.map((entry, index) => (
              <TimelineEntry
                key={entry.id}
                entry={entry}
                isLatest={index === 0}
                isFirst={index === data.history.length - 1}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Detailed History */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Detailed History</h3>
        <div className="space-y-4">
          {data.history.map((entry) => (
            <HistoryEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: 'up' | 'down';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorClasses[color as keyof typeof colorClasses])}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div className={cn('w-5 h-5 rounded flex items-center justify-center', trend === 'up' ? 'bg-red-100' : 'bg-green-100')}>
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3 text-red-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-green-600" />
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE ENTRY
// ═══════════════════════════════════════════════════════════════════════════

function TimelineEntry({
  entry,
  isLatest,
  isFirst,
}: {
  entry: CorrectionHistoryEntry;
  isLatest: boolean;
  isFirst: boolean;
}) {
  const hasCorrection = !!entry.correctedAt;
  const hasResubmission = !!entry.resubmittedAt;

  return (
    <div className="relative pl-16">
      {/* Timeline Marker */}
      <div
        className={cn(
          'absolute left-3 w-6 h-6 rounded-full border-4 flex items-center justify-center',
          isLatest
            ? 'bg-blue-600 border-white'
            : hasResubmission
            ? 'bg-green-600 border-white'
            : 'bg-amber-600 border-white'
        )}
      >
        {hasResubmission ? (
          <CheckCircle className="w-3 h-3 text-white" />
        ) : (
          <XCircle className="w-3 h-3 text-white" />
        )}
      </div>

      {/* Iteration Badge */}
      <div className="absolute left-0 top-8 text-xs font-medium text-gray-600">
        #{entry.iteration}
      </div>

      <div className="space-y-3">
        {/* Return Event */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-gray-900">Returned for Correction</span>
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
              {entry.issueCount} issues
            </Badge>
          </div>
          <div className="text-sm text-gray-600 mb-1">
            <User className="w-3 h-3 inline mr-1" />
            {entry.returnedBy} • {new Date(entry.returnedAt).toLocaleString()}
          </div>
          <p className="text-sm text-gray-800 bg-amber-50 border border-amber-200 rounded p-2">
            {entry.returnReason}
          </p>
        </div>

        {/* Correction Event */}
        {hasCorrection && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-gray-900">Corrections Completed</span>
            </div>
            <div className="text-sm text-gray-600 mb-1">
              <User className="w-3 h-3 inline mr-1" />
              {entry.correctedBy} • {new Date(entry.correctedAt!).toLocaleString()}
            </div>
            {entry.correctionNotes && (
              <p className="text-sm text-gray-800 bg-blue-50 border border-blue-200 rounded p-2">
                {entry.correctionNotes}
              </p>
            )}
            <div className="text-xs text-gray-600 mt-1">
              <Clock className="w-3 h-3 inline mr-1" />
              Time to correct:{' '}
              {Math.round(
                (new Date(entry.correctedAt!).getTime() - new Date(entry.returnedAt).getTime()) /
                  (1000 * 60 * 60)
              )}{' '}
              hours
            </div>
          </div>
        )}

        {/* Resubmission Event */}
        {hasResubmission && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Send className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-gray-900">Resubmitted for Review</span>
            </div>
            <div className="text-sm text-gray-600">
              {new Date(entry.resubmittedAt!).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HISTORY ENTRY CARD
// ═══════════════════════════════════════════════════════════════════════════

function HistoryEntryCard({ entry }: { entry: CorrectionHistoryEntry }) {
  const hasCorrection = !!entry.correctedAt;
  const hasResubmission = !!entry.resubmittedAt;

  const correctionTime = hasCorrection
    ? Math.round(
        (new Date(entry.correctedAt!).getTime() - new Date(entry.returnedAt).getTime()) /
          (1000 * 60 * 60)
      )
    : null;

  return (
    <Card
      className={cn(
        'p-4',
        hasResubmission ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              hasResubmission
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-amber-100 text-amber-700 border-amber-300'
            )}
          >
            Iteration #{entry.iteration}
          </Badge>
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
            {entry.issueCount} issues
          </Badge>
          {correctionTime !== null && (
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
              Corrected in {correctionTime}h
            </Badge>
          )}
        </div>
        <div className="text-xs text-gray-600">
          {new Date(entry.returnedAt).toLocaleDateString()}
        </div>
      </div>

      <div className="space-y-3">
        {/* Return Info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-gray-900">Returned by {entry.returnedBy}</span>
          </div>
          <p className="text-sm text-gray-800 bg-white border border-amber-200 rounded p-2">
            {entry.returnReason}
          </p>
        </div>

        {/* Correction Info */}
        {hasCorrection && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">
                Corrected by {entry.correctedBy}
              </span>
            </div>
            {entry.correctionNotes ? (
              <p className="text-sm text-gray-800 bg-white border border-green-200 rounded p-2">
                {entry.correctionNotes}
              </p>
            ) : (
              <p className="text-sm text-gray-600 italic">No correction notes provided</p>
            )}
          </div>
        )}

        {/* Status */}
        <div className="pt-2 border-t flex items-center justify-between">
          <span className="text-xs text-gray-600">Status:</span>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              hasResubmission
                ? 'bg-green-100 text-green-700 border-green-300'
                : hasCorrection
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-amber-100 text-amber-700 border-amber-300'
            )}
          >
            {hasResubmission ? (
              <>
                <Send className="w-3 h-3 mr-1" />
                Resubmitted
              </>
            ) : hasCorrection ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Corrected
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Awaiting Correction
              </>
            )}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockCorrectionHistoryData(): CorrectionHistoryData {
  return {
    documentId: '485-2024-078',
    patientName: 'Patricia Davis',
    documentType: 'Plan of Care (485)',
    admissionId: 'ADM-12347',
    clinicianName: 'Michael Chen, RN',
    history: [
      {
        id: 'history-2',
        returnedAt: '2024-12-14T10:00:00Z',
        returnedBy: 'Jane Smith, QA Reviewer',
        returnReason: 'Goal #3 still not measurable. Please revise to include specific metrics.',
        issueCount: 1,
        correctedAt: '2024-12-14T15:30:00Z',
        correctedBy: 'Michael Chen, RN',
        correctionNotes: 'Revised goal to include specific ambulation distance target.',
        resubmittedAt: '2024-12-14T15:35:00Z',
        iteration: 2,
      },
      {
        id: 'history-1',
        returnedAt: '2024-12-10T09:30:00Z',
        returnedBy: 'Jane Smith, QA Reviewer',
        returnReason:
          'Multiple required sections incomplete. Please complete all sections before resubmission.',
        issueCount: 5,
        correctedAt: '2024-12-11T14:20:00Z',
        correctedBy: 'Michael Chen, RN',
        correctionNotes: 'All sections completed as requested. Added functional limitations and safety measures.',
        resubmittedAt: '2024-12-11T14:25:00Z',
        iteration: 1,
      },
    ],
    currentStatus: 'approved',
    totalReturns: 2,
    totalDaysInCorrection: 5,
    averageCorrectionTime: 21,
  };
}
