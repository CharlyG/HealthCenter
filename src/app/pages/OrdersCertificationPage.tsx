/**
 * Orders and Certification Demo Page
 * 
 * Demonstrates the complete Orders and Certification architecture
 * with management workspace and document detail views.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  FileText,
  Info,
  Check,
  Phone,
  ClipboardList,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Clock,
  Target,
  Workflow,
} from 'lucide-react';
import OrdersCertificationManagement from '../components/OrdersCertificationManagement';
import OrderDocumentDetail from '../components/OrderDocumentDetail';
import {
  type DocumentCategory,
  generateMockOrderDocument,
  DOCUMENT_CATEGORY_CONFIG,
} from '../services/ordersAndCertification';

export default function OrdersCertificationPage() {
  const navigate = useNavigate();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [mockDocument] = useState(
    generateMockOrderDocument('physician-order', 'ADM-12345')
  );

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
                  Orders & Certification Architecture
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive order and certification document management system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="workspace">
          <TabsList>
            <TabsTrigger value="workspace">
              <FileText className="w-4 h-4 mr-2" />
              Management Workspace
            </TabsTrigger>
            <TabsTrigger value="detail">
              <Eye className="w-4 h-4 mr-2" />
              Document Detail
            </TabsTrigger>
            <TabsTrigger value="architecture">
              <Info className="w-4 h-4 mr-2" />
              Architecture
            </TabsTrigger>
          </TabsList>

          {/* Workspace Tab */}
          <TabsContent value="workspace" className="mt-6">
            <OrdersCertificationManagement
              admissionId="ADM-12345"
              patientName="Margaret Johnson"
              onDocumentClick={docId => setSelectedDocumentId(docId)}
              onCreateDocument={category => {
                console.log('Creating document:', category);
              }}
            />
          </TabsContent>

          {/* Detail Tab */}
          <TabsContent value="detail" className="mt-6">
            <Card className="overflow-hidden">
              <OrderDocumentDetail
                document={mockDocument}
                onEdit={() => console.log('Edit document')}
                onSendForSignature={() => console.log('Send for signature')}
              />
            </Card>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="mt-6 space-y-6">
            <ArchitectureOverview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHITECTURE OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════

function ArchitectureOverview() {
  return (
    <>
      {/* Overview */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Orders & Certification Architecture
        </h3>
        <p className="text-gray-700 mb-4">
          Comprehensive system for managing physician orders, verbal orders, plan of care,
          recertification, and discharge certification documents within patient admissions.
          Treats documents as operational workflow items with full lifecycle tracking.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">5 Document Categories</p>
            <p className="text-sm text-blue-700 mt-1">Comprehensive coverage</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Workflow className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">8 Status Types</p>
            <p className="text-sm text-green-700 mt-1">Full lifecycle tracking</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">Signature Workflow</p>
            <p className="text-sm text-purple-700 mt-1">Multi-signer support</p>
          </div>
        </div>
      </Card>

      {/* Document Categories */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">5 Document Categories</h3>
        <div className="space-y-4">
          {(Object.keys(DOCUMENT_CATEGORY_CONFIG) as DocumentCategory[]).map(category => {
            const config = DOCUMENT_CATEGORY_CONFIG[category];
            const icons = {
              'physician-order': FileText,
              'verbal-order': Phone,
              'plan-of-care': ClipboardList,
              'recertification': RefreshCw,
              'discharge-certification': CheckCircle,
            };
            const Icon = icons[category];

            return (
              <div
                key={category}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${config.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: config.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{config.label}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {config.typicalExpiration || 'No expiration'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{config.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>
                      Physician Signature:{' '}
                      {config.requiresPhysicianSignature ? '✓ Required' : '✗ Not required'}
                    </span>
                    <span>
                      Nurse Signature:{' '}
                      {config.requiresNurseSignature ? '✓ Required' : '✗ Not required'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      Regulatory Requirements:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-0.5">
                      {config.regulatoryRequirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Core Data Model */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Core Data Model</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Document Properties</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Document Type', icon: FileText },
                { label: 'Admission Association', icon: Users },
                { label: 'Order Date', icon: Calendar },
                { label: 'Effective Date', icon: Calendar },
                { label: 'Ordering Physician', icon: Users },
                { label: 'Created By', icon: Users },
                { label: 'Status', icon: CheckCircle },
                { label: 'Signature Status', icon: CheckCircle },
              ].map((prop, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <prop.icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{prop.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Workflow Tracking</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Current step, completed steps, pending steps</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Full timeline with user actions and timestamps</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Compliance tracking with severity-based issues</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Review history with approvals/rejections</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Expiration tracking with warning levels</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Signature Model</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Multi-signer support (physician, nurse, therapist, social worker)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Signature status tracking (pending, signed, declined)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Signature methods (electronic, wet, verbal)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Reminder workflow with tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Decline reasons and IP address logging</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Workflow States */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">8 Document Status Types</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { status: 'Draft', color: '#6B7280', desc: 'Document is being created' },
            { status: 'Pending Review', color: '#F59E0B', desc: 'Awaiting clinical review' },
            {
              status: 'Pending Signature',
              color: '#3B82F6',
              desc: 'Sent for physician signature',
            },
            { status: 'Signed', color: '#10B981', desc: 'All signatures obtained' },
            { status: 'Active', color: '#10B981', desc: 'Currently in effect' },
            { status: 'Expired', color: '#EF4444', desc: 'Certification period ended' },
            { status: 'Superseded', color: '#6B7280', desc: 'Replaced by newer version' },
            { status: 'Cancelled', color: '#DC2626', desc: 'Cancelled before completion' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <p className="font-medium text-gray-900 text-sm">{item.status}</p>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Features</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Management Workspace
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Category and status filtering</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Search by document ID, physician, type</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Pending action queue</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Expiration alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Quick create menu</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Document Detail View
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>4-tab interface (Content, Workflow, Signatures, Compliance)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Category-specific content rendering</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Visual timeline with user actions</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Signature panel with reminder workflow</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Compliance tracking with severity levels</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Use Cases */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Clinical Use Cases</h3>
        <div className="space-y-3">
          {[
            {
              role: 'Nurses',
              desc: 'Create and manage verbal orders with read-back verification tracking',
            },
            {
              role: 'Care Coordinators',
              desc: 'Track all orders and certifications across admissions with expiration monitoring',
            },
            {
              role: 'Physicians',
              desc: 'Review and sign pending orders electronically with audit trail',
            },
            {
              role: 'Compliance Officers',
              desc: 'Monitor regulatory compliance and identify missing signatures/documentation',
            },
            {
              role: 'Billing Teams',
              desc: 'Verify active certifications and plan of care before claim submission',
            },
          ].map((useCase, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{useCase.role}</p>
                <p className="text-sm text-gray-700">{useCase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

// Missing Eye import
function Eye({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

// Missing Workflow import
function Workflow({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}
