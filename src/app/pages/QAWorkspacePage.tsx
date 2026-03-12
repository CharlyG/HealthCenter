/**
 * QA Workspace Demo Page
 * 
 * Demonstrates the QA Workspace with operational queues for clinical
 * documentation review.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Info,
  Check,
  Layout,
} from 'lucide-react';
import QAWorkspace, {
  generateMockQAWorkspaceData,
  QAWorkspaceData,
} from '../components/QAWorkspace';
import DocumentReviewPanel, {
  generateMockDocumentReviewData,
  DocumentReviewData,
} from '../components/DocumentReviewPanel';
import type { QAReviewItem } from '../components/QACenterWorkspace';

export default function QAWorkspacePage() {
  const navigate = useNavigate();
  const [mockData] = useState<QAWorkspaceData>(generateMockQAWorkspaceData());
  const [selectedItem, setSelectedItem] = useState<QAReviewItem | null>(null);
  const [reviewData, setReviewData] = useState<DocumentReviewData | null>(null);
  const [viewMode, setViewMode] = useState<'workspace' | 'review'>('workspace');

  const handleOpenDocument = (item: QAReviewItem) => {
    setSelectedItem(item);
    setReviewData(generateMockDocumentReviewData(item));
    setViewMode('review');
  };

  const handleBack = () => {
    setViewMode('workspace');
    setSelectedItem(null);
    setReviewData(null);
  };

  const handleReturn = (reason: string, comments: string) => {
    console.log('Return document:', reason, comments);
    alert(`Document returned for correction.\n\nReason: ${reason}\n\nComments: ${comments}`);
    handleBack();
  };

  const handleApprove = (comments: string) => {
    console.log('Approve document:', comments);
    alert(`Document approved for billing.${comments ? `\n\nComments: ${comments}` : ''}`);
    handleBack();
  };

  const handleEscalate = (reason: string) => {
    console.log('Escalate:', reason);
    alert(`Document escalated.\n\nReason: ${reason}`);
  };

  const handleSaveNotes = (notes: string) => {
    console.log('Save notes:', notes);
    alert('Notes saved successfully');
  };

  const handleRefresh = () => {
    console.log('Refresh workspace');
    alert('Workspace refreshed');
  };

  const handleExport = (queueType: string) => {
    console.log('Export queue:', queueType);
    alert(`${queueType} queue exported to CSV`);
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
                <h1 className="text-xl font-bold text-gray-900">QA Workspace</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Operational queues for clinical documentation review
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-73px)]">
        {viewMode === 'workspace' ? (
          <QAWorkspace
            data={mockData}
            onOpenDocument={handleOpenDocument}
            onRefresh={handleRefresh}
            onExport={handleExport}
            currentReviewer="Jane Smith"
          />
        ) : reviewData && selectedItem ? (
          <DocumentReviewPanel
            data={reviewData}
            currentReviewer="Jane Smith"
            onReturn={handleReturn}
            onApprove={handleApprove}
            onEscalate={handleEscalate}
            onSaveNotes={handleSaveNotes}
            onBack={handleBack}
          />
        ) : null}
      </div>
    </div>
  );
}

// cn utility
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
