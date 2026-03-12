/**
 * Healthcare Design System - Metric Card
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type MetricTrend = 'up' | 'down' | 'neutral';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: MetricTrend;
  trendValue?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
  className?: string;
}

const trendIcons: Record<MetricTrend, React.ReactNode> = {
  up: <TrendingUp className="size-4" />,
  down: <TrendingDown className="size-4" />,
  neutral: <Minus className="size-4" />,
};

const trendColors: Record<MetricTrend, string> = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-500',
};

const variantColors: Record<string, string> = {
  default: 'border-gray-200',
  success: 'border-green-500 bg-green-50',
  warning: 'border-yellow-500 bg-yellow-50',
  danger: 'border-red-500 bg-red-50',
};

export const MetricCard = React.memo(({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  variant = 'default',
  onClick,
  className = '',
}: MetricCardProps) => {
  return (
    <Card
      className={`${variantColors[variant]} ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trendColors[trend]}`}>
              {trendIcons[trend]}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';