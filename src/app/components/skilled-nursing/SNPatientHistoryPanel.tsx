/**
 * SN Patient History Panel
 * Display previous patient assessment patterns and trends
 */

import React, { useState, useMemo } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface HistoryItem {
  date: string;
  type: string;
  finding: string;
  value?: string | number;
  clinician: string;
}

interface SNPatientHistoryPanelProps {
  patientId: string;
  category: string;
  onInsert?: (text: string) => void;
}

export function SNPatientHistoryPanel({
  patientId,
  category,
  onInsert,
}: SNPatientHistoryPanelProps) {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');
  
  // Mock history data - in real app, fetch from API
  const historyItems = useMemo(
    () => getMockHistoryForCategory(patientId, category, timeRange),
    [patientId, category, timeRange]
  );

  const trends = useMemo(() => analyzeTrends(historyItems), [historyItems]);

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Patient History Pattern
          </h4>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="text-xs border border-gray-200 rounded px-2 py-1"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
        </div>

        {trends && (
          <TrendIndicator trend={trends} />
        )}
      </div>

      <div className="max-h-64 overflow-y-auto">
        {historyItems.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No previous history for this category
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {historyItems.map((item, idx) => (
              <HistoryItemRow
                key={idx}
                item={item}
                onInsert={onInsert}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TrendIndicatorProps {
  trend: {
    direction: 'improving' | 'stable' | 'declining';
    description: string;
  };
}

function TrendIndicator({ trend }: TrendIndicatorProps) {
  const icons = {
    improving: TrendingUp,
    stable: Minus,
    declining: TrendingDown,
  };

  const colors = {
    improving: 'text-green-600 bg-green-50',
    stable: 'text-gray-600 bg-gray-50',
    declining: 'text-red-600 bg-red-50',
  };

  const Icon = icons[trend.direction];

  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${colors[trend.direction]}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium">{trend.description}</span>
    </div>
  );
}

interface HistoryItemRowProps {
  item: HistoryItem;
  onInsert?: (text: string) => void;
}

function HistoryItemRow({ item, onInsert }: HistoryItemRowProps) {
  const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="p-3 hover:bg-gray-50 group">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-gray-900">{formattedDate}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{item.type}</span>
          </div>
          <p className="text-sm text-gray-700">{item.finding}</p>
          {item.value && (
            <p className="text-xs text-gray-600 mt-0.5">Value: {item.value}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">{item.clinician}</p>
        </div>
        
        {onInsert && (
          <button
            onClick={() => onInsert(item.finding)}
            className="opacity-0 group-hover:opacity-100 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded"
          >
            Insert
          </button>
        )}
      </div>
    </div>
  );
}

// Mock data generator - replace with actual API call
function getMockHistoryForCategory(
  patientId: string,
  category: string,
  timeRange: string
): HistoryItem[] {
  const mockData: Record<string, HistoryItem[]> = {
    vital_signs: [
      {
        date: '2026-03-10',
        type: 'SN Visit',
        finding: 'BP 142/86, HR 78, RR 18, O2 sat 96% on room air',
        clinician: 'Jane Smith, RN',
      },
      {
        date: '2026-03-05',
        type: 'SN Visit',
        finding: 'BP 138/84, HR 76, RR 16, O2 sat 97% on room air',
        clinician: 'Jane Smith, RN',
      },
      {
        date: '2026-03-01',
        type: 'SN Visit',
        finding: 'BP 145/88, HR 82, RR 20, O2 sat 95% on room air',
        value: 'BP trending down with medication compliance',
        clinician: 'John Davis, RN',
      },
    ],
    
    cardiopulmonary: [
      {
        date: '2026-03-10',
        type: 'SN Visit',
        finding: 'Lungs clear to auscultation bilaterally, no adventitious sounds',
        clinician: 'Jane Smith, RN',
      },
      {
        date: '2026-03-05',
        type: 'SN Visit',
        finding: 'Trace crackles in bilateral bases, cleared with cough',
        clinician: 'Jane Smith, RN',
      },
    ],
    
    pain: [
      {
        date: '2026-03-10',
        type: 'SN Visit',
        finding: 'Reports pain 3/10 in lower back, aching quality, improved with medication',
        value: '3/10',
        clinician: 'Jane Smith, RN',
      },
      {
        date: '2026-03-05',
        type: 'SN Visit',
        finding: 'Reports pain 4/10 in lower back, taking pain medication as ordered',
        value: '4/10',
        clinician: 'Jane Smith, RN',
      },
      {
        date: '2026-03-01',
        type: 'SN Visit',
        finding: 'Reports pain 5/10 in lower back, limits mobility',
        value: '5/10',
        clinician: 'John Davis, RN',
      },
    ],
    
    integumentary: [
      {
        date: '2026-03-10',
        type: 'SN Visit',
        finding: 'Right heel pressure injury Stage 2, 2cm x 1.5cm, wound bed pink with granulation tissue, minimal serous drainage',
        clinician: 'Jane Smith, RN',
      },
      {
        date: '2026-03-05',
        type: 'SN Visit',
        finding: 'Right heel pressure injury Stage 2, 2.5cm x 2cm, wound bed 50% red/50% pink, moderate serous drainage',
        clinician: 'Jane Smith, RN',
      },
    ],
    
    safety: [
      {
        date: '2026-03-10',
        type: 'SN Visit',
        finding: 'Patient using walker appropriately, steady gait with device, no falls since last visit',
        clinician: 'Jane Smith, RN',
      },
      {
        date: '2026-03-05',
        type: 'SN Visit',
        finding: 'Patient using walker, gait improving, continues to need supervision',
        clinician: 'Jane Smith, RN',
      },
    ],
  };

  return mockData[category] || [];
}

function analyzeTrends(items: HistoryItem[]): {
  direction: 'improving' | 'stable' | 'declining';
  description: string;
} | null {
  if (items.length === 0) return null;

  // Simple trend analysis based on most recent vs oldest item
  // In production, this would be more sophisticated
  
  // For vital signs, check BP trends
  if (items[0].finding.includes('BP') && items.length >= 2) {
    const latestBP = extractBP(items[0].finding);
    const oldestBP = extractBP(items[items.length - 1].finding);
    
    if (latestBP && oldestBP) {
      if (latestBP.systolic < oldestBP.systolic) {
        return {
          direction: 'improving',
          description: 'Blood pressure trending down',
        };
      } else if (latestBP.systolic > oldestBP.systolic) {
        return {
          direction: 'declining',
          description: 'Blood pressure trending up',
        };
      }
    }
  }

  // For pain, check pain scores
  if (items[0].value && typeof items[0].value === 'string' && items[0].value.includes('/10')) {
    const scores = items
      .filter(i => i.value && typeof i.value === 'string')
      .map(i => parseInt((i.value as string).split('/')[0]));
    
    if (scores.length >= 2) {
      const latest = scores[0];
      const oldest = scores[scores.length - 1];
      
      if (latest < oldest) {
        return {
          direction: 'improving',
          description: `Pain decreasing (${oldest}/10 → ${latest}/10)`,
        };
      } else if (latest > oldest) {
        return {
          direction: 'declining',
          description: `Pain increasing (${oldest}/10 → ${latest}/10)`,
        };
      }
    }
  }

  // For wounds, check size trends
  if (items[0].finding.includes('cm x')) {
    const sizes = items.map(extractWoundSize).filter(Boolean);
    
    if (sizes.length >= 2) {
      const latestArea = sizes[0]!.length * sizes[0]!.width;
      const oldestArea = sizes[sizes.length - 1]!.length * sizes[sizes.length - 1]!.width;
      
      if (latestArea < oldestArea * 0.9) {
        return {
          direction: 'improving',
          description: 'Wound size decreasing',
        };
      } else if (latestArea > oldestArea * 1.1) {
        return {
          direction: 'declining',
          description: 'Wound size increasing',
        };
      }
    }
  }

  return {
    direction: 'stable',
    description: 'Condition stable',
  };
}

function extractBP(text: string): { systolic: number; diastolic: number } | null {
  const match = text.match(/BP\s+(\d+)\/(\d+)/);
  if (match) {
    return {
      systolic: parseInt(match[1]),
      diastolic: parseInt(match[2]),
    };
  }
  return null;
}

function extractWoundSize(item: HistoryItem): { length: number; width: number } | null {
  const match = item.finding.match(/(\d+(?:\.\d+)?)cm\s*x\s*(\d+(?:\.\d+)?)cm/);
  if (match) {
    return {
      length: parseFloat(match[1]),
      width: parseFloat(match[2]),
    };
  }
  return null;
}
