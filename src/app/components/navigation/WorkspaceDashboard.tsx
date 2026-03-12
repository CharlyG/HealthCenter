/**
 * Workspace Dashboard
 * 
 * Role-based workspace acting as the daily launch point.
 * Provides critical issues, operational queues, today's work, and quick actions.
 */

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Activity,
  ArrowRight,
  User,
  MapPin,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface WorkspaceDashboardProps {
  userRole: string;
  userName: string;
}

export default function WorkspaceDashboard({ userRole, userName }: WorkspaceDashboardProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {userName.split(' ')[0]}
        </h1>
        <p className="text-gray-600">Here's what needs your attention today</p>
      </div>

      {/* Critical Issues */}
      <Card className="p-6 border-l-4 border-l-red-500">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Critical Issues
            </h2>
            <p className="text-sm text-gray-600">Requires immediate attention</p>
          </div>
          <Badge variant="destructive">3</Badge>
        </div>

        <div className="space-y-3">
          <CriticalIssueItem
            title="Missing physician orders"
            patient="Sarah Johnson"
            description="Admission started 3 days ago, no orders on file"
            severity="high"
          />
          <CriticalIssueItem
            title="Overdue QA review"
            patient="Michael Brown"
            description="Visit documentation pending review for 48 hours"
            severity="medium"
          />
          <CriticalIssueItem
            title="Authorization expiring"
            patient="Emily Davis"
            description="Medicare authorization expires in 2 days"
            severity="high"
          />
        </div>

        <Button variant="outline" size="sm" className="w-full mt-4">
          View All Critical Issues
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>

      {/* Today's Work */}
      <div className="grid grid-cols-3 gap-6">
        {/* Operational Queues */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Operational Queues
          </h2>

          <div className="space-y-3">
            <QueueItem label="Pending Admissions" count={5} color="blue" />
            <QueueItem label="Overdue Documentation" count={7} color="orange" />
            <QueueItem label="QA Review Queue" count={15} color="purple" />
            <QueueItem label="Pending Claims" count={6} color="green" />
            <QueueItem label="Expiring Credentials" count={3} color="red" />
          </div>
        </Card>

        {/* Today's Schedule */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Today's Schedule
          </h2>

          <div className="space-y-3">
            <ScheduleItem
              time="9:00 AM"
              type="SN Visit"
              patient="Sarah Johnson"
              caregiver="Jane Smith, RN"
            />
            <ScheduleItem
              time="11:30 AM"
              type="PT Eval"
              patient="Michael Brown"
              caregiver="Tom Wilson, PT"
            />
            <ScheduleItem
              time="2:00 PM"
              type="SOC Visit"
              patient="Emily Davis"
              caregiver="Lisa Garcia, RN"
            />
          </div>

          <Button variant="outline" size="sm" className="w-full mt-4">
            View Full Schedule
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Quick Stats
          </h2>

          <div className="space-y-4">
            <StatItem label="Active Patients" value="247" trend="+3" />
            <StatItem label="Pending Admissions" value="12" trend="+2" />
            <StatItem label="Today's Visits" value="34" trend="0" />
            <StatItem label="Overdue Tasks" value="7" trend="-1" trendPositive={false} />
          </div>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Recent Patients
          </h2>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <RecentPatientCard
            name="Sarah Johnson"
            mrn="123456"
            status="Active"
            lastVisit="03/15/2024"
          />
          <RecentPatientCard
            name="Michael Brown"
            mrn="789012"
            status="Active"
            lastVisit="03/14/2024"
          />
          <RecentPatientCard
            name="Emily Davis"
            mrn="345678"
            status="Pending"
            lastVisit="03/10/2024"
          />
          <RecentPatientCard
            name="Robert Wilson"
            mrn="901234"
            status="Active"
            lastVisit="03/12/2024"
          />
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>

        <div className="grid grid-cols-4 gap-3">
          <QuickActionButton icon={User} label="New Patient" />
          <QuickActionButton icon={Activity} label="New Admission" />
          <QuickActionButton icon={Calendar} label="Schedule Visit" />
          <QuickActionButton icon={FileText} label="Start Documentation" />
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CRITICAL ISSUE ITEM
// ═══════════════════════════════════════════════════════════════════════════

function CriticalIssueItem({
  title,
  patient,
  description,
  severity,
}: {
  title: string;
  patient: string;
  description: string;
  severity: 'high' | 'medium';
}) {
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-700 mt-1">Patient: {patient}</div>
          <div className="text-sm text-gray-600 mt-1">{description}</div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-xs flex-shrink-0',
            severity === 'high'
              ? 'bg-red-100 text-red-700 border-red-300'
              : 'bg-orange-100 text-orange-700 border-orange-300'
          )}
        >
          {severity}
        </Badge>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE ITEM
// ═══════════════════════════════════════════════════════════════════════════

function QueueItem({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <Badge
        variant="outline"
        className={cn(
          'text-xs',
          color === 'blue' && 'bg-blue-100 text-blue-700 border-blue-300',
          color === 'orange' && 'bg-orange-100 text-orange-700 border-orange-300',
          color === 'purple' && 'bg-purple-100 text-purple-700 border-purple-300',
          color === 'green' && 'bg-green-100 text-green-700 border-green-300',
          color === 'red' && 'bg-red-100 text-red-700 border-red-300'
        )}
      >
        {count}
      </Badge>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHEDULE ITEM
// ═══════════════════════════════════════════════════════════════════════════

function ScheduleItem({
  time,
  type,
  patient,
  caregiver,
}: {
  time: string;
  type: string;
  patient: string;
  caregiver: string;
}) {
  return (
    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-purple-600" />
        <span className="font-medium text-purple-900">{time}</span>
        <Badge variant="outline" className="text-xs">
          {type}
        </Badge>
      </div>
      <div className="text-sm text-gray-900">{patient}</div>
      <div className="text-xs text-gray-600 mt-1">{caregiver}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT ITEM
// ═══════════════════════════════════════════════════════════════════════════

function StatItem({
  label,
  value,
  trend,
  trendPositive = true,
}: {
  label: string;
  value: string;
  trend: string;
  trendPositive?: boolean;
}) {
  return (
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span
          className={cn(
            'text-sm font-medium',
            trendPositive ? 'text-green-600' : 'text-red-600'
          )}
        >
          {trend}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RECENT PATIENT CARD
// ═══════════════════════════════════════════════════════════════════════════

function RecentPatientCard({
  name,
  mrn,
  status,
  lastVisit,
}: {
  name: string;
  mrn: string;
  status: string;
  lastVisit: string;
}) {
  return (
    <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            status === 'Active'
              ? 'bg-green-100 text-green-700 border-green-300'
              : 'bg-amber-100 text-amber-700 border-amber-300'
          )}
        >
          {status}
        </Badge>
      </div>
      <div className="font-medium text-gray-900 text-sm">{name}</div>
      <div className="text-xs text-gray-600 mt-1">MRN: {mrn}</div>
      <div className="text-xs text-gray-500 mt-1">Last visit: {lastVisit}</div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK ACTION BUTTON
// ═══════════════════════════════════════════════════════════════════════════

function QuickActionButton({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <Button variant="outline" className="h-20 flex flex-col gap-2">
      <Icon className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </Button>
  );
}