/**
 * Wound Care Tracking Component
 * 
 * Main component for tracking wounds longitudinally across an admission.
 * Displays wounds as cards with progression summaries and detail panels.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Ruler,
  Droplet,
  Image as ImageIcon,
  ChevronRight,
  Activity,
  Clock,
  MapPin,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Wound } from '../services/woundCareTracking';
import {
  getMockWounds,
  WOUND_LOCATION_CONFIG,
  WOUND_TYPE_CONFIG,
  WOUND_STATUS_CONFIG,
  PRESSURE_INJURY_STAGE_CONFIG,
  getMostRecentAssessment,
  getWoundAge,
  getDaysSinceLastAssessment,
  getWoundDisplayName,
  getAssessmentSummary,
} from '../services/woundCareTracking';
import WoundDetailPanel from './WoundDetailPanel';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function WoundCareTracking() {
  const [wounds] = useState<Wound[]>(getMockWounds());
  const [selectedWoundId, setSelectedWoundId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'healed'>('active');

  const filteredWounds = wounds.filter(wound => {
    if (filter === 'active') return wound.isActive;
    if (filter === 'healed') return !wound.isActive;
    return true;
  });

  const activeCount = wounds.filter(w => w.isActive).length;
  const healedCount = wounds.filter(w => !w.isActive).length;
  const criticalCount = wounds.filter(w => 
    w.isActive && (w.currentStatus === 'infected' || w.currentStatus === 'worsening')
  ).length;

  const selectedWound = wounds.find(w => w.id === selectedWoundId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Wound Care Tracking</h2>
          <p className="text-sm text-gray-600 mt-1">
            Longitudinal tracking of wound progression and treatment
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Wound
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{activeCount}</span>
          </div>
          <p className="text-sm text-gray-600">Active Wounds</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{healedCount}</span>
          </div>
          <p className="text-sm text-gray-600">Healed Wounds</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">{criticalCount}</span>
          </div>
          <p className="text-sm text-gray-600">Critical Attention</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{wounds.length}</span>
          </div>
          <p className="text-sm text-gray-600">Total Tracked</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({wounds.length})
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Active ({activeCount})
        </Button>
        <Button
          variant={filter === 'healed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('healed')}
        >
          Healed ({healedCount})
        </Button>
      </div>

      {/* Wound Cards */}
      <div className="space-y-4">
        {filteredWounds.map(wound => (
          <WoundCard
            key={wound.id}
            wound={wound}
            onViewDetails={() => setSelectedWoundId(wound.id)}
          />
        ))}
      </div>

      {filteredWounds.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h4 className="font-semibold text-gray-900 mb-1">
              No {filter === 'all' ? '' : filter} wounds found
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {filter === 'active'
                ? 'No active wounds are currently being tracked'
                : filter === 'healed'
                ? 'No healed wounds in history'
                : 'Start tracking wounds to monitor healing progression'}
            </p>
            {filter === 'all' && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Wound
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Detail Panel */}
      {selectedWound && (
        <WoundDetailPanel
          wound={selectedWound}
          open={!!selectedWoundId}
          onClose={() => setSelectedWoundId(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WOUND CARD
// ═══════════════════════════════════════════════════════════════════════════

interface WoundCardProps {
  wound: Wound;
  onViewDetails: () => void;
}

function WoundCard({ wound, onViewDetails }: WoundCardProps) {
  const recentAssessment = getMostRecentAssessment(wound);
  const woundAge = getWoundAge(wound);
  const daysSinceAssessment = getDaysSinceLastAssessment(wound);
  const woundName = getWoundDisplayName(wound);
  const statusConfig = WOUND_STATUS_CONFIG[wound.currentStatus];
  const typeConfig = WOUND_TYPE_CONFIG[wound.type];

  // Get trend from recent assessments
  const hasTrend = wound.assessments.length >= 2;
  const trendIcon = recentAssessment?.trend === 'improving' ? (
    <TrendingUp className="w-4 h-4 text-green-600" />
  ) : recentAssessment?.trend === 'worsening' ? (
    <TrendingDown className="w-4 h-4 text-red-600" />
  ) : (
    <Minus className="w-4 h-4 text-gray-600" />
  );

  return (
    <Card className={cn(
      'overflow-hidden border-l-4',
      wound.currentStatus === 'infected' && 'border-l-red-500',
      wound.currentStatus === 'worsening' && 'border-l-amber-500',
      wound.currentStatus === 'healing' && 'border-l-green-500',
      wound.currentStatus === 'stable' && 'border-l-gray-400',
      wound.currentStatus === 'healed' && 'border-l-emerald-500',
      wound.currentStatus === 'new' && 'border-l-blue-500'
    )}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Left: Wound Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900">{woundName}</h3>
              <Badge
                className="text-xs"
                style={{ backgroundColor: typeConfig.color, color: 'white' }}
              >
                {typeConfig.label}
              </Badge>
              {wound.stage && (
                <Badge variant="outline" className="text-xs">
                  {PRESSURE_INJURY_STAGE_CONFIG[wound.stage].label}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {WOUND_LOCATION_CONFIG[wound.location].label}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {woundAge} days old
              </span>
              {daysSinceAssessment !== null && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last assessed {daysSinceAssessment} day{daysSinceAssessment !== 1 ? 's' : ''} ago
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className={cn('text-xs')}
                style={{
                  backgroundColor: statusConfig.color,
                  color: 'white',
                }}
              >
                <span className="flex items-center gap-1">
                  {hasTrend && trendIcon}
                  {statusConfig.label}
                </span>
              </Badge>
              {recentAssessment?.percentChange !== undefined && recentAssessment.percentChange !== 0 && (
                <span className={cn(
                  'text-xs font-medium',
                  recentAssessment.percentChange < 0 ? 'text-green-700' : 'text-red-700'
                )}>
                  {recentAssessment.percentChange > 0 ? '+' : ''}{recentAssessment.percentChange}% from previous
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick Stats */}
          <div className="flex items-start gap-4">
            {recentAssessment && (
              <div className="text-right">
                <div className="text-xs text-gray-600 mb-1">Current Size</div>
                {recentAssessment.area !== undefined && recentAssessment.area > 0 ? (
                  <>
                    <div className="text-lg font-bold text-gray-900">
                      {recentAssessment.area} cm²
                    </div>
                    {recentAssessment.length && recentAssessment.width && (
                      <div className="text-xs text-gray-600">
                        {recentAssessment.length} × {recentAssessment.width} cm
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-lg font-bold text-green-700">Healed</div>
                )}
              </div>
            )}

            <div className="text-right">
              <div className="text-xs text-gray-600 mb-1">Assessments</div>
              <div className="text-lg font-bold text-gray-900">{wound.assessments.length}</div>
              <div className="text-xs text-gray-600">{wound.photos.length} photos</div>
            </div>
          </div>
        </div>

        {/* Mini Progression */}
        {hasTrend && wound.assessments.length >= 3 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-700 mb-2">Area Progression</div>
            <MiniProgressionChart assessments={wound.assessments.slice(0, 6).reverse()} />
          </div>
        )}

        {/* Recent Assessment Summary */}
        {recentAssessment && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <QuickMetric
              icon={<Ruler className="w-3 h-3 text-gray-600" />}
              label="Measurements"
              value={getAssessmentSummary(recentAssessment)}
            />
            <QuickMetric
              icon={<Droplet className="w-3 h-3 text-blue-600" />}
              label="Drainage"
              value={recentAssessment.drainageAmount || 'Not assessed'}
            />
            <QuickMetric
              icon={<Activity className="w-3 h-3 text-purple-600" />}
              label="Wound Bed"
              value={recentAssessment.woundBed.join(', ') || 'Not assessed'}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ImageIcon className="w-3 h-3 mr-1.5" />
              View Photos ({wound.photos.length})
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-3 h-3 mr-1.5" />
              Add Assessment
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewDetails}>
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK METRIC
// ═══════════════════════════════════════════════════════════════════════════

function QuickMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border rounded-lg p-2 bg-gray-50">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <p className="text-xs font-medium text-gray-900 line-clamp-1">{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MINI PROGRESSION CHART
// ═══════════════════════════════════════════════════════════════════════════

function MiniProgressionChart({ assessments }: { assessments: any[] }) {
  const maxArea = Math.max(...assessments.map(a => a.area || 0));

  return (
    <div className="flex items-end gap-1 h-12">
      {assessments.map((assessment, idx) => {
        const height = maxArea > 0 ? ((assessment.area || 0) / maxArea) * 100 : 0;
        const color = assessment.trend === 'improving'
          ? 'bg-green-500'
          : assessment.trend === 'worsening'
          ? 'bg-red-500'
          : 'bg-gray-400';

        return (
          <div key={assessment.id} className="flex-1 flex flex-col justify-end">
            <div
              className={cn('rounded-t transition-all', color)}
              style={{ height: `${height}%` }}
              title={`${assessment.area?.toFixed(1)} cm² on ${new Date(assessment.assessmentDate).toLocaleDateString()}`}
            />
          </div>
        );
      })}
    </div>
  );
}
