/**
 * Document Review Interface Demo Page
 * 
 * Demonstrates the complete Document Review Interface for QA staff with
 * document viewer, review panel, validation tools, and interactive features.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DocumentReviewInterface, {
  generateMockDocumentReviewState,
  DocumentReviewState,
  ReviewComment,
  ClarificationRequest,
} from '../components/DocumentReviewInterface';
import { generateMockQAReviewItems, QAReviewItem } from '../components/QACenterWorkspace';

export default function DocumentReviewInterfacePage() {
  const navigate = useNavigate();
  const [mockItem] = useState<QAReviewItem>(generateMockQAReviewItems()[0]);
  const [reviewState, setReviewState] = useState<DocumentReviewState>(
    generateMockDocumentReviewState(mockItem)
  );

  const handleApprove = (comments: string) => {
    console.log('Approve document:', comments);
    alert(
      `Document approved for billing!${comments ? `\n\nReview Notes:\n${comments}` : ''}`
    );
  };

  const handleReturn = (reason: string, comments: ReviewComment[]) => {
    console.log('Return document:', reason, comments);
    alert(
      `Document returned for correction.\n\nReason: ${reason}\n\nIssues: ${comments.length}`
    );
  };

  const handleSaveComment = (comment: ReviewComment) => {
    console.log('Save comment:', comment);
    setReviewState({
      ...reviewState,
      comments: [...reviewState.comments, comment],
    });
  };

  const handleRequestClarification = (request: ClarificationRequest) => {
    console.log('Request clarification:', request);
    setReviewState({
      ...reviewState,
      clarifications: [...reviewState.clarifications, request],
    });
    alert('Clarification request sent to clinician');
  };

  const handleSaveDraft = () => {
    console.log('Save draft');
    alert('Review draft saved successfully');
  };

  const handleBack = () => {
    navigate(-1);
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
                  Document Review Interface
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete QA review tools for clinical documentation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-73px)]">
        <DocumentReviewInterface
          reviewState={reviewState}
          currentReviewer="Jane Smith"
          onApprove={handleApprove}
          onReturn={handleReturn}
          onSaveComment={handleSaveComment}
          onRequestClarification={handleRequestClarification}
          onSaveDraft={handleSaveDraft}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}

// cn utility
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
