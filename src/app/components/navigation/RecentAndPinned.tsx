/**
 * Recent and Pinned Items Navigation
 * 
 * Quick access to frequently used items:
 * - Recently opened patients
 * - Recently opened admissions
 * - Pinned patients
 * - Pinned work queues
 * - Pinned reports
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { User, UserPlus, Clock, Pin, X, ChevronRight, FileText, Activity } from 'lucide-react';
import { cn } from '../ui/utils';

interface RecentItem {
  id: string;
  type: 'patient' | 'admission' | 'queue' | 'report';
  title: string;
  subtitle?: string;
  timestamp: Date;
  path: string;
}

interface PinnedItem {
  id: string;
  type: 'patient' | 'admission' | 'queue' | 'report';
  title: string;
  subtitle?: string;
  path: string;
}

interface RecentAndPinnedProps {
  recentItems: RecentItem[];
  pinnedItems: PinnedItem[];
  onNavigate?: (path: string) => void;
  onPin?: (item: RecentItem) => void;
  onUnpin?: (itemId: string) => void;
  maxRecent?: number;
  maxPinned?: number;
}

export default function RecentAndPinned({
  recentItems,
  pinnedItems,
  onNavigate,
  onPin,
  onUnpin,
  maxRecent = 5,
  maxPinned = 8,
}: RecentAndPinnedProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedRecent = showAll ? recentItems : recentItems.slice(0, maxRecent);
  const displayedPinned = pinnedItems.slice(0, maxPinned);

  return (
    <div className="space-y-6">
      {/* Pinned Items */}
      {displayedPinned.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Pinned</h3>
            <Badge variant="outline" className="text-xs">
              {pinnedItems.length}
            </Badge>
          </div>
          <div className="space-y-1">
            {displayedPinned.map((item) => (
              <PinnedItemCard
                key={item.id}
                item={item}
                onNavigate={onNavigate}
                onUnpin={onUnpin}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Items */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Recent</h3>
          <Badge variant="outline" className="text-xs">
            {recentItems.length}
          </Badge>
        </div>
        <div className="space-y-1">
          {displayedRecent.map((item) => (
            <RecentItemCard
              key={item.id}
              item={item}
              onNavigate={onNavigate}
              onPin={onPin}
              isPinned={pinnedItems.some((p) => p.id === item.id)}
            />
          ))}
        </div>
        {recentItems.length > maxRecent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-2"
          >
            {showAll ? 'Show Less' : `Show ${recentItems.length - maxRecent} More`}
          </Button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PINNED ITEM CARD
// ═══════════════════════════════════════════════════════════════════════════

function PinnedItemCard({
  item,
  onNavigate,
  onUnpin,
}: {
  item: PinnedItem;
  onNavigate?: (path: string) => void;
  onUnpin?: (itemId: string) => void;
}) {
  const Icon = getItemIcon(item.type);

  return (
    <div className="group flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <Pin className="w-4 h-4 text-blue-600 flex-shrink-0" />
      <button
        onClick={() => onNavigate?.(item.path)}
        className="flex-1 flex items-center gap-3 min-w-0"
      >
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-sm font-medium text-gray-900 truncate">{item.title}</div>
          {item.subtitle && (
            <div className="text-xs text-gray-600 truncate">{item.subtitle}</div>
          )}
        </div>
      </button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onUnpin?.(item.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RECENT ITEM CARD
// ═══════════════════════════════════════════════════════════════════════════

function RecentItemCard({
  item,
  onNavigate,
  onPin,
  isPinned,
}: {
  item: RecentItem;
  onNavigate?: (path: string) => void;
  onPin?: (item: RecentItem) => void;
  isPinned: boolean;
}) {
  const Icon = getItemIcon(item.type);
  const timeAgo = formatTimeAgo(item.timestamp);

  return (
    <div className="group flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <button
        onClick={() => onNavigate?.(item.path)}
        className="flex-1 flex items-center gap-3 min-w-0"
      >
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{item.title}</div>
          {item.subtitle && (
            <div className="text-xs text-gray-600 truncate">{item.subtitle}</div>
          )}
        </div>
        <div className="text-xs text-gray-500 flex-shrink-0">{timeAgo}</div>
      </button>
      {!isPinned && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPin?.(item)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          title="Pin this item"
        >
          <Pin className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getItemIcon(type: string) {
  const icons = {
    patient: User,
    admission: UserPlus,
    queue: Activity,
    report: FileText,
  };
  return icons[type as keyof typeof icons] || FileText;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

// ═══════════════════════════════════════════════════════════════════════════
// DEMO COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function RecentAndPinnedDemo() {
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([
    {
      id: 'p1',
      type: 'patient',
      title: 'Sarah Johnson',
      subtitle: 'MRN: 123456',
      path: '/patient/1',
    },
    {
      id: 'q1',
      type: 'queue',
      title: 'QA Review Queue',
      subtitle: '15 pending',
      path: '/qa-workspace',
    },
  ]);

  const recentItems: RecentItem[] = [
    {
      id: 'r1',
      type: 'patient',
      title: 'Michael Brown',
      subtitle: 'MRN: 789012',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      path: '/patient/2',
    },
    {
      id: 'r2',
      type: 'admission',
      title: 'Admission 03/01/2024',
      subtitle: 'Emily Davis',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      path: '/admissions/3',
    },
    {
      id: 'r3',
      type: 'patient',
      title: 'Robert Wilson',
      subtitle: 'MRN: 345678',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      path: '/patient/4',
    },
    {
      id: 'r4',
      type: 'report',
      title: 'Billing Summary Report',
      subtitle: 'March 2024',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      path: '/billing',
    },
    {
      id: 'r5',
      type: 'queue',
      title: 'Documentation Tracker',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      path: '/documentation-tracker',
    },
    {
      id: 'r6',
      type: 'patient',
      title: 'Linda Martinez',
      subtitle: 'MRN: 901234',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      path: '/patient/5',
    },
  ];

  const handlePin = (item: RecentItem) => {
    const pinnedItem: PinnedItem = {
      id: item.id,
      type: item.type,
      title: item.title,
      subtitle: item.subtitle,
      path: item.path,
    };
    setPinnedItems([...pinnedItems, pinnedItem]);
  };

  const handleUnpin = (itemId: string) => {
    setPinnedItems(pinnedItems.filter((item) => item.id !== itemId));
  };

  return (
    <div className="p-8 max-w-md bg-white rounded-lg border">
      <h2 className="text-xl font-bold mb-6">Recent & Pinned Items</h2>
      <RecentAndPinned
        recentItems={recentItems}
        pinnedItems={pinnedItems}
        onNavigate={(path) => console.log('Navigate to:', path)}
        onPin={handlePin}
        onUnpin={handleUnpin}
        maxRecent={5}
        maxPinned={8}
      />
    </div>
  );
}