/**
 * Healthcare Design System - Workspace Layout
 */
import React from 'react';
import { Card } from '../ui/card';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  filters?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export const WorkspaceLayout = ({
  children,
  header,
  filters,
  sidebar,
  className = '',
}: WorkspaceLayoutProps) => {
  return (
    <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
      {/* Workspace Header */}
      {header && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          {header}
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (optional) */}
        {sidebar && (
          <div className="w-64 bg-white border-r border-gray-200 overflow-auto p-4">
            {sidebar}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Filters */}
          {filters && (
            <div className="bg-white border-b border-gray-200 p-4">
              {filters}
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface WorkspaceHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
}

export const WorkspaceHeader = ({
  icon,
  title,
  subtitle,
  actions,
  tabs,
}: WorkspaceHeaderProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <div className="text-blue-600">{icon}</div>}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {tabs && <div>{tabs}</div>}
    </div>
  );
};

interface WorkspaceFiltersProps {
  children: React.ReactNode;
  onClear?: () => void;
}

export const WorkspaceFilters = ({
  children,
  onClear,
}: WorkspaceFiltersProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
        {children}
      </div>
      {onClear && (
        <button
          onClick={onClear}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

interface WorkspaceSectionProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const WorkspaceSection = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
}: WorkspaceSectionProps) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <Card className="p-6">
        {children}
      </Card>
    </div>
  );
};