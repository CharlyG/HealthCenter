/**
 * QA Metrics System Demo Page
 * 
 * Comprehensive demo including:
 * - Documentation Quality Metrics Dashboard
 * - Admission QA Summary Panel
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, TrendingUp, Shield } from 'lucide-react';
import DocumentationQualityMetrics, {
  generateMockDocumentationQualityMetrics,
  DocumentationQualityMetricsData,
} from '../components/DocumentationQualityMetrics';
import AdmissionQASummaryPanel, {
  generateMockAdmissionQASummary,
} from '../components/AdmissionQASummaryPanel';

export default function QAMetricsSystemPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'metrics' | 'admission'>('metrics');

  // Quality Metrics state
  const [qualityMetrics, setQualityMetrics] = useState<DocumentationQualityMetricsData>(
    generateMockDocumentationQualityMetrics()
  );

  // Admission QA state
  const [admissionQA] = useState(generateMockAdmissionQASummary());

  const handleTimeframeChange = (timeframe: '7d' | '30d' | '90d') => {
    console.log('Timeframe changed:', timeframe);
    // In production, fetch new data for the selected timeframe
  };

  const handleClinicianClick = (clinicianId: string) => {
    console.log('Clinician clicked:', clinicianId);
    alert(`Opening detailed metrics for clinician: ${clinicianId}`);
  };

  const handleViewDocuments = (status?: string) => {
    console.log('View documents:', status);
    alert(`Opening documents list${status ? ` filtered by: ${status}` : ''}`);
  };

  const handleViewCompliance = () => {
    console.log('View compliance');
    alert('Opening detailed compliance report');
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
                <h1 className="text-xl font-bold text-gray-900">QA Metrics System</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Quality metrics & admission QA summaries
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
              <TabsTrigger value="metrics">
                <TrendingUp className="w-4 h-4 mr-2" />
                Quality Metrics Dashboard
              </TabsTrigger>
              <TabsTrigger value="admission">
                <Shield className="w-4 h-4 mr-2" />
                Admission QA Summary
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {/* Quality Metrics View */}
        {activeView === 'metrics' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Documentation Quality Metrics
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Comprehensive quality metrics dashboard to help agencies improve documentation
                quality through data-driven insights.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm">4 Key Metrics</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Overall correction rate (% with trend)</li>
                    <li>• Average documentation completion time</li>
                    <li>• Average QA turnaround time</li>
                    <li>• Total documents reviewed</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 text-sm">
                    Clinician Performance
                  </h3>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Per-clinician correction rates</li>
                    <li>• Avg completion time by clinician</li>
                    <li>• Trend indicators (improving/declining/stable)</li>
                    <li>• Common errors per clinician</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2 text-sm">
                    Validation Error Analysis
                  </h3>
                  <ul className="text-xs text-red-800 space-y-1">
                    <li>• Top validation errors by occurrence</li>
                    <li>• Error category breakdown</li>
                    <li>• Affected clinician count</li>
                    <li>• Percentage of total errors</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2 text-sm">Features</h3>
                  <ul className="text-xs text-green-800 space-y-1">
                    <li>• Timeframe filtering (7d/30d/90d)</li>
                    <li>• Discipline filtering</li>
                    <li>• Clickable clinician rows</li>
                    <li>• Visual charts & tables</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FeatureCard
                  title="Correction Rate Tracking"
                  description="Monitor overall and per-clinician correction rates"
                  icon="📊"
                />
                <FeatureCard
                  title="Time Metrics"
                  description="Track completion and turnaround times"
                  icon="⏱️"
                />
                <FeatureCard
                  title="Error Analysis"
                  description="Identify most common validation errors"
                  icon="🔍"
                />
                <FeatureCard
                  title="Trend Indicators"
                  description="See if performance is improving or declining"
                  icon="📈"
                />
                <FeatureCard
                  title="Discipline Filtering"
                  description="Filter metrics by clinical discipline"
                  icon="🏥"
                />
                <FeatureCard
                  title="Timeframe Selection"
                  description="View metrics for 7, 30, or 90 days"
                  icon="📅"
                />
              </div>
            </Card>

            <DocumentationQualityMetrics
              data={qualityMetrics}
              onTimeframeChange={handleTimeframeChange}
              onClinicianClick={handleClinicianClick}
              mode="full"
            />

            {/* Compact Mode Demo */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Compact Mode</h3>
              <p className="text-sm text-gray-600 mb-4">
                The metrics dashboard also supports a compact mode for use in sidebars or widgets.
              </p>
              <div className="max-w-sm">
                <DocumentationQualityMetrics data={qualityMetrics} mode="compact" />
              </div>
            </Card>
          </div>
        )}

        {/* Admission QA Summary View */}
        {activeView === 'admission' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Admission QA Summary Panel</h2>
              <p className="text-sm text-gray-600 mb-4">
                Comprehensive QA summary for individual admissions showing documents reviewed,
                pending, returned, and compliance status. Appears in admission dashboard and QA
                workspace.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                    4 Document Categories
                  </h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Documents Reviewed (blue Eye icon)</li>
                    <li>• Documents Pending Review (amber Clock)</li>
                    <li>• Documents Returned (red XCircle)</li>
                    <li>• Documents Approved (green CheckCircle)</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2 text-sm">Compliance Status</h3>
                  <ul className="text-xs text-green-800 space-y-1">
                    <li>• Overall compliance score (0-100%)</li>
                    <li>• Category-level compliance (pass/warning/fail)</li>
                    <li>• Required documentation check</li>
                    <li>• Signature, billing, clinical, timeliness</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 text-sm">
                    Recent QA Activity
                  </h3>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Recent documents with status</li>
                    <li>• Priority indicators (urgent/high)</li>
                    <li>• Reviewer name & dates</li>
                    <li>• Issue count for returned docs</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-900 mb-2 text-sm">3 Display Modes</h3>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• Full mode (detailed dashboard)</li>
                    <li>• Compact mode (sidebar widget)</li>
                    <li>• Mini mode (ultra-compact)</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FeatureCard
                  title="Metric Cards"
                  description="Clickable cards with document counts"
                  icon="📋"
                />
                <FeatureCard
                  title="Compliance Score"
                  description="Color-coded overall compliance percentage"
                  icon="✅"
                />
                <FeatureCard
                  title="Category Status"
                  description="Pass/warning/fail per compliance category"
                  icon="🔍"
                />
                <FeatureCard
                  title="Recent Activity"
                  description="Timeline of recent QA activity"
                  icon="📅"
                />
                <FeatureCard
                  title="Quick Actions"
                  description="Navigate to filtered document lists"
                  icon="⚡"
                />
                <FeatureCard
                  title="Turnaround Stats"
                  description="Average QA turnaround time tracking"
                  icon="⏱️"
                />
              </div>
            </Card>

            {/* Full Mode */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Full Mode</h3>
              <AdmissionQASummaryPanel
                data={admissionQA}
                onViewDocuments={handleViewDocuments}
                onViewCompliance={handleViewCompliance}
                mode="full"
              />
            </div>

            {/* Compact Mode */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Compact Mode</h3>
              <p className="text-sm text-gray-600 mb-4">
                Compact version for sidebars showing key metrics with grid buttons.
              </p>
              <div className="max-w-sm">
                <AdmissionQASummaryPanel
                  data={admissionQA}
                  onViewDocuments={handleViewDocuments}
                  mode="compact"
                />
              </div>
            </Card>

            {/* Mini Mode */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Mini Mode</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ultra-compact version for tight spaces or list views.
              </p>
              <div className="max-w-xs">
                <AdmissionQASummaryPanel
                  data={admissionQA}
                  onViewDocuments={handleViewDocuments}
                  mode="mini"
                />
              </div>
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
