/**
 * Clinical Alerts Dashboard Component
 * 
 * Central dashboard for monitoring and managing clinical alerts across an admission.
 * Surfaces critical issues requiring immediate attention.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Eye,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  Phone,
  Calendar,
  Edit,
  UserPlus,
  Send,
  Bell,
  Pill,
  Activity,
  FileText,
  Clipboard,
  Shield,
  TrendingUp,
  Clock,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type {
  ClinicalAlert,
  AlertSeverity,
  AlertCategory,
  AlertStatus,
} from '../services/clinicalAlerts';
import {
  getMockClinicalAlerts,
  getAlertStatistics,
  filterAlerts,
  ALERT_CATEGORY_CONFIG,
  ALERT_SEVERITY_CONFIG,
  ALERT_STATUS_CONFIG,
} from '../services/clinicalAlerts';

// ═══════════════════════════════════════════════════════════════════════════
// ICON MAPPING
// ═══════════════════════════════════════════════════════════════════════════

const ICON_MAP: Record<string, any> = {
  pill: Pill,
  'alert-triangle': AlertTriangle,
  activity: Activity,
  calendar: Calendar,
  'file-text': FileText,
  clipboard: Clipboard,
  'check-circle': CheckCircle2,
  'trending-up': TrendingUp,
  shield: Shield,
  'alert-circle': AlertCircle,
  info: Info,
  eye: Eye,
  'x-circle': XCircle,
  phone: Phone,
  edit: Edit,
  'user-plus': UserPlus,
  send: Send,
  bell: Bell,
  'calendar-plus': Calendar,
  'clipboard-check': Clipboard,
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ClinicalAlertsDashboard() {
  const navigate = useNavigate();
  const [alerts] = useState<ClinicalAlert[]>(getMockClinicalAlerts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<AlertSeverity[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<AlertCategory[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<AlertStatus[]>(['active', 'acknowledged']);
  const [showFilters, setShowFilters] = useState(false);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return filterAlerts(alerts, {
      severity: selectedSeverities.length > 0 ? selectedSeverities : undefined,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      searchQuery,
    });
  }, [alerts, selectedSeverities, selectedCategories, selectedStatuses, searchQuery]);

  // Statistics
  const stats = useMemo(() => getAlertStatistics(filteredAlerts), [filteredAlerts]);

  // Toggle filter
  const toggleSeverity = (severity: AlertSeverity) => {
    setSelectedSeverities(prev =>
      prev.includes(severity) ? prev.filter(s => s !== severity) : [...prev, severity]
    );
  };

  const toggleCategory = (category: AlertCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleStatus = (status: AlertStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Clinical Alerts Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          Monitor and manage clinical issues requiring attention
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-gray-400">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-600">Total Alerts</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{stats.critical}</span>
          </div>
          <p className="text-sm text-gray-600">Critical</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-2xl font-bold text-amber-900">{stats.high}</span>
          </div>
          <p className="text-sm text-gray-600">High Priority</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{stats.medium}</span>
          </div>
          <p className="text-sm text-gray-600">Medium</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{stats.acknowledged}</span>
          </div>
          <p className="text-sm text-gray-600">Acknowledged</p>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {(selectedSeverities.length > 0 || selectedCategories.length > 0) && (
            <Badge variant="secondary" className="ml-2">
              {selectedSeverities.length + selectedCategories.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="space-y-4">
            {/* Severity Filters */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Severity</h4>
              <div className="flex flex-wrap gap-2">
                {(['critical', 'high', 'medium', 'low'] as AlertSeverity[]).map(severity => (
                  <Button
                    key={severity}
                    variant={selectedSeverities.includes(severity) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSeverity(severity)}
                  >
                    {ALERT_SEVERITY_CONFIG[severity].label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filters */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Category</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ALERT_CATEGORY_CONFIG).map(([key, config]) => {
                  const category = key as AlertCategory;
                  const count = stats.byCategory[category] || 0;
                  if (count === 0) return null;
                  
                  return (
                    <Button
                      key={category}
                      variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleCategory(category)}
                    >
                      {config.label}
                      <Badge variant="secondary" className="ml-2">
                        {count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Status</h4>
              <div className="flex flex-wrap gap-2">
                {(['active', 'acknowledged', 'resolved', 'dismissed'] as AlertStatus[]).map(status => (
                  <Button
                    key={status}
                    variant={selectedStatuses.includes(status) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleStatus(status)}
                  >
                    {ALERT_STATUS_CONFIG[status].label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedSeverities.length > 0 || selectedCategories.length > 0 || selectedStatuses.length !== 2) && (
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSeverities([]);
                    setSelectedCategories([]);
                    setSelectedStatuses(['active', 'acknowledged']);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} onNavigate={navigate} />
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <h4 className="font-semibold text-gray-900 mb-1">No Alerts Found</h4>
            <p className="text-sm text-gray-600">
              {searchQuery || selectedSeverities.length > 0 || selectedCategories.length > 0
                ? 'Try adjusting your filters or search query'
                : 'All clinical issues are currently addressed'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT CARD
// ═══════════════════════════════════════════════════════════════════════════

interface AlertCardProps {
  alert: ClinicalAlert;
  onNavigate: (route: string) => void;
}

function AlertCard({ alert, onNavigate }: AlertCardProps) {
  const severityConfig = ALERT_SEVERITY_CONFIG[alert.severity];
  const categoryConfig = ALERT_CATEGORY_CONFIG[alert.category];
  const statusConfig = ALERT_STATUS_CONFIG[alert.status];
  const CategoryIcon = ICON_MAP[categoryConfig.icon] || Activity;
  const SeverityIcon = ICON_MAP[severityConfig.icon] || AlertCircle;
  const StatusIcon = ICON_MAP[statusConfig.icon] || Info;

  const handleQuickAction = (action: any) => {
    if (action.route) {
      onNavigate(action.route);
    } else {
      console.log('Quick action:', action.action);
      // Here you would implement the actual action logic
    }
  };

  const timeAgo = getTimeAgo(alert.detectedDate);

  return (
    <Card
      className={cn(
        'overflow-hidden border-l-4 transition-all hover:shadow-md',
        alert.severity === 'critical' && 'border-l-red-500',
        alert.severity === 'high' && 'border-l-amber-500',
        alert.severity === 'medium' && 'border-l-blue-500',
        alert.severity === 'low' && 'border-l-gray-400',
        alert.status === 'acknowledged' && 'opacity-75'
      )}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Category Icon */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${categoryConfig.color}20` }}
            >
              <CategoryIcon className="w-5 h-5" style={{ color: categoryConfig.color }} />
            </div>

            {/* Title and Metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-gray-900">{alert.title}</h3>
                <Badge
                  className="text-xs"
                  style={{
                    backgroundColor: severityConfig.bgColor,
                    color: severityConfig.color,
                    border: `1px solid ${severityConfig.color}`,
                  }}
                >
                  <SeverityIcon className="w-3 h-3 mr-1" />
                  {severityConfig.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {categoryConfig.label}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span>{alert.patientName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo}
                </span>
                {alert.status !== 'active' && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1" style={{ color: statusConfig.color }}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-3 pl-13">{alert.description}</p>

        {/* Context */}
        {alert.context && Object.keys(alert.context).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 pl-13">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {alert.context.visitDate && (
                <div>
                  <span className="text-gray-600">Visit Date: </span>
                  <span className="font-medium text-gray-900">
                    {new Date(alert.context.visitDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {alert.context.disciplineType && (
                <div>
                  <span className="text-gray-600">Discipline: </span>
                  <span className="font-medium text-gray-900">{alert.context.disciplineType}</span>
                </div>
              )}
              {alert.context.documentType && (
                <div>
                  <span className="text-gray-600">Document: </span>
                  <span className="font-medium text-gray-900">{alert.context.documentType}</span>
                </div>
              )}
              {alert.context.assessmentType && (
                <div>
                  <span className="text-gray-600">Assessment: </span>
                  <span className="font-medium text-gray-900">{alert.context.assessmentType}</span>
                </div>
              )}
              {alert.context.additionalInfo && (
                <div className="col-span-2">
                  <span className="text-gray-600">Details: </span>
                  <span className="font-medium text-gray-900">{alert.context.additionalInfo}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggested Action */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 pl-13">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-900 mb-1">Suggested Action</p>
              <p className="text-sm text-blue-800">{alert.suggestedAction}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 pl-13 flex-wrap">
          {alert.quickActions.map((action) => {
            const ActionIcon = ICON_MAP[action.icon] || ArrowRight;
            return (
              <Button
                key={action.id}
                variant={action.id === 'qa-1' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickAction(action)}
              >
                <ActionIcon className="w-3 h-3 mr-1.5" />
                {action.label}
              </Button>
            );
          })}
        </div>

        {/* Acknowledgment Info */}
        {alert.acknowledgedBy && (
          <div className="mt-3 pt-3 border-t pl-13">
            <p className="text-xs text-gray-600">
              Acknowledged by <span className="font-medium">{alert.acknowledgedBy}</span> on{' '}
              {new Date(alert.acknowledgedDate!).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
