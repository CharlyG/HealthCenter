/**
 * Inline Help System
 * 
 * Contextual help system with tooltips and side panels.
 * 
 * Features:
 * - Help icons near complex fields
 * - Tooltip-based quick help
 * - Side panel for detailed explanations
 * - CMS references and regulatory guidance
 * - Examples and best practices
 * - Searchable help content
 * 
 * @example
 * ```tsx
 * // Simple tooltip help
 * <HelpTooltip content="Enter patient's primary diagnosis code" />
 * 
 * // Detailed help with CMS reference
 * <HelpIcon
 *   title="OASIS M1021 - Primary Diagnosis"
 *   content="The primary diagnosis most related to the current plan of care."
 *   cmsReference="OASIS-E Guidance Manual, Chapter 3, Section M1021"
 *   examples={['I50.9 - Heart failure, unspecified']}
 * />
 * 
 * // Field with inline help
 * <FieldWithHelp
 *   label="Functional Score"
 *   helpContent="Rate patient's ability on scale of 0-4"
 *   helpDetails="0=Unable, 1=Substantial Assistance..."
 * >
 *   <input type="number" />
 * </FieldWithHelp>
 * ```
 */

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info, BookOpen, ExternalLink, X, Search } from 'lucide-react';

// ==================== TYPES ====================

export interface HelpContent {
  title?: string;
  content: string;
  details?: string;
  cmsReference?: string;
  examples?: string[];
  links?: Array<{ label: string; url: string }>;
  keywords?: string[];
}

// ==================== HELP TOOLTIP ====================

interface HelpTooltipProps {
  content: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  size = 'md',
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const tooltipPositionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <HelpCircle className={`${sizeClasses[size]} text-gray-400 hover:text-gray-600 cursor-help transition-colors`} />
      
      {isVisible && (
        <div
          className={`absolute ${tooltipPositionClasses[position]} z-50 w-64 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none`}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              'left-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
};

// ==================== HELP ICON WITH POPOVER ====================

interface HelpIconProps extends HelpContent {
  size?: 'sm' | 'md' | 'lg';
}

export const HelpIcon: React.FC<HelpIconProps> = ({
  title,
  content,
  details,
  cmsReference,
  examples,
  links,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-0.5 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Show help"
      >
        <Info className={`${sizeClasses[size]} text-blue-500 hover:text-blue-600`} />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-xl">
          <div className="p-4">
            {title && (
              <div className="flex items-start justify-between gap-2 mb-3">
                <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
            
            {details && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 leading-relaxed">{details}</p>
              </div>
            )}
            
            {cmsReference && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1">CMS Reference</p>
                    <p className="text-xs text-gray-600">{cmsReference}</p>
                  </div>
                </div>
              </div>
            )}
            
            {examples && examples.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-900 mb-2">Examples</p>
                <ul className="space-y-1">
                  {examples.map((example, index) => (
                    <li key={index} className="text-xs text-gray-600 pl-4 relative before:content-['•'] before:absolute before:left-0">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {links && links.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="space-y-2">
                  {links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== FIELD WITH HELP ====================

interface FieldWithHelpProps {
  label: string;
  helpContent: string;
  helpDetails?: string;
  cmsReference?: string;
  examples?: string[];
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export const FieldWithHelp: React.FC<FieldWithHelpProps> = ({
  label,
  helpContent,
  helpDetails,
  cmsReference,
  examples,
  required,
  error,
  children
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <HelpIcon
          content={helpContent}
          details={helpDetails}
          cmsReference={cmsReference}
          examples={examples}
        />
      </div>
      
      {children}
      
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

// ==================== HELP PANEL ====================

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export const HelpPanel: React.FC<HelpPanelProps> = ({
  isOpen,
  onClose,
  title = 'Help',
  children,
  position = 'right'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div
        className={`fixed top-0 ${position === 'right' ? 'right-0' : 'left-0'} h-full w-96 bg-white shadow-2xl z-50 transform transition-transform`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close help panel"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

// ==================== HELP SECTION ====================

interface HelpSectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const HelpSection: React.FC<HelpSectionProps> = ({
  title,
  children,
  collapsible = false,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (collapsible) {
    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <span className="text-gray-500">{isExpanded ? '−' : '+'}</span>
        </button>
        
        {isExpanded && (
          <div className="pb-4 text-sm text-gray-700 leading-relaxed">
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="text-sm text-gray-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
};

// ==================== CONTEXTUAL HELP ====================

interface ContextualHelpProps {
  context: string; // e.g., 'oasis-assessment', 'medication-order'
  helpItems: HelpContent[];
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  context,
  helpItems
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = helpItems.filter(item => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
        aria-label="Open help"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
      
      <HelpPanel isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Help: ${context}`}>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No help topics found
            </p>
          ) : (
            filteredItems.map((item, index) => (
              <HelpSection key={index} title={item.title || `Topic ${index + 1}`} collapsible defaultExpanded={false}>
                <p className="mb-2">{item.content}</p>
                
                {item.details && (
                  <p className="mb-3 text-xs text-gray-600">{item.details}</p>
                )}
                
                {item.cmsReference && (
                  <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                    <p className="font-semibold text-blue-900 mb-1">CMS Reference</p>
                    <p className="text-blue-800">{item.cmsReference}</p>
                  </div>
                )}
                
                {item.examples && item.examples.length > 0 && (
                  <div>
                    <p className="font-semibold mb-1 text-xs">Examples:</p>
                    <ul className="space-y-1">
                      {item.examples.map((example, i) => (
                        <li key={i} className="text-xs text-gray-600 pl-4 relative before:content-['•'] before:absolute before:left-0">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </HelpSection>
            ))
          )}
        </div>
      </HelpPanel>
    </>
  );
};

// ==================== QUICK HELP BADGE ====================

interface QuickHelpBadgeProps {
  label: string;
  content: string;
}

export const QuickHelpBadge: React.FC<QuickHelpBadgeProps> = ({
  label,
  content
}) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
      <Info className="w-3 h-3" />
      <span className="font-medium">{label}</span>
      <HelpTooltip content={content} size="sm" />
    </div>
  );
};
