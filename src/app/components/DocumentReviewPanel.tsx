/**
 * Document Review Panel Component
 * 
 * Individual document review interface for QA Center. Displays document
 * content, compliance validation results, return/approval workflow controls,
 * and review history. Supports efficient document review with keyboard
 * shortcuts and quick actions.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  MessageSquare,
  History,
  User,
  Calendar,
  Flag,
  ArrowLeft,
  Send,
  Save,
  Eye,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { QAReviewItem, QADocumentStatus } from './QACenterWorkspace';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ComplianceRule {
  id: string;
  category: string;
  rule: string;
  status: 'passed' | 'failed' | 'warning';
  details?: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface ReviewAction {
  type: 'return' | 'approve' | 'escalate' | 'note';
  timestamp: string;
  reviewer: string;
  comment: string;
  returnReason?: string;
}

export interface DocumentReviewData {
  item: QAReviewItem;
  documentContent: string; // HTML or structured content
  complianceRules: ComplianceRule[];
  reviewHistory: ReviewAction[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentReviewPanelProps {
  data: DocumentReviewData;
  currentReviewer: string;
  onReturn: (reason: string, comments: string) => void;
  onApprove: (comments: string) => void;
  onEscalate: (reason: string) => void;
  onSaveNotes: (notes: string) => void;
  onBack: () => void;
}

export default function DocumentReviewPanel({
  data,
  currentReviewer,
  onReturn,
  onApprove,
  onEscalate,
  onSaveNotes,
  onBack,
}: DocumentReviewPanelProps) {
  const [reviewNotes, setReviewNotes] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  const failedRules = data.complianceRules.filter((r) => r.status === 'failed');
  const warningRules = data.complianceRules.filter((r) => r.status === 'warning');
  const passedRules = data.complianceRules.filter((r) => r.status === 'passed');

  const canApprove = failedRules.length === 0;
  const compliancePercentage = Math.round(
    (passedRules.length / data.complianceRules.length) * 100
  );

  const handleReturn = () => {
    if (returnReason.trim()) {
      onReturn(returnReason, reviewNotes);
      setShowReturnDialog(false);
      setReturnReason('');
      setReviewNotes('');
    }
  };

  const handleApprove = () => {
    onApprove(reviewNotes);
    setShowApproveDialog(false);
    setReviewNotes('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Queue
            </Button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{data.item.patientName}</h2>
              <p className="text-sm text-gray-600">
                {data.item.documentType} • {data.item.admissionId} •{' '}
                {data.item.visitDate
                  ? new Date(data.item.visitDate).toLocaleDateString()
                  : 'No visit date'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReturnDialog(true)}
              disabled={data.item.status === 'approved'}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Return for Correction
            </Button>
            <Button
              size="sm"
              onClick={() => setShowApproveDialog(true)}
              disabled={!canApprove || data.item.status === 'approved'}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve for Billing
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <DocumentStatusBar item={data.item} compliancePercentage={compliancePercentage} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="document" className="h-full">
            <TabsList>
              <TabsTrigger value="document">
                <FileText className="w-4 h-4 mr-2" />
                Document
              </TabsTrigger>
              <TabsTrigger value="compliance">
                <Flag className="w-4 h-4 mr-2" />
                Compliance ({failedRules.length + warningRules.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="document" className="flex-1 mt-4">
              <DocumentContentView content={data.documentContent} />
            </TabsContent>

            <TabsContent value="compliance" className="flex-1 mt-4">
              <ComplianceValidationView rules={data.complianceRules} />
            </TabsContent>

            <TabsContent value="history" className="flex-1 mt-4">
              <ReviewHistoryView history={data.reviewHistory} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Side Panel - Review Notes */}
        <div className="w-96 border-l bg-white p-6 overflow-auto">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Review Notes
          </h3>

          <Textarea
            placeholder="Add notes about this review..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            className="h-40 mb-4"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSaveNotes(reviewNotes)}
            className="w-full mb-6"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Notes
          </Button>

          {/* Quick Stats */}
          <QuickStatsPanel item={data.item} rules={data.complianceRules} />
        </div>
      </div>

      {/* Return Dialog */}
      {showReturnDialog && (
        <ReturnDialog
          onReturn={handleReturn}
          onCancel={() => setShowReturnDialog(false)}
          returnReason={returnReason}
          setReturnReason={setReturnReason}
          failedRules={failedRules}
        />
      )}

      {/* Approve Dialog */}
      {showApproveDialog && (
        <ApproveDialog
          onApprove={handleApprove}
          onCancel={() => setShowApproveDialog(false)}
          item={data.item}
          compliancePercentage={compliancePercentage}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT STATUS BAR
// ═══════════════════════════════════════════════════════════════════════════

function DocumentStatusBar({
  item,
  compliancePercentage,
}: {
  item: QAReviewItem;
  compliancePercentage: number;
}) {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Clinician:</span>
        <span className="text-sm font-medium text-gray-900">{item.clinicianName}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Submitted:</span>
        <span className="text-sm font-medium text-gray-900">
          {new Date(item.submittedDate).toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Days in Queue:</span>
        <span className="text-sm font-medium text-gray-900">{item.daysInQueue} days</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Compliance:</span>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                compliancePercentage >= 90 ? 'bg-green-600' : compliancePercentage >= 80 ? 'bg-amber-600' : 'bg-red-600'
              )}
              style={{ width: `${compliancePercentage}%` }}
            />
          </div>
          <span
            className={cn(
              'text-sm font-medium',
              compliancePercentage >= 90 ? 'text-green-700' : compliancePercentage >= 80 ? 'text-amber-700' : 'text-red-700'
            )}
          >
            {compliancePercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT CONTENT VIEW
// ═══════════════════════════════════════════════════════════════════════════

function DocumentContentView({ content }: { content: string }) {
  return (
    <Card className="p-6">
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE VALIDATION VIEW
// ═══════════════════════════════════════════════════════════════════════════

function ComplianceValidationView({ rules }: { rules: ComplianceRule[] }) {
  const failedRules = rules.filter((r) => r.status === 'failed');
  const warningRules = rules.filter((r) => r.status === 'warning');
  const passedRules = rules.filter((r) => r.status === 'passed');

  return (
    <div className="space-y-4">
      {/* Failed Rules */}
      {failedRules.length > 0 && (
        <div>
          <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Critical Issues ({failedRules.length})
          </h3>
          <div className="space-y-2">
            {failedRules.map((rule) => (
              <ComplianceRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      )}

      {/* Warning Rules */}
      {warningRules.length > 0 && (
        <div>
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Warnings ({warningRules.length})
          </h3>
          <div className="space-y-2">
            {warningRules.map((rule) => (
              <ComplianceRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      )}

      {/* Passed Rules */}
      {passedRules.length > 0 && (
        <div>
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Passed ({passedRules.length})
          </h3>
          <div className="space-y-2">
            {passedRules.map((rule) => (
              <ComplianceRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ComplianceRuleCard({ rule }: { rule: ComplianceRule }) {
  const statusConfig = {
    failed: {
      icon: XCircle,
      bgClass: 'bg-red-50',
      borderClass: 'border-red-300',
      iconClass: 'text-red-600',
      textClass: 'text-red-900',
    },
    warning: {
      icon: AlertTriangle,
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      iconClass: 'text-amber-600',
      textClass: 'text-amber-900',
    },
    passed: {
      icon: CheckCircle,
      bgClass: 'bg-green-50',
      borderClass: 'border-green-300',
      iconClass: 'text-green-600',
      textClass: 'text-green-900',
    },
  };

  const config = statusConfig[rule.status];
  const StatusIcon = config.icon;

  return (
    <Card className={cn('p-4 border', config.bgClass, config.borderClass)}>
      <div className="flex items-start gap-3">
        <StatusIcon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconClass)} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-600 uppercase">
              {rule.category}
            </span>
            {rule.severity === 'critical' && (
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                Critical
              </Badge>
            )}
          </div>
          <p className={cn('font-medium mb-1', config.textClass)}>{rule.rule}</p>
          {rule.details && <p className="text-sm text-gray-700">{rule.details}</p>}
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEW HISTORY VIEW
// ═══════════════════════════════════════════════════════════════════════════

function ReviewHistoryView({ history }: { history: ReviewAction[] }) {
  if (history.length === 0) {
    return (
      <Card className="p-8 text-center">
        <History className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <h3 className="font-semibold text-gray-900 mb-1">No Review History</h3>
        <p className="text-sm text-gray-600">This document has not been reviewed yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((action, idx) => (
        <ReviewActionCard key={idx} action={action} />
      ))}
    </div>
  );
}

function ReviewActionCard({ action }: { action: ReviewAction }) {
  const typeConfig = {
    return: { label: 'Returned for Correction', icon: XCircle, color: 'amber' },
    approve: { label: 'Approved for Billing', icon: CheckCircle, color: 'green' },
    escalate: { label: 'Escalated', icon: AlertTriangle, color: 'red' },
    note: { label: 'Note Added', icon: MessageSquare, color: 'blue' },
  };

  const config = typeConfig[action.type];
  const Icon = config.icon;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', `text-${config.color}-600`)} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{config.label}</h4>
            <span className="text-sm text-gray-600">
              {new Date(action.timestamp).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{action.reviewer}</span>
          </div>
          {action.comment && (
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{action.comment}</p>
          )}
          {action.returnReason && (
            <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded mt-2">
              <strong>Reason:</strong> {action.returnReason}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK STATS PANEL
// ═══════════════════════════════════════════════════════════════════════════

function QuickStatsPanel({
  item,
  rules,
}: {
  item: QAReviewItem;
  rules: ComplianceRule[];
}) {
  const criticalIssues = rules.filter((r) => r.status === 'failed' && r.severity === 'critical').length;
  const totalIssues = rules.filter((r) => r.status === 'failed' || r.status === 'warning').length;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Quick Stats</h4>
      
      <div className="space-y-2">
        <StatRow label="Total Issues" value={totalIssues} color={totalIssues > 0 ? 'red' : 'green'} />
        <StatRow label="Critical" value={criticalIssues} color={criticalIssues > 0 ? 'red' : 'gray'} />
        <StatRow label="Flags" value={item.flagCount} color={item.flagCount > 0 ? 'amber' : 'gray'} />
        <StatRow
          label="Signature"
          value={item.requiresSignature ? 'Required' : 'Not Required'}
          color={item.requiresSignature ? 'purple' : 'gray'}
        />
        <StatRow
          label="Billing Impact"
          value={item.billingImpact ? 'Yes' : 'No'}
          color={item.billingImpact ? 'red' : 'gray'}
        />
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClasses = {
    red: 'text-red-700',
    amber: 'text-amber-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
    blue: 'text-blue-700',
    gray: 'text-gray-700',
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className={cn('font-medium', colorClasses[color as keyof typeof colorClasses])}>
        {value}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RETURN DIALOG
// ═══════════════════════════════════════════════════════════════════════════

function ReturnDialog({
  onReturn,
  onCancel,
  returnReason,
  setReturnReason,
  failedRules,
}: {
  onReturn: () => void;
  onCancel: () => void;
  returnReason: string;
  setReturnReason: (value: string) => void;
  failedRules: ComplianceRule[];
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto m-4">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Return for Correction</h3>

          {failedRules.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Failed Compliance Rules:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 bg-red-50 p-3 rounded">
                {failedRules.map((rule) => (
                  <li key={rule.id} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{rule.rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Return Reason (Required)
            </label>
            <Textarea
              placeholder="Explain what needs to be corrected..."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="h-32"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onReturn} disabled={!returnReason.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Return Document
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APPROVE DIALOG
// ═══════════════════════════════════════════════════════════════════════════

function ApproveDialog({
  onApprove,
  onCancel,
  item,
  compliancePercentage,
}: {
  onApprove: () => void;
  onCancel: () => void;
  item: QAReviewItem;
  compliancePercentage: number;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md m-4">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
            Approve for Billing?
          </h3>
          <p className="text-sm text-gray-600 mb-4 text-center">
            This document will be approved for billing submission.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Patient:</span>
              <span className="font-medium text-gray-900">{item.patientName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Document:</span>
              <span className="font-medium text-gray-900">{item.documentType}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Compliance:</span>
              <span className="font-medium text-green-700">{compliancePercentage}%</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onApprove}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockDocumentReviewData(item: QAReviewItem): DocumentReviewData {
  return {
    item,
    documentContent: `
      <h2>Skilled Nursing Visit Note</h2>
      <p><strong>Visit Date:</strong> ${item.visitDate ? new Date(item.visitDate).toLocaleDateString() : 'N/A'}</p>
      <p><strong>Visit Type:</strong> Skilled Nursing</p>
      <p><strong>Duration:</strong> 45 minutes</p>
      
      <h3>Vital Signs</h3>
      <ul>
        <li>Blood Pressure: 128/82 mmHg</li>
        <li>Heart Rate: 76 bpm</li>
        <li>Temperature: 98.4°F</li>
        <li>Respiratory Rate: 18 breaths/min</li>
        <li>O2 Saturation: 96% on room air</li>
      </ul>
      
      <h3>Assessment</h3>
      <p>Patient is alert and oriented x3. Ambulating with walker independently. Wound care performed on left lower leg ulcer - 2cm x 1.5cm, moderate serous drainage, no signs of infection. Wound bed pink with granulation tissue present.</p>
      
      <h3>Interventions</h3>
      <ul>
        <li>Wound cleansed with normal saline</li>
        <li>Applied silver alginate dressing</li>
        <li>Secured with gauze and tape</li>
        <li>Reviewed medication compliance</li>
        <li>Patient education on wound care and infection signs</li>
      </ul>
      
      <h3>Patient Response</h3>
      <p>Patient tolerated interventions well. Verbalized understanding of wound care instructions and when to call for concerns. No complaints of pain during dressing change.</p>
      
      <h3>Plan</h3>
      <p>Continue SN visits 3x weekly for wound care. Monitor for signs of infection. Next visit scheduled for 12/16/2024.</p>
    `,
    complianceRules: [
      {
        id: 'rule-1',
        category: 'Documentation',
        rule: 'Visit note completed within 24 hours',
        status: 'passed',
        severity: 'major',
      },
      {
        id: 'rule-2',
        category: 'Clinical Content',
        rule: 'Vital signs documented',
        status: item.complianceScore && item.complianceScore < 80 ? 'failed' : 'passed',
        details: item.complianceScore && item.complianceScore < 80 ? 'Blood pressure not recorded' : undefined,
        severity: 'critical',
      },
      {
        id: 'rule-3',
        category: 'Clinical Content',
        rule: 'Assessment and interventions documented',
        status: 'passed',
        severity: 'critical',
      },
      {
        id: 'rule-4',
        category: 'Medication Review',
        rule: 'Medication reconciliation performed',
        status: item.complianceScore && item.complianceScore < 80 ? 'warning' : 'passed',
        details: item.complianceScore && item.complianceScore < 80 ? 'Medication review incomplete' : undefined,
        severity: 'major',
      },
      {
        id: 'rule-5',
        category: 'Patient Safety',
        rule: 'Fall risk assessment completed',
        status: 'passed',
        severity: 'major',
      },
      {
        id: 'rule-6',
        category: 'Plan of Care',
        rule: 'Goals and interventions aligned with POC',
        status: 'passed',
        severity: 'critical',
      },
      {
        id: 'rule-7',
        category: 'Billing',
        rule: 'Visit duration documented',
        status: 'passed',
        severity: 'critical',
      },
      {
        id: 'rule-8',
        category: 'Billing',
        rule: 'Discipline-specific activities documented',
        status: 'passed',
        severity: 'critical',
      },
    ],
    reviewHistory: item.status === 'returned' || item.status === 'approved' ? [
      {
        type: item.status === 'returned' ? 'return' : 'approve',
        timestamp: item.reviewedDate || new Date().toISOString(),
        reviewer: item.reviewedBy || 'Unknown',
        comment: item.reviewNotes || '',
        returnReason: item.returnReason,
      },
    ] : [],
  };
}
