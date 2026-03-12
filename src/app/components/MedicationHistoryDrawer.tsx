/**
 * Medication History Drawer Component
 * 
 * Slide-out drawer showing complete history of a specific medication.
 * 
 * SECTIONS:
 * - Medication Summary (current state)
 * - Prescribing Information
 * - Timeline (dates)
 * - Change History
 * - Related Alerts
 * - Related Documentation
 * 
 * FEATURES:
 * - Opens from medication items
 * - Full medication context
 * - Change timeline
 * - Alert history
 * - Document references
 * - No navigation required
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import {
  X,
  Pill,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  Edit,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Download,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { MedicationEvent } from '../services/medicationTimeline';
import type { MedicationAlert } from '../services/medicationAlerts';
import { MEDICATION_EVENT_CONFIG } from '../services/medicationTimeline';
import { ALERT_SEVERITY_CONFIG } from '../services/medicationAlerts';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface MedicationHistoryData {
  id: string;
  name: string;
  genericName?: string;
  currentStrength?: string;
  currentDose?: string;
  currentRoute?: string;
  currentFrequency?: string;
  isPRN?: boolean;
  prnReason?: string;
  isActive: boolean;
  isHighRisk?: boolean;
  
  // Prescribing info
  prescribingPhysician?: string;
  indication?: string;
  instructions?: string;
  
  // Dates
  startDate?: string;
  endDate?: string;
  lastModifiedDate?: string;
  
  // Related data
  events: MedicationEvent[];
  alerts: MedicationAlert[];
  documentReferences: DocumentReference[];
}

export interface DocumentReference {
  id: string;
  type: 'visit-note' | 'assessment' | 'order' | 'reconciliation' | 'plan-of-care';
  title: string;
  date: string;
  author: string;
  status: 'draft' | 'signed' | 'locked';
  description?: string;
  url?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface MedicationHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: MedicationHistoryData | null;
}

export default function MedicationHistoryDrawer({
  open,
  onOpenChange,
  medication,
}: MedicationHistoryDrawerProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['summary', 'timeline']);

  if (!medication) {
    return null;
  }

  const activeDuration = medication.startDate
    ? calculateDuration(medication.startDate, medication.endDate)
    : null;

  const changeCount = medication.events.filter(e =>
    ['dose-changed', 'frequency-changed', 'route-changed', 'strength-changed'].includes(e.type)
  ).length;

  const activeAlerts = medication.alerts.filter(a => a.status === 'active');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-6 h-6 text-blue-600" />
                <SheetTitle className="text-xl">{medication.name}</SheetTitle>
              </div>
              {medication.genericName && medication.genericName !== medication.name && (
                <p className="text-sm text-gray-600">
                  Generic: {medication.genericName}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge className={medication.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
                  {medication.isActive ? 'Active' : 'Discontinued'}
                </Badge>
                {medication.isHighRisk && (
                  <Badge variant="destructive">High Risk</Badge>
                )}
                {medication.isPRN && (
                  <Badge variant="outline" className="bg-amber-50">PRN</Badge>
                )}
              </div>
            </div>
          </div>
          <SheetDescription>
            Complete medication history and related information
          </SheetDescription>
        </SheetHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard
            icon={Calendar}
            label="Duration"
            value={activeDuration || 'N/A'}
            small
          />
          <StatCard
            icon={Edit}
            label="Changes"
            value={changeCount}
            small
          />
          <StatCard
            icon={AlertTriangle}
            label="Active Alerts"
            value={activeAlerts.length}
            small
            color={activeAlerts.length > 0 ? 'amber' : undefined}
          />
        </div>

        <Separator className="mb-6" />

        {/* Accordion Sections */}
        <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
          {/* Medication Summary */}
          <AccordionItem value="summary">
            <AccordionTrigger className="text-base font-semibold">
              Medication Summary
            </AccordionTrigger>
            <AccordionContent>
              <MedicationSummarySection medication={medication} />
            </AccordionContent>
          </AccordionItem>

          {/* Prescribing Information */}
          <AccordionItem value="prescribing">
            <AccordionTrigger className="text-base font-semibold">
              Prescribing Information
            </AccordionTrigger>
            <AccordionContent>
              <PrescribingInfoSection medication={medication} />
            </AccordionContent>
          </AccordionItem>

          {/* Timeline */}
          <AccordionItem value="timeline">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                Timeline
                <Badge variant="outline" className="text-xs">
                  {medication.events.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <TimelineSection events={medication.events} />
            </AccordionContent>
          </AccordionItem>

          {/* Change History */}
          <AccordionItem value="changes">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                Change History
                <Badge variant="outline" className="text-xs">
                  {changeCount}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ChangeHistorySection events={medication.events} />
            </AccordionContent>
          </AccordionItem>

          {/* Related Alerts */}
          <AccordionItem value="alerts">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                Related Alerts
                <Badge variant="outline" className="text-xs">
                  {medication.alerts.length}
                </Badge>
                {activeAlerts.length > 0 && (
                  <Badge className="bg-amber-600 text-white text-xs ml-1">
                    {activeAlerts.length} active
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <AlertsSection alerts={medication.alerts} />
            </AccordionContent>
          </AccordionItem>

          {/* Related Documentation */}
          <AccordionItem value="documentation">
            <AccordionTrigger className="text-base font-semibold">
              <div className="flex items-center gap-2">
                Related Documentation
                <Badge variant="outline" className="text-xs">
                  {medication.documentReferences.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <DocumentationSection documents={medication.documentReferences} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t sticky bottom-0 bg-white">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export History
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATION SUMMARY SECTION
// ═══════════════════════════════════════════════════════════════════════════

function MedicationSummarySection({ medication }: { medication: MedicationHistoryData }) {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">Current Regimen</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {medication.currentStrength && (
            <div>
              <p className="text-blue-600 mb-1">Strength</p>
              <p className="font-semibold text-blue-900">{medication.currentStrength}</p>
            </div>
          )}
          {medication.currentDose && (
            <div>
              <p className="text-blue-600 mb-1">Dose</p>
              <p className="font-semibold text-blue-900">{medication.currentDose}</p>
            </div>
          )}
          {medication.currentRoute && (
            <div>
              <p className="text-blue-600 mb-1">Route</p>
              <p className="font-semibold text-blue-900">{medication.currentRoute}</p>
            </div>
          )}
          {medication.currentFrequency && (
            <div>
              <p className="text-blue-600 mb-1">Frequency</p>
              <p className="font-semibold text-blue-900">{medication.currentFrequency}</p>
            </div>
          )}
        </div>
        {medication.isPRN && medication.prnReason && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
            <p className="text-xs font-medium text-amber-900">
              PRN - {medication.prnReason}
            </p>
          </div>
        )}
      </Card>

      {medication.instructions && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Special Instructions</Label>
          <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded border">
            {medication.instructions}
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESCRIBING INFO SECTION
// ═══════════════════════════════════════════════════════════════════════════

function PrescribingInfoSection({ medication }: { medication: MedicationHistoryData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        {medication.prescribingPhysician && (
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <User className="w-4 h-4" />
              <span>Prescribing Physician</span>
            </div>
            <p className="font-semibold text-gray-900">{medication.prescribingPhysician}</p>
          </div>
        )}
        {medication.startDate && (
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span>Start Date</span>
            </div>
            <p className="font-semibold text-gray-900">
              {new Date(medication.startDate).toLocaleDateString()}
            </p>
          </div>
        )}
        {medication.endDate && (
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span>End Date</span>
            </div>
            <p className="font-semibold text-gray-900">
              {new Date(medication.endDate).toLocaleDateString()}
            </p>
          </div>
        )}
        {medication.lastModifiedDate && (
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span>Last Modified</span>
            </div>
            <p className="font-semibold text-gray-900">
              {new Date(medication.lastModifiedDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {medication.indication && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Indication</Label>
          <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded border">
            {medication.indication}
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE SECTION
// ═══════════════════════════════════════════════════════════════════════════

function TimelineSection({ events }: { events: MedicationEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No timeline events</p>
      </div>
    );
  }

  // Sort by date, most recent first
  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedEvents.map((event, idx) => (
        <TimelineEventCard
          key={event.id}
          event={event}
          isLast={idx === sortedEvents.length - 1}
        />
      ))}
    </div>
  );
}

function TimelineEventCard({ event, isLast }: { event: MedicationEvent; isLast: boolean }) {
  const config = MEDICATION_EVENT_CONFIG[event.type];
  const Icon = getEventIcon(event.type);
  const date = new Date(event.timestamp);

  return (
    <div className="relative pl-8">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
      )}

      {/* Event Icon */}
      <div className={cn(
        'absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center',
        config.bgColor
      )}>
        <Icon className={cn('w-4 h-4', config.iconColor)} />
      </div>

      {/* Event Content */}
      <div className="pb-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Badge className={cn('text-xs', config.badgeColor)}>
            {config.label}
          </Badge>
          <span className="text-xs text-gray-500">
            {date.toLocaleDateString()} {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-1">{event.description}</p>
        <p className="text-xs text-gray-500">by {event.user}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHANGE HISTORY SECTION
// ═══════════════════════════════════════════════════════════════════════════

function ChangeHistorySection({ events }: { events: MedicationEvent[] }) {
  const changeEvents = events.filter(e =>
    ['dose-changed', 'frequency-changed', 'route-changed', 'strength-changed'].includes(e.type)
  );

  if (changeEvents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Edit className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No changes recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {changeEvents.map(event => (
        <ChangeEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function ChangeEventCard({ event }: { event: MedicationEvent }) {
  const date = new Date(event.timestamp);
  const config = MEDICATION_EVENT_CONFIG[event.type];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge className={cn('text-xs', config.badgeColor)}>
            {config.label}
          </Badge>
        </div>
        <span className="text-xs text-gray-500">
          {date.toLocaleDateString()}
        </span>
      </div>

      {event.details?.previousValue && event.details?.newValue && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
          <div className="flex-1">
            <p className="text-xs text-gray-600 mb-1">Previous</p>
            <p className="text-sm font-semibold text-gray-900">
              {event.details.previousValue}
            </p>
          </div>
          <ArrowRightLeft className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-600 mb-1">New</p>
            <p className="text-sm font-semibold text-gray-900">
              {event.details.newValue}
            </p>
          </div>
        </div>
      )}

      {event.details?.notes && (
        <p className="text-xs text-gray-600 mt-2 p-2 bg-blue-50 rounded">
          <strong>Note:</strong> {event.details.notes}
        </p>
      )}

      <p className="text-xs text-gray-500 mt-2">Changed by {event.user}</p>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERTS SECTION
// ═══════════════════════════════════════════════════════════════════════════

function AlertsSection({ alerts }: { alerts: MedicationAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-50" />
        <p className="text-sm">No alerts</p>
      </div>
    );
  }

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="space-y-4">
      {activeAlerts.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-gray-900 mb-2">Active Alerts</h5>
          <div className="space-y-2">
            {activeAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {resolvedAlerts.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-gray-900 mb-2">Resolved Alerts</h5>
          <div className="space-y-2">
            {resolvedAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert }: { alert: MedicationAlert }) {
  const config = ALERT_SEVERITY_CONFIG[alert.severity];
  const date = new Date(alert.createdDate);

  return (
    <Card className={cn('p-3', alert.status === 'resolved' && 'opacity-60')}>
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <AlertCircle className={cn('w-4 h-4', config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={cn('text-xs', config.badgeColor)}>
              {config.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {alert.type.replace('-', ' ')}
            </Badge>
            {alert.status === 'resolved' && (
              <Badge className="bg-green-600 text-white text-xs">Resolved</Badge>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">{alert.title}</p>
          <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
          {alert.suggestedAction && (
            <p className="text-xs text-gray-700 p-2 bg-gray-50 rounded">
              <strong>Action:</strong> {alert.suggestedAction}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {date.toLocaleDateString()}
            {alert.resolvedBy && ` • Resolved by ${alert.resolvedBy}`}
          </p>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENTATION SECTION
// ═══════════════════════════════════════════════════════════════════════════

function DocumentationSection({ documents }: { documents: DocumentReference[] }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No related documentation</p>
      </div>
    );
  }

  // Group by type
  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) {
      acc[doc.type] = [];
    }
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<string, DocumentReference[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedDocs).map(([type, docs]) => (
        <div key={type}>
          <h5 className="text-sm font-semibold text-gray-900 mb-2 capitalize">
            {type.replace('-', ' ')}s ({docs.length})
          </h5>
          <div className="space-y-2">
            {docs.map(doc => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentCard({ document: doc }: { document: DocumentReference }) {
  const date = new Date(doc.date);

  return (
    <Card className="p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <h6 className="font-semibold text-sm text-gray-900 truncate">{doc.title}</h6>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                doc.status === 'signed' && 'bg-green-50 text-green-700',
                doc.status === 'locked' && 'bg-blue-50 text-blue-700'
              )}
            >
              {doc.status}
            </Badge>
          </div>
          {doc.description && (
            <p className="text-xs text-gray-600 mb-1">{doc.description}</p>
          )}
          <p className="text-xs text-gray-500">
            {date.toLocaleDateString()} • {doc.author}
          </p>
        </div>
        {doc.url && (
          <Button variant="ghost" size="sm" asChild>
            <a href={doc.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════

function StatCard({
  icon: Icon,
  label,
  value,
  small = false,
  color = 'blue',
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  small?: boolean;
  color?: 'blue' | 'amber';
}) {
  const colorConfig = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
  };

  return (
    <Card className={cn('p-3', colorConfig[color])}>
      <div className="flex items-center gap-2">
        <Icon className={cn(small ? 'w-4 h-4' : 'w-5 h-5')} />
        <div>
          <div className={cn('font-bold', small ? 'text-base' : 'text-xl')}>{value}</div>
          <div className={cn('opacity-80', small ? 'text-xs' : 'text-sm')}>{label}</div>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function calculateDuration(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    return remainingMonths > 0
      ? `${years}y ${remainingMonths}m`
      : `${years} year${years !== 1 ? 's' : ''}`;
  }
}

function getEventIcon(type: string) {
  switch (type) {
    case 'medication-added':
    case 'medication-resumed':
      return Plus;
    case 'medication-discontinued':
      return XCircle;
    case 'dose-changed':
    case 'strength-changed':
      return TrendingUp;
    case 'route-changed':
    case 'frequency-changed':
      return ArrowRightLeft;
    case 'reconciliation-completed':
      return CheckCircle2;
    case 'alert-resolved':
      return CheckCircle2;
    case 'prn-status-changed':
    case 'physician-changed':
      return Edit;
    default:
      return Pill;
  }
}

function Label({ children, className, ...props }: any) {
  return (
    <label className={cn('text-sm font-medium text-gray-700', className)} {...props}>
      {children}
    </label>
  );
}
