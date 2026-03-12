/**
 * Compliance Checklist & QA Activity Timeline Demo Page
 * 
 * Demonstrates:
 * - Compliance Checklist for document review
 * - QA Activity Timeline showing document history
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, CheckCircle, History } from 'lucide-react';
import ComplianceChecklist, {
  generateMockComplianceChecklistData,
  ComplianceChecklistData,
  ChecklistItemStatus,
} from '../components/ComplianceChecklist';
import QAActivityTimeline, {
  generateMockQAActivityTimelineData,
  QAActivityTimelineData,
} from '../components/QAActivityTimeline';

export default function ComplianceChecklistPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'checklist' | 'timeline'>('checklist');
  const [checklistData, setChecklistData] = useState<ComplianceChecklistData>(
    generateMockComplianceChecklistData()
  );
  const [timelineData] = useState<QAActivityTimelineData>(generateMockQAActivityTimelineData());

  const handleItemUpdate = (itemId: string, status: ChecklistItemStatus, notes?: string) => {
    setChecklistData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status,
              notes,
              verifiedBy: status === 'verified' ? 'Jane Smith, QA Reviewer' : item.verifiedBy,
              verifiedAt: status === 'verified' ? new Date().toISOString() : item.verifiedAt,
            }
          : item
      ),
    }));
  };

  const handleComplete = () => {
    alert('Checklist completed! Document ready for approval.');
  };

  const handleFieldClick = (fieldId: string, sectionName: string) => {
    console.log('Navigate to field:', fieldId, sectionName);
    alert(`Navigate to field:\n\nField: ${fieldId}\nSection: ${sectionName}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Compliance Checklist & QA Activity Timeline
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Document compliance verification & complete QA history
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* View Selector */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Select View</h2>
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="checklist">
                <CheckCircle className="w-4 h-4 mr-2" />
                Compliance Checklist
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <History className="w-4 h-4 mr-2" />
                QA Activity Timeline
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {/* Checklist View */}
        {activeView === 'checklist' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Compliance Checklist</h2>
              <p className="text-sm text-gray-600 mb-4">
                Interactive checklist for QA reviewers to verify compliance items before approving
                documents for billing. Mark each item as verified, failed, or not applicable.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                    7 Compliance Categories
                  </h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Required Documentation</li>
                    <li>• Plan of Care</li>
                    <li>• Orders & Certification</li>
                    <li>• Visit Frequency</li>
                    <li>• Assessments</li>
                    <li>• Signatures</li>
                    <li>• Billing Requirements</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2 text-sm">
                    4 Item Statuses
                  </h3>
                  <ul className="text-xs text-green-800 space-y-1">
                    <li>
                      <strong>Verified:</strong> Item meets requirements
                    </li>
                    <li>
                      <strong>Failed:</strong> Item does not meet requirements
                    </li>
                    <li>
                      <strong>N/A:</strong> Item not applicable to this document
                    </li>
                    <li>
                      <strong>Pending:</strong> Item not yet reviewed
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FeatureCard
                  title="Required Items"
                  description="Critical items that must be verified before approval"
                  icon="⚠️"
                />
                <FeatureCard
                  title="Progress Tracking"
                  description="Visual progress bars for overall and required items"
                  icon="📊"
                />
                <FeatureCard
                  title="Reviewer Notes"
                  description="Add detailed notes to any checklist item"
                  icon="📝"
                />
                <FeatureCard
                  title="Field Links"
                  description="Click to navigate directly to affected fields"
                  icon="🔗"
                />
                <FeatureCard
                  title="Related Documents"
                  description="See which documents are related to each item"
                  icon="📄"
                />
                <FeatureCard
                  title="Verification Tracking"
                  description="Track who verified each item and when"
                  icon="✅"
                />
              </div>
            </Card>

            <ComplianceChecklist
              data={checklistData}
              currentReviewer="Jane Smith"
              onItemUpdate={handleItemUpdate}
              onComplete={handleComplete}
              onFieldClick={handleFieldClick}
              mode="full"
            />

            {/* Compact Mode Demo */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Compact Mode Example</h3>
              <p className="text-sm text-gray-600 mb-4">
                The checklist also supports a compact mode for use in sidebars or summary views.
              </p>
              <ComplianceChecklist
                data={checklistData}
                currentReviewer="Jane Smith"
                onItemUpdate={handleItemUpdate}
                onComplete={handleComplete}
                mode="compact"
              />
            </Card>
          </div>
        )}

        {/* Timeline View */}
        {activeView === 'timeline' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">QA Activity Timeline</h2>
              <p className="text-sm text-gray-600 mb-4">
                Complete timeline of all QA-related events for a clinical document. Shows document
                lifecycle from creation through approval, including all review cycles, corrections,
                and status changes.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 text-sm">
                    12 Event Types
                  </h3>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Document Created</li>
                    <li>• Document Submitted</li>
                    <li>• QA Review Started</li>
                    <li>• QA Review Completed</li>
                    <li>• Returned for Correction</li>
                    <li>• Correction Started</li>
                    <li>• Correction Completed</li>
                    <li>• Correction Resubmitted</li>
                    <li>• Approved for Billing</li>
                    <li>• Comment Added</li>
                    <li>• Status Changed</li>
                    <li>• Assigned to Reviewer</li>
                  </ul>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-900 mb-2 text-sm">
                    Event Metadata
                  </h3>
                  <ul className="text-xs text-indigo-800 space-y-1">
                    <li>
                      <strong>Timestamp:</strong> Exact date and time
                    </li>
                    <li>
                      <strong>User:</strong> Person who performed action
                    </li>
                    <li>
                      <strong>Role:</strong> User's role in the system
                    </li>
                    <li>
                      <strong>Description:</strong> What happened
                    </li>
                    <li>
                      <strong>Issue Count:</strong> Number of issues
                    </li>
                    <li>
                      <strong>Duration:</strong> Time taken
                    </li>
                    <li>
                      <strong>Compliance Score:</strong> Document quality
                    </li>
                    <li>
                      <strong>Comments:</strong> Additional context
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FeatureCard
                  title="Complete History"
                  description="Every event in document lifecycle"
                  icon="📜"
                />
                <FeatureCard
                  title="User Attribution"
                  description="See who performed each action"
                  icon="👤"
                />
                <FeatureCard
                  title="Timestamp Tracking"
                  description="Precise date and time for every event"
                  icon="⏰"
                />
                <FeatureCard
                  title="Iteration Numbers"
                  description="Track correction cycles and attempts"
                  icon="🔄"
                />
                <FeatureCard
                  title="Event Metadata"
                  description="Rich context for each timeline event"
                  icon="ℹ️"
                />
                <FeatureCard
                  title="Duration Tracking"
                  description="Time calculations for corrections"
                  icon="⏱️"
                />
              </div>
            </Card>

            <QAActivityTimeline data={timelineData} mode="full" />

            {/* Compact Mode Demo */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Compact Mode Example</h3>
              <p className="text-sm text-gray-600 mb-4">
                The timeline also supports a compact mode for use in sidebars or summary views.
              </p>
              <QAActivityTimeline data={timelineData} mode="compact" />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h4>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}
