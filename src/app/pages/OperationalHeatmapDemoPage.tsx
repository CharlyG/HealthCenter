/**
 * Operational Heatmap Demo Page
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import OperationalHeatmap from '../components/heatmap/OperationalHeatmap';
import {
  Info,
  CheckCircle2,
  BarChart3,
  MapPin,
  Clock,
  Users,
  Navigation,
  Filter,
  AlertTriangle,
  Target,
  TrendingUp,
  ZoomIn,
} from 'lucide-react';

export default function OperationalHeatmapDemoPage() {
  const [showLive, setShowLive] = useState(false);

  if (showLive) {
    return <OperationalHeatmap />;
  }

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="size-8 text-blue-600" />
            Operational Heatmap Visualization
          </h1>
          <p className="text-gray-600 mt-2">
            Visual analytics for identifying operational trends and bottlenecks across regions and caregivers
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Operational Heatmap</p>
                <p className="mt-1 text-blue-800">
                  The Operational Heatmap provides <strong>visual analytics</strong> across 4 key operational dimensions: Visit Density, Delayed Visits, Caregiver Workload, and Travel Inefficiencies. Uses <strong>color-coded grid visualization</strong> to quickly identify high/low intensity areas, with multi-dimensional filtering by office, discipline, and date range. Includes automatic <strong>bottleneck detection</strong> with actionable recommendations for administrators.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4 Heatmap Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4 Heatmap Visualization Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HeatmapTypeCard
                icon={<MapPin className="size-6 text-blue-600" />}
                title="Visit Density"
                description="Volume of visits by region"
                colorScale={['#f0fdf4', '#86efac', '#22c55e', '#15803d', '#14532d']}
                metrics={[
                  'Total visits per region',
                  'Visit count trends',
                  'High-volume areas',
                  'Capacity planning insights',
                ]}
                useCase="Identify regions with high patient concentration to optimize caregiver assignments"
              />
              <HeatmapTypeCard
                icon={<Clock className="size-6 text-red-600" />}
                title="Delayed Visits"
                description="Locations with delayed visit patterns"
                colorScale={['#fef2f2', '#fca5a5', '#ef4444', '#dc2626', '#991b1b']}
                metrics={[
                  'Delayed visit count by region',
                  'Delay severity levels',
                  'Problem area clusters',
                  'Trend analysis',
                ]}
                useCase="Pinpoint geographic areas with chronic delay issues requiring immediate intervention"
              />
              <HeatmapTypeCard
                icon={<Users className="size-6 text-orange-600" />}
                title="Caregiver Workload"
                description="Distribution of caregiver assignments"
                colorScale={['#fef3c7', '#fbbf24', '#f59e0b', '#d97706', '#92400e']}
                metrics={[
                  'Assigned vs completed visits',
                  'Utilization percentage',
                  'Workload balance',
                  'Overload detection',
                ]}
                useCase="Balance workload across team to prevent burnout and improve visit completion rates"
              />
              <HeatmapTypeCard
                icon={<Navigation className="size-6 text-blue-600" />}
                title="Travel Inefficiencies"
                description="High travel time vs visit time ratio"
                colorScale={['#f0f9ff', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a']}
                metrics={[
                  'Travel/visit time ratio',
                  'Average drive time',
                  'Route optimization needs',
                  'Cost impact analysis',
                ]}
                useCase="Optimize routing and clustering to reduce drive time and increase billable visit time"
              />
            </div>
          </CardContent>
        </Card>

        {/* Color-Coded Intensity System */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Color-Coded Intensity System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Each heatmap type uses a 5-level color scale to represent intensity from low to high. Regions are automatically assigned severity badges based on threshold values.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3">Visit Density Scale (Green)</h4>
                <div className="space-y-2">
                  <ColorScaleExample
                    color="#f0fdf4"
                    label="Very Low (0-20%)"
                    description="Minimal visit volume"
                  />
                  <ColorScaleExample
                    color="#86efac"
                    label="Low (20-40%)"
                    description="Below average volume"
                  />
                  <ColorScaleExample
                    color="#22c55e"
                    label="Medium (40-60%)"
                    description="Average volume"
                  />
                  <ColorScaleExample
                    color="#15803d"
                    label="High (60-80%)"
                    description="Above average volume"
                  />
                  <ColorScaleExample
                    color="#14532d"
                    label="Very High (80-100%)"
                    description="Maximum visit density"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3">Delayed Visits Scale (Red)</h4>
                <div className="space-y-2">
                  <ColorScaleExample
                    color="#fef2f2"
                    label="Excellent (0-2%)"
                    description="Minimal delays"
                  />
                  <ColorScaleExample
                    color="#fca5a5"
                    label="Good (2-5%)"
                    description="Acceptable delay rate"
                  />
                  <ColorScaleExample
                    color="#ef4444"
                    label="Concerning (5-10%)"
                    description="Elevated delays"
                  />
                  <ColorScaleExample
                    color="#dc2626"
                    label="Critical (10-15%)"
                    description="High delay rate"
                  />
                  <ColorScaleExample
                    color="#991b1b"
                    label="Severe (>15%)"
                    description="Chronic delay issues"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Severity Badges:</p>
              <div className="flex items-center gap-3">
                <Badge className="bg-red-600 text-white">CRITICAL</Badge>
                <span className="text-xs text-gray-600">Value exceeds critical threshold</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-orange-600 text-white">HIGH</Badge>
                <span className="text-xs text-gray-600">Value exceeds high threshold</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-amber-600 text-white">MEDIUM</Badge>
                <span className="text-xs text-gray-600">Value is above normal but manageable</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtering System */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Multi-Dimensional Filtering</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Filter heatmap data across 3 dimensions to drill down into specific operational segments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FilterCard
                icon={<MapPin className="size-5 text-blue-600" />}
                title="By Office"
                description="Filter data by office location"
                options={['All Offices', 'Downtown Office', 'Northside Office', 'Southside Office']}
                example="Show only Northside Office operations"
              />
              <FilterCard
                icon={<Users className="size-5 text-purple-600" />}
                title="By Discipline"
                description="Filter by caregiver type"
                options={['All Disciplines', 'RN', 'LPN', 'PT', 'OT', 'ST', 'HHA']}
                example="View only RN visit patterns"
              />
              <FilterCard
                icon={<Clock className="size-5 text-orange-600" />}
                title="By Date Range"
                description="Select custom time period"
                options={['Last 7 days', 'Last 30 days', 'Custom range']}
                example="Analyze trends from past 2 weeks"
              />
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <p className="text-sm font-semibold text-gray-900 mb-3">Example Filter Workflow:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-semibold text-sm">1.</span>
                  <p className="text-sm text-gray-700">Select "Northside Office" from office filter</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-semibold text-sm">2.</span>
                  <p className="text-sm text-gray-700">Choose "RN" from discipline filter</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-semibold text-sm">3.</span>
                  <p className="text-sm text-gray-700">Set date range to "Last 14 days"</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-semibold text-sm">4.</span>
                  <p className="text-sm text-gray-700">Heatmap updates to show only RN visits in Northside for past 2 weeks</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottleneck Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Automatic Bottleneck Detection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              The system automatically identifies operational bottlenecks and provides actionable recommendations.
            </p>

            <div className="space-y-3">
              <BottleneckExample
                severity="critical"
                icon="🔴"
                type="Delayed Visit Cluster"
                region="Downtown"
                metric="12 delayed visits"
                recommendation="Review caregiver schedules and reassign visits to available staff. Consider adding 2 additional RNs to this region."
              />
              <BottleneckExample
                severity="critical"
                icon="🔴"
                type="Overloaded Caregiver"
                region="Sarah Chen (RN)"
                metric="98% utilization"
                recommendation="Redistribute workload immediately. Sarah has 42 assigned visits - reassign 10 visits to caregivers with <80% utilization."
              />
              <BottleneckExample
                severity="high"
                icon="🟠"
                type="High Visit Density"
                region="Northside"
                metric="58 visits"
                recommendation="Consider adding 3 more caregivers to this region. Current staff-to-visit ratio is suboptimal."
              />
              <BottleneckExample
                severity="medium"
                icon="🟡"
                type="Travel Inefficiency"
                region="Eastside"
                metric="0.72 ratio"
                recommendation="Optimize routing. Caregivers spending 43 minutes drive time per 60-minute visit. Cluster visits geographically."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-900">
                <CheckCircle2 className="size-4 inline mr-1" />
                <strong>Proactive Alerts:</strong> Bottleneck detection runs automatically every 15 minutes, alerting administrators before issues escalate.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interactive Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InteractiveFeatureCard
                icon={<ZoomIn className="size-5 text-blue-600" />}
                title="Region Drill-Down"
                description="Click any region card to see detailed metrics"
                features={[
                  'Total visits breakdown',
                  'Delayed visits count',
                  'Assigned caregivers',
                  'Patient count',
                  'Average travel times',
                ]}
              />
              <InteractiveFeatureCard
                icon={<Users className="size-5 text-purple-600" />}
                title="Caregiver Detail View"
                description="Click caregiver row for full workload analysis"
                features={[
                  'Assigned vs completed visits',
                  'Delay patterns',
                  'Utilization percentage',
                  'Drive time analysis',
                  'Regions covered',
                ]}
              />
              <InteractiveFeatureCard
                icon={<TrendingUp className="size-5 text-green-600" />}
                title="Trend Analysis"
                description="Compare metrics over different time periods"
                features={[
                  'Week-over-week changes',
                  'Month-over-month trends',
                  'Seasonal patterns',
                  'Predictive forecasting',
                ]}
              />
              <InteractiveFeatureCard
                icon={<Target className="size-5 text-orange-600" />}
                title="Export & Reporting"
                description="Download heatmap data for further analysis"
                features={[
                  'CSV export of all metrics',
                  'Excel workbooks',
                  'PDF reports with visualizations',
                  'API integration available',
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UseCaseCard
              title="Weekly Operations Review"
              scenario="Director of Operations reviews weekly performance"
              steps={[
                'Open Operational Heatmap with default 7-day view',
                'Check Visit Density heatmap - identify Downtown has 58 visits (HIGH)',
                'Switch to Delayed Visits heatmap - see Downtown has 12 delayed (CRITICAL)',
                'Click Downtown region card for drill-down details',
                'Identify root cause: Only 4 caregivers assigned, need 6-7 for volume',
                'Switch to Caregiver Workload tab',
                'See Sarah Chen at 98% utilization (overloaded)',
                'Navigate to scheduling to redistribute Sarah\'s visits',
                'Add 2 new caregivers to Downtown region',
              ]}
              benefit="Identified and resolved bottleneck reducing delays by 75% within 3 days"
            />

            <UseCaseCard
              title="Route Optimization Initiative"
              scenario="Operations manager reducing travel costs"
              steps={[
                'Filter heatmap: All offices, All disciplines, Last 30 days',
                'Switch to Travel Inefficiencies heatmap',
                'Identify Eastside region: 0.72 travel/visit ratio (HIGH)',
                'Drill into Eastside details: Caregivers averaging 43min drive per visit',
                'Analyze caregiver workload: Multiple caregivers crossing regions',
                'Recommendation: Cluster visits geographically',
                'Implement new routing: Assign caregivers to specific sub-regions',
                'Monitor heatmap over next 2 weeks',
                'Travel ratio improves to 0.45 (40% reduction in drive time)',
              ]}
              benefit="Reduced travel costs by $12,000/month and increased billable visit time by 18%"
            />

            <UseCaseCard
              title="Capacity Planning for New Office"
              scenario="Planning caregiver staffing for new office location"
              steps={[
                'Filter heatmap to show similar existing office (Northside)',
                'View Visit Density: Average 45 visits per week',
                'Check Caregiver Workload: 6 caregivers maintaining 80% utilization',
                'Analyze Travel Inefficiencies: 0.38 ratio (efficient)',
                'Calculate: 45 visits ÷ 6 caregivers = 7.5 visits/caregiver/week',
                'For new office with projected 60 visits/week: Need 8 caregivers',
                'Plan discipline mix: 3 RNs, 2 LPNs, 2 PTs, 1 OT (based on Northside ratios)',
                'Set up new office with 8 caregivers',
                'Monitor heatmap post-launch to validate staffing model',
              ]}
              benefit="New office achieved 85% utilization from day 1 with optimal staffing"
            />
          </UseCaseCard>
        </Card>

        {/* Try It Out */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <BarChart3 className="size-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Try the Operational Heatmap</h3>
            <p className="text-sm text-green-800 mb-4">
              Explore the interactive heatmap with all 4 visualization types and filtering capabilities
            </p>
            <Button onClick={() => setShowLive(true)} size="lg">
              Launch Heatmap
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">4</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Heatmap Types</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">3</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Filter Dimensions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">5</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Intensity Levels</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-orange-600">∞</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Region Tracking</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper Components

interface HeatmapTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorScale: string[];
  metrics: string[];
  useCase: string;
}

function HeatmapTypeCard({ icon, title, description, colorScale, metrics, useCase }: HeatmapTypeCardProps) {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-sm text-gray-700 mb-3">{description}</p>
      
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-700 mb-1.5">Color Scale:</p>
        <div className="flex gap-1">
          {colorScale.map((color, i) => (
            <div key={i} className="h-6 flex-1 rounded border border-gray-300" style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-700 mb-1.5">Metrics:</p>
        <ul className="space-y-1">
          {metrics.map((metric, i) => (
            <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
              <span className="text-blue-600">•</span>
              <span>{metric}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-2">
        <p className="text-xs text-blue-900">
          <strong>Use Case:</strong> {useCase}
        </p>
      </div>
    </div>
  );
}

interface ColorScaleExampleProps {
  color: string;
  label: string;
  description: string;
}

function ColorScaleExample({ color, label, description }: ColorScaleExampleProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="size-8 rounded border border-gray-300 flex-shrink-0" style={{ backgroundColor: color }} />
      <div>
        <p className="text-xs font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}

interface FilterCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  options: string[];
  example: string;
}

function FilterCard({ icon, title, description, options, example }: FilterCardProps) {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
      </div>
      <p className="text-xs text-gray-700 mb-3">{description}</p>
      <div className="bg-gray-50 rounded p-2 mb-2">
        <p className="text-xs font-semibold text-gray-700 mb-1">Options:</p>
        <ul className="space-y-0.5">
          {options.slice(0, 3).map((opt, i) => (
            <li key={i} className="text-xs text-gray-600">• {opt}</li>
          ))}
          {options.length > 3 && <li className="text-xs text-gray-600">• +{options.length - 3} more</li>}
        </ul>
      </div>
      <p className="text-xs text-blue-700 italic">{example}</p>
    </div>
  );
}

interface BottleneckExampleProps {
  severity: string;
  icon: string;
  type: string;
  region: string;
  metric: string;
  recommendation: string;
}

function BottleneckExample({ severity, icon, type, region, metric, recommendation }: BottleneckExampleProps) {
  const severityColors: Record<string, string> = {
    critical: 'bg-red-100 border-red-300 text-red-900',
    high: 'bg-orange-100 border-orange-300 text-orange-900',
    medium: 'bg-amber-100 border-amber-300 text-amber-900',
  };

  return (
    <div className={`border-2 rounded-lg p-3 ${severityColors[severity]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="font-semibold text-sm">{type}</p>
            <p className="text-xs opacity-80">{region}</p>
          </div>
        </div>
        <Badge className="bg-white/50 text-xs">{metric}</Badge>
      </div>
      <div className="bg-white/30 rounded p-2">
        <p className="text-xs">
          <strong>💡 Recommendation:</strong> {recommendation}
        </p>
      </div>
    </div>
  );
}

interface InteractiveFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

function InteractiveFeatureCard({ icon, title, description, features }: InteractiveFeatureCardProps) {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
      </div>
      <p className="text-xs text-gray-700 mb-3">{description}</p>
      <ul className="space-y-1">
        {features.map((feature, i) => (
          <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
            <CheckCircle2 className="size-3 text-green-600 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface UseCaseCardProps {
  title: string;
  scenario: string;
  steps: string[];
  benefit: string;
}

function UseCaseCard({ title, scenario, steps, benefit }: UseCaseCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{scenario}</p>
      <p className="text-xs font-semibold text-gray-700 mb-2">Workflow:</p>
      <ol className="space-y-1.5 mb-3">
        {steps.map((step, i) => (
          <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
            <span className="text-blue-600 font-semibold">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="bg-green-50 border border-green-200 rounded p-2">
        <p className="text-xs text-green-800">
          <CheckCircle2 className="size-3 inline mr-1" />
          <strong>Result:</strong> {benefit}
        </p>
      </div>
    </div>
  );
}
