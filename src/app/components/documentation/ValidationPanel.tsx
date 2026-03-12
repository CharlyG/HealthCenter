/**
 * Validation Panel Component
 * 
 * Interactive validation panel for clinical documentation
 * Displays errors, warnings, and info messages with navigation to fields
 */

import React, { useState, useMemo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  ValidationError, 
  ValidationResult,
  ValidationSeverity 
} from '../../lib/documentValidation';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  X,
  Filter,
  Search,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN VALIDATION PANEL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ValidationPanelProps {
  validationResult: ValidationResult;
  onNavigateToField?: (fieldId: string, sectionId: string) => void;
  onDismissError?: (errorId: string) => void;
  showWarnings?: boolean;
  showInfos?: boolean;
  className?: string;
  compact?: boolean;
}

export function ValidationPanel({
  validationResult,
  onNavigateToField,
  onDismissError,
  showWarnings = true,
  showInfos = false,
  className,
  compact = false,
}: ValidationPanelProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [selectedSeverity, setSelectedSeverity] = useState<ValidationSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter errors based on selected severity and search
  const filteredErrors = useMemo(() => {
    let errors = [...validationResult.errors];
    
    if (showWarnings) {
      errors = [...errors, ...validationResult.warnings];
    }
    
    if (showInfos) {
      errors = [...errors, ...validationResult.infos];
    }

    // Filter by severity
    if (selectedSeverity !== 'all') {
      errors = errors.filter(e => e.severity === selectedSeverity);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      errors = errors.filter(e => 
        e.message.toLowerCase().includes(query) ||
        e.fieldLabel.toLowerCase().includes(query) ||
        e.sectionTitle.toLowerCase().includes(query)
      );
    }

    return errors;
  }, [validationResult, showWarnings, showInfos, selectedSeverity, searchQuery]);

  // Group errors by section
  const errorsBySection = useMemo(() => {
    const grouped: Record<string, ValidationError[]> = {};
    
    filteredErrors.forEach(error => {
      if (!grouped[error.sectionId]) {
        grouped[error.sectionId] = [];
      }
      grouped[error.sectionId].push(error);
    });

    return grouped;
  }, [filteredErrors]);

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const handleNavigateToField = (fieldId: string, sectionId: string) => {
    if (onNavigateToField) {
      onNavigateToField(fieldId, sectionId);
    }
  };

  // If no errors, show success state
  if (validationResult.isValid) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center gap-3 text-green-700">
          <CheckCircle2 className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">All validation checks passed</h3>
            <p className="text-sm text-green-600">
              This document is ready for submission
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <CompactValidationPanel
        validationResult={validationResult}
        onNavigateToField={onNavigateToField}
        className={className}
      />
    );
  }

  return (
    <Card className={cn('', className)}>
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Validation Issues
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Fix these issues before submitting
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <ValidationSummaryBadges validationResult={validationResult} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search errors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          
          <Button
            variant={selectedSeverity === 'error' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSeverity(selectedSeverity === 'error' ? 'all' : 'error')}
            className="gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            Errors ({validationResult.errorCount})
          </Button>
          
          {showWarnings && (
            <Button
              variant={selectedSeverity === 'warning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSeverity(selectedSeverity === 'warning' ? 'all' : 'warning')}
              className="gap-1"
            >
              <AlertTriangle className="w-4 h-4" />
              Warnings ({validationResult.warningCount})
            </Button>
          )}
        </div>
      </div>

      {/* Error List */}
      <ScrollArea className="h-[500px]">
        <div className="p-4 space-y-4">
          {Object.keys(errorsBySection).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Filter className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No validation issues match your filters</p>
            </div>
          ) : (
            Object.entries(errorsBySection).map(([sectionId, errors]) => (
              <SectionErrorGroup
                key={sectionId}
                sectionId={sectionId}
                sectionTitle={errors[0].sectionTitle}
                errors={errors}
                isCollapsed={collapsedSections.has(sectionId)}
                onToggle={() => toggleSection(sectionId)}
                onNavigateToField={handleNavigateToField}
                onDismissError={onDismissError}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION ERROR GROUP
// ═══════════════════════════════════════════════════════════════════════════

interface SectionErrorGroupProps {
  sectionId: string;
  sectionTitle: string;
  errors: ValidationError[];
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigateToField?: (fieldId: string, sectionId: string) => void;
  onDismissError?: (errorId: string) => void;
}

function SectionErrorGroup({
  sectionId,
  sectionTitle,
  errors,
  isCollapsed,
  onToggle,
  onNavigateToField,
  onDismissError,
}: SectionErrorGroupProps) {
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
          <span className="font-medium text-gray-900">{sectionTitle}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {errorCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              {errorCount}
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 border-amber-300">
              <AlertTriangle className="w-3 h-3" />
              {warningCount}
            </Badge>
          )}
        </div>
      </button>

      {/* Error Items */}
      {!isCollapsed && (
        <div className="divide-y">
          {errors.map(error => (
            <ValidationErrorItem
              key={error.id}
              error={error}
              onNavigate={() => onNavigateToField?.(error.fieldId, error.sectionId)}
              onDismiss={() => onDismissError?.(error.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION ERROR ITEM
// ═══════════════════════════════════════════════════════════════════════════

interface ValidationErrorItemProps {
  error: ValidationError;
  onNavigate?: () => void;
  onDismiss?: () => void;
}

function ValidationErrorItem({ error, onNavigate, onDismiss }: ValidationErrorItemProps) {
  const Icon = getSeverityIcon(error.severity);
  const colorClasses = getSeverityColorClasses(error.severity);

  return (
    <div className={cn('p-4 hover:bg-gray-50 transition-colors', colorClasses.bg)}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('mt-0.5', colorClasses.icon)}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Field Label */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 text-sm">
              {error.fieldLabel}
            </span>
            <Badge variant="outline" className="text-xs">
              {error.severity}
            </Badge>
          </div>

          {/* Error Message */}
          <p className={cn('text-sm mb-2', colorClasses.text)}>
            {error.message}
          </p>

          {/* Suggestion */}
          {error.suggestion && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3 text-sm text-blue-800">
              <Info className="w-4 h-4 inline mr-1" />
              {error.suggestion}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onNavigate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigate}
                className="gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Go to field
              </Button>
            )}
            
            {onDismiss && error.severity !== 'error' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="gap-1"
              >
                <X className="w-3 h-3" />
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT VALIDATION PANEL
// ═══════════════════════════════════════════════════════════════════════════

interface CompactValidationPanelProps {
  validationResult: ValidationResult;
  onNavigateToField?: (fieldId: string, sectionId: string) => void;
  className?: string;
}

function CompactValidationPanel({
  validationResult,
  onNavigateToField,
  className,
}: CompactValidationPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (validationResult.isValid) {
    return (
      <div className={cn('p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2', className)}>
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-green-700">All checks passed</span>
      </div>
    );
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-700">
            {validationResult.errorCount} validation {validationResult.errorCount === 1 ? 'issue' : 'issues'}
          </span>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-red-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-red-600" />
        )}
      </button>

      {expanded && (
        <div className="p-3 bg-white space-y-2 max-h-64 overflow-y-auto">
          {validationResult.errors.map(error => (
            <div key={error.id} className="text-sm">
              <button
                onClick={() => onNavigateToField?.(error.fieldId, error.sectionId)}
                className="text-left hover:underline text-red-700 font-medium"
              >
                {error.fieldLabel}: {error.message}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION SUMMARY BADGES
// ═══════════════════════════════════════════════════════════════════════════

interface ValidationSummaryBadgesProps {
  validationResult: ValidationResult;
  size?: 'sm' | 'md' | 'lg';
}

export function ValidationSummaryBadges({ 
  validationResult, 
  size = 'md' 
}: ValidationSummaryBadgesProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <div className="flex items-center gap-2">
      {validationResult.errorCount > 0 && (
        <Badge 
          variant="destructive" 
          className={cn('gap-1', sizeClasses[size])}
        >
          <AlertCircle className="w-3 h-3" />
          {validationResult.errorCount} {validationResult.errorCount === 1 ? 'Error' : 'Errors'}
        </Badge>
      )}
      
      {validationResult.warningCount > 0 && (
        <Badge 
          className={cn('gap-1 bg-amber-100 text-amber-700 border-amber-300', sizeClasses[size])}
        >
          <AlertTriangle className="w-3 h-3" />
          {validationResult.warningCount} {validationResult.warningCount === 1 ? 'Warning' : 'Warnings'}
        </Badge>
      )}
      
      {validationResult.infoCount > 0 && (
        <Badge 
          variant="outline" 
          className={cn('gap-1 bg-blue-100 text-blue-700 border-blue-300', sizeClasses[size])}
        >
          <Info className="w-3 h-3" />
          {validationResult.infoCount} Info
        </Badge>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getSeverityIcon(severity: ValidationSeverity) {
  const icons = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };
  return icons[severity];
}

function getSeverityColorClasses(severity: ValidationSeverity) {
  const classes = {
    error: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      icon: 'text-red-600',
      border: 'border-red-200',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: 'text-amber-600',
      border: 'border-amber-200',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: 'text-blue-600',
      border: 'border-blue-200',
    },
  };
  return classes[severity];
}
