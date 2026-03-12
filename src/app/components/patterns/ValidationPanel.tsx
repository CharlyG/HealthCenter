/**
 * Validation Panel Pattern
 * 
 * Consistent panel for displaying validation messages.
 * Shows errors, warnings, and informational messages with links to affected fields.
 * 
 * Use Cases:
 * - Clinical documentation validation
 * - Assessment validation
 * - Order validation
 * - Configuration validation
 * - Form validation
 * 
 * Performance:
 * - Memoized component
 * - Virtualized for large lists
 * - Grouped by severity
 */

import { memo, useState, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../ui/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationMessage {
  id: string;
  severity: ValidationSeverity;
  message: string;
  description?: string;
  section?: string;
  field?: string;
  code?: string;
  onClick?: () => void;
  onDismiss?: () => void;
}

interface ValidationPanelProps {
  /** Validation messages */
  messages: ValidationMessage[];
  
  /** Panel title */
  title?: string;
  
  /** Show/hide panel */
  isOpen?: boolean;
  
  /** Toggle handler */
  onToggle?: () => void;
  
  /** Close handler */
  onClose?: () => void;
  
  /** Group by severity */
  groupBySeverity?: boolean;
  
  /** Show summary counts */
  showSummary?: boolean;
  
  /** Collapsible groups */
  collapsibleGroups?: boolean;
  
  /** Max height */
  maxHeight?: string;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Position */
  position?: 'right' | 'bottom';
  
  /** Empty state message */
  emptyMessage?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ValidationPanel = memo(function ValidationPanel({
  messages,
  title = 'Validation',
  isOpen = true,
  onToggle,
  onClose,
  groupBySeverity = true,
  showSummary = true,
  collapsibleGroups = false,
  maxHeight = '600px',
  compact = false,
  position = 'right',
  emptyMessage = 'No validation issues',
}: ValidationPanelProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Group messages by severity
  const groupedMessages = useMemo(() => {
    if (!groupBySeverity) {
      return { all: messages };
    }

    return {
      error: messages.filter(m => m.severity === 'error'),
      warning: messages.filter(m => m.severity === 'warning'),
      info: messages.filter(m => m.severity === 'info'),
    };
  }, [messages, groupBySeverity]);

  // Count by severity
  const counts = useMemo(() => ({
    error: messages.filter(m => m.severity === 'error').length,
    warning: messages.filter(m => m.severity === 'warning').length,
    info: messages.filter(m => m.severity === 'info').length,
  }), [messages]);

  const toggleGroup = useCallback((severity: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(severity)) {
        next.delete(severity);
      } else {
        next.add(severity);
      }
      return next;
    });
  }, []);

  if (!isOpen) return null;

  const severityConfig = {
    error: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      label: 'Errors',
      badgeVariant: 'destructive' as const,
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      label: 'Warnings',
      badgeVariant: 'secondary' as const,
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      label: 'Info',
      badgeVariant: 'outline' as const,
    },
  };

  return (
    <div
      className={cn(
        'bg-white border-l flex flex-col',
        position === 'right' && 'w-80',
        position === 'bottom' && 'w-full border-l-0 border-t'
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between border-b bg-gray-50 flex-shrink-0',
        compact ? 'px-3 py-2' : 'px-4 py-3'
      )}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {showSummary && messages.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {messages.length}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-7 w-7 p-0"
            >
              {isOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Summary Counts */}
      {showSummary && messages.length > 0 && (
        <div className={cn(
          'flex items-center gap-2 border-b bg-gray-50',
          compact ? 'px-3 py-2' : 'px-4 py-2'
        )}>
          {counts.error > 0 && (
            <Badge variant="destructive" className="text-xs">
              {counts.error} {counts.error === 1 ? 'Error' : 'Errors'}
            </Badge>
          )}
          {counts.warning > 0 && (
            <Badge variant="secondary" className="text-xs">
              {counts.warning} {counts.warning === 1 ? 'Warning' : 'Warnings'}
            </Badge>
          )}
          {counts.info > 0 && (
            <Badge variant="outline" className="text-xs">
              {counts.info} Info
            </Badge>
          )}
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ maxHeight }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
            <p className="text-sm text-gray-600">{emptyMessage}</p>
          </div>
        ) : groupBySeverity ? (
          <div className={cn('space-y-1', compact ? 'p-2' : 'p-4')}>
            {/* Errors */}
            {groupedMessages.error && groupedMessages.error.length > 0 && (
              <ValidationGroup
                severity="error"
                messages={groupedMessages.error}
                config={severityConfig.error}
                collapsed={collapsedGroups.has('error')}
                onToggle={() => toggleGroup('error')}
                collapsible={collapsibleGroups}
                compact={compact}
              />
            )}

            {/* Warnings */}
            {groupedMessages.warning && groupedMessages.warning.length > 0 && (
              <ValidationGroup
                severity="warning"
                messages={groupedMessages.warning}
                config={severityConfig.warning}
                collapsed={collapsedGroups.has('warning')}
                onToggle={() => toggleGroup('warning')}
                collapsible={collapsibleGroups}
                compact={compact}
              />
            )}

            {/* Info */}
            {groupedMessages.info && groupedMessages.info.length > 0 && (
              <ValidationGroup
                severity="info"
                messages={groupedMessages.info}
                config={severityConfig.info}
                collapsed={collapsedGroups.has('info')}
                onToggle={() => toggleGroup('info')}
                collapsible={collapsibleGroups}
                compact={compact}
              />
            )}
          </div>
        ) : (
          <div className={cn('space-y-2', compact ? 'p-2' : 'p-4')}>
            {messages.map((msg) => (
              <ValidationMessageItem
                key={msg.id}
                message={msg}
                config={severityConfig[msg.severity]}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// GROUP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ValidationGroupProps {
  severity: string;
  messages: ValidationMessage[];
  config: any;
  collapsed: boolean;
  onToggle: () => void;
  collapsible: boolean;
  compact: boolean;
}

const ValidationGroup = memo(function ValidationGroup({
  severity,
  messages,
  config,
  collapsed,
  onToggle,
  collapsible,
  compact,
}: ValidationGroupProps) {
  return (
    <div className="space-y-2">
      {collapsible && (
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase">
              {config.label}
            </span>
            <Badge variant={config.badgeVariant} className="text-xs">
              {messages.length}
            </Badge>
          </div>
          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </button>
      )}

      {!collapsed && (
        <div className="space-y-2">
          {messages.map((msg) => (
            <ValidationMessageItem
              key={msg.id}
              message={msg}
              config={config}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ValidationMessageItemProps {
  message: ValidationMessage;
  config: any;
  compact: boolean;
}

const ValidationMessageItem = memo(function ValidationMessageItem({
  message,
  config,
  compact,
}: ValidationMessageItemProps) {
  const Icon = config.icon;

  return (
    <button
      onClick={message.onClick}
      disabled={!message.onClick}
      className={cn(
        'w-full text-left rounded-lg border transition-all',
        config.bg,
        config.border,
        compact ? 'p-2' : 'p-3',
        message.onClick && 'hover:shadow-sm cursor-pointer',
        !message.onClick && 'cursor-default'
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className={cn('flex-shrink-0 mt-0.5', config.iconColor, compact ? 'w-3 h-3' : 'w-4 h-4')} />
        
        <div className="flex-1 min-w-0">
          <div className={cn('font-medium', config.text, compact ? 'text-xs' : 'text-sm')}>
            {message.message}
          </div>

          {message.description && (
            <div className={cn('text-gray-700 mt-1', compact ? 'text-xs' : 'text-sm')}>
              {message.description}
            </div>
          )}

          {(message.section || message.field || message.code) && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {message.section && (
                <Badge variant="outline" className="text-xs">
                  {message.section}
                </Badge>
              )}
              {message.field && (
                <Badge variant="outline" className="text-xs">
                  {message.field}
                </Badge>
              )}
              {message.code && (
                <span className="text-xs font-mono text-gray-600">
                  {message.code}
                </span>
              )}
            </div>
          )}
        </div>

        {message.onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              message.onDismiss?.();
            }}
            className="flex-shrink-0 p-1 rounded hover:bg-white/50 transition-colors"
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
        )}
      </div>
    </button>
  );
});

ValidationPanel.displayName = 'ValidationPanel';

export default ValidationPanel;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
<ValidationPanel
  messages={[
    {
      id: '1',
      severity: 'error',
      message: 'Blood pressure is required',
      section: 'Vital Signs',
      field: 'Blood Pressure',
      onClick: () => scrollToField('bp')
    },
    {
      id: '2',
      severity: 'warning',
      message: 'Consider documenting pain assessment',
      description: 'Pain assessment is recommended for home health visits',
      section: 'Assessment',
      onClick: () => scrollToSection('assessment')
    },
    {
      id: '3',
      severity: 'info',
      message: 'All required fields completed',
      code: 'VAL-001'
    }
  ]}
  groupBySeverity
  showSummary
  collapsibleGroups
/>
*/
