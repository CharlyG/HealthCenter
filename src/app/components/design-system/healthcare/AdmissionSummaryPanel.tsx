/**
 * Healthcare Design System - Admission Summary Panel
 * Displays admission status, dates, and quick metrics
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { StatusBadge } from '../StatusBadge';
import { Calendar, User, Building2, FileText } from 'lucide-react';
import { formatDate } from '../../../lib/utils/dateUtils';

export interface AdmissionSummaryData {
  id: string;
  admission_date: string;
  discharge_date?: string;
  status: 'active' | 'pending' | 'discharged';
  service_type: string;
  frequency?: string;
  case_manager?: string;
  office_name?: string;
  total_visits?: number;
  pending_visits?: number;
}

interface AdmissionSummaryPanelProps {
  admission: AdmissionSummaryData;
  onEdit?: () => void;
  className?: string;
}

export const AdmissionSummaryPanel = React.memo(({
  admission,
  onEdit,
  className = '',
}: AdmissionSummaryPanelProps) => {
  const daysSinceAdmission = Math.floor(
    (new Date().getTime() - new Date(admission.admission_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Admission Summary</CardTitle>
          <StatusBadge status={admission.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Calendar className="size-3" />
              <span className="uppercase font-medium">Admitted</span>
            </div>
            <div className="font-semibold text-gray-900">
              {formatDate(admission.admission_date)}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {daysSinceAdmission} days ago
            </div>
          </div>

          {admission.discharge_date ? (
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Calendar className="size-3" />
                <span className="uppercase font-medium">Discharged</span>
              </div>
              <div className="font-semibold text-gray-900">
                {formatDate(admission.discharge_date)}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <FileText className="size-3" />
                <span className="uppercase font-medium">Service Type</span>
              </div>
              <div className="font-semibold text-gray-900">
                {admission.service_type}
              </div>
              {admission.frequency && (
                <div className="text-xs text-gray-600 mt-0.5">
                  {admission.frequency}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assignment Info */}
        <div className="pt-4 border-t border-gray-200 space-y-3">
          {admission.case_manager && (
            <div className="flex items-center gap-2 text-sm">
              <User className="size-4 text-gray-400" />
              <span className="text-gray-600">Case Manager:</span>
              <span className="font-medium text-gray-900">{admission.case_manager}</span>
            </div>
          )}

          {admission.office_name && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="size-4 text-gray-400" />
              <span className="text-gray-600">Office:</span>
              <span className="font-medium text-gray-900">{admission.office_name}</span>
            </div>
          )}
        </div>

        {/* Visit Stats */}
        {(admission.total_visits !== undefined || admission.pending_visits !== undefined) && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              {admission.total_visits !== undefined && (
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {admission.total_visits}
                  </div>
                  <div className="text-xs text-gray-600">Total Visits</div>
                </div>
              )}
              {admission.pending_visits !== undefined && (
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {admission.pending_visits}
                  </div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

AdmissionSummaryPanel.displayName = 'AdmissionSummaryPanel';