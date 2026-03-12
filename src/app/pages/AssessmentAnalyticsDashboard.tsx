/**
 * ASSESSMENT ANALYTICS DASHBOARD
 * 
 * Comprehensive analytics and reporting for assessment system:
 * - Completion metrics and trends
 * - Clinician performance analytics
 * - Assessment type distribution
 * - Time-to-completion analysis
 * - Quality metrics
 * - Compliance tracking
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  FileText,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';

export default function AssessmentAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessment Analytics</h1>
            <p className="text-gray-600 mt-1">Performance metrics and insights</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={timeRange === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('week')}
              >
                Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('month')}
              >
                Month
              </Button>
              <Button
                variant={timeRange === 'quarter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('quarter')}
              >
                Quarter
              </Button>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Total Assessments</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">1,247</p>
            <p className="text-xs text-gray-500 mt-2">vs. last {timeRange}</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5%
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">94.2%</p>
            <p className="text-xs text-gray-500 mt-2">Industry avg: 87%</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <TrendingDown className="w-3 h-3 mr-1" />
                -8%
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Avg Completion Time</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">22 min</p>
            <p className="text-xs text-gray-500 mt-2">Target: &lt;25 min</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Pending Signature</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">18</p>
            <p className="text-xs text-gray-500 mt-2">Avg wait: 4.2 hrs</p>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-6">
          {/* Assessment Volume Trend */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Assessment Volume Trend</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {[45, 52, 48, 61, 58, 67, 71, 65, 73, 69, 78, 82].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-colors cursor-pointer"
                    style={{ height: `${(height / 82) * 100}%` }}
                    title={`${height} assessments`}
                  />
                  <span className="text-xs text-gray-500 mt-2">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Assessment Type Distribution */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Assessment Type Distribution</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {[
                { type: 'Skilled Nursing', count: 487, percentage: 39, color: 'blue' },
                { type: 'Physical Therapy', count: 312, percentage: 25, color: 'green' },
                { type: 'Occupational Therapy', count: 187, percentage: 15, color: 'purple' },
                { type: 'Speech Therapy', count: 124, percentage: 10, color: 'amber' },
                { type: 'Home Health Aide', count: 87, percentage: 7, color: 'cyan' },
                { type: 'Wound Care', count: 50, percentage: 4, color: 'red' },
              ].map(item => (
                <div key={item.type}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.type}</span>
                    <span className="font-medium text-gray-900">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${item.color}-600`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-3 gap-6">
          {/* Completion Time Analysis */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Avg Completion Time by Type</h3>
            <div className="space-y-3">
              {[
                { type: 'PT Eval', time: 28, target: 30 },
                { type: 'OT Eval', time: 26, target: 30 },
                { type: 'SLP Eval', time: 24, target: 25 },
                { type: 'SN Visit', time: 18, target: 20 },
                { type: 'Wound Care', time: 22, target: 25 },
                { type: 'HHA Visit', time: 12, target: 15 },
              ].map(item => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{item.time} min</span>
                    {item.time <= item.target ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Performers */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Performers
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Dr. Sarah Chen', role: 'PT', count: 94, badge: '🥇' },
                { name: 'Jessica Martinez', role: 'RN', count: 87, badge: '🥈' },
                { name: 'Michael Brown', role: 'OTR', count: 76, badge: '🥉' },
                { name: 'David Lee', role: 'SLP', count: 68, badge: '' },
                { name: 'Emily Rodriguez', role: 'RN', count: 62, badge: '' },
              ].map((clinician, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{clinician.badge || '👤'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{clinician.name}</p>
                      <p className="text-xs text-gray-500">{clinician.role}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{clinician.count} completed</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Quality Metrics */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quality Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">QA Pass Rate</span>
                  <span className="font-medium text-gray-900">96.8%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '96.8%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">Documentation Completeness</span>
                  <span className="font-medium text-gray-900">98.2%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '98.2%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">Signature Compliance</span>
                  <span className="font-medium text-gray-900">94.5%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '94.5%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">Timely Completion (&lt;24h)</span>
                  <span className="font-medium text-gray-900">91.3%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600" style={{ width: '91.3%' }} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Assessment Details by Clinician</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Clinician</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Total</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Completed</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">In Progress</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Avg Time</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">QA Pass Rate</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { name: 'Dr. Sarah Chen, PT', total: 94, completed: 92, inProgress: 2, avgTime: 26, qaRate: 98 },
                  { name: 'Jessica Martinez, RN', total: 87, completed: 85, inProgress: 2, avgTime: 19, qaRate: 97 },
                  { name: 'Michael Brown, OTR', total: 76, completed: 74, inProgress: 2, avgTime: 28, qaRate: 96 },
                  { name: 'David Lee, SLP', total: 68, completed: 66, inProgress: 2, avgTime: 24, qaRate: 99 },
                  { name: 'Emily Rodriguez, RN, CWCN', total: 62, completed: 61, inProgress: 1, avgTime: 22, qaRate: 95 },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{row.name}</td>
                    <td className="py-3 px-4 text-sm text-center text-gray-900 font-medium">{row.total}</td>
                    <td className="py-3 px-4 text-sm text-center text-gray-900">{row.completed}</td>
                    <td className="py-3 px-4 text-sm text-center text-gray-900">{row.inProgress}</td>
                    <td className="py-3 px-4 text-sm text-center text-gray-900">{row.avgTime} min</td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span className={`font-medium ${row.qaRate >= 97 ? 'text-green-700' : 'text-amber-700'}`}>
                        {row.qaRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        On Track
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Insights */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Positive Trend</h4>
                <p className="text-sm text-gray-700">
                  Assessment completion time has decreased by 8% this month through template usage and workflow optimization
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Action Required</h4>
                <p className="text-sm text-gray-700">
                  18 assessments pending signature for more than 4 hours. Consider sending reminders to clinicians.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
