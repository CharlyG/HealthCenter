/**
 * Notification System Demo Page
 * 
 * Demonstrates centralized notification center for healthcare operations.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  NotificationCenter,
  NotificationBell,
  NotificationSummary,
  type Notification,
} from '../components/notifications/NotificationSystem';
import {
  Info,
  CheckCircle2,
  Zap,
  Bell,
  AlertTriangle,
  FileText,
  Stethoscope,
  Receipt,
  UserPlus,
  Shield,
  MessageSquare,
  Target,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSystemDemoPage() {
  const navigate = useNavigate();
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Mock notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n1',
      type: 'operational_alert',
      category: 'operational',
      priority: 'critical',
      title: 'Critical: Patient Hospitalized',
      message: 'Patient Johnson, Mary has been admitted to hospital. Immediate care plan review required.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      isRead: false,
      patientName: 'Johnson, Mary',
      admissionId: 'ADM-2024-001',
      actionPath: '/patient/PT-001234/chart',
      actionLabel: 'Review Chart',
    },
    {
      id: 'n2',
      type: 'documentation_overdue',
      category: 'documentation',
      priority: 'high',
      title: 'OASIS Assessment Overdue',
      message: 'Recertification OASIS for Williams, Robert is 2 days overdue. Complete within 24 hours to avoid compliance issues.',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      isRead: false,
      patientName: 'Williams, Robert',
      admissionId: 'ADM-2024-015',
      actionPath: '/clinical/assessments',
      actionLabel: 'Complete Assessment',
    },
    {
      id: 'n3',
      type: 'claim_rejected',
      category: 'billing',
      priority: 'high',
      title: 'Claim Rejected',
      message: 'Medicare claim CLM-2024-0453 rejected due to missing documentation. Review and resubmit.',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      isRead: false,
      patientName: 'Davis, Susan',
      admissionId: 'ADM-2024-008',
      actionPath: '/billing',
      actionLabel: 'Review Rejection',
      metadata: {
        claimNumber: 'CLM-2024-0453',
        amount: '$3,845.00',
      },
    },
    {
      id: 'n4',
      type: 'authorization_expiring',
      category: 'authorization',
      priority: 'high',
      title: 'Authorization Expiring Soon',
      message: 'Blue Cross authorization for Brown, James expires in 3 days. Renew immediately to avoid service interruption.',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      isRead: false,
      patientName: 'Brown, James',
      admissionId: 'ADM-2024-012',
      actionPath: '/authorization-tracker',
      actionLabel: 'Renew Authorization',
    },
    {
      id: 'n5',
      type: 'visit_delayed',
      category: 'visit',
      priority: 'medium',
      title: 'Visit Running Late',
      message: 'PT visit for Taylor, Jessica is running 45 minutes behind schedule. Patient has been notified.',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      isRead: false,
      patientName: 'Taylor, Jessica',
      actionPath: '/scheduling',
      actionLabel: 'View Schedule',
    },
    {
      id: 'n6',
      type: 'referral_new',
      category: 'referral',
      priority: 'medium',
      title: 'New Referral Received',
      message: 'New home health referral from Memorial Hospital for post-surgical care.',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      isRead: false,
      actionPath: '/referral-pipeline',
      actionLabel: 'Review Referral',
      metadata: {
        source: 'Memorial Hospital',
        service: 'Post-Surgical Care',
      },
    },
    {
      id: 'n7',
      type: 'signature_needed',
      category: 'documentation',
      priority: 'medium',
      title: 'Physician Signature Needed',
      message: 'Physician orders for Garcia, Carlos require Dr. Chen signature.',
      timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      isRead: false,
      patientName: 'Garcia, Carlos',
      admissionId: 'ADM-2024-022',
      actionPath: '/clinical/orders',
      actionLabel: 'View Orders',
    },
    {
      id: 'n8',
      type: 'message_received',
      category: 'message',
      priority: 'low',
      title: 'New Team Message',
      message: 'Emily Rodriguez sent a message about patient schedule changes.',
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      isRead: false,
      actionPath: '/careconnect',
      actionLabel: 'View Message',
    },
    {
      id: 'n9',
      type: 'visit_completed',
      category: 'visit',
      priority: 'low',
      title: 'Visit Completed',
      message: 'Sarah Thompson completed RN visit for Johnson, Mary.',
      timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
      isRead: true,
      patientName: 'Johnson, Mary',
      admissionId: 'ADM-2024-001',
      actionPath: '/poc/visit/V-12345',
      actionLabel: 'View Notes',
    },
    {
      id: 'n10',
      type: 'authorization_approved',
      category: 'authorization',
      priority: 'low',
      title: 'Authorization Approved',
      message: 'Medicare authorization approved for 20 visits over 60 days.',
      timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
      isRead: true,
      patientName: 'Anderson, Thomas',
      admissionId: 'ADM-2024-018',
      actionPath: '/authorization-tracker',
      actionLabel: 'View Details',
    },
    {
      id: 'n11',
      type: 'claim_paid',
      category: 'billing',
      priority: 'low',
      title: 'Claim Payment Received',
      message: 'Medicare payment of $3,542.00 received for Miller, Patricia.',
      timestamp: new Date(Date.now() - 1000 * 60 * 540).toISOString(),
      isRead: true,
      patientName: 'Miller, Patricia',
      admissionId: 'ADM-2024-005',
      actionPath: '/billing',
      actionLabel: 'View Payment',
    },
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    toast.success('Marked as read');
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
    setIsNotificationCenterOpen(false);
  };

  const handleAction = (notification: Notification) => {
    if (notification.actionPath) {
      navigate(notification.actionPath);
      handleMarkAsRead(notification.id);
      setIsNotificationCenterOpen(false);
    }
  };

  const handleAddTestNotification = () => {
    const testNotification: Notification = {
      id: `n${Date.now()}`,
      type: 'operational_alert',
      category: 'operational',
      priority: 'critical',
      title: 'Test Alert',
      message: 'This is a test notification to demonstrate real-time updates.',
      timestamp: new Date().toISOString(),
      isRead: false,
      actionPath: '/',
      actionLabel: 'View Dashboard',
    };
    setNotifications((prev) => [testNotification, ...prev]);
    toast.error('Critical Alert', {
      description: 'This is a test notification',
    });
  };

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="size-8 text-blue-600" />
              Notification System
            </h1>
            <p className="text-gray-600 mt-2">
              Centralized notification center with quick actions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleAddTestNotification} variant="outline">
              <Zap className="size-4 mr-2" />
              Add Test Notification
            </Button>
            <NotificationBell
              notifications={notifications}
              onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
            />
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Notification System</p>
                <p className="mt-1 text-blue-800">
                  The notification center displays <strong>operational alerts</strong>,{' '}
                  <strong>documentation reminders</strong>, <strong>visit updates</strong>,{' '}
                  <strong>billing issues</strong>, and <strong>referral updates</strong>. Each
                  notification includes quick action links to resolve issues immediately.
                  Notifications are prioritized (critical/high/medium/low) and support filtering
                  by category.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Types (20+)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <NotificationTypeCard
                icon={AlertTriangle}
                title="Operational"
                items={['Critical Alerts', 'Warnings', 'System Status']}
                color="red"
              />
              <NotificationTypeCard
                icon={FileText}
                title="Documentation"
                items={['Reminders', 'Overdue', 'Signatures']}
                color="blue"
              />
              <NotificationTypeCard
                icon={Stethoscope}
                title="Visits"
                items={['Scheduled', 'Cancelled', 'Delayed', 'Completed']}
                color="green"
              />
              <NotificationTypeCard
                icon={Receipt}
                title="Billing"
                items={['Issues', 'Rejections', 'Payments']}
                color="orange"
              />
              <NotificationTypeCard
                icon={UserPlus}
                title="Referrals"
                items={['New', 'Accepted', 'Declined']}
                color="purple"
              />
              <NotificationTypeCard
                icon={Shield}
                title="Authorization"
                items={['Expiring', 'Approved', 'Denied']}
                color="indigo"
              />
              <NotificationTypeCard
                icon={MessageSquare}
                title="Messages"
                items={['Team Messages', 'Assignments']}
                color="amber"
              />
            </div>
          </CardContent>
        </Card>

        {/* Priority Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <PriorityCard
                level="Critical"
                description="Requires immediate action"
                color="red"
                examples={['Patient hospitalized', 'System outage']}
              />
              <PriorityCard
                level="High"
                description="Action needed today"
                color="amber"
                examples={['Documentation overdue', 'Auth expiring soon']}
              />
              <PriorityCard
                level="Medium"
                description="Action needed this week"
                color="blue"
                examples={['Visit delayed', 'New referral']}
              />
              <PriorityCard
                level="Low"
                description="Informational"
                color="gray"
                examples={['Visit completed', 'Claim paid']}
              />
            </div>
          </CardContent>
        </Card>

        {/* Live Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Card */}
          <NotificationSummary
            notifications={notifications}
            onViewAll={() => setIsNotificationCenterOpen(true)}
          />

          {/* Key Features */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={Target}
                  title="Priority-Based Sorting"
                  description="Critical notifications appear first, ensuring urgent issues get immediate attention"
                />
                <FeatureCard
                  icon={Zap}
                  title="Quick Action Links"
                  description="One-click access to resolve issues directly from notifications"
                />
                <FeatureCard
                  icon={Bell}
                  title="Real-Time Updates"
                  description="Notifications appear instantly as events occur across the platform"
                />
                <FeatureCard
                  icon={TrendingUp}
                  title="Category Filtering"
                  description="Filter by operational, documentation, visits, billing, referrals, auth"
                />
                <FeatureCard
                  icon={CheckCircle2}
                  title="Read/Unread Management"
                  description="Mark individual or all notifications as read with one click"
                />
                <FeatureCard
                  icon={MessageSquare}
                  title="Context Display"
                  description="Shows patient name and admission ID for clinical notifications"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UseCaseCard
              number={1}
              title="Critical Alert Response"
              scenario="Patient hospitalized notification received"
              flow={[
                'Critical notification appears (red badge, pulse animation)',
                'Click bell icon to open notification center',
                'See "Patient hospitalized" with patient name',
                'Click "Review Chart" quick action',
                'Navigate directly to patient chart',
                'Notification marked as read automatically',
              ]}
              benefit="Immediate awareness and response to critical events"
            />

            <UseCaseCard
              number={2}
              title="Documentation Compliance"
              scenario="OASIS assessment overdue reminder"
              flow={[
                'High-priority notification (amber badge)',
                'Shows "2 days overdue" in description',
                'Patient name and admission ID displayed',
                'Click "Complete Assessment" action',
                'Navigate to clinical assessments module',
                'Complete overdue assessment',
              ]}
              benefit="Proactive compliance management preventing violations"
            />

            <UseCaseCard
              number={3}
              title="Billing Issue Resolution"
              scenario="Claim rejected notification"
              flow={[
                'High-priority notification appears',
                'Shows claim number and rejection reason',
                'Click "Review Rejection" action',
                'Navigate to billing workspace',
                'Review rejection details',
                'Fix and resubmit claim',
              ]}
              benefit="Fast claim resolution improving cash flow"
            />

            <UseCaseCard
              number={4}
              title="Authorization Management"
              scenario="Authorization expiring in 3 days"
              flow={[
                'High-priority notification',
                'Shows expiration date and patient',
                'Click "Renew Authorization" action',
                'Navigate to authorization tracker',
                'Submit renewal request',
                'Prevent service interruption',
              ]}
              benefit="Proactive authorization management avoiding denials"
            />
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">20+</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Notification Types</p>
              <p className="text-xs text-gray-500 mt-1">Across 7 categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-red-600">4</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Priority Levels</p>
              <p className="text-xs text-gray-500 mt-1">Critical to Low</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">1</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Click to Action</p>
              <p className="text-xs text-gray-500 mt-1">Direct navigation</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">
                {notifications.filter((n) => !n.isRead).length}
              </p>
              <p className="text-sm text-gray-700 font-medium mt-1">Unread Now</p>
              <p className="text-xs text-gray-500 mt-1">In demo</p>
            </CardContent>
          </Card>
        </div>

        {/* Implementation */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Ready to Use</p>
                <p className="mt-1 text-green-800">
                  Import <code className="bg-green-200 px-1 py-0.5 rounded">NotificationBell</code>{' '}
                  and <code className="bg-green-200 px-1 py-0.5 rounded">NotificationCenter</code>{' '}
                  from <code className="bg-green-200 px-1 py-0.5 rounded">@/components/notifications</code>.
                  The system supports 20+ notification types, priority-based sorting, filtering, and
                  quick actions. Fully typed with TypeScript.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        notifications={notifications}
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
        onAction={handleAction}
      />
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

interface NotificationTypeCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  color: 'red' | 'blue' | 'green' | 'orange' | 'purple' | 'indigo' | 'amber';
}

function NotificationTypeCard({ icon: Icon, title, items, color }: NotificationTypeCardProps) {
  const colorClasses = {
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    amber: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className={`size-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="size-5" />
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-2">{title}</h3>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-xs text-gray-600">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PriorityCardProps {
  level: string;
  description: string;
  color: 'red' | 'amber' | 'blue' | 'gray';
  examples: string[];
}

function PriorityCard({ level, description, color, examples }: PriorityCardProps) {
  const colorClasses = {
    red: 'border-l-red-600 bg-red-50',
    amber: 'border-l-amber-600 bg-amber-50',
    blue: 'border-l-blue-600 bg-blue-50',
    gray: 'border-l-gray-600 bg-gray-50',
  };

  return (
    <div className={`p-4 border-l-4 rounded-lg ${colorClasses[color]}`}>
      <h3 className="font-bold text-gray-900 mb-1">{level}</h3>
      <p className="text-xs text-gray-600 mb-3">{description}</p>
      <div className="space-y-1">
        {examples.map((example, index) => (
          <p key={index} className="text-xs text-gray-700">
            • {example}
          </p>
        ))}
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="size-5 text-blue-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

interface UseCaseCardProps {
  number: number;
  title: string;
  scenario: string;
  flow: string[];
  benefit: string;
}

function UseCaseCard({ number, title, scenario, flow, benefit }: UseCaseCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start gap-3 mb-3">
        <div className="size-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
          {number}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{scenario}</p>
        </div>
      </div>
      <div className="ml-11">
        <p className="text-xs font-semibold text-gray-700 mb-2">Flow:</p>
        <ol className="space-y-1 mb-3">
          {flow.map((step, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-blue-600 font-semibold">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="bg-green-50 border border-green-200 rounded p-2">
          <p className="text-sm text-green-800">
            <CheckCircle2 className="size-4 inline mr-1" />
            <strong>Benefit:</strong> {benefit}
          </p>
        </div>
      </div>
    </div>
  );
}