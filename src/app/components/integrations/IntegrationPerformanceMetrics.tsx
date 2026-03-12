/**
 * Integration Performance Metrics
 * 
 * Display performance analytics including API response times, success rates,
 * error rates, and transaction volumes with trend charts over time.
 */

import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { IntegrationCategory } from '../../lib/integrationTypes';

interface IntegrationPerformanceMetricsProps {
  category?: IntegrationCategory;
}

export default function IntegrationPerformanceMetrics({
  category,
}: IntegrationPerformanceMetricsProps) {
  // Mock data - in production, fetch from analytics API
  const metrics = {
    avgResponseTime: 245,
    responseTimeTrend: -12, // negative = improvement
    successRate: 98.5,
    successRateTrend: 1.2,
    errorRate: 1.5,
    errorRateTrend: -0.3,
    dailyVolume: 1250,
    volumeTrend: 15,
  };

  const performanceData = [
    { date: '2024-03-04', avgResponse: 280, success: 97.2, errors: 2.8, volume: 1100 },
    { date: '2024-03-05', avgResponse: 265, success: 97.8, errors: 2.2, volume: 1150 },
    { date: '2024-03-06', avgResponse: 255, success: 98.0, errors: 2.0, volume: 1200 },
    { date: '2024-03-07', avgResponse: 250, success: 98.3, errors: 1.7, volume: 1180 },
    { date: '2024-03-08', avgResponse: 248, success: 98.5, errors: 1.5, volume: 1220 },
    { date: '2024-03-09', avgResponse: 242, success: 98.7, errors: 1.3, volume: 1240 },
    { date: '2024-03-10', avgResponse: 245, success: 98.5, errors: 1.5, volume: 1250 },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {/* Average Response Time */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            {metrics.responseTimeTrend < 0 ? (
              <TrendingDown className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.avgResponseTime}ms</div>
          <div className="text-sm text-gray-600 mb-1">Avg Response Time</div>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              metrics.responseTimeTrend < 0
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-red-100 text-red-700 border-red-300'
            )}
          >
            {metrics.responseTimeTrend > 0 ? '+' : ''}
            {metrics.responseTimeTrend}% vs last week
          </Badge>
        </Card>

        {/* Success Rate */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            {metrics.successRateTrend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.successRate}%</div>
          <div className="text-sm text-gray-600 mb-1">Success Rate</div>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              metrics.successRateTrend > 0
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-red-100 text-red-700 border-red-300'
            )}
          >
            {metrics.successRateTrend > 0 ? '+' : ''}
            {metrics.successRateTrend}% vs last week
          </Badge>
        </Card>

        {/* Error Rate */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            {metrics.errorRateTrend < 0 ? (
              <TrendingDown className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{metrics.errorRate}%</div>
          <div className="text-sm text-gray-600 mb-1">Error Rate</div>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              metrics.errorRateTrend < 0
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-red-100 text-red-700 border-red-300'
            )}
          >
            {metrics.errorRateTrend > 0 ? '+' : ''}
            {metrics.errorRateTrend}% vs last week
          </Badge>
        </Card>

        {/* Daily Volume */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
            {metrics.volumeTrend > 0 ? (
              <TrendingUp className="w-4 h-4 text-blue-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-gray-600" />
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics.dailyVolume.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mb-1">Daily Volume</div>
          <Badge
            variant="outline"
            className="text-xs bg-blue-100 text-blue-700 border-blue-300"
          >
            {metrics.volumeTrend > 0 ? '+' : ''}
            {metrics.volumeTrend}% vs last week
          </Badge>
        </Card>
      </div>

      {/* Response Time Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Response Time Trend</h3>
          <Badge variant="outline" className="text-xs">
            Last 7 days
          </Badge>
        </div>
        <SimpleLineChart
          data={performanceData}
          dataKey="avgResponse"
          color="blue"
          label="ms"
        />
      </Card>

      {/* Success Rate Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Success Rate Trend</h3>
          <Badge variant="outline" className="text-xs">
            Last 7 days
          </Badge>
        </div>
        <SimpleLineChart
          data={performanceData}
          dataKey="success"
          color="green"
          label="%"
        />
      </Card>

      {/* Volume Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Transaction Volume</h3>
          <Badge variant="outline" className="text-xs">
            Last 7 days
          </Badge>
        </div>
        <SimpleBarChart data={performanceData} dataKey="volume" color="purple" />
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE CHART COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function SimpleLineChart({
  data,
  dataKey,
  color,
  label,
}: {
  data: any[];
  dataKey: string;
  color: string;
  label: string;
}) {
  const values = data.map((d) => d[dataKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d[dataKey] - min) / range) * 100;
    return `${x},${y}`;
  });

  return (
    <div className="relative h-48">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke={color === 'blue' ? '#3b82f6' : color === 'green' ? '#22c55e' : '#a855f7'}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - ((d[dataKey] - min) / range) * 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1"
              fill={color === 'blue' ? '#3b82f6' : color === 'green' ? '#22c55e' : '#a855f7'}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      {/* Y-axis labels */}
      <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-600">
        <span>
          {max}
          {label}
        </span>
        <span>
          {((max + min) / 2).toFixed(0)}
          {label}
        </span>
        <span>
          {min}
          {label}
        </span>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        {data.map((d, i) => (
          <span key={i} className={i % 2 === 0 ? '' : 'opacity-0'}>
            {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>
    </div>
  );
}

function SimpleBarChart({
  data,
  dataKey,
  color,
}: {
  data: any[];
  dataKey: string;
  color: string;
}) {
  const max = Math.max(...data.map((d) => d[dataKey]));

  return (
    <div className="relative h-48">
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((d, i) => {
          const height = (d[dataKey] / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className={cn(
                  'w-full rounded-t transition-all',
                  color === 'purple' ? 'bg-purple-500' : 'bg-blue-500'
                )}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Y-axis labels */}
      <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-600">
        <span>{max.toLocaleString()}</span>
        <span>{(max / 2).toLocaleString()}</span>
        <span>0</span>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        {data.map((d, i) => (
          <span key={i} className={i % 2 === 0 ? 'flex-1 text-center' : 'opacity-0 flex-1'}>
            {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>
    </div>
  );
}
