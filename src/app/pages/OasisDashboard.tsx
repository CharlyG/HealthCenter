/**
 * OASIS COMPLETION DASHBOARD
 * 
 * Analytics and metrics for OASIS assessment completion
 * Tracks timepoints, completion rates, quality metrics
 */

import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react';

export default function OasisDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">OASIS Dashboard</h1>
            <p className="text-gray-600 mt-1">Performance metrics and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 Days
            </Button>
            <Button variant="outline">
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Total Assessments"
            value="156"
            change="+12%"
            trend="up"
            icon={FileText}
            color="blue"
          />
          <MetricCard
            title="Completion Rate"
            value="94%"
            change="+3%"
            trend="up"
            icon={CheckCircle2}
            color="green"
          />
          <MetricCard
            title="Avg Time to Complete"
            value="42 min"
            change="-5 min"
            trend="down"
            icon={Clock}
            color="purple"
          />
          <MetricCard
            title="QA Return Rate"
            value="8%"
            change="-2%"
            trend="down"
            icon={AlertTriangle}
            color="amber"
          />
        </div>

        {/* Timepoint Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assessments by Timepoint</h2>
          <div className="grid grid-cols-4 gap-4">
            <TimepointCard label="Start of Care" count={52} percentage={33} color="blue" />
            <TimepointCard label="Recertification" count={78} percentage={50} color="green" />
            <TimepointCard label="Resumption of Care" count={18} percentage={12} color="purple" />
            <TimepointCard label="Discharge" count={8} percentage={5} color="gray" />
          </div>
        </Card>

        {/* Performance Tabs */}
        <Card className="p-6">
          <Tabs defaultValue="completion">
            <TabsList>
              <TabsTrigger value="completion">Completion Metrics</TabsTrigger>
              <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
              <TabsTrigger value="clinician">Clinician Performance</TabsTrigger>
              <TabsTrigger value="timeliness">Timeliness</TabsTrigger>
            </TabsList>

            <TabsContent value="completion" className="mt-6">
              <CompletionMetrics />
            </TabsContent>

            <TabsContent value="quality" className="mt-6">
              <QualityMetrics />
            </TabsContent>

            <TabsContent value="clinician" className="mt-6">
              <ClinicianPerformance />
            </TabsContent>

            <TabsContent value="timeliness" className="mt-6">
              <TimelinessMetrics />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Recent Issues */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Common Validation Issues</h2>
          <div className="space-y-3">
            <IssueRow
              mItem="M1021"
              description="Primary Diagnosis - Missing ICD-10 code"
              count={12}
              percentage={32}
            />
            <IssueRow
              mItem="M1033"
              description="Risk for Hospitalization - Incomplete assessment"
              count={8}
              percentage={21}
            />
            <IssueRow
              mItem="M1800"
              description="Grooming ADL - Missing functional score"
              count={6}
              percentage={16}
            />
            <IssueRow
              mItem="M1242"
              description="Hearing - Not assessed"
              count={5}
              percentage={13}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{title}</p>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <div className="flex items-center gap-1 text-sm">
        {trend === 'up' ? (
          <TrendingUp className="w-4 h-4 text-green-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-green-600" />
        )}
        <span className="text-green-600 font-medium">{change}</span>
        <span className="text-gray-600">vs last month</span>
      </div>
    </Card>
  );
}

function TimepointCard({
  label,
  count,
  percentage,
  color,
}: {
  label: string;
  count: number;
  percentage: number;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-600',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-3">{count}</p>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-1">{percentage}% of total</p>
    </div>
  );
}

function CompletionMetrics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Average Completion Time</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">42 min</p>
          <p className="text-xs text-gray-600 mt-2">
            SOC: 48 min • Recert: 38 min • ROC: 45 min
          </p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">First-Time Validation Pass Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">86%</p>
          <p className="text-xs text-green-600 mt-2">+4% from last month</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Auto-save Usage</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">98%</p>
          <p className="text-xs text-gray-600 mt-2">Avg 12 auto-saves per assessment</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Section Completion Rates</h3>
        <div className="space-y-2">
          {[
            { section: 'Patient Tracking', rate: 100 },
            { section: 'Clinical Record', rate: 98 },
            { section: 'Living Arrangements', rate: 96 },
            { section: 'Integumentary', rate: 94 },
            { section: 'ADLs', rate: 92 },
            { section: 'IADLs', rate: 89 },
          ].map((item) => (
            <div key={item.section} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{item.section}</span>
              <div className="flex items-center gap-3">
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {item.rate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QualityMetrics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">QA Approval Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">92%</p>
          <p className="text-xs text-green-600 mt-2">First-time approval</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Avg Validation Errors</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">1.2</p>
          <p className="text-xs text-gray-600 mt-2">Per assessment</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Data Accuracy Score</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">96%</p>
          <p className="text-xs text-green-600 mt-2">+2% improvement</p>
        </div>
      </div>
    </div>
  );
}

function ClinicianPerformance() {
  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Clinician
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Assessments
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Avg Time
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                QA Pass Rate
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Quality Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              {
                name: 'Sarah Chen, RN',
                count: 42,
                time: '38 min',
                passRate: 95,
                score: 98,
              },
              {
                name: 'Emily Rodriguez, RN',
                count: 38,
                time: '41 min',
                passRate: 94,
                score: 97,
              },
              {
                name: 'Michael Brown, RN',
                count: 35,
                time: '45 min',
                passRate: 91,
                score: 95,
              },
              {
                name: 'Jessica Martinez, RN',
                count: 28,
                time: '43 min',
                passRate: 89,
                score: 93,
              },
            ].map((clinician) => (
              <tr key={clinician.name} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{clinician.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{clinician.count}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{clinician.time}</td>
                <td className="px-4 py-3 text-sm">
                  <Badge
                    className={
                      clinician.passRate >= 95
                        ? 'bg-green-100 text-green-700'
                        : clinician.passRate >= 90
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }
                  >
                    {clinician.passRate}%
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600"
                        style={{ width: `${clinician.score}%` }}
                      />
                    </div>
                    <span className="font-medium text-gray-900">{clinician.score}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TimelinessMetrics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">On-Time Completion</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">91%</p>
          <p className="text-xs text-gray-600 mt-2">Within 48 hours of admission</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Overdue Assessments</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
          <p className="text-xs text-red-600 mt-2">Requires immediate attention</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Avg Days to Signature</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">1.2</p>
          <p className="text-xs text-gray-600 mt-2">From completion to signature</p>
        </div>
      </div>
    </div>
  );
}

function IssueRow({
  mItem,
  description,
  count,
  percentage,
}: {
  mItem: string;
  description: string;
  count: number;
  percentage: number;
}) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3 flex-1">
        <Badge variant="outline" className="font-mono">
          {mItem}
        </Badge>
        <span className="text-sm text-gray-900">{description}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-red-600" style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-sm font-medium text-gray-900 w-12 text-right">{count}</span>
      </div>
    </div>
  );
}
