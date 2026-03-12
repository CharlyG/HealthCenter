/**
 * Order Document Detail Component
 * 
 * Comprehensive detail view for orders and certification documents.
 * Shows document content, workflow state, signatures, and compliance tracking.
 */

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  FileText,
  Phone,
  ClipboardList,
  RefreshCw,
  CheckCircle,
  User,
  Calendar,
  Clock,
  AlertCircle,
  CheckSquare,
  Send,
  Download,
  Printer,
  Edit,
  X,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  type OrderCertificationDocument,
  type WorkflowEvent,
  type Signature,
  DOCUMENT_CATEGORY_CONFIG,
  STATUS_CONFIG,
  calculateExpirationWarning,
} from '../services/ordersAndCertification';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface OrderDocumentDetailProps {
  document: OrderCertificationDocument;
  onClose?: () => void;
  onEdit?: () => void;
  onSendForSignature?: () => void;
}

export default function OrderDocumentDetail({
  document,
  onClose,
  onEdit,
  onSendForSignature,
}: OrderDocumentDetailProps) {
  const categoryConfig = DOCUMENT_CATEGORY_CONFIG[document.category];
  const statusConfig = STATUS_CONFIG[document.status];
  const expirationInfo = document.expirationDate
    ? calculateExpirationWarning(document.expirationDate)
    : null;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {categoryConfig.label}
                  </h2>
                  <Badge
                    style={{
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color,
                    }}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Document #{document.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              {document.signatureStatus !== 'fully-signed' && onSendForSignature && (
                <Button onClick={onSendForSignature}>
                  <Send className="w-4 h-4 mr-2" />
                  Send for Signature
                </Button>
              )}
            </div>
          </div>

          {/* Key Info Bar */}
          <div className="grid grid-cols-4 gap-4">
            <InfoItem
              icon={User}
              label="Ordering Physician"
              value={document.orderingPhysician.name}
              subvalue={document.orderingPhysician.npi}
            />
            <InfoItem
              icon={Calendar}
              label="Order Date"
              value={new Date(document.orderDate).toLocaleDateString()}
            />
            <InfoItem
              icon={Calendar}
              label="Effective Date"
              value={new Date(document.effectiveDate).toLocaleDateString()}
            />
            {document.expirationDate && (
              <InfoItem
                icon={Clock}
                label="Expiration"
                value={new Date(document.expirationDate).toLocaleDateString()}
                subvalue={
                  expirationInfo
                    ? `${expirationInfo.daysUntil} days remaining`
                    : undefined
                }
                alert={expirationInfo?.warningLevel === 'critical'}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">
              <FileText className="w-4 h-4 mr-2" />
              Document Content
            </TabsTrigger>
            <TabsTrigger value="workflow">
              <Clock className="w-4 h-4 mr-2" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="signatures">
              <CheckSquare className="w-4 h-4 mr-2" />
              Signatures
              {document.signatureStatus !== 'fully-signed' &&
                document.signatureStatus !== 'not-required' && (
                  <Badge variant="destructive" className="ml-2">
                    Pending
                  </Badge>
                )}
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <AlertCircle className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <DocumentContentView document={document} />
          </TabsContent>

          <TabsContent value="workflow" className="mt-6">
            <WorkflowTimeline events={document.workflow.timeline} />
          </TabsContent>

          <TabsContent value="signatures" className="mt-6">
            <SignaturePanel signatures={document.signatures} />
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <CompliancePanel
              workflow={document.workflow}
              metadata={document.metadata}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INFO ITEM
// ═══════════════════════════════════════════════════════════════════════════

interface InfoItemProps {
  icon: any;
  label: string;
  value: string;
  subvalue?: string;
  alert?: boolean;
}

function InfoItem({ icon: Icon, label, value, subvalue, alert }: InfoItemProps) {
  return (
    <div className={cn('flex items-center gap-3 p-3 bg-gray-50 rounded-lg', alert && 'bg-red-50')}>
      <Icon className={cn('w-5 h-5', alert ? 'text-red-600' : 'text-gray-400')} />
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className={cn('text-sm font-medium', alert ? 'text-red-900' : 'text-gray-900')}>
          {value}
        </p>
        {subvalue && (
          <p className={cn('text-xs', alert ? 'text-red-700' : 'text-gray-600')}>
            {subvalue}
          </p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT CONTENT VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentContentViewProps {
  document: OrderCertificationDocument;
}

function DocumentContentView({ document }: DocumentContentViewProps) {
  const { content } = document;

  return (
    <div className="space-y-6">
      {/* Plan of Care / Recertification Content */}
      {(document.category === 'plan-of-care' || document.category === 'recertification') &&
        content.certificationPeriod && (
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Certification Period</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Start Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(content.certificationPeriod.start).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">End Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(content.certificationPeriod.end).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        )}

      {/* Diagnoses */}
      {content.diagnoses && content.diagnoses.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Diagnoses</h3>
          <div className="space-y-3">
            {content.diagnoses.map((dx, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <Badge variant={dx.type === 'primary' ? 'default' : 'secondary'}>
                  {dx.type}
                </Badge>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {dx.code} - {dx.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Disciplines */}
      {content.disciplines && content.disciplines.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Ordered Disciplines</h3>
          <div className="space-y-3">
            {content.disciplines.map((disc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{disc.discipline}</p>
                  {disc.goal && <p className="text-sm text-gray-600 mt-1">{disc.goal}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{disc.frequency}</p>
                  <p className="text-xs text-gray-600">{disc.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Order Text */}
      {content.orderText && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{content.orderText}</p>
          {content.orderInstructions && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">Instructions</p>
              <p className="text-sm text-blue-700">{content.orderInstructions}</p>
            </div>
          )}
        </Card>
      )}

      {/* Verbal Order Details */}
      {content.verbalOrderDetails && (
        <Card className="p-6 bg-amber-50 border-amber-300">
          <h3 className="font-semibold text-amber-900 mb-4">Verbal Order Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-amber-700 mb-1">Taken By</p>
              <p className="font-medium text-amber-900">
                {content.verbalOrderDetails.takenBy.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-amber-700 mb-1">Date/Time</p>
              <p className="font-medium text-amber-900">
                {new Date(content.verbalOrderDetails.takenDate).toLocaleString()}
              </p>
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                {content.verbalOrderDetails.readBack ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium text-amber-900">
                  {content.verbalOrderDetails.readBack
                    ? 'Read-back verification completed'
                    : 'Read-back verification pending'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Notes */}
      {content.notes && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Additional Notes</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{content.notes}</p>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW TIMELINE
// ═══════════════════════════════════════════════════════════════════════════

interface WorkflowTimelineProps {
  events: WorkflowEvent[];
}

function WorkflowTimeline({ events }: WorkflowTimelineProps) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 mb-6">Document Timeline</h3>
      <div className="space-y-4">
        {events.map((event, idx) => (
          <div key={event.id} className="flex gap-4">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              {idx < events.length - 1 && <div className="w-0.5 flex-1 bg-gray-300 mt-2" />}
            </div>

            {/* Event Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-gray-900">{event.action}</p>
                <p className="text-sm text-gray-600">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-gray-600">{event.userName}</p>
              {event.notes && (
                <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                  {event.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SIGNATURE PANEL
// ═══════════════════════════════════════════════════════════════════════════

interface SignaturePanelProps {
  signatures: Signature[];
}

function SignaturePanel({ signatures }: SignaturePanelProps) {
  return (
    <div className="space-y-4">
      {signatures.map(sig => (
        <Card
          key={sig.id}
          className={cn(
            'p-6',
            sig.status === 'pending' && 'border-2 border-amber-300 bg-amber-50',
            sig.status === 'signed' && 'border-green-300 bg-green-50',
            sig.status === 'declined' && 'border-red-300 bg-red-50'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-gray-900">
                  {sig.signerName}
                  {sig.signerCredentials && `, ${sig.signerCredentials}`}
                </h4>
                <Badge
                  variant={
                    sig.status === 'signed'
                      ? 'default'
                      : sig.status === 'declined'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {sig.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1 capitalize">
                {sig.signerType} Signature
              </p>
              {sig.signedAt && (
                <p className="text-sm text-gray-600">
                  Signed on {new Date(sig.signedAt).toLocaleString()}
                </p>
              )}
              {sig.status === 'pending' && sig.lastReminderSent && (
                <p className="text-sm text-amber-700 mt-2">
                  Last reminder sent {new Date(sig.lastReminderSent).toLocaleDateString()}
                  {sig.remindersSent && ` (${sig.remindersSent} reminders sent)`}
                </p>
              )}
              {sig.declineReason && (
                <div className="mt-3 p-3 bg-red-100 rounded-lg">
                  <p className="text-sm font-medium text-red-900 mb-1">Decline Reason</p>
                  <p className="text-sm text-red-700">{sig.declineReason}</p>
                </div>
              )}
            </div>
            {sig.status === 'pending' && (
              <Button variant="outline" size="sm">
                <Send className="w-4 h-4 mr-2" />
                Send Reminder
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE PANEL
// ═══════════════════════════════════════════════════════════════════════════

interface CompliancePanelProps {
  workflow: OrderCertificationDocument['workflow'];
  metadata: OrderCertificationDocument['metadata'];
}

function CompliancePanel({ workflow, metadata }: CompliancePanelProps) {
  return (
    <div className="space-y-6">
      {/* Overall Compliance Status */}
      <Card
        className={cn(
          'p-6',
          workflow.compliance.isCompliant
            ? 'border-green-300 bg-green-50'
            : 'border-red-300 bg-red-50'
        )}
      >
        <div className="flex items-center gap-3">
          {workflow.compliance.isCompliant ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-600" />
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {workflow.compliance.isCompliant
                ? 'Document is Compliant'
                : 'Compliance Issues Detected'}
            </h3>
            <p className="text-sm text-gray-700">
              {workflow.compliance.isCompliant
                ? 'All regulatory requirements are met'
                : `${workflow.compliance.issues.length} issue(s) require attention`}
            </p>
          </div>
        </div>
      </Card>

      {/* Compliance Issues */}
      {workflow.compliance.issues.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Compliance Issues</h3>
          <div className="space-y-3">
            {workflow.compliance.issues.map(issue => (
              <div
                key={issue.id}
                className={cn(
                  'p-4 rounded-lg border',
                  issue.severity === 'critical' &&
                    'bg-red-50 border-red-300',
                  issue.severity === 'high' &&
                    'bg-orange-50 border-orange-300',
                  issue.severity === 'medium' &&
                    'bg-amber-50 border-amber-300',
                  issue.severity === 'low' &&
                    'bg-blue-50 border-blue-300'
                )}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={cn(
                      'w-5 h-5 mt-0.5',
                      issue.severity === 'critical' && 'text-red-600',
                      issue.severity === 'high' && 'text-orange-600',
                      issue.severity === 'medium' && 'text-amber-600',
                      issue.severity === 'low' && 'text-blue-600'
                    )}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          issue.severity === 'critical'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="uppercase text-xs"
                      >
                        {issue.severity}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">
                        {issue.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{issue.message}</p>
                    {issue.resolutionRequired && (
                      <p className="text-xs text-gray-600 mt-2">
                        ⚠️ Resolution required before activation
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Regulatory Requirements */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Regulatory Requirements</h3>
        <div className="space-y-2">
          {metadata.regulatoryRequirements?.map((req, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-700">{req}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>CMS Compliance:</strong>{' '}
            {metadata.cmsCompliant ? 'Compliant' : 'Non-Compliant'}
          </p>
        </div>
      </Card>
    </div>
  );
}
