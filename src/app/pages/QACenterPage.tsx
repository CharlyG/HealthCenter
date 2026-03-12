/**
 * QA Center Demo Page
 * 
 * Demonstrates the complete QA Center architecture for reviewing clinical
 * documentation before billing and compliance submission.
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
  FileText,
  Eye,
} from 'lucide-react';
import QACenterWorkspace, {
  generateMockQAReviewItems,
  generateMockQAMetrics,
  QAReviewItem,
  QAMetrics,
} from '../components/QACenterWorkspace';
import DocumentReviewPanel, {
  generateMockDocumentReviewData,
  DocumentReviewData,
} from '../components/DocumentReviewPanel';

export default function QACenterPage() {
  const navigate = useNavigate();
  const [mockItems] = useState<QAReviewItem[]>(generateMockQAReviewItems());
  const [mockMetrics] = useState<QAMetrics>(generateMockQAMetrics());
  const [selectedItem, setSelectedItem] = useState<QAReviewItem | null>(null);
  const [reviewData, setReviewData] = useState<DocumentReviewData | null>(null);
  const [viewMode, setViewMode] = useState<'queue' | 'review'>('queue');

  const handleReviewItem = (itemId: string) => {
    const item = mockItems.find((i) => i.id === itemId);
    if (item) {
      setSelectedItem(item);
      setReviewData(generateMockDocumentReviewData(item));
      setViewMode('review');
    }
  };

  const handleBack = () => {
    setViewMode('queue');
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

  const handleBulkAssign = (itemIds: string[], reviewer: string) => {
    console.log('Bulk assign:', itemIds, reviewer);
    alert(`${itemIds.length} items assigned to ${reviewer}`);
  };

  const handleExportQueue = () => {
    console.log('Export queue');
    alert('Queue exported to CSV');
  };

  const handleRefresh = () => {
    console.log('Refresh queue');
    alert('Queue refreshed');
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
                <h1 className="text-xl font-bold text-gray-900">QA Center</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Review clinical documentation for compliance and billing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-73px)]">
        {viewMode === 'queue' ? (
          <QACenterWorkspace
            items={mockItems}
            metrics={mockMetrics}
            currentReviewer="Jane Smith"
            onReviewItem={handleReviewItem}
            onBulkAssign={handleBulkAssign}
            onExportQueue={handleExportQueue}
            onRefresh={handleRefresh}
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
