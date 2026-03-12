/**
 * Settings / Configuration Shell
 * 
 * Standardized layout for administrative and configuration pages.
 * Makes complex settings easier to manage with clear navigation.
 * 
 * Use Cases:
 * - Platform configuration
 * - Integration settings
 * - Module management
 * - Feature flags
 * - Role management
 * - Clinical settings
 * - System preferences
 * 
 * Performance:
 * - Lazy-loaded sections
 * - Memoized navigation
 * - Optimized re-renders
 */

import { memo, ReactNode, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Settings,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Info,
  X,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../ui/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SettingsSection {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive';
  };
  description?: string;
  subsections?: Array<{
    id: string;
    label: string;
  }>;
}

interface SettingsShellProps {
  /** Page title */
  title: string;
  
  /** Page description */
  description?: string;
  
  /** Navigation sections */
  sections: SettingsSection[];
  
  /** Active section ID */
  activeSection: string;
  
  /** Section change handler */
  onSectionChange: (sectionId: string) => void;
  
  /** Main content */
  children: ReactNode;
  
  /** Help/documentation panel content */
  helpContent?: ReactNode;
  
  /** Show help panel */
  showHelp?: boolean;
  
  /** Toggle help panel */
  onToggleHelp?: () => void;
  
  /** Has unsaved changes */
  hasUnsavedChanges?: boolean;
  
  /** Save handler */
  onSave?: () => void | Promise<void>;
  
  /** Reset handler */
  onReset?: () => void;
  
  /** Cancel handler */
  onCancel?: () => void;
  
  /** Saving state */
  saving?: boolean;
  
  /** Validation errors */
  validationErrors?: number;
  
  /** Custom footer actions */
  footerActions?: ReactNode;
  
  /** Breadcrumbs */
  breadcrumbs?: Array<{
    label: string;
    onClick?: () => void;
  }>;
  
  /** Compact sidebar */
  compactSidebar?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const SettingsShell = memo(function SettingsShell({
  title,
  description,
  sections,
  activeSection,
  onSectionChange,
  children,
  helpContent,
  showHelp: initialShowHelp = false,
  onToggleHelp,
  hasUnsavedChanges = false,
  onSave,
  onReset,
  onCancel,
  saving = false,
  validationErrors = 0,
  footerActions,
  breadcrumbs,
  compactSidebar = false,
}: SettingsShellProps) {
  const [internalShowHelp, setInternalShowHelp] = useState(initialShowHelp);
  const showHelp = onToggleHelp ? initialShowHelp : internalShowHelp;
  
  const toggleHelp = useCallback(() => {
    if (onToggleHelp) {
      onToggleHelp();
    } else {
      setInternalShowHelp(prev => !prev);
    }
  }, [onToggleHelp]);

  const canSave = hasUnsavedChanges && !saving && validationErrors === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="px-6 py-4">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  {crumb.onClick ? (
                    <button
                      onClick={crumb.onClick}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-gray-900 font-medium">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Title */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
              </div>
            </div>

            {/* Header Actions */}
            {helpContent && (
              <Button
                variant={showHelp ? 'default' : 'outline'}
                size="sm"
                onClick={toggleHelp}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
            )}
          </div>

          {/* Warning Banner */}
          {hasUnsavedChanges && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900">
                  You have unsaved changes
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Make sure to save your changes before leaving this page.
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Navigation Sidebar */}
        <aside
          className={cn(
            'bg-white border-r flex-shrink-0 overflow-y-auto',
            compactSidebar ? 'w-56' : 'w-64'
          )}
        >
          <nav className="p-4">
            <div className="space-y-1">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                const hasSubsections = section.subsections && section.subsections.length > 0;

                return (
                  <div key={section.id}>
                    <button
                      onClick={() => onSectionChange(section.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {section.icon && (
                          <span className={cn('flex-shrink-0', isActive && 'text-blue-600')}>
                            {section.icon}
                          </span>
                        )}
                        <span className="truncate">{section.label}</span>
                      </div>
                      {section.badge && (
                        <Badge variant={section.badge.variant || 'secondary'} className="text-xs ml-2">
                          {section.badge.label}
                        </Badge>
                      )}
                    </button>

                    {/* Subsections */}
                    {hasSubsections && isActive && (
                      <div className="ml-8 mt-1 space-y-1">
                        {section.subsections!.map((subsection) => (
                          <button
                            key={subsection.id}
                            onClick={() => onSectionChange(subsection.id)}
                            className="w-full text-left px-3 py-1 text-xs text-gray-600 hover:text-gray-900 rounded"
                          >
                            {subsection.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    {isActive && section.description && (
                      <p className="px-3 mt-1 text-xs text-gray-600">
                        {section.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Configuration Detail Panel */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {children}
          </div>
          
          {/* Spacer for sticky footer */}
          <div className="h-20" />
        </main>

        {/* Help / Documentation Panel */}
        {showHelp && helpContent && (
          <aside className="w-96 border-l bg-gray-50 overflow-y-auto flex-shrink-0">
            <div className="sticky top-0 z-10 bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Help & Documentation</h3>
              </div>
              <button
                onClick={toggleHelp}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              {helpContent}
            </div>
          </aside>
        )}
      </div>

      {/* Sticky Save Footer */}
      <footer className="bg-white border-t sticky bottom-0 z-30">
        <div className="px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Status */}
            <div className="flex items-center gap-3 text-sm">
              {validationErrors > 0 && (
                <span className="flex items-center gap-1 text-red-600 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  {validationErrors} {validationErrors === 1 ? 'error' : 'errors'}
                </span>
              )}
              {hasUnsavedChanges && validationErrors === 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  Unsaved changes
                </span>
              )}
              {!hasUnsavedChanges && validationErrors === 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  All changes saved
                </span>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
              )}

              {onReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  disabled={!hasUnsavedChanges || saving}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}

              {footerActions}

              {onSave && (
                <Button
                  size="sm"
                  onClick={onSave}
                  disabled={!canSave}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
});

SettingsShell.displayName = 'SettingsShell';

export default SettingsShell;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
<SettingsShell
  title="Platform Configuration"
  description="Configure global settings for your organization"
  breadcrumbs={[
    { label: 'Settings', onClick: () => navigate('/settings') },
    { label: 'Platform Configuration' },
  ]}
  sections={[
    {
      id: 'general',
      label: 'General',
      icon: <Settings className="w-4 h-4" />,
      description: 'Basic platform settings'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <Plug className="w-4 h-4" />,
      badge: { label: '12', variant: 'secondary' },
      subsections: [
        { id: 'evv', label: 'EVV Integration' },
        { id: 'ehr', label: 'EHR Integration' },
      ]
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-4 h-4" />,
    },
  ]}
  activeSection={activeSection}
  onSectionChange={setActiveSection}
  hasUnsavedChanges={configChanged}
  onSave={saveConfiguration}
  onReset={resetConfiguration}
  saving={isSaving}
  validationErrors={errors.length}
  helpContent={
    <div className="space-y-4">
      <h4 className="font-semibold">Configuration Help</h4>
      <p className="text-sm text-gray-600">
        These settings control the global behavior of the platform...
      </p>
    </div>
  }
>
  <ConfigurationForm
    section={activeSection}
    data={configData}
    onChange={setConfigData}
  />
</SettingsShell>
*/
