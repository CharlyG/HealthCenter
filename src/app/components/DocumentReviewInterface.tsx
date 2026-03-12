/**
 * Document Review Interface Component
 * 
 * Complete review interface for QA staff to review clinical documentation.
 * Displays the full clinical document with review panel, validation results,
 * and interactive review tools including approve, return, comments, field
 * highlighting, and clarification requests.
 */

import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Highlighter,
  HelpCircle,
  Flag,
  Save,
  Send,
  Eye,
  EyeOff,
  FileText,
  User,
  Calendar,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { QAReviewItem, DocumentType } from './QACenterWorkspace';
import type { ComplianceRule } from './DocumentReviewPanel';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  fields: DocumentField[];
  validationIssues: string[];
}

export interface DocumentField {
  id: string;
  label: string;
  value: string;
  required: boolean;
  hasIssue: boolean;
  issueDescription?: string;
  position?: { top: number; left: number }; // For highlighting
}

export interface ReviewComment {
  id: string;
  fieldId?: string;
  sectionId?: string;
  text: string;
  type: 'comment' | 'issue' | 'question';
  timestamp: string;
  reviewer: string;
  resolved?: boolean;
}

export interface ClarificationRequest {
  id: string;
  fieldId: string;
  question: string;
  priority: 'high' | 'normal';
  timestamp: string;
  reviewer: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
}

export interface DocumentReviewState {
  item: QAReviewItem;
  sections: DocumentSection[];
  complianceRules: ComplianceRule[];
  comments: ReviewComment[];
  clarifications: ClarificationRequest[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentReviewInterfaceProps {
  reviewState: DocumentReviewState;
  currentReviewer: string;
  onApprove: (comments: string) => void;
  onReturn: (reason: string, comments: ReviewComment[]) => void;
  onSaveComment: (comment: ReviewComment) => void;
  onRequestClarification: (request: ClarificationRequest) => void;
  onSaveDraft: () => void;
  onBack: () => void;
}

export default function DocumentReviewInterface({
  reviewState,
  currentReviewer,
  onApprove,
  onReturn,
  onSaveComment,
  onRequestClarification,
  onSaveDraft,
  onBack,
}: DocumentReviewInterfaceProps) {
  const [activeSection, setActiveSection] = useState<string>(
    reviewState.sections[0]?.id || ''
  );
  const [highlightMode, setHighlightMode] = useState(false);
  const [selectedField, setSelectedField] = useState<DocumentField | null>(null);
  const [comments, setComments] = useState<ReviewComment[]>(reviewState.comments);
  const [clarifications, setClarifications] = useState<ClarificationRequest[]>(
    reviewState.clarifications
  );
  const [showValidationPanel, setShowValidationPanel] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  const documentViewerRef = useRef<HTMLDivElement>(null);

  // Calculate validation statistics
  const totalIssues = reviewState.sections.reduce(
    (sum, section) => sum + section.validationIssues.length,
    0
  );
  const criticalRules = reviewState.complianceRules.filter(
    (r) => r.status === 'failed' && r.severity === 'critical'
  );
  const canApprove = criticalRules.length === 0;

  const handleAddComment = (type: 'comment' | 'issue' | 'question', text: string) => {
    const newComment: ReviewComment = {
      id: `comment-${Date.now()}`,
      fieldId: selectedField?.id,
      sectionId: activeSection,
      text,
      type,
      timestamp: new Date().toISOString(),
      reviewer: currentReviewer,
      resolved: false,
    };
    setComments([...comments, newComment]);
    onSaveComment(newComment);
  };

  const handleRequestClarification = (fieldId: string, question: string, priority: 'high' | 'normal') => {
    const newRequest: ClarificationRequest = {
      id: `clarification-${Date.now()}`,
      fieldId,
      question,
      priority,
      timestamp: new Date().toISOString(),
      reviewer: currentReviewer,
    };
    setClarifications([...clarifications, newRequest]);
    onRequestClarification(newRequest);
  };

  const handleApprove = () => {
    onApprove(reviewNotes);
    setShowApproveDialog(false);
  };

  const handleReturn = (reason: string) => {
    onReturn(reason, comments.filter((c) => c.type === 'issue'));
    setShowReturnDialog(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <DocumentReviewHeader
        item={reviewState.item}
        onBack={onBack}
        onSaveDraft={onSaveDraft}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Document Viewer */}
        <div className="flex-1 overflow-auto bg-white p-6" ref={documentViewerRef}>
          <DocumentViewer
            sections={reviewState.sections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            highlightMode={highlightMode}
            selectedField={selectedField}
            onFieldSelect={setSelectedField}
            comments={comments}
          />
        </div>

        {/* Review Panel */}
        <div className="w-96 border-l bg-white overflow-auto">
          <ReviewPanel
            reviewState={reviewState}
            comments={comments}
            clarifications={clarifications}
            selectedField={selectedField}
            showValidationPanel={showValidationPanel}
            onToggleValidationPanel={() => setShowValidationPanel(!showValidationPanel)}
            onAddComment={handleAddComment}
            onRequestClarification={handleRequestClarification}
            highlightMode={highlightMode}
            onToggleHighlightMode={() => setHighlightMode(!highlightMode)}
            reviewNotes={reviewNotes}
            onReviewNotesChange={setReviewNotes}
          />
        </div>
      </div>

      {/* Action Bar */}
      <ActionBar
        canApprove={canApprove}
        totalIssues={totalIssues}
        criticalCount={criticalRules.length}
        onApprove={() => setShowApproveDialog(true)}
        onReturn={() => setShowReturnDialog(true)}
      />

      {/* Dialogs */}
      {showApproveDialog && (
        <ApproveDialog
          item={reviewState.item}
          reviewNotes={reviewNotes}
          onApprove={handleApprove}
          onCancel={() => setShowApproveDialog(false)}
        />
      )}

      {showReturnDialog && (
        <ReturnDialog
          item={reviewState.item}
          issues={comments.filter((c) => c.type === 'issue')}
          onReturn={handleReturn}
          onCancel={() => setShowReturnDialog(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT REVIEW HEADER
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentReviewHeaderProps {
  item: QAReviewItem;
  onBack: () => void;
  onSaveDraft: () => void;
}

function DocumentReviewHeader({ item, onBack, onSaveDraft }: DocumentReviewHeaderProps) {
  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Queue
          </Button>
          <div className="border-l h-6" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">{item.patientName}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{item.documentType}</span>
              <span>•</span>
              <span>{item.admissionId}</span>
              {item.visitDate && (
                <>
                  <span>•</span>
                  <span>Visit: {new Date(item.visitDate).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Clinician:</span>
          <span className="font-medium text-gray-900">{item.clinicianName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Submitted:</span>
          <span className="font-medium text-gray-900">
            {new Date(item.submittedDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Days in Queue:</span>
          <span className="font-medium text-gray-900">{item.daysInQueue} days</span>
        </div>
        {item.flagCount > 0 && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
            <Flag className="w-3 h-3 mr-1" />
            {item.flagCount} flags
          </Badge>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT VIEWER
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentViewerProps {
  sections: DocumentSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  highlightMode: boolean;
  selectedField: DocumentField | null;
  onFieldSelect: (field: DocumentField | null) => void;
  comments: ReviewComment[];
}

function DocumentViewer({
  sections,
  activeSection,
  onSectionChange,
  highlightMode,
  selectedField,
  onFieldSelect,
  comments,
}: DocumentViewerProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Section Navigation */}
      <div className="mb-6 flex flex-wrap gap-2">
        {sections.map((section) => {
          const hasIssues = section.validationIssues.length > 0;
          const isActive = section.id === activeSection;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-600 text-white'
                  : hasIssues
                  ? 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {section.title}
              {hasIssues && (
                <Badge
                  variant="outline"
                  className={cn(
                    'ml-2 text-xs',
                    isActive
                      ? 'bg-white text-blue-600 border-white'
                      : 'bg-amber-100 text-amber-700 border-amber-300'
                  )}
                >
                  {section.validationIssues.length}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      {sections
        .filter((s) => s.id === activeSection)
        .map((section) => (
          <DocumentSection
            key={section.id}
            section={section}
            highlightMode={highlightMode}
            selectedField={selectedField}
            onFieldSelect={onFieldSelect}
            comments={comments.filter((c) => c.sectionId === section.id)}
          />
        ))}
    </div>
  );
}

function DocumentSection({
  section,
  highlightMode,
  selectedField,
  onFieldSelect,
  comments,
}: {
  section: DocumentSection;
  highlightMode: boolean;
  selectedField: DocumentField | null;
  onFieldSelect: (field: DocumentField | null) => void;
  comments: ReviewComment[];
}) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{section.title}</h3>

      {/* Validation Issues */}
      {section.validationIssues.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-900">
              Validation Issues ({section.validationIssues.length})
            </span>
          </div>
          <ul className="text-sm text-amber-700 space-y-1">
            {section.validationIssues.map((issue, idx) => (
              <li key={idx}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-4">
        {section.fields.map((field) => {
          const isSelected = selectedField?.id === field.id;
          const fieldComments = comments.filter((c) => c.fieldId === field.id);

          return (
            <div
              key={field.id}
              className={cn(
                'p-3 rounded-lg border-2 transition-all cursor-pointer',
                field.hasIssue
                  ? 'bg-red-50 border-red-300'
                  : isSelected
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              )}
              onClick={() => onFieldSelect(isSelected ? null : field)}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-600 ml-1">*</span>}
                  </span>
                  {field.hasIssue && (
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                      Issue
                    </Badge>
                  )}
                </div>
                {fieldComments.length > 0 && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {fieldComments.length}
                  </Badge>
                )}
              </div>

              <div className="text-sm text-gray-900 mb-2">{field.value || '—'}</div>

              {field.hasIssue && field.issueDescription && (
                <div className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                  {field.issueDescription}
                </div>
              )}

              {/* Field Comments */}
              {fieldComments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {fieldComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="text-xs bg-blue-50 border border-blue-200 rounded p-2"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CommentTypeIcon type={comment.type} />
                        <span className="font-medium text-blue-900">{comment.reviewer}</span>
                        <span className="text-blue-600">
                          {new Date(comment.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-blue-900">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function CommentTypeIcon({ type }: { type: 'comment' | 'issue' | 'question' }) {
  const config = {
    comment: { icon: MessageSquare, color: 'text-blue-600' },
    issue: { icon: AlertTriangle, color: 'text-red-600' },
    question: { icon: HelpCircle, color: 'text-purple-600' },
  };

  const { icon: Icon, color } = config[type];
  return <Icon className={cn('w-3 h-3', color)} />;
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEW PANEL
// ═══════════════════════════════════════════════════════════════════════════

interface ReviewPanelProps {
  reviewState: DocumentReviewState;
  comments: ReviewComment[];
  clarifications: ClarificationRequest[];
  selectedField: DocumentField | null;
  showValidationPanel: boolean;
  onToggleValidationPanel: () => void;
  onAddComment: (type: 'comment' | 'issue' | 'question', text: string) => void;
  onRequestClarification: (fieldId: string, question: string, priority: 'high' | 'normal') => void;
  highlightMode: boolean;
  onToggleHighlightMode: () => void;
  reviewNotes: string;
  onReviewNotesChange: (notes: string) => void;
}

function ReviewPanel({
  reviewState,
  comments,
  clarifications,
  selectedField,
  showValidationPanel,
  onToggleValidationPanel,
  onAddComment,
  onRequestClarification,
  highlightMode,
  onToggleHighlightMode,
  reviewNotes,
  onReviewNotesChange,
}: ReviewPanelProps) {
  const [activeTab, setActiveTab] = useState<'tools' | 'validation' | 'comments'>('tools');

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Review Panel</h3>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="tools">
            <Edit className="w-4 h-4 mr-2" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="validation">
            <Flag className="w-4 h-4 mr-2" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="w-4 h-4 mr-2" />
            Comments ({comments.length})
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="tools" className="p-4 space-y-4">
            <ReviewTools
              selectedField={selectedField}
              highlightMode={highlightMode}
              onToggleHighlightMode={onToggleHighlightMode}
              onAddComment={onAddComment}
              onRequestClarification={onRequestClarification}
              reviewNotes={reviewNotes}
              onReviewNotesChange={onReviewNotesChange}
            />
          </TabsContent>

          <TabsContent value="validation" className="p-4">
            <ValidationResults complianceRules={reviewState.complianceRules} />
          </TabsContent>

          <TabsContent value="comments" className="p-4">
            <CommentsHistory comments={comments} clarifications={clarifications} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEW TOOLS
// ═══════════════════════════════════════════════════════════════════════════

interface ReviewToolsProps {
  selectedField: DocumentField | null;
  highlightMode: boolean;
  onToggleHighlightMode: () => void;
  onAddComment: (type: 'comment' | 'issue' | 'question', text: string) => void;
  onRequestClarification: (fieldId: string, question: string, priority: 'high' | 'normal') => void;
  reviewNotes: string;
  onReviewNotesChange: (notes: string) => void;
}

function ReviewTools({
  selectedField,
  highlightMode,
  onToggleHighlightMode,
  onAddComment,
  onRequestClarification,
  reviewNotes,
  onReviewNotesChange,
}: ReviewToolsProps) {
  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'issue' | 'question'>('comment');
  const [clarificationText, setClarificationText] = useState('');
  const [clarificationPriority, setClarificationPriority] = useState<'high' | 'normal'>('normal');

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(commentType, commentText);
      setCommentText('');
    }
  };

  const handleRequestClarification = () => {
    if (selectedField && clarificationText.trim()) {
      onRequestClarification(selectedField.id, clarificationText, clarificationPriority);
      setClarificationText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Highlight Mode Toggle */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Highlight Tools</h4>
        <Button
          variant={highlightMode ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleHighlightMode}
          className="w-full"
        >
          <Highlighter className="w-4 h-4 mr-2" />
          {highlightMode ? 'Highlighting On' : 'Enable Highlighting'}
        </Button>
        <p className="text-xs text-gray-600 mt-2">
          Click fields in the document to highlight and add comments
        </p>
      </Card>

      {/* Selected Field Info */}
      {selectedField && (
        <Card className="p-4 bg-blue-50 border-blue-300">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm">Selected Field</h4>
          <p className="text-sm text-blue-700 font-medium mb-1">{selectedField.label}</p>
          <p className="text-xs text-blue-600">{selectedField.value || 'No value'}</p>
        </Card>
      )}

      {/* Add Comment */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Add Comment</h4>
        
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-700 mb-2 block">Comment Type</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setCommentType('comment')}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded border transition-all',
                commentType === 'comment'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-50 text-gray-700 border-gray-300'
              )}
            >
              <MessageSquare className="w-3 h-3 mx-auto mb-1" />
              Note
            </button>
            <button
              onClick={() => setCommentType('issue')}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded border transition-all',
                commentType === 'issue'
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : 'bg-gray-50 text-gray-700 border-gray-300'
              )}
            >
              <AlertTriangle className="w-3 h-3 mx-auto mb-1" />
              Issue
            </button>
            <button
              onClick={() => setCommentType('question')}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded border transition-all',
                commentType === 'question'
                  ? 'bg-purple-100 text-purple-700 border-purple-300'
                  : 'bg-gray-50 text-gray-700 border-gray-300'
              )}
            >
              <HelpCircle className="w-3 h-3 mx-auto mb-1" />
              Question
            </button>
          </div>
        </div>

        <Textarea
          placeholder="Enter your comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="mb-3 h-24"
        />

        <Button size="sm" onClick={handleAddComment} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Comment
        </Button>
      </Card>

      {/* Request Clarification */}
      {selectedField && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">
            Request Clarification
          </h4>

          <div className="mb-3">
            <label className="text-xs font-medium text-gray-700 mb-2 block">Priority</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setClarificationPriority('normal')}
                className={cn(
                  'px-3 py-2 text-xs font-medium rounded border transition-all',
                  clarificationPriority === 'normal'
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-gray-50 text-gray-700 border-gray-300'
                )}
              >
                Normal
              </button>
              <button
                onClick={() => setClarificationPriority('high')}
                className={cn(
                  'px-3 py-2 text-xs font-medium rounded border transition-all',
                  clarificationPriority === 'high'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-gray-50 text-gray-700 border-gray-300'
                )}
              >
                High Priority
              </button>
            </div>
          </div>

          <Textarea
            placeholder="What clarification do you need?"
            value={clarificationText}
            onChange={(e) => setClarificationText(e.target.value)}
            className="mb-3 h-24"
          />

          <Button size="sm" onClick={handleRequestClarification} className="w-full" variant="outline">
            <HelpCircle className="w-4 h-4 mr-2" />
            Request Clarification
          </Button>
        </Card>
      )}

      {/* Review Notes */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Overall Review Notes</h4>
        <Textarea
          placeholder="General notes about this review..."
          value={reviewNotes}
          onChange={(e) => onReviewNotesChange(e.target.value)}
          className="h-32"
        />
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION RESULTS
// ═══════════════════════════════════════════════════════════════════════════

function ValidationResults({ complianceRules }: { complianceRules: ComplianceRule[] }) {
  const failed = complianceRules.filter((r) => r.status === 'failed');
  const warnings = complianceRules.filter((r) => r.status === 'warning');
  const passed = complianceRules.filter((r) => r.status === 'passed');

  return (
    <div className="space-y-4">
      {failed.length > 0 && (
        <div>
          <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2 text-sm">
            <XCircle className="w-4 h-4" />
            Failed ({failed.length})
          </h4>
          <div className="space-y-2">
            {failed.map((rule) => (
              <ValidationRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4" />
            Warnings ({warnings.length})
          </h4>
          <div className="space-y-2">
            {warnings.map((rule) => (
              <ValidationRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      )}

      {passed.length > 0 && (
        <div>
          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4" />
            Passed ({passed.length})
          </h4>
          <div className="space-y-2">
            {passed.map((rule) => (
              <ValidationRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ValidationRuleCard({ rule }: { rule: ComplianceRule }) {
  const statusConfig = {
    failed: { bgClass: 'bg-red-50', borderClass: 'border-red-300', textClass: 'text-red-700' },
    warning: { bgClass: 'bg-amber-50', borderClass: 'border-amber-300', textClass: 'text-amber-700' },
    passed: { bgClass: 'bg-green-50', borderClass: 'border-green-300', textClass: 'text-green-700' },
  };

  const config = statusConfig[rule.status];

  return (
    <div className={cn('p-3 rounded-lg border text-sm', config.bgClass, config.borderClass)}>
      <div className="text-xs font-medium text-gray-600 uppercase mb-1">{rule.category}</div>
      <p className={cn('font-medium mb-1', config.textClass)}>{rule.rule}</p>
      {rule.details && <p className="text-xs text-gray-700">{rule.details}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMENTS HISTORY
// ═══════════════════════════════════════════════════════════════════════════

function CommentsHistory({
  comments,
  clarifications,
}: {
  comments: ReviewComment[];
  clarifications: ClarificationRequest[];
}) {
  return (
    <div className="space-y-4">
      {/* Comments */}
      {comments.length > 0 ? (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600 text-center py-8">No comments yet</p>
      )}

      {/* Clarifications */}
      {clarifications.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">
            Clarification Requests ({clarifications.length})
          </h4>
          <div className="space-y-2">
            {clarifications.map((clarification) => (
              <ClarificationCard key={clarification.id} clarification={clarification} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CommentCard({ comment }: { comment: ReviewComment }) {
  const typeConfig = {
    comment: { bgClass: 'bg-blue-50', borderClass: 'border-blue-300', icon: MessageSquare },
    issue: { bgClass: 'bg-red-50', borderClass: 'border-red-300', icon: AlertTriangle },
    question: { bgClass: 'bg-purple-50', borderClass: 'border-purple-300', icon: HelpCircle },
  };

  const config = typeConfig[comment.type];
  const Icon = config.icon;

  return (
    <div className={cn('p-3 rounded-lg border text-sm', config.bgClass, config.borderClass)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="font-medium">{comment.reviewer}</span>
        <span className="text-xs text-gray-600">
          {new Date(comment.timestamp).toLocaleString()}
        </span>
      </div>
      <p className="text-gray-900">{comment.text}</p>
    </div>
  );
}

function ClarificationCard({ clarification }: { clarification: ClarificationRequest }) {
  return (
    <div
      className={cn(
        'p-3 rounded-lg border text-sm',
        clarification.priority === 'high'
          ? 'bg-red-50 border-red-300'
          : 'bg-blue-50 border-blue-300'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-4 h-4" />
        <span className="font-medium">{clarification.reviewer}</span>
        {clarification.priority === 'high' && (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
            High Priority
          </Badge>
        )}
      </div>
      <p className="text-gray-900 mb-2">{clarification.question}</p>
      <p className="text-xs text-gray-600">
        {new Date(clarification.timestamp).toLocaleString()}
      </p>

      {clarification.response && (
        <div className="mt-2 pt-2 border-t">
          <p className="text-xs text-gray-600 mb-1">
            Response by {clarification.respondedBy}:
          </p>
          <p className="text-gray-900">{clarification.response}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTION BAR
// ═══════════════════════════════════════════════════════════════════════════

interface ActionBarProps {
  canApprove: boolean;
  totalIssues: number;
  criticalCount: number;
  onApprove: () => void;
  onReturn: () => void;
}

function ActionBar({
  canApprove,
  totalIssues,
  criticalCount,
  onApprove,
  onReturn,
}: ActionBarProps) {
  return (
    <div className="bg-white border-t px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Total Issues:</span>
            <Badge
              variant="outline"
              className={cn(
                totalIssues > 0
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-green-100 text-green-700 border-green-300'
              )}
            >
              {totalIssues}
            </Badge>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Critical:</span>
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                {criticalCount}
              </Badge>
            </div>
          )}
          {!canApprove && (
            <div className="text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Cannot approve: Critical issues must be resolved
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onReturn}>
            <XCircle className="w-4 h-4 mr-2" />
            Return for Correction
          </Button>
          <Button onClick={onApprove} disabled={!canApprove}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve for Billing
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DIALOGS
// ═══════════════════════════════════════════════════════════════════════════

function ApproveDialog({
  item,
  reviewNotes,
  onApprove,
  onCancel,
}: {
  item: QAReviewItem;
  reviewNotes: string;
  onApprove: () => void;
  onCancel: () => void;
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
            This document will be approved and ready for billing submission.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Patient:</span>
              <span className="font-medium text-gray-900">{item.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Document:</span>
              <span className="font-medium text-gray-900">{item.documentType}</span>
            </div>
            {reviewNotes && (
              <div>
                <span className="text-gray-600">Notes:</span>
                <p className="text-gray-900 mt-1">{reviewNotes}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onApprove} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ReturnDialog({
  item,
  issues,
  onReturn,
  onCancel,
}: {
  item: QAReviewItem;
  issues: ReviewComment[];
  onReturn: (reason: string) => void;
  onCancel: () => void;
}) {
  const [returnReason, setReturnReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto m-4">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Return for Correction</h3>

          {issues.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Issues Identified ({issues.length}):
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                {issues.map((issue) => (
                  <div key={issue.id} className="text-sm text-red-700">
                    • {issue.text}
                  </div>
                ))}
              </div>
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

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => onReturn(returnReason)}
              disabled={!returnReason.trim()}
              className="flex-1"
            >
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
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockDocumentReviewState(item: QAReviewItem): DocumentReviewState {
  return {
    item,
    sections: [
      {
        id: 'section-1',
        title: 'Visit Information',
        content: 'Visit details and basic information',
        fields: [
          {
            id: 'field-1',
            label: 'Visit Date',
            value: item.visitDate || 'Not recorded',
            required: true,
            hasIssue: false,
          },
          {
            id: 'field-2',
            label: 'Visit Duration',
            value: '45 minutes',
            required: true,
            hasIssue: false,
          },
          {
            id: 'field-3',
            label: 'Visit Type',
            value: 'Skilled Nursing',
            required: true,
            hasIssue: false,
          },
        ],
        validationIssues: [],
      },
      {
        id: 'section-2',
        title: 'Vital Signs',
        content: 'Patient vital signs',
        fields: [
          {
            id: 'field-4',
            label: 'Blood Pressure',
            value: item.complianceScore && item.complianceScore < 80 ? '' : '128/82 mmHg',
            required: true,
            hasIssue: item.complianceScore ? item.complianceScore < 80 : false,
            issueDescription: item.complianceScore && item.complianceScore < 80 ? 'Blood pressure not recorded' : undefined,
          },
          {
            id: 'field-5',
            label: 'Heart Rate',
            value: '76 bpm',
            required: true,
            hasIssue: false,
          },
          {
            id: 'field-6',
            label: 'Temperature',
            value: '98.4°F',
            required: true,
            hasIssue: false,
          },
          {
            id: 'field-7',
            label: 'Respiratory Rate',
            value: '18 breaths/min',
            required: true,
            hasIssue: false,
          },
        ],
        validationIssues: item.complianceScore && item.complianceScore < 80 ? ['Blood pressure not recorded'] : [],
      },
      {
        id: 'section-3',
        title: 'Assessment',
        content: 'Clinical assessment',
        fields: [
          {
            id: 'field-8',
            label: 'Mental Status',
            value: 'Alert and oriented x3',
            required: true,
            hasIssue: false,
          },
          {
            id: 'field-9',
            label: 'Mobility Status',
            value: 'Ambulating with walker independently',
            required: true,
            hasIssue: false,
          },
          {
            id: 'field-10',
            label: 'Pain Assessment',
            value: '2/10 - Well controlled',
            required: true,
            hasIssue: false,
          },
        ],
        validationIssues: [],
      },
      {
        id: 'section-4',
        title: 'Interventions',
        content: 'Care interventions performed',
        fields: [
          {
            id: 'field-11',
            label: 'Wound Care',
            value: 'Wound cleansed with normal saline, applied silver alginate dressing',
            required: false,
            hasIssue: false,
          },
          {
            id: 'field-12',
            label: 'Medication Review',
            value: item.complianceScore && item.complianceScore < 80 ? 'Not completed' : 'Completed - All medications reviewed',
            required: true,
            hasIssue: item.complianceScore ? item.complianceScore < 80 : false,
            issueDescription: item.complianceScore && item.complianceScore < 80 ? 'Medication review incomplete' : undefined,
          },
          {
            id: 'field-13',
            label: 'Patient Education',
            value: 'Wound care instructions and infection signs reviewed',
            required: true,
            hasIssue: false,
          },
        ],
        validationIssues: item.complianceScore && item.complianceScore < 80 ? ['Medication review incomplete'] : [],
      },
    ],
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
        category: 'Medication Review',
        rule: 'Medication reconciliation performed',
        status: item.complianceScore && item.complianceScore < 80 ? 'warning' : 'passed',
        details: item.complianceScore && item.complianceScore < 80 ? 'Medication review incomplete' : undefined,
        severity: 'major',
      },
      {
        id: 'rule-4',
        category: 'Patient Safety',
        rule: 'Fall risk assessment completed',
        status: 'passed',
        severity: 'major',
      },
      {
        id: 'rule-5',
        category: 'Plan of Care',
        rule: 'Goals and interventions aligned with POC',
        status: 'passed',
        severity: 'critical',
      },
    ],
    comments: [],
    clarifications: [],
  };
}
