/**
 * Clinical Control Center Component
 * 
 * Central dashboard showing all clinical summary cards for an admission.
 * Provides a comprehensive overview of the patient's status across all
 * clinical domains.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '../lib/utils';
import ClinicalSummaryCard from './ClinicalSummaryCard';
import {
  getAllClinicalSummaryCards,
  getAdmissionHealthScore,
  getCardStatistics,
  getCriticalCards,
  type ClinicalSummaryCard as ClinicalSummaryCardType,
  type CardType,
} from '../services/clinicalSummaryCards';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ClinicalControlCenterProps {
  admissionId: string;
  patientName?: string;
  onRefresh?: () => void;
}

export default function ClinicalControlCenter({
  admissionId,
  patientName = 'Margaret Johnson',
  onRefresh,
}: ClinicalControlCenterProps) {
  const [cards] = useState<ClinicalSummaryCardType[]>(
    getAllClinicalSummaryCards(admissionId)
  );
  const [filterMode, setFilterMode] = useState<'all' | 'critical'>('all');
  const [hiddenCards, setHiddenCards] = useState<Set<CardType>>(new Set());

  // Calculate statistics
  const healthScore = useMemo(() => getAdmissionHealthScore(cards), [cards]);
  const stats = useMemo(() => getCardStatistics(cards), [cards]);
  const criticalCards = useMemo(() => getCriticalCards(cards), [cards]);

  // Filter cards
  const displayedCards = useMemo(() => {
    let filtered = cards.filter(card => !hiddenCards.has(card.type));
    if (filterMode === 'critical') {
      filtered = filtered.filter(card =>
        criticalCards.some(c => c.id === card.id)
      );
    }
    return filtered;
  }, [cards, filterMode, hiddenCards, criticalCards]);

  const toggleCardVisibility = (cardType: CardType) => {
    setHiddenCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardType)) {
        newSet.delete(cardType);
      } else {
        newSet.add(cardType);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinical Control Center</h2>
          <p className="text-sm text-gray-600 mt-1">{patientName} • Admission #{admissionId}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Health Score Banner */}
      <HealthScoreBanner healthScore={healthScore} stats={stats} />

      {/* Filter Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex items-center gap-2">
              <Button
                variant={filterMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterMode('all')}
              >
                All Cards
                <Badge variant="secondary" className="ml-2">
                  {cards.length}
                </Badge>
              </Button>
              <Button
                variant={filterMode === 'critical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterMode('critical')}
              >
                Critical Only
                {criticalCards.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {criticalCards.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Card Visibility Toggles */}
          <div className="flex items-center gap-2">
            {cards.map(card => {
              const isHidden = hiddenCards.has(card.type);
              return (
                <Button
                  key={card.id}
                  variant={isHidden ? 'ghost' : 'outline'}
                  size="sm"
                  onClick={() => toggleCardVisibility(card.type)}
                  className={cn(isHidden && 'opacity-50')}
                >
                  {isHidden ? (
                    <EyeOff className="w-4 h-4 mr-1.5" />
                  ) : (
                    <Eye className="w-4 h-4 mr-1.5" />
                  )}
                  {card.title}
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedCards.map(card => (
          <ClinicalSummaryCard
            key={card.id}
            data={card}
            onAction={actionId => {
              console.log('Action triggered:', actionId);
            }}
          />
        ))}
      </div>

      {/* Empty State */}
      {displayedCards.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h4 className="font-semibold text-gray-900 mb-1">No Cards to Display</h4>
            <p className="text-sm text-gray-600">
              {filterMode === 'critical'
                ? 'No critical issues detected. Great work!'
                : 'All cards are currently hidden. Toggle visibility above to show cards.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH SCORE BANNER
// ═══════════════════════════════════════════════════════════════════════════

interface HealthScoreBannerProps {
  healthScore: ReturnType<typeof getAdmissionHealthScore>;
  stats: ReturnType<typeof getCardStatistics>;
}

function HealthScoreBanner({ healthScore, stats }: HealthScoreBannerProps) {
  const levelConfig = {
    excellent: {
      color: '#10B981',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-900',
      icon: CheckCircle,
    },
    good: {
      color: '#3B82F6',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-900',
      icon: TrendingUp,
    },
    fair: {
      color: '#F59E0B',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      textColor: 'text-amber-900',
      icon: AlertCircle,
    },
    poor: {
      color: '#EF4444',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-900',
      icon: TrendingDown,
    },
  };

  const config = levelConfig[healthScore.level];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        'border-2 overflow-hidden',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Health Score Circle */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                />
                {/* Progress Circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke={config.color}
                  strokeWidth="8"
                  strokeDasharray={`${(healthScore.score / 100) * 351.86} 351.86`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold" style={{ color: config.color }}>
                  {healthScore.score}
                </p>
                <p className="text-xs text-gray-600">Health Score</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-6 h-6" style={{ color: config.color }} />
              <h3 className={cn('text-xl font-bold', config.textColor)}>
                {healthScore.level.charAt(0).toUpperCase() + healthScore.level.slice(1)} Condition
              </h3>
            </div>
            <p className={cn('text-sm mb-4', config.textColor)}>
              {healthScore.message}
            </p>

            {/* Statistics Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Total Warnings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWarnings}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalWarnings}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Cards Need Attention</p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.cardsNeedingAttention}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
