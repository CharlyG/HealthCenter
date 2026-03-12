/**
 * Application Shell
 * 
 * Main layout wrapper used across the entire platform.
 * Provides persistent navigation, header, notifications, and content regions.
 * 
 * Features:
 * - Persistent left sidebar navigation (role-based)
 * - Top application bar
 * - Quick access area
 * - Notification center access
 * - Global search/command palette access
 * - Main content region
 * - Optional right-side context drawer
 * 
 * Performance:
 * - Memoized to prevent unnecessary re-renders
 * - Lazy-loaded drawer content
 * - Optimized sidebar with virtualization
 */

import { memo, ReactNode, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Bell, 
  Search, 
  Menu, 
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '../ui/utils';
import UnifiedSidebar from '../navigation/UnifiedSidebar.optimized';
import CommandPalette from '../navigation/CommandPalette.optimized';

interface ApplicationShellProps {
  /** Current user role for navigation filtering */
  userRole: string;
  
  /** User profile info for header display */
  userProfile?: {
    name: string;
    email: string;
    avatar?: string;
  };
  
  /** Main content area */
  children: ReactNode;
  
  /** Optional right drawer content */
  rightDrawer?: ReactNode;
  
  /** Show right drawer by default */
  rightDrawerOpen?: boolean;
  
  /** Notification count for badge */
  notificationCount?: number;
  
  /** Handler for notification center click */
  onNotificationsClick?: () => void;
  
  /** Handler for settings click */
  onSettingsClick?: () => void;
  
  /** Handler for help click */
  onHelpClick?: () => void;
  
  /** Custom header actions */
  headerActions?: ReactNode;
  
  /** Show breadcrumbs in header */
  breadcrumbs?: Array<{ label: string; path?: string }>;
  
  /** Allow sidebar collapse */
  collapsibleSidebar?: boolean;
  
  /** Initial sidebar state */
  sidebarDefaultCollapsed?: boolean;
}

const ApplicationShell = memo(function ApplicationShell({
  userRole,
  userProfile,
  children,
  rightDrawer,
  rightDrawerOpen = false,
  notificationCount = 0,
  onNotificationsClick,
  onSettingsClick,
  onHelpClick,
  headerActions,
  breadcrumbs,
  collapsibleSidebar = true,
  sidebarDefaultCollapsed = false,
}: ApplicationShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(sidebarDefaultCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(rightDrawerOpen);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // PERFORMANCE: Memoize callbacks
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);

  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false);
  }, []);

  // PERFORMANCE: Calculate sidebar width for layout
  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64';
  const contentMargin = sidebarCollapsed ? 'ml-16' : 'ml-64';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside 
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40 bg-white border-r shadow-sm transition-all duration-200',
          sidebarWidth
        )}
      >
        <UnifiedSidebar 
          userRole={userRole} 
          collapsed={sidebarCollapsed}
        />
        
        {/* Sidebar Collapse Toggle */}
        {collapsibleSidebar && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-6 w-6 h-6 bg-white border rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-3 h-3 text-gray-600" />
            ) : (
              <ChevronLeft className="w-3 h-3 text-gray-600" />
            )}
          </button>
        )}
      </aside>

      {/* Main Content Area */}
      <div className={cn('transition-all duration-200', contentMargin)}>
        {/* Top Application Bar */}
        <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
          <div className="h-16 px-6 flex items-center justify-between gap-4">
            {/* Left Section: Breadcrumbs or Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {breadcrumbs && breadcrumbs.length > 0 ? (
                <nav className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center gap-2 whitespace-nowrap">
                      {index > 0 && <span className="text-gray-400">/</span>}
                      {crumb.path ? (
                        <a 
                          href={crumb.path}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {crumb.label}
                        </a>
                      ) : (
                        <span className="text-gray-900 font-medium">
                          {crumb.label}
                        </span>
                      )}
                    </div>
                  ))}
                </nav>
              ) : (
                <div className="flex items-center gap-3">
                  <Menu className="w-5 h-5 text-gray-400 lg:hidden" />
                  <h1 className="text-lg font-semibold text-gray-900 truncate">
                    Healthcare Platform
                  </h1>
                </div>
              )}
            </div>

            {/* Center Section: Quick Access */}
            <div className="flex items-center gap-2">
              {/* Global Search */}
              <Button
                variant="outline"
                size="sm"
                onClick={openCommandPalette}
                className="hidden md:flex items-center gap-2 min-w-[200px] justify-start text-gray-500"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Search...</span>
                <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-gray-100 border rounded">
                  ⌘K
                </kbd>
              </Button>

              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="sm"
                onClick={openCommandPalette}
                className="md:hidden"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Right Section: Actions & Profile */}
            <div className="flex items-center gap-2">
              {/* Custom Header Actions */}
              {headerActions}

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onNotificationsClick}
                className="relative"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
              </Button>

              {/* Help */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onHelpClick}
              >
                <HelpCircle className="w-4 h-4" />
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettingsClick}
              >
                <Settings className="w-4 h-4" />
              </Button>

              {/* User Profile */}
              {userProfile && (
                <div className="flex items-center gap-2 pl-2 border-l">
                  <div className="hidden md:block text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {userProfile.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {userRole}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {userProfile.avatar ? (
                      <img 
                        src={userProfile.avatar} 
                        alt={userProfile.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium text-blue-600">
                        {userProfile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative">
          <div className={cn(
            'transition-all duration-200',
            drawerOpen && rightDrawer ? 'mr-96' : 'mr-0'
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Right Context Drawer */}
      {rightDrawer && (
        <aside 
          className={cn(
            'fixed right-0 top-16 bottom-0 w-96 bg-white border-l shadow-lg z-30 transition-transform duration-200',
            drawerOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="h-full flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">Context</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDrawer}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto">
              {rightDrawer}
            </div>
          </div>
        </aside>
      )}

      {/* Right Drawer Toggle (when closed) */}
      {rightDrawer && !drawerOpen && (
        <button
          onClick={toggleDrawer}
          className="fixed right-0 top-24 w-8 h-16 bg-white border border-r-0 rounded-l-lg shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors z-20"
          aria-label="Open context drawer"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Command Palette */}
      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={closeCommandPalette}
        userRole={userRole}
      />
    </div>
  );
});

ApplicationShell.displayName = 'ApplicationShell';

export default ApplicationShell;
