/**
 * Risk Trend Chart — 7-day trend line chart per risk category.
 */
import React, { useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import type { RiskTrendPoint, RiskCategory } from '../../lib/riskTypes';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const LINE_COLORS: Record<string, string> = {
  hospitalization: '#ef4444',
  missed_visits: '#f97316',
  caregiver_reliability: '#8b5cf6',
  missing_documentation: '#f59e0b',
  claim_rejection: '#3b82f6',
  expiring_authorization: '#14b8a6',
};

const LINE_LABELS: Record<string, string> = {
  hospitalization: 'Hospitalization',
  missed_visits: 'Missed Visits',
  caregiver_reliability: 'Caregiver',
  missing_documentation: 'Documentation',
  claim_rejection: 'Claims',
  expiring_authorization: 'Auth Expiry',
};

interface RiskTrendChartProps {
  trends: RiskTrendPoint[];
  visibleCategories?: RiskCategory[];
}

export const RiskTrendChart = React.memo(function RiskTrendChart({
  trends,
  visibleCategories,
}: RiskTrendChartProps) {
  const allCategories: RiskCategory[] = [
    'hospitalization', 'missed_visits', 'caregiver_reliability',
    'missing_documentation', 'claim_rejection', 'expiring_authorization',
  ];
  const active = visibleCategories ?? allCategories;

  const data = useMemo(() =>
    trends.map(t => ({
      ...t,
      date: t.date.slice(5), // MM-DD
    })),
  [trends]);

  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">7-Day Risk Trend</h4>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                iconType="circle"
                iconSize={6}
              />
              {active.map(cat => (
                <Line
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  name={LINE_LABELS[cat]}
                  stroke={LINE_COLORS[cat]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

export default RiskTrendChart;
