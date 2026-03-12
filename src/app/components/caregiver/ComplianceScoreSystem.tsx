/**
 * Compliance Score System
 * 
 * Scoring system reflecting credential and training compliance status
 * with visual indicators for fully compliant, minor issues, and non-compliant states.
 */

import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Award,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ComplianceScoreLevel = 'fully-compliant' | 'minor-issues' | 'non-compliant';

export interface ComplianceScore {
  caregiverId: string;
  caregiverName: string;
  score: number; // 0-100
  level: ComplianceScoreLevel;
  breakdown: {
    requiredCredentials: {
      total: number;
      valid: number;
      expired: number;
      expiringSoon: number;
    };
    requiredTraining: {
      total: number;
      completed: number;
      overdue: number;
      expiringSoon: number;
    };
    optionalCredentials: {
      total: number;
      valid: number;
    };
  };
  issues: ComplianceIssue[];
  lastCalculated: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ComplianceIssue {
  type: 'expired-credential' | 'expiring-credential' | 'missing-credential' | 'overdue-training' | 'expiring-training';
  severity: 'critical' | 'high' | 'medium';
  description: string;
  dueDate?: string;
  daysOverdue?: number;
  daysUntilExpiration?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT - COMPLIANCE SCORE BADGE
// ═══════════════════════════════════════════════════════════════════════════

interface ComplianceScoreBadgeProps {
  score: ComplianceScore;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: () => void;
}

export function ComplianceScoreBadge({
  score,
  size = 'md',
  showDetails = false,
  onClick,
}: ComplianceScoreBadgeProps) {
  const config = {
    'fully-compliant': {
      label: 'Fully Compliant',
      color: 'green',
      icon: CheckCircle,
      bgClass: 'bg-green-100',
      textClass: 'text-green-900',
      borderClass: 'border-green-300',
    },
    'minor-issues': {
      label: 'Minor Issues',
      color: 'amber',
      icon: AlertTriangle,
      bgClass: 'bg-amber-100',
      textClass: 'text-amber-900',
      borderClass: 'border-amber-300',
    },
    'non-compliant': {
      label: 'Non-Compliant',
      color: 'red',
      icon: XCircle,
      bgClass: 'bg-red-100',
      textClass: 'text-red-900',
      borderClass: 'border-red-300',
    },
  };

  const levelConfig = config[score.level];
  const Icon = levelConfig.icon;

  if (size === 'sm') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'text-xs cursor-pointer',
          levelConfig.bgClass,
          levelConfig.textClass,
          levelConfig.borderClass
        )}
        onClick={onClick}
      >
        <Icon className="w-3 h-3 mr-1" />
        {score.score}%
      </Badge>
    );
  }

  if (size === 'md') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow',
          levelConfig.bgClass,
          levelConfig.borderClass
        )}
        onClick={onClick}
      >
        <Icon className={cn('w-5 h-5', levelConfig.textClass)} />
        <div>
          <div className={cn('text-xs font-medium', levelConfig.textClass)}>
            {levelConfig.label}
          </div>
          <div className={cn('text-lg font-bold', levelConfig.textClass)}>
            {score.score}%
          </div>
        </div>
      </div>
    );
  }

  // Large size with details
  return (
    <Card className={cn('p-6 border-l-4', levelConfig.borderClass, levelConfig.bgClass)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', levelConfig.bgClass)}>
            <Icon className={cn('w-6 h-6', levelConfig.textClass)} />
          </div>
          <div>
            <h3 className={cn('font-semibold', levelConfig.textClass)}>
              {levelConfig.label}
            </h3>
            <div className={cn('text-3xl font-bold', levelConfig.textClass)}>
              {score.score}%
            </div>
          </div>
        </div>

        {score.trend && (
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              score.trend === 'improving'
                ? 'bg-green-100 text-green-700 border-green-300'
                : score.trend === 'declining'
                ? 'bg-red-100 text-red-700 border-red-300'
                : 'bg-gray-100 text-gray-700 border-gray-300'
            )}
          >
            {score.trend === 'improving' && <TrendingUp className="w-3 h-3 mr-1" />}
            {score.trend === 'declining' && <TrendingDown className="w-3 h-3 mr-1" />}
            {score.trend === 'improving' ? 'Improving' : score.trend === 'declining' ? 'Declining' : 'Stable'}
          </Badge>
        )}
      </div>

      {showDetails && (
        <>
          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-white rounded-lg">
              <div className="text-xs text-gray-600 mb-2">Required Credentials</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Valid:</span>
                <span className="font-semibold text-green-700">
                  {score.breakdown.requiredCredentials.valid}/{score.breakdown.requiredCredentials.total}
                </span>
              </div>
              {score.breakdown.requiredCredentials.expired > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Expired:</span>
                  <span className="font-semibold text-red-700">
                    {score.breakdown.requiredCredentials.expired}
                  </span>
                </div>
              )}
              {score.breakdown.requiredCredentials.expiringSoon > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Expiring Soon:</span>
                  <span className="font-semibold text-amber-700">
                    {score.breakdown.requiredCredentials.expiringSoon}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 bg-white rounded-lg">
              <div className="text-xs text-gray-600 mb-2">Required Training</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Completed:</span>
                <span className="font-semibold text-green-700">
                  {score.breakdown.requiredTraining.completed}/{score.breakdown.requiredTraining.total}
                </span>
              </div>
              {score.breakdown.requiredTraining.overdue > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Overdue:</span>
                  <span className="font-semibold text-red-700">
                    {score.breakdown.requiredTraining.overdue}
                  </span>
                </div>
              )}
              {score.breakdown.requiredTraining.expiringSoon > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Expiring Soon:</span>
                  <span className="font-semibold text-amber-700">
                    {score.breakdown.requiredTraining.expiringSoon}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Issues */}
          {score.issues.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-700 mb-2">
                Issues ({score.issues.length})
              </div>
              <div className="space-y-2">
                {score.issues.slice(0, 3).map((issue, index) => (
                  <ComplianceIssueRow key={index} issue={issue} />
                ))}
              </div>
              {score.issues.length > 3 && (
                <Button variant="ghost" size="sm" onClick={onClick} className="mt-2 w-full">
                  View All {score.issues.length} Issues
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE ISSUE ROW
// ═══════════════════════════════════════════════════════════════════════════

function ComplianceIssueRow({ issue }: { issue: ComplianceIssue }) {
  const severityConfig = {
    critical: { color: 'red', icon: XCircle },
    high: { color: 'orange', icon: AlertTriangle },
    medium: { color: 'amber', icon: AlertTriangle },
  };

  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-2 p-2 bg-white rounded text-sm">
      <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', `text-${config.color}-600`)} />
      <div className="flex-1">
        <div className="font-medium text-gray-900">{issue.description}</div>
        {issue.daysOverdue !== undefined && (
          <div className="text-xs text-red-700">Overdue by {issue.daysOverdue} days</div>
        )}
        {issue.daysUntilExpiration !== undefined && (
          <div className="text-xs text-amber-700">Expires in {issue.daysUntilExpiration} days</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE SCORE CARD (For Dashboards)
// ═══════════════════════════════════════════════════════════════════════════

interface ComplianceScoreCardProps {
  score: ComplianceScore;
  onViewDetails?: () => void;
}

export function ComplianceScoreCard({ score, onViewDetails }: ComplianceScoreCardProps) {
  const config = {
    'fully-compliant': {
      label: 'Fully Compliant',
      icon: CheckCircle,
      color: 'green',
    },
    'minor-issues': {
      label: 'Minor Issues',
      icon: AlertTriangle,
      color: 'amber',
    },
    'non-compliant': {
      label: 'Non-Compliant',
      icon: XCircle,
      color: 'red',
    },
  };

  const levelConfig = config[score.level];
  const Icon = levelConfig.icon;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onViewDetails}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900 text-sm">Compliance Score</span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            levelConfig.color === 'green'
              ? 'bg-green-100 text-green-700 border-green-300'
              : levelConfig.color === 'amber'
              ? 'bg-amber-100 text-amber-700 border-amber-300'
              : 'bg-red-100 text-red-700 border-red-300'
          )}
        >
          <Icon className="w-3 h-3 mr-1" />
          {levelConfig.label}
        </Badge>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <div className="text-4xl font-bold text-gray-900">{score.score}%</div>
        {score.trend && (
          <div className="flex items-center gap-1 text-xs">
            {score.trend === 'improving' && <TrendingUp className="w-3 h-3 text-green-600" />}
            {score.trend === 'declining' && <TrendingDown className="w-3 h-3 text-red-600" />}
            <span className={cn(
              score.trend === 'improving' ? 'text-green-700' :
              score.trend === 'declining' ? 'text-red-700' : 'text-gray-600'
            )}>
              {score.trend}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Valid Credentials:</span>
          <span className="font-semibold text-gray-900">
            {score.breakdown.requiredCredentials.valid}/{score.breakdown.requiredCredentials.total}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Completed Training:</span>
          <span className="font-semibold text-gray-900">
            {score.breakdown.requiredTraining.completed}/{score.breakdown.requiredTraining.total}
          </span>
        </div>
        {score.issues.length > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Issues:</span>
            <span className="font-semibold text-red-700">{score.issues.length}</span>
          </div>
        )}
      </div>

      {onViewDetails && (
        <Button variant="outline" size="sm" className="w-full mt-3" onClick={onViewDetails}>
          View Details
        </Button>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE CALCULATION HELPER
// ═══════════════════════════════════════════════════════════════════════════

export function calculateComplianceScore(
  requiredCredentials: { valid: number; total: number; expired: number; expiringSoon: number },
  requiredTraining: { completed: number; total: number; overdue: number; expiringSoon: number },
  issues: ComplianceIssue[]
): { score: number; level: ComplianceScoreLevel } {
  // Start with 100 points
  let score = 100;

  // Deduct points for expired/missing credentials (critical)
  const credentialsMissing = requiredCredentials.total - requiredCredentials.valid;
  score -= credentialsMissing * 20; // -20 points per expired/missing

  // Deduct points for expiring credentials (less severe)
  score -= requiredCredentials.expiringSoon * 5; // -5 points per expiring

  // Deduct points for overdue training (critical)
  score -= requiredTraining.overdue * 15; // -15 points per overdue

  // Deduct points for training expiring soon
  score -= requiredTraining.expiringSoon * 3; // -3 points per expiring

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Determine level
  let level: ComplianceScoreLevel;
  if (score >= 90 && credentialsMissing === 0 && requiredTraining.overdue === 0) {
    level = 'fully-compliant';
  } else if (score >= 70) {
    level = 'minor-issues';
  } else {
    level = 'non-compliant';
  }

  return { score, level };
}
