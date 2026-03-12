/**
 * Caregiver Management Modules
 * 
 * Consolidated modules for document library, training tracking, workload
 * monitoring, and activity timeline.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  FileText,
  Download,
  Eye,
  Upload,
  Trash2,
  GraduationCap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type {
  CaregiverDocument,
  DocumentCategory,
  DocumentStatus,
  TrainingRecord,
  TrainingAlert,
  TrainingStatus,
  WorkloadMetrics,
  WorkloadAlert,
  CaregiverActivity,
} from '../../lib/caregiverManagementTypes';
import { TRAINING_CATEGORY_CONFIG, ACTIVITY_TYPE_CONFIG } from '../../lib/caregiverManagementTypes';

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT LIBRARY MODULE
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentLibraryModuleProps {
  documents: CaregiverDocument[];
  onUpload?: () => void;
  onPreview?: (documentId: string) => void;
  onDownload?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
}

export function DocumentLibraryModule({
  documents,
  onUpload,
  onPreview,
  onDownload,
  onDelete,
}: DocumentLibraryModuleProps) {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');

  const categories: DocumentCategory[] = [
    'credential',
    'training',
    'employment',
    'background-check',
    'other',
  ];

  const categoryLabels: Record<DocumentCategory, string> = {
    credential: 'Credentials',
    training: 'Training',
    employment: 'Employment',
    'background-check': 'Background Checks',
    other: 'Other',
  };

  const filteredDocuments =
    selectedCategory === 'all'
      ? documents
      : documents.filter((d) => d.category === selectedCategory);

  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<DocumentCategory, CaregiverDocument[]>);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Document Library</h2>
              <p className="text-sm text-gray-600">
                HR documents, credentials, and training certificates
              </p>
            </div>
          </div>

          {onUpload && (
            <Button onClick={onUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className={cn(selectedCategory === 'all' && 'bg-blue-100 border-blue-300')}
          >
            All ({documents.length})
          </Button>
          {categories.map((category) => {
            const count = documents.filter((d) => d.category === category).length;
            return (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(selectedCategory === category && 'bg-blue-100 border-blue-300')}
              >
                {categoryLabels[category]} ({count})
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Documents by Category */}
      {selectedCategory === 'all' ? (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([category, docs]) => (
            <Card key={category} className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {categoryLabels[category as DocumentCategory]}
              </h3>
              <div className="space-y-3">
                {docs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onPreview={onPreview}
                    onDownload={onDownload}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No {categoryLabels[selectedCategory]} documents found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onPreview={onPreview}
                  onDownload={onDownload}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function DocumentCard({
  document,
  onPreview,
  onDownload,
  onDelete,
}: {
  document: CaregiverDocument;
  onPreview?: (id: string) => void;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const statusConfig: Record<DocumentStatus, { label: string; color: string }> = {
    active: { label: 'Active', color: 'green' },
    expired: { label: 'Expired', color: 'red' },
    'expiring-soon': { label: 'Expiring Soon', color: 'amber' },
    archived: { label: 'Archived', color: 'gray' },
  };

  const config = statusConfig[document.status];
  const fileSize =
    document.fileSize < 1024
      ? `${document.fileSize} B`
      : document.fileSize < 1024 * 1024
      ? `${(document.fileSize / 1024).toFixed(1)} KB`
      : `${(document.fileSize / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">{document.documentName}</h4>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  config.color === 'green'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : config.color === 'amber'
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : config.color === 'red'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                )}
              >
                {config.label}
              </Badge>
            </div>

            <div className="text-xs text-gray-600 mb-2">
              Type: {document.documentType} • Uploaded: {new Date(document.uploadDate).toLocaleDateString()} • {fileSize}
              {document.expirationDate && (
                <> • Expires: {new Date(document.expirationDate).toLocaleDateString()}</>
              )}
            </div>

            {document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {document.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-gray-100 text-gray-700 border-gray-300 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {onPreview && (
            <Button variant="ghost" size="sm" onClick={() => onPreview(document.id)}>
              <Eye className="w-4 h-4" />
            </Button>
          )}
          {onDownload && (
            <Button variant="ghost" size="sm" onClick={() => onDownload(document.id)}>
              <Download className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(document.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TRAINING & CERTIFICATION MODULE
// ═══════════════════════════════════════════════════════════════════════════

interface TrainingModuleProps {
  training: TrainingRecord[];
  alerts: TrainingAlert[];
  onAddTraining?: () => void;
  onViewCertificate?: (trainingId: string) => void;
}

export function TrainingModule({
  training,
  alerts,
  onAddTraining,
  onViewCertificate,
}: TrainingModuleProps) {
  const completedCount = training.filter((t) => t.status === 'completed').length;
  const overdueCount = training.filter((t) => t.status === 'overdue').length;
  const expiringSoonCount = training.filter((t) => t.status === 'expiring-soon').length;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Training & Certification</h2>
              <p className="text-sm text-gray-600">Required training and compliance status</p>
            </div>
          </div>

          {onAddTraining && (
            <Button onClick={onAddTraining}>
              <Upload className="w-4 h-4 mr-2" />
              Add Training
            </Button>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-700 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-900">{completedCount}</div>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="text-sm text-amber-700 mb-1">Expiring Soon</div>
            <div className="text-2xl font-bold text-amber-900">{expiringSoonCount}</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-sm text-red-700 mb-1">Overdue</div>
            <div className="text-2xl font-bold text-red-900">{overdueCount}</div>
          </div>
        </div>
      </Card>

      {/* Training Alerts */}
      {alerts.length > 0 && (
        <Card className="p-6 border-l-4 border-red-500 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-3">Training Alerts</h3>
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{alert.trainingName}</div>
                        <div className="text-sm text-gray-600">
                          {alert.alertType === 'overdue'
                            ? `Overdue by ${alert.daysOverdue} days`
                            : `Expires in ${alert.daysUntilExpiration} days`}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          alert.severity === 'critical'
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : alert.severity === 'high'
                            ? 'bg-orange-100 text-orange-700 border-orange-300'
                            : 'bg-amber-100 text-amber-700 border-amber-300'
                        )}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Training Records */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Training Records</h3>
        <div className="space-y-3">
          {training.map((record) => (
            <TrainingCard key={record.id} record={record} onViewCertificate={onViewCertificate} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function TrainingCard({
  record,
  onViewCertificate,
}: {
  record: TrainingRecord;
  onViewCertificate?: (id: string) => void;
}) {
  const config = TRAINING_CATEGORY_CONFIG[record.category];

  const statusConfig: Record<TrainingStatus, { label: string; color: string; icon: any }> = {
    completed: { label: 'Completed', color: 'green', icon: CheckCircle },
    overdue: { label: 'Overdue', color: 'red', icon: XCircle },
    'expiring-soon': { label: 'Expiring Soon', color: 'amber', icon: AlertTriangle },
    'in-progress': { label: 'In Progress', color: 'blue', icon: Clock },
    required: { label: 'Required', color: 'purple', icon: AlertTriangle },
  };

  const statusInfo = statusConfig[record.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{config.icon}</span>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">{record.trainingName}</h4>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  statusInfo.color === 'green'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : statusInfo.color === 'amber'
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : statusInfo.color === 'red'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : statusInfo.color === 'blue'
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-purple-100 text-purple-700 border-purple-300'
                )}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>
              {record.required && (
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                  Required
                </Badge>
              )}
            </div>

            <div className="text-xs text-gray-600 mb-2">
              Provider: {record.provider}
              {record.hours && <> • {record.hours} hours</>}
              {record.completionDate && (
                <> • Completed: {new Date(record.completionDate).toLocaleDateString()}</>
              )}
              {record.expirationDate && (
                <> • Expires: {new Date(record.expirationDate).toLocaleDateString()}</>
              )}
            </div>
          </div>
        </div>

        {record.certificateUrl && onViewCertificate && (
          <Button variant="ghost" size="sm" onClick={() => onViewCertificate(record.id)}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKLOAD MONITORING MODULE
// ═══════════════════════════════════════════════════════════════════════════

interface WorkloadMonitoringModuleProps {
  metrics: WorkloadMetrics;
  alerts: WorkloadAlert[];
}

export function WorkloadMonitoringModule({ metrics, alerts }: WorkloadMonitoringModuleProps) {
  const workloadColor = {
    underutilized: 'blue',
    optimal: 'green',
    high: 'amber',
    overloaded: 'red',
  };

  const burnoutColor = {
    low: 'green',
    medium: 'amber',
    high: 'red',
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Workload Monitoring</h2>
              <p className="text-sm text-gray-600">Visit metrics and capacity analysis</p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={cn(
            'p-4 rounded-lg',
            `bg-${workloadColor[metrics.workloadStatus]}-50`
          )}>
            <div className="text-sm mb-1" style={{ color: `var(--${workloadColor[metrics.workloadStatus]}-700)` }}>
              Workload Status
            </div>
            <div className="text-lg font-bold capitalize" style={{ color: `var(--${workloadColor[metrics.workloadStatus]}-900)` }}>
              {metrics.workloadStatus}
            </div>
          </div>

          <div className={cn(
            'p-4 rounded-lg',
            `bg-${burnoutColor[metrics.burnoutRisk]}-50`
          )}>
            <div className="text-sm mb-1" style={{ color: `var(--${burnoutColor[metrics.burnoutRisk]}-700)` }}>
              Burnout Risk
            </div>
            <div className="text-lg font-bold capitalize" style={{ color: `var(--${burnoutColor[metrics.burnoutRisk]}-900)` }}>
              {metrics.burnoutRisk}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-700 mb-1">Utilization Rate</div>
            <div className="text-lg font-bold text-gray-900">{metrics.utilizationRate}%</div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  metrics.utilizationRate >= 90
                    ? 'bg-red-500'
                    : metrics.utilizationRate >= 80
                    ? 'bg-green-500'
                    : metrics.utilizationRate >= 60
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                )}
                style={{ width: `${metrics.utilizationRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Week Metrics */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Current Week</h4>
            <div className="space-y-3">
              <MetricRow label="Scheduled Visits" value={metrics.currentWeek.scheduledVisits} />
              <MetricRow label="Completed Visits" value={metrics.currentWeek.completedVisits} />
              <MetricRow label="Cancelled Visits" value={metrics.currentWeek.cancelledVisits} />
              <MetricRow
                label="Avg Visits/Day"
                value={metrics.currentWeek.averageVisitsPerDay.toFixed(1)}
              />
              <MetricRow
                label="Total Hours"
                value={`${metrics.currentWeek.totalHours}h`}
              />
              <MetricRow
                label="Total Mileage"
                value={`${metrics.currentWeek.totalMileage} mi`}
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Month to Date</h4>
            <div className="space-y-3">
              <MetricRow label="Scheduled Visits" value={metrics.monthToDate.scheduledVisits} />
              <MetricRow label="Completed Visits" value={metrics.monthToDate.completedVisits} />
              <MetricRow
                label="Avg Visits/Week"
                value={metrics.monthToDate.averageVisitsPerWeek.toFixed(1)}
              />
              <MetricRow
                label="Total Hours"
                value={`${metrics.monthToDate.totalHours}h`}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Workload Alerts */}
      {alerts.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Workload Alerts
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <WorkloadAlertCard key={index} alert={alert} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function WorkloadAlertCard({ alert }: { alert: WorkloadAlert }) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg border-l-4',
        alert.severity === 'critical'
          ? 'border-red-500 bg-red-50'
          : alert.severity === 'warning'
          ? 'border-amber-500 bg-amber-50'
          : 'border-blue-500 bg-blue-50'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium text-gray-900 mb-1">{alert.message}</div>
          <div className="text-sm text-gray-600 mb-2">
            Current: {alert.metrics.current} {alert.metrics.unit} • Threshold:{' '}
            {alert.metrics.threshold} {alert.metrics.unit}
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            alert.severity === 'critical'
              ? 'bg-red-100 text-red-700 border-red-300'
              : alert.severity === 'warning'
              ? 'bg-amber-100 text-amber-700 border-amber-300'
              : 'bg-blue-100 text-blue-700 border-blue-300'
          )}
        >
          {alert.severity}
        </Badge>
      </div>

      {alert.recommendations.length > 0 && (
        <div className="mt-2 pt-2 border-t">
          <div className="text-xs text-gray-600 mb-1">Recommendations:</div>
          <ul className="text-xs text-gray-700 space-y-1">
            {alert.recommendations.map((rec, index) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY TIMELINE MODULE
// ═══════════════════════════════════════════════════════════════════════════

interface ActivityTimelineModuleProps {
  activities: CaregiverActivity[];
  onViewActivity?: (activityId: string) => void;
}

export function ActivityTimelineModule({
  activities,
  onViewActivity,
}: ActivityTimelineModuleProps) {
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Activity className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Activity Timeline</h2>
            <p className="text-sm text-gray-600">Chronological view of caregiver activity</p>
          </div>
        </div>
      </div>

      {sortedActivities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No activities recorded</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Activities */}
          <div className="space-y-4">
            {sortedActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onView={onViewActivity}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function ActivityCard({
  activity,
  onView,
}: {
  activity: CaregiverActivity;
  onView?: (id: string) => void;
}) {
  const config = ACTIVITY_TYPE_CONFIG[activity.activityType];

  return (
    <div className="relative pl-14">
      {/* Timeline Dot */}
      <div className={cn(
        'absolute left-4 w-5 h-5 rounded-full border-4 border-white',
        `bg-${config.color}-500`
      )} />

      {/* Content */}
      <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <div>
              <h4 className="font-medium text-gray-900">{activity.title}</h4>
              <p className="text-xs text-gray-600">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {onView && activity.relatedEntityId && (
            <Button variant="ghost" size="sm" onClick={() => onView(activity.id)}>
              View
            </Button>
          )}
        </div>

        <p className="text-sm text-gray-700">{activity.description}</p>

        {activity.performedBy && (
          <div className="mt-2 text-xs text-gray-600">
            <User className="w-3 h-3 inline mr-1" />
            {activity.performedBy}
          </div>
        )}
      </div>
    </div>
  );
}
