/**
 * Return for Correction Workflow Demo Page
 * 
 * Demonstrates the complete Return for Correction workflow including:
 * - QA staff return workflow with issue classification
 * - Clinician returned documents queue
 * - Correction history tracking
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  XCircle,
  FileText,
  History,
} from 'lucide-react';
import ReturnForCorrectionWorkflow, {
  generateMockCorrectionHistory,
  ReturnMetadata,
} from '../components/ReturnForCorrectionWorkflow';
import ClinicianReturnedDocumentsQueue, {
  generateMockReturnedDocuments,
  ReturnedDocument,
} from '../components/ClinicianReturnedDocumentsQueue';
import CorrectionHistoryTracker, {
  generateMockCorrectionHistoryData,
  CorrectionHistoryData,
} from '../components/CorrectionHistoryTracker';
import { generateMockQAReviewItems, QAReviewItem } from '../components/QACenterWorkspace';

export default function ReturnForCorrectionWorkflowPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'qa' | 'clinician' | 'history'>('qa');
  const [showReturnWorkflow, setShowReturnWorkflow] = useState(false);
  const [mockItem] = useState<QAReviewItem>(generateMockQAReviewItems()[2]); // The one with issues
  const [mockReturnedDocs] = useState<ReturnedDocument[]>(generateMockReturnedDocuments());
  const [mockHistoryData] = useState<CorrectionHistoryData>(generateMockCorrectionHistoryData());
  const [mockCorrectionHistory] = useState(generateMockCorrectionHistory());

  const handleReturn = (metadata: ReturnMetadata) => {
    console.log('Document returned:', metadata);
    alert(
      `Document returned to ${mockItem.clinicianName}!\n\n` +
        `Issues: ${metadata.issues.length}\n` +
        `Priority: ${metadata.priority}\n` +
        `Reason: ${metadata.returnReason}`
    );
    setShowReturnWorkflow(false);
  };

  const handleOpenDocument = (document: ReturnedDocument) => {
    console.log('Open document:', document);
    alert(`Opening document for correction:\n\n${document.item.patientName} - ${document.item.documentType}`);
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
                  Return for Correction Workflow
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete workflow for returning documents and tracking corrections
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
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="qa">
                <XCircle className="w-4 h-4 mr-2" />
                QA Staff View
              </TabsTrigger>
              <TabsTrigger value="clinician">
                <FileText className="w-4 h-4 mr-2" />
                Clinician View
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="w-4 h-4 mr-2" />
                History View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {/* QA Staff View */}
        {activeView === 'qa' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                QA Reviewer - Return Document Workflow
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                As a QA reviewer, you can return documents to clinicians with detailed correction
                instructions. The workflow guides you through identifying issues, classifying them,
                and providing clear correction instructions.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">Sample Document</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>
                    <strong>Patient:</strong> {mockItem.patientName}
                  </div>
                  <div>
                    <strong>Document:</strong> {mockItem.documentType}
                  </div>
                  <div>
                    <strong>Clinician:</strong> {mockItem.clinicianName}
                  </div>
                  <div>
                    <strong>Compliance Score:</strong> {mockItem.complianceScore}%
                  </div>
                  <div>
                    <strong>Flags:</strong> {mockItem.flags.join(', ')}
                  </div>
                </div>
              </div>

              <Button onClick={() => setShowReturnWorkflow(true)}>
                <XCircle className="w-4 h-4 mr-2" />
                Start Return Workflow
              </Button>
            </Card>

            {/* Features */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Workflow Features</h3>
              <div className="grid grid-cols-2 gap-4">
                <FeatureCard
                  title="Issue Classification"
                  description="7 issue categories with severity levels (Critical, Major, Minor)"
                  icon="🏷️"
                />
                <FeatureCard
                  title="Detailed Instructions"
                  description="Provide specific correction instructions for each issue"
                  icon="📝"
                />
                <FeatureCard
                  title="Field-Level Tracking"
                  description="Associate issues with specific sections and fields"
                  icon="🎯"
                />
                <FeatureCard
                  title="Priority Setting"
                  description="Set urgent, high, or normal priority with due dates"
                  icon="⚡"
                />
                <FeatureCard
                  title="3-Step Process"
                  description="Identify Issues → Provide Instructions → Review & Send"
                  icon="📊"
                />
                <FeatureCard
                  title="Correction History"
                  description="Track return iterations and quality trends"
                  icon="📈"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Clinician View */}
        {activeView === 'clinician' && (
          <div className="h-[calc(100vh-220px)]">
            <ClinicianReturnedDocumentsQueue
              documents={mockReturnedDocs}
              currentClinician="Emily Chen, RN"
              onOpenDocument={handleOpenDocument}
            />
          </div>
        )}

        {/* History View */}
        {activeView === 'history' && (
          <CorrectionHistoryTracker data={mockHistoryData} />
        )}
      </div>

      {/* Return Workflow Modal */}
      {showReturnWorkflow && (
        <ReturnForCorrectionWorkflow
          item={mockItem}
          currentReviewer="Jane Smith"
          correctionHistory={mockCorrectionHistory}
          onReturn={handleReturn}
          onCancel={() => setShowReturnWorkflow(false)}
        />
      )}
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
