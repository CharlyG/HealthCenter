/**
 * PatientAlertsPanel Component
 * Displays alerts specific to a patient within their chart view.
 * Used in the patient chart page as a collapsible panel.
 */
import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAlerts } from '../../context/AlertContext';
import { AlertCard } from './AlertCard';
import { AlertBadge } from './AlertBadge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronDown, Bell, CheckCheck } from 'lucide-react';
import { cn } from '../ui/utils';
import type { ClinicalAlert } from '../../lib/alertTypes';

interface PatientAlertsPanelProps {
  patientId: string;
  /** Start collapsed? */
  defaultOpen?: boolean;
  className?: string;
}

export const PatientAlertsPanel = React.memo(function PatientAlertsPanel({
  patientId,
  defaultOpen = true,
  className,
}: PatientAlertsPanelProps) {
  const navigate = useNavigate();
  const {
    getPatientAlerts,
    getPatientAlertCounts,
    acknowledge,
    resolve,
    dismiss,
  } = useAlerts();

  const [isOpen, setIsOpen] = useState(defaultOpen);

  const patientAlerts = useMemo(() => getPatientAlerts(patientId), [getPatientAlerts, patientId]);
  const counts = useMemo(() => getPatientAlertCounts(patientId), [getPatientAlertCounts, patientId]);

  const activeAlerts = useMemo(
    () => patientAlerts.filter(a => a.status === 'open' || a.status === 'acknowledged'),
    [patientAlerts]
  );

  const handleQuickAction = useCallback((alert: ClinicalAlert) => {
    if (alert.quickAction?.route) {
      navigate(alert.quickAction.route);
    }
  }, [navigate]);

  // Don't render if no alerts for this patient
  if (patientAlerts.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn('border-2', counts.critical > 0 ? 'border-red-300' : counts.high > 0 ? 'border-orange-300' : 'border-gray-200', className)}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="size-4" />
                Patient Alerts
                <AlertBadge counts={counts} compact />
              </CardTitle>
              <ChevronDown
                className={cn(
                  'size-4 text-gray-400 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="px-4 pb-4 pt-0 space-y-3">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-4">
                <CheckCheck className="size-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-gray-600">No active alerts for this patient</p>
              </div>
            ) : (
              activeAlerts.map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  showPatient={false}
                  onAcknowledge={acknowledge}
                  onResolve={resolve}
                  onDismiss={dismiss}
                  onQuickAction={handleQuickAction}
                />
              ))
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
});

export default PatientAlertsPanel;
