/**
 * Activity Feed System
 * 
 * Chronological activity feed for healthcare operations.
 * 
 * Activity Types:
 * - Visit: Completion, cancellation, reassignment
 * - Documentation: Updates, signatures, reviews
 * - Orders: Signed, renewed, expired
 * - Authorization: Approved, denied, renewed
 * - Billing: Claims submitted, paid, rejected
 * - Messages: Staff communication, notes
 * - System: Status changes, alerts
 * 
 * Features:
 * - Real-time updates
 * - Filtering by type, user, date
 * - Grouping by date
 * - Quick action links
 * - Context-aware (global, patient, admission)
 * - Integration with Quick View
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Stethoscope,
  FileText,
  FileSignature,
  Shield,
  Receipt,
  MessageSquare,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit,
  UserPlus,
  RefreshCw,
  DollarSign,
  Send,
  Bell,
  Activity,
  Filter,
  Search,
  ChevronRight,
  Eye,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ==================== TYPE DEFINITIONS ====================

export type ActivityType =
  | 'visit_completed'
  | 'visit_cancelled'
  | 'visit_reassigned'
  | 'visit_scheduled'
  | 'documentation_created'
  | 'documentation_updated'
  | 'documentation_signed'
  | 'documentation_reviewed'
  | 'order_signed'
  | 'order_renewed'
  | 'order_expired'
  | 'authorization_approved'
  | 'authorization_denied'
  | 'authorization_renewed'
  | 'authorization_expiring'
  | 'claim_submitted'
  | 'claim_paid'
  | 'claim_rejected'
  | 'claim_adjusted'
  | 'message_sent'
  | 'note_added'
  | 'status_changed'
  | 'alert_created'
  | 'staff_assigned'
  | 'admission_created';

export type ActivityCategory = 'visit' | 'documentation' | 'order' | 'authorization' | 'billing' | 'message' | 'system';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  category: ActivityCategory;
  timestamp: string;
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  description: string;
  details?: string;
  patientId?: string;
  patientName?: string;
  admissionId?: string;
  actionPath?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  priority?: 'high' | 'medium' | 'low';
}

export interface ActivityConfig {
  type: ActivityType;
  category: ActivityCategory;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
}

// ==================== ACTIVITY CONFIGURATIONS ====================

export const activityConfigs: Record<ActivityType, ActivityConfig> = {
  // Visit Activities
  visit_completed: {
    type: 'visit_completed',
    category: 'visit',
    icon: CheckCircle2,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Visit Completed',
  },
  visit_cancelled: {
    type: 'visit_cancelled',
    category: 'visit',
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Visit Cancelled',
  },
  visit_reassigned: {
    type: 'visit_reassigned',
    category: 'visit',
    icon: RefreshCw,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Visit Reassigned',
  },
  visit_scheduled: {
    type: 'visit_scheduled',
    category: 'visit',
    icon: Calendar,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Visit Scheduled',
  },

  // Documentation Activities
  documentation_created: {
    type: 'documentation_created',
    category: 'documentation',
    icon: FileText,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Document Created',
  },
  documentation_updated: {
    type: 'documentation_updated',
    category: 'documentation',
    icon: Edit,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    label: 'Document Updated',
  },
  documentation_signed: {
    type: 'documentation_signed',
    category: 'documentation',
    icon: FileSignature,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Document Signed',
  },
  documentation_reviewed: {
    type: 'documentation_reviewed',
    category: 'documentation',
    icon: CheckCircle2,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Document Reviewed',
  },

  // Order Activities
  order_signed: {
    type: 'order_signed',
    category: 'order',
    icon: FileSignature,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Order Signed',
  },
  order_renewed: {
    type: 'order_renewed',
    category: 'order',
    icon: RefreshCw,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Order Renewed',
  },
  order_expired: {
    type: 'order_expired',
    category: 'order',
    icon: AlertTriangle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Order Expired',
  },

  // Authorization Activities
  authorization_approved: {
    type: 'authorization_approved',
    category: 'authorization',
    icon: CheckCircle2,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Authorization Approved',
  },
  authorization_denied: {
    type: 'authorization_denied',
    category: 'authorization',
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Authorization Denied',
  },
  authorization_renewed: {
    type: 'authorization_renewed',
    category: 'authorization',
    icon: RefreshCw,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Authorization Renewed',
  },
  authorization_expiring: {
    type: 'authorization_expiring',
    category: 'authorization',
    icon: AlertTriangle,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    label: 'Authorization Expiring',
  },

  // Billing Activities
  claim_submitted: {
    type: 'claim_submitted',
    category: 'billing',
    icon: Send,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Claim Submitted',
  },
  claim_paid: {
    type: 'claim_paid',
    category: 'billing',
    icon: DollarSign,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Claim Paid',
  },
  claim_rejected: {
    type: 'claim_rejected',
    category: 'billing',
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Claim Rejected',
  },
  claim_adjusted: {
    type: 'claim_adjusted',
    category: 'billing',
    icon: Edit,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    label: 'Claim Adjusted',
  },

  // Message Activities
  message_sent: {
    type: 'message_sent',
    category: 'message',
    icon: MessageSquare,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Message Sent',
  },
  note_added: {
    type: 'note_added',
    category: 'message',
    icon: FileText,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Note Added',
  },

  // System Activities
  status_changed: {
    type: 'status_changed',
    category: 'system',
    icon: TrendingUp,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Status Changed',
  },
  alert_created: {
    type: 'alert_created',
    category: 'system',
    icon: Bell,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Alert Created',
  },
  staff_assigned: {
    type: 'staff_assigned',
    category: 'system',
    icon: UserPlus,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Staff Assigned',
  },
  admission_created: {
    type: 'admission_created',
    category: 'system',
    icon: Activity,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Admission Created',
  },
};

// ==================== ACTIVITY ITEM CARD ====================

interface ActivityItemCardProps {
  item: ActivityItem;
  showPatient?: boolean;
  onQuickView?: (item: ActivityItem) => void;
}

export function ActivityItemCard({ item, showPatient = true, onQuickView }: ActivityItemCardProps) {
  const navigate = useNavigate();
  const config = activityConfigs[item.type];
  const Icon = config.icon;

  const handleAction = () => {
    if (item.actionPath) {
      navigate(item.actionPath);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(item);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(item.timestamp), { addSuffix: true });

  return (
    <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-300 hover:shadow-sm transition-all">
      {/* Icon */}
      <div className={`size-12 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`size-6 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
              {item.priority === 'high' && (
                <Badge className="bg-red-100 text-red-800 text-xs">High Priority</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
            <Clock className="size-3" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-900 font-medium mb-1">{item.description}</p>

        {/* Details */}
        {item.details && (
          <p className="text-xs text-gray-600 mb-2">{item.details}</p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 flex-wrap mb-2">
          {/* User */}
          <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <User className="size-3.5 text-gray-500" />
            <span className="font-medium">{item.user.name}</span>
            <span className="text-gray-500">({item.user.role})</span>
          </div>

          {/* Patient */}
          {showPatient && item.patientName && (
            <div className="flex items-center gap-1.5 text-xs text-gray-700">
              <User className="size-3.5 text-gray-500" />
              <span>{item.patientName}</span>
            </div>
          )}

          {/* Admission */}
          {item.admissionId && (
            <div className="flex items-center gap-1.5 text-xs text-gray-700">
              <Activity className="size-3.5 text-gray-500" />
              <span>{item.admissionId}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {(item.actionPath || onQuickView) && (
          <div className="flex items-center gap-2">
            {onQuickView && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickView}
                className="h-7 text-xs gap-1"
              >
                <Eye className="size-3" />
                Quick View
              </Button>
            )}
            {item.actionPath && (
              <Button
                size="sm"
                onClick={handleAction}
                className="h-7 text-xs gap-1"
              >
                {item.actionLabel || 'View Details'}
                <ChevronRight className="size-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== ACTIVITY FEED FILTERS ====================

interface ActivityFeedFiltersProps {
  onSearchChange: (query: string) => void;
  onCategoryFilter: (category: string) => void;
  onDateFilter: (date: string) => void;
  categories: ActivityCategory[];
}

export function ActivityFeedFilters({
  onSearchChange,
  onCategoryFilter,
  onDateFilter,
  categories,
}: ActivityFeedFiltersProps) {
  const categoryIcons: Record<ActivityCategory, React.ComponentType<{ className?: string }>> = {
    visit: Stethoscope,
    documentation: FileText,
    order: FileSignature,
    authorization: Shield,
    billing: Receipt,
    message: MessageSquare,
    system: Bell,
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          placeholder="Search activities..."
          className="pl-10"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Category Filter */}
        <Select onValueChange={onCategoryFilter} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <Filter className="size-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => {
              const Icon = categoryIcons[category];
              return (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <span className="capitalize">{category}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Date Filter */}
        <Select onValueChange={onDateFilter} defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <Calendar className="size-4 mr-2" />
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ==================== ACTIVITY GROUP ====================

interface ActivityGroupProps {
  date: string;
  items: ActivityItem[];
  showPatient?: boolean;
  onQuickView?: (item: ActivityItem) => void;
}

export function ActivityGroup({ date, items, showPatient, onQuickView }: ActivityGroupProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = new Date(date).toDateString() === new Date().toDateString();
  const isYesterday =
    new Date(date).toDateString() ===
    new Date(Date.now() - 86400000).toDateString();

  let displayDate = formattedDate;
  if (isToday) displayDate = 'Today';
  else if (isYesterday) displayDate = 'Yesterday';

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{displayDate}</h3>
        <div className="flex-1 h-px bg-gray-200" />
        <Badge variant="outline" className="text-xs">
          {items.length} {items.length === 1 ? 'activity' : 'activities'}
        </Badge>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <ActivityItemCard
            key={item.id}
            item={item}
            showPatient={showPatient}
            onQuickView={onQuickView}
          />
        ))}
      </div>
    </div>
  );
}

// ==================== ACTIVITY FEED ====================

interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
  showPatient?: boolean;
  showFilters?: boolean;
  maxHeight?: string;
  onQuickView?: (item: ActivityItem) => void;
}

export function ActivityFeed({
  items,
  title = 'Activity Feed',
  showPatient = true,
  showFilters = true,
  maxHeight = '600px',
  onQuickView,
}: ActivityFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<ActivityCategory>();
    items.forEach((item) => cats.add(item.category));
    return Array.from(cats);
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.patientName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((item) => item.category === categoryFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 86400000);
      const weekAgo = new Date(today.getTime() - 7 * 86400000);
      const monthAgo = new Date(today.getTime() - 30 * 86400000);

      result = result.filter((item) => {
        const itemDate = new Date(item.timestamp);
        switch (dateFilter) {
          case 'today':
            return itemDate >= today;
          case 'yesterday':
            return itemDate >= yesterday && itemDate < today;
          case 'week':
            return itemDate >= weekAgo;
          case 'month':
            return itemDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return result;
  }, [items, searchQuery, categoryFilter, dateFilter]);

  // Group by date
  const groupedItems = useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {};

    filteredItems.forEach((item) => {
      const date = new Date(item.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });

    // Sort groups by date (newest first)
    const sortedGroups = Object.entries(groups).sort(
      ([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime()
    );

    return sortedGroups;
  }, [filteredItems]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5 text-blue-600" />
            {title}
          </CardTitle>
          <Badge variant="outline">{filteredItems.length} items</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="mb-4">
            <ActivityFeedFilters
              onSearchChange={setSearchQuery}
              onCategoryFilter={setCategoryFilter}
              onDateFilter={setDateFilter}
              categories={categories}
            />
          </div>
        )}

        {/* Feed Content */}
        <div
          className="space-y-6 overflow-y-auto pr-2"
          style={{ maxHeight }}
        >
          {groupedItems.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No activities found</p>
            </div>
          ) : (
            groupedItems.map(([date, items]) => (
              <ActivityGroup
                key={date}
                date={date}
                items={items}
                showPatient={showPatient}
                onQuickView={onQuickView}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== COMPACT ACTIVITY FEED ====================

interface CompactActivityFeedProps {
  items: ActivityItem[];
  title?: string;
  maxItems?: number;
  onViewAll?: () => void;
}

export function CompactActivityFeed({
  items,
  title = 'Recent Activity',
  maxItems = 5,
  onViewAll,
}: CompactActivityFeedProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1">
              View All
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayItems.map((item) => {
            const config = activityConfigs[item.type];
            const Icon = config.icon;
            const timeAgo = formatDistanceToNow(new Date(item.timestamp), {
              addSuffix: true,
            });

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`size-8 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`size-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{item.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600">{item.user.name}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{timeAgo}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
