/**
 * Healthcare Design System - EVV Status Card
 * Displays Electronic Visit Verification status for a visit
 */
import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Clock, MapPin, Smartphone } from 'lucide-react';

export type EVVStatus = 'verified' | 'pending' | 'missing' | 'exception' | 'partial';

interface EVVStatusData {
  visit_id: string;
  patient_name: string;
  visit_date: string;
  visit_time: string;
  clinician_name: string;
  status: EVVStatus;
  clock_in_time?: string;
  clock_out_time?: string;
  clock_in_location?: string;
  clock_out_location?: string;
  verification_method?: 'mobile' | 'telephony' | 'fixed';
  exception_reason?: string;
}

interface EVVStatusCardProps {
  data: EVVStatusData;
  onResolve?: () => void;
  onClick?: () => void;
  className?: string;
}

const statusConfig: Record<EVVStatus, {
  label: string;
  color: string;
  icon: React.ReactNode;
  variant: 'default' | 'success' | 'warning' | 'destructive';
}> = {
  verified: {
    label: 'Verified',
    color: 'bg-green-50 border-green-200',
    icon: <CheckCircle2 className="size-5 text-green-600" />,
    variant: 'success',
  },
  pending: {
    label: 'Pending Verification',
    color: 'bg-yellow-50 border-yellow-200',
    icon: <Clock className="size-5 text-yellow-600" />,
    variant: 'warning',
  },
  missing: {
    label: 'EVV Missing',
    color: 'bg-red-50 border-red-200',
    icon: <XCircle className="size-5 text-red-600" />,
    variant: 'destructive',
  },
  exception: {
    label: 'Exception',
    color: 'bg-orange-50 border-orange-200',
    icon: <AlertCircle className="size-5 text-orange-600" />,
    variant: 'warning',
  },
  partial: {
    label: 'Partial Data',
    color: 'bg-yellow-50 border-yellow-200',
    icon: <AlertCircle className="size-5 text-yellow-600" />,
    variant: 'warning',
  },
};

const methodIcons = {
  mobile: <Smartphone className="size-3" />,
  telephony: <Clock className="size-3" />,
  fixed: <MapPin className="size-3" />,
};

export const EVVStatusCard = React.memo(({
  data,
  onResolve,
  onClick,
  className = '',
}: EVVStatusCardProps) => {
  const config = statusConfig[data.status];

  return (
    <Card
      className={`${config.color} border ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {config.icon}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-900">{data.patient_name}</span>
              <Badge variant={config.variant} className="text-xs">
                {config.label}
              </Badge>
              {data.verification_method && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {methodIcons[data.verification_method]}
                  <span>{data.verification_method}</span>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-700 mb-2">
              <span className="font-medium">{data.clinician_name}</span>
              {' · '}
              <span>{data.visit_date} at {data.visit_time}</span>
            </div>

            {data.clock_in_time && data.clock_out_time && (
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <Clock className="size-3 inline mr-1" />
                  Clock In: {data.clock_in_time}
                  {data.clock_in_location && ` • ${data.clock_in_location}`}
                </div>
                <div>
                  <Clock className="size-3 inline mr-1" />
                  Clock Out: {data.clock_out_time}
                  {data.clock_out_location && ` • ${data.clock_out_location}`}
                </div>
              </div>
            )}

            {data.exception_reason && (
              <div className="mt-2 text-xs bg-white border border-orange-300 rounded px-2 py-1 text-orange-900">
                <AlertCircle className="size-3 inline mr-1" />
                {data.exception_reason}
              </div>
            )}
          </div>

          {onResolve && data.status !== 'verified' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolve();
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Resolve
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

EVVStatusCard.displayName = 'EVVStatusCard';