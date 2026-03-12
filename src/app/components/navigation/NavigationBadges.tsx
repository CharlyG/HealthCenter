/**
 * Navigation Badges and Alert Indicators
 * 
 * Displays meaningful, actionable counts on navigation items.
 * Examples: Pending QA items, EVV errors, Unsigned orders, Admissions not ready, Credential issues
 */

import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { AlertTriangle, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export type BadgeType =
  | 'count' // Simple count (blue)
  | 'warning' // Warning state (amber)
  | 'error' // Error state (red)
  | 'success' // Success state (green)
  | 'info'; // Info state (blue)

interface NavigationBadgeProps {
  count: number;
  type?: BadgeType;
  max?: number; // Display "99+" if count exceeds max
  pulse?: boolean; // Animate badge for urgent items
  className?: string;
}

export function NavigationBadge({
  count,
  type = 'count',
  max = 99,
  pulse = false,
  className,
}: NavigationBadgeProps) {
  if (count === 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  const typeStyles = {
    count: 'bg-blue-100 text-blue-700 border-blue-300',
    warning: 'bg-amber-100 text-amber-700 border-amber-300',
    error: 'bg-red-100 text-red-700 border-red-300',
    success: 'bg-green-100 text-green-700 border-green-300',
    info: 'bg-blue-100 text-blue-700 border-blue-300',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium',
        typeStyles[type],
        pulse && 'animate-pulse',
        className
      )}
    >
      {displayCount}
    </Badge>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BADGE WITH ICON (for specific alert types)
// ═══════════════════════════════════════════════════════════════════════════

interface IconBadgeProps {
  count: number;
  type: BadgeType;
  label?: string;
  pulse?: boolean;
}

export function IconBadge({ count, type, label, pulse = false }: IconBadgeProps) {
  if (count === 0) return null;

  const config = {
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-300',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
    },
    success: {
      icon: CheckCircle,
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
    },
    info: {
      icon: Clock,
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-300',
    },
    count: {
      icon: Clock,
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-300',
    },
  };

  const { icon: Icon, bg, text, border } = config[type];

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium flex items-center gap-1',
        bg,
        text,
        border,
        pulse && 'animate-pulse'
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{count}</span>
      {label && <span className="ml-0.5">{label}</span>}
    </Badge>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PREDEFINED BADGE PATTERNS FOR COMMON USE CASES
// ═══════════════════════════════════════════════════════════════════════════

export function PendingQABadge({ count }: { count: number }) {
  return <NavigationBadge count={count} type="warning" pulse={count > 20} />;
}

export function EVVErrorsBadge({ count }: { count: number }) {
  return <NavigationBadge count={count} type="error" pulse={count > 5} />;
}

export function UnsignedOrdersBadge({ count }: { count: number }) {
  return <NavigationBadge count={count} type="error" pulse={count > 10} />;
}

export function AdmissionsNotReadyBadge({ count }: { count: number }) {
  return <NavigationBadge count={count} type="warning" pulse={count > 3} />;
}

export function CredentialIssuesBadge({ count }: { count: number }) {
  return <NavigationBadge count={count} type="error" pulse />;
}

export function OverdueDocumentationBadge({ count }: { count: number }) {
  return <NavigationBadge count={count} type="error" pulse={count > 10} />;
}

export function PendingApprovalsBadge({ count }: { count: number }) {
  return <NavigationBadge count={count} type="info" />;
}

export function ClaimsReadyBadge({ count }: { count: number }) {
  return <NavigationBadge count={count} type="success" />;
}

// ═══════════════════════════════════════════════════════════════════════════
// BADGE RULES AND THRESHOLDS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Badge Rules:
 * 
 * 1. Use badges ONLY for actionable work that requires user attention
 * 2. Do NOT badge informational counts that don't require action
 * 3. Use pulse animation for urgent items (>threshold or critical)
 * 4. Color coding:
 *    - RED (error): Requires immediate action (EVV errors, unsigned orders, credential issues)
 *    - AMBER (warning): Requires attention soon (pending QA, admissions not ready)
 *    - BLUE (info): Informational but actionable (pending approvals)
 *    - GREEN (success): Ready for next step (claims ready to submit)
 * 5. Keep max at 99 to prevent overwhelming counts
 * 6. Never show 0 counts - badges should disappear when empty
 */

export interface BadgeThresholds {
  pendingQA: number;
  evvErrors: number;
  unsignedOrders: number;
  admissionsNotReady: number;
  credentialIssues: number;
  overdueDocumentation: number;
}

export const defaultBadgeThresholds: BadgeThresholds = {
  pendingQA: 20, // Pulse if >20 items
  evvErrors: 5, // Pulse if >5 errors
  unsignedOrders: 10, // Pulse if >10 orders
  admissionsNotReady: 3, // Pulse if >3 admissions
  credentialIssues: 0, // Always pulse (critical)
  overdueDocumentation: 10, // Pulse if >10 items
};

// ═════════════════════════════════════════════════���═════════════════════════
// DEMO COMPONENT SHOWING ALL BADGE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export function NavigationBadgesDemo() {
  return (
    <div className="p-8 space-y-8 bg-white">
      <div>
        <h2 className="text-xl font-bold mb-4">Navigation Badge Examples</h2>
        <p className="text-sm text-gray-600 mb-6">
          Badges communicate actionable work and use color coding for urgency
        </p>
      </div>

      <div className="space-y-6">
        <BadgeSection title="Standard Counts (Blue - Informational)">
          <BadgeExample label="Low count" badge={<NavigationBadge count={3} />} />
          <BadgeExample label="Medium count" badge={<NavigationBadge count={15} />} />
          <BadgeExample label="High count" badge={<NavigationBadge count={42} />} />
          <BadgeExample label="Over max" badge={<NavigationBadge count={150} max={99} />} />
        </BadgeSection>

        <BadgeSection title="Warning State (Amber - Needs Attention)">
          <BadgeExample
            label="Pending QA (normal)"
            badge={<PendingQABadge count={12} />}
          />
          <BadgeExample
            label="Pending QA (urgent, pulsing)"
            badge={<PendingQABadge count={25} />}
          />
          <BadgeExample
            label="Admissions not ready"
            badge={<AdmissionsNotReadyBadge count={2} />}
          />
        </BadgeSection>

        <BadgeSection title="Error State (Red - Immediate Action)">
          <BadgeExample label="EVV Errors" badge={<EVVErrorsBadge count={8} />} />
          <BadgeExample label="Unsigned Orders" badge={<UnsignedOrdersBadge count={6} />} />
          <BadgeExample
            label="Credential Issues (always pulsing)"
            badge={<CredentialIssuesBadge count={2} />}
          />
          <BadgeExample
            label="Overdue Documentation"
            badge={<OverdueDocumentationBadge count={15} />}
          />
        </BadgeSection>

        <BadgeSection title="Success State (Green - Ready)">
          <BadgeExample label="Claims Ready" badge={<ClaimsReadyBadge count={8} />} />
        </BadgeSection>

        <BadgeSection title="Icon Badges">
          <BadgeExample
            label="Warning with icon"
            badge={<IconBadge count={5} type="warning" label="alerts" />}
          />
          <BadgeExample
            label="Error with icon"
            badge={<IconBadge count={3} type="error" label="errors" />}
          />
          <BadgeExample
            label="Success with icon"
            badge={<IconBadge count={12} type="success" label="ready" />}
          />
        </BadgeSection>
      </div>
    </div>
  );
}

function BadgeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function BadgeExample({ label, badge }: { label: string; badge: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-700">{label}</span>
      {badge}
    </div>
  );
}