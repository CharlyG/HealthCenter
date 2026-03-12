/**
 * QA System Demo Page
 * 
 * Comprehensive QA system demo including:
 * - QA Queue Filters
 * - QA Performance Dashboard
 * - Clinician Feedback Panel
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Filter, BarChart3, MessageSquare } from 'lucide-react';
import QAQueueFilters, {
  generateMockFilterOptions,
  generateMockFilters,
  generateMockFilterStats,
  QAQueueFilters as QAQueueFiltersType,
} from '../components/QAQueueFilters';
import QAPerformanceDashboard, {
  generateMockQAPerformanceData,
} from '../components/QAPerformanceDashboard';
import ClinicianFeedbackPanel, {
  generateMockClinicianFeedbackData,
} from '../components/ClinicianFeedbackPanel';

export default function QASystemPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'filters' | 'performance' | 'feedback'>('filters');

  // Filter state
  const [filters, setFilters] = useState<QAQueueFiltersType>(generateMockFilters());
  const [filterOptions] = useState(generateMockFilterOptions());
  const filterStats = generateMockFilterStats(filters);

  // Performance data
  const [performanceData] = useState(generateMockQAPerformanceData());

  // Feedback data
  const [feedbackData] = useState(generateMockClinicianFeedbackData());

  const handleResetFilters = () => {
    setFilters(generateMockFilters());
  };

  const handleFieldClick = (fieldId: string, sectionName: string) => {
    console.log('Navigate to field:', fieldId, sectionName);
    alert(`Navigate to field:\n\nField: ${fieldId}\nSection: ${sectionName}`);
  };

  const handleStartCorrection = () => {
    alert('Opening document editor for corrections...');
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
                <h1 className="text-xl font-bold text-gray-900">QA System</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Queue filtering, performance monitoring & clinician feedback
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
          <h2 className="font-semibold text-gray-900 mb-4">Select Demo View</h2>
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="filters">
                <Filter className="w-4 h-4 mr-2" />
                Queue Filters
              </TabsTrigger>
              <TabsTrigger value="performance">
                <BarChart3 className="w-4 h-4 mr-2" />
                Performance Dashboard
              </TabsTrigger>
              <TabsTrigger value="feedback">
                <MessageSquare className="w-4 h-4 mr-2" />
                Clinician Feedback
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {/* Filters View */}
        {activeView === 'filters' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Filters Sidebar */}
            <div>
              <QAQueueFilters
                filters={filters}
                options={filterOptions}
                stats={filterStats}
                onFiltersChange={setFilters}
                onReset={handleResetFilters}
                mode="full"
              />
            </div>

            {/* Content Area */}
            <div className="col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="font-semibold text-gray-900 mb-4">QA Queue Filtering</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Advanced filtering capabilities help QA reviewers efficiently manage large
                  workloads by filtering items by office, clinician, discipline, document type,
                  priority, and date range.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2 text-sm">6 Filter Categories</h3>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Office Location</li>
                      <li>• Clinician Name</li>
                      <li>• Clinical Discipline</li>
                      <li>• Document Type</li>
                      <li>• Priority Level</li>
                      <li>• Date Range</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2 text-sm">Key Features</h3>
                    <ul className="text-xs text-green-800 space-y-1">
                      <li>• Multi-select checkboxes</li>
                      <li>• Search by patient/doc ID</li>
                      <li>• Active filter badges</li>
                      <li>• Quick reset all</li>
                      <li>• Real-time result count</li>
                      <li>• Expandable sections</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FeatureCard
                    title="Multi-Select Filters"
                    description="Select multiple options within each category"
                    icon="☑️"
                  />
                  <FeatureCard
                    title="Active Filter Summary"
                    description="See all active filters with removable badges"
                    icon="🏷️"
                  />
                  <FeatureCard
                    title="Result Count"
                    description="Real-time filtered vs total item count"
                    icon="📊"
                  />
                  <FeatureCard
                    title="Date Range Picker"
                    description="Filter by submission date range"
                    icon="📅"
                  />
                  <FeatureCard
                    title="Search Bar"
                    description="Quick search by patient name or doc ID"
                    icon="🔍"
                  />
                  <FeatureCard
                    title="Reset All"
                    description="Clear all filters with one click"
                    icon="🔄"
                  />
                </div>
              </Card>

              {/* Mock Queue Results */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Queue Results ({filterStats.filteredItems} items)
                </h3>
                <div className="space-y-3">
                  {[...Array(Math.min(5, filterStats.filteredItems))].map((_, i) => (
                    <Card key={i} className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Patient {i + 1}</div>
                          <div className="text-sm text-gray-600">Visit Note • ADM-{12345 + i}</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Performance View */}
        {activeView === 'performance' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">QA Performance Dashboard</h2>
              <p className="text-sm text-gray-600 mb-4">
                Comprehensive dashboard displaying key QA metrics to help administrators monitor
                team performance, identify trends, and optimize review processes.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 text-sm">5 Key Metrics</h3>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Documents Reviewed Today</li>
                    <li>• Documents Pending Review</li>
                    <li>• Average Review Turnaround Time</li>
                    <li>• Documents Returned for Correction</li>
                    <li>• Documents Approved</li>
                  </ul>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-900 mb-2 text-sm">Visual Analytics</h3>
                  <ul className="text-xs text-indigo-800 space-y-1">
                    <li>• Trend indicators (up/down)</li>
                    <li>• 7-day trend chart</li>
                    <li>• Document type breakdown</li>
                    <li>• Reviewer performance table</li>
                    <li>• Approval rate tracking</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FeatureCard
                  title="Trend Indicators"
                  description="See percentage change from previous day"
                  icon="📈"
                />
                <FeatureCard
                  title="7-Day Chart"
                  description="Visual bar chart showing daily trends"
                  icon="📊"
                />
                <FeatureCard
                  title="Type Breakdown"
                  description="Distribution of document types reviewed"
                  icon="📋"
                />
                <FeatureCard
                  title="Reviewer Stats"
                  description="Performance metrics per QA reviewer"
                  icon="👥"
                />
                <FeatureCard
                  title="Approval Rate"
                  description="Track approval rates with indicators"
                  icon="✅"
                />
                <FeatureCard
                  title="Turnaround Time"
                  description="Average hours from submission to approval"
                  icon="⏱️"
                />
              </div>
            </Card>

            <QAPerformanceDashboard data={performanceData} mode="full" />

            {/* Compact Mode Demo */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Compact Mode Example</h3>
              <p className="text-sm text-gray-600 mb-4">
                The performance dashboard also supports a compact mode for use in sidebars.
              </p>
              <QAPerformanceDashboard data={performanceData} mode="compact" />
            </Card>
          </div>
        )}

        {/* Feedback View */}
        {activeView === 'feedback' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Clinician Feedback Panel</h2>
              <p className="text-sm text-gray-600 mb-4">
                Clear, actionable feedback panel showing QA review comments, correction
                instructions, and highlighted fields needing updates. Helps clinicians quickly
                understand and address all issues.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-900 mb-2 text-sm">Feedback Components</h3>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• Return reason summary</li>
                    <li>• Issue-by-issue breakdown</li>
                    <li>• Correction instructions</li>
                    <li>• Reviewer comments</li>
                    <li>• Field-level guidance</li>
                    <li>• Due date tracking</li>
                  </ul>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <h3 className="font-semibold text-teal-900 mb-2 text-sm">Navigation Features</h3>
                  <ul className="text-xs text-teal-800 space-y-1">
                    <li>• "Go to Field" buttons</li>
                    <li>• Field highlights list</li>
                    <li>• Issue severity badges</li>
                    <li>• Category labels</li>
                    <li>• Start Correction CTA</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FeatureCard
                  title="Issue Breakdown"
                  description="Numbered issues with severity levels"
                  icon="🔢"
                />
                <FeatureCard
                  title="Correction Steps"
                  description="Clear what-to-do instructions"
                  icon="✅"
                />
                <FeatureCard
                  title="Field Navigation"
                  description="Direct links to fields needing updates"
                  icon="🔗"
                />
                <FeatureCard
                  title="Priority Indicators"
                  description="Urgent/high/normal priority badges"
                  icon="🚨"
                />
                <FeatureCard
                  title="Reviewer Comments"
                  description="Additional context and notes"
                  icon="💬"
                />
                <FeatureCard
                  title="Summary Stats"
                  description="Total, critical, major issue counts"
                  icon="📊"
                />
              </div>
            </Card>

            <ClinicianFeedbackPanel
              data={feedbackData}
              onFieldClick={handleFieldClick}
              onStartCorrection={handleStartCorrection}
              mode="full"
            />

            {/* Compact Mode Demo */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Compact Mode Example</h3>
              <p className="text-sm text-gray-600 mb-4">
                The feedback panel also supports a compact mode for use in notifications or alerts.
              </p>
              <ClinicianFeedbackPanel
                data={feedbackData}
                onFieldClick={handleFieldClick}
                onStartCorrection={handleStartCorrection}
                mode="compact"
              />
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
