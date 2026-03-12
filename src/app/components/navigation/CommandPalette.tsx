/**
 * Command Palette / Global Search
 * 
 * Keyboard-optimized global search and command palette for fast navigation.
 * Searches across patients, admissions, visits, documents, and provides quick actions.
 */

import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Search,
  User,
  UserPlus,
  Calendar,
  FileText,
  ClipboardCheck,
  Pill,
  FileSignature,
  CreditCard,
  Heart,
  Command,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface SearchResult {
  id: string;
  type: 'patient' | 'admission' | 'visit' | 'document' | 'order' | 'assessment' | 'claim' | 'caregiver';
  title: string;
  subtitle?: string;
  metadata?: string[];
  icon: any;
  path: string;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: any;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Mock data - in production, this would come from API
  const recentSearches: SearchResult[] = [
    {
      id: '1',
      type: 'patient',
      title: 'Sarah Johnson',
      subtitle: 'MRN: 123456',
      metadata: ['DOB: 01/15/1965', 'Active'],
      icon: User,
      path: '/patient/1',
    },
    {
      id: '2',
      type: 'admission',
      title: 'Admission - 03/01/2024',
      subtitle: 'Sarah Johnson',
      metadata: ['Medicare', 'Active'],
      icon: UserPlus,
      path: '/admissions/2',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'create-patient',
      label: 'Create Patient',
      description: 'Start new patient registration',
      icon: UserPlus,
      shortcut: 'P',
      action: () => console.log('Create patient'),
    },
    {
      id: 'create-admission',
      label: 'Create Admission',
      description: 'Begin admission process',
      icon: UserPlus,
      shortcut: 'A',
      action: () => console.log('Create admission'),
    },
    {
      id: 'schedule-visit',
      label: 'Schedule Visit',
      description: 'Create new visit appointment',
      icon: Calendar,
      shortcut: 'V',
      action: () => console.log('Schedule visit'),
    },
    {
      id: 'start-documentation',
      label: 'Start Documentation',
      description: 'Begin clinical note',
      icon: FileText,
      shortcut: 'D',
      action: () => console.log('Start documentation'),
    },
    {
      id: 'qa-queue',
      label: 'Open QA Queue',
      description: 'Review pending documents',
      icon: ClipboardCheck,
      shortcut: 'Q',
      action: () => console.log('Open QA queue'),
    },
    {
      id: 'billing-queue',
      label: 'Open Billing Queue',
      description: 'Review pending claims',
      icon: CreditCard,
      shortcut: 'B',
      action: () => console.log('Open billing queue'),
    },
    {
      id: 'integrations',
      label: 'Integration Settings',
      description: 'Manage external integrations',
      icon: Heart,
      action: () => console.log('Open integrations'),
    },
  ];

  // Mock search results
  const searchResults: SearchResult[] = query.length > 0
    ? [
        {
          id: '101',
          type: 'patient',
          title: 'Michael Brown',
          subtitle: 'MRN: 789012',
          metadata: ['DOB: 05/20/1978', 'Active'],
          icon: User,
          path: '/patient/101',
        },
        {
          id: '102',
          type: 'visit',
          title: 'SN Visit - 03/15/2024',
          subtitle: 'Michael Brown',
          metadata: ['Completed', 'Awaiting QA'],
          icon: Calendar,
          path: '/poc/visit/102',
        },
        {
          id: '103',
          type: 'document',
          title: 'OASIS-E Assessment',
          subtitle: 'Sarah Johnson',
          metadata: ['Draft', '03/10/2024'],
          icon: ClipboardCheck,
          path: '/assessment-workspace',
        },
      ]
    : [];

  const displayItems = query.length > 0
    ? [...searchResults, ...quickActions.map(a => ({ ...a, type: 'action' as const }))]
    : [...recentSearches, ...quickActions.map(a => ({ ...a, type: 'action' as const }))];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % displayItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + displayItems.length) % displayItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = displayItems[selectedIndex];
        if ('action' in item) {
          item.action();
          onClose();
        } else if ('path' in item) {
          onNavigate?.(item.path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, displayItems, onClose, onNavigate]);

  if (!isOpen) return null;

  const iconConfig = {
    patient: { icon: User, color: 'blue' },
    admission: { icon: UserPlus, color: 'green' },
    visit: { icon: Calendar, color: 'purple' },
    document: { icon: FileText, color: 'orange' },
    order: { icon: FileSignature, color: 'red' },
    assessment: { icon: ClipboardCheck, color: 'teal' },
    claim: { icon: CreditCard, color: 'amber' },
    caregiver: { icon: Heart, color: 'pink' },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients, admissions, visits, documents... or type a command"
              className="pl-10 pr-4 text-base"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {query.length === 0 && (
            <div className="px-4 py-2 bg-gray-50 border-b">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                Recent
              </div>
            </div>
          )}

          {displayItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No results found</p>
            </div>
          ) : (
            <div className="py-2">
              {displayItems.map((item, index) => {
                if ('action' in item) {
                  // Quick Action
                  return (
                    <QuickActionItem
                      key={item.id}
                      action={item as QuickAction}
                      selected={index === selectedIndex}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                    />
                  );
                } else {
                  // Search Result
                  const result = item as SearchResult;
                  const config = iconConfig[result.type];
                  const Icon = config.icon;

                  return (
                    <button
                      key={result.id}
                      onClick={() => {
                        onNavigate?.(result.path);
                        onClose();
                      }}
                      className={cn(
                        'w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors',
                        index === selectedIndex && 'bg-blue-50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                          `bg-${config.color}-100`
                        )}
                      >
                        <Icon className={cn('w-5 h-5', `text-${config.color}-600`)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-sm text-gray-600 truncate">{result.subtitle}</div>
                        )}
                        {result.metadata && (
                          <div className="flex items-center gap-2 mt-1">
                            {result.metadata.map((meta, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {meta}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  );
                }
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border">Enter</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════���══════════════════════════════════════════════════
// QUICK ACTION ITEM
// ═══════════════════════════════════════════════════════════════════════════

function QuickActionItem({
  action,
  selected,
  onClick,
}: {
  action: QuickAction;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = action.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors',
        selected && 'bg-blue-50'
      )}
    >
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{action.label}</div>
        <div className="text-sm text-gray-600">{action.description}</div>
      </div>
      {action.shortcut && (
        <kbd className="px-2 py-1 text-xs bg-gray-100 rounded border">
          {action.shortcut}
        </kbd>
      )}
    </button>
  );
}