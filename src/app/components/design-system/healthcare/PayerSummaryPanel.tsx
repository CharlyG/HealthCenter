/**
 * Healthcare Design System - Payer Summary Panel
 * Displays insurance/payer information and authorization status
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Building2, Calendar, Hash, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../../lib/utils/dateUtils';

export interface PayerData {
  id: string;
  payer_name: string;
  payer_type: 'primary' | 'secondary' | 'tertiary';
  policy_number: string;
  group_number?: string;
  effective_date?: string;
  termination_date?: string;
  authorization_required: boolean;
  authorization_number?: string;
  authorization_start?: string;
  authorization_end?: string;
  authorized_visits?: number;
  used_visits?: number;
}

interface PayerSummaryPanelProps {
  payer: PayerData;
  className?: string;
}

export const PayerSummaryPanel = React.memo(({
  payer,
  className = '',
}: PayerSummaryPanelProps) => {
  const isAuthExpiringSoon = payer.authorization_end 
    ? new Date(payer.authorization_end).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
    : false;

  const isAuthExpired = payer.authorization_end 
    ? new Date(payer.authorization_end) < new Date()
    : false;

  const hasAuthorization = payer.authorization_required 
    ? !!payer.authorization_number 
    : true;

  const visitsRemaining = payer.authorized_visits && payer.used_visits 
    ? payer.authorized_visits - payer.used_visits
    : undefined;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Payer Information</CardTitle>
          <Badge variant={payer.payer_type === 'primary' ? 'default' : 'outline'}>
            {payer.payer_type.charAt(0).toUpperCase() + payer.payer_type.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payer Details */}
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Building2 className="size-3" />
            <span className="uppercase font-medium">Payer</span>
          </div>
          <div className="font-semibold text-gray-900 text-lg">
            {payer.payer_name}
          </div>
        </div>

        {/* Policy Information */}
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Hash className="size-3" />
              <span className="uppercase font-medium">Policy Number</span>
            </div>
            <div className="font-mono font-semibold text-gray-900">
              {payer.policy_number}
            </div>
          </div>

          {payer.group_number && (
            <div>
              <div className="text-xs text-gray-500 mb-1">
                <span className="uppercase font-medium">Group Number</span>
              </div>
              <div className="font-mono font-semibold text-gray-900">
                {payer.group_number}
              </div>
            </div>
          )}
        </div>

        {/* Coverage Dates */}
        {(payer.effective_date || payer.termination_date) && (
          <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
            {payer.effective_date && (
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Calendar className="size-3" />
                  <span className="uppercase font-medium">Effective</span>
                </div>
                <div className="font-semibold text-gray-900 text-sm">
                  {formatDate(payer.effective_date)}
                </div>
              </div>
            )}

            {payer.termination_date && (
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Calendar className="size-3" />
                  <span className="uppercase font-medium">Termination</span>
                </div>
                <div className="font-semibold text-gray-900 text-sm">
                  {formatDate(payer.termination_date)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Authorization Status */}
        {payer.authorization_required && (
          <div className={`pt-4 border-t border-gray-200 ${isAuthExpired ? 'bg-red-50 -mx-6 -mb-6 px-6 pb-6 mt-4' : isAuthExpiringSoon ? 'bg-yellow-50 -mx-6 -mb-6 px-6 pb-6 mt-4' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              {!hasAuthorization || isAuthExpired ? (
                <AlertCircle className="size-5 text-red-600" />
              ) : isAuthExpiringSoon ? (
                <AlertCircle className="size-5 text-yellow-600" />
              ) : (
                <CheckCircle2 className="size-5 text-green-600" />
              )}
              <span className="font-semibold text-gray-900">Authorization</span>
            </div>

            {payer.authorization_number ? (
              <>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-gray-600">Auth #:</span>
                    <span className="font-mono font-semibold text-gray-900 ml-2">
                      {payer.authorization_number}
                    </span>
                  </div>

                  {payer.authorization_start && payer.authorization_end && (
                    <div>
                      <span className="text-gray-600">Valid:</span>
                      <span className="font-semibold text-gray-900 ml-2">
                        {formatDate(payer.authorization_start)} - {formatDate(payer.authorization_end)}
                      </span>
                      {isAuthExpired && (
                        <Badge variant="destructive" className="ml-2">Expired</Badge>
                      )}
                      {isAuthExpiringSoon && !isAuthExpired && (
                        <Badge variant="warning" className="ml-2">Expiring Soon</Badge>
                      )}
                    </div>
                  )}

                  {visitsRemaining !== undefined && (
                    <div>
                      <span className="text-gray-600">Visits Remaining:</span>
                      <span className={`font-bold ml-2 ${visitsRemaining <= 3 ? 'text-red-600' : 'text-gray-900'}`}>
                        {visitsRemaining} of {payer.authorized_visits}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="size-4" />
                <span className="font-medium">Authorization Required - Not on File</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

PayerSummaryPanel.displayName = 'PayerSummaryPanel';