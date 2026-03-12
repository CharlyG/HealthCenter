/**
 * Design System - Page Layout
 * Standard page wrapper with consistent spacing and structure
 */
import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-[1400px]',
  full: 'max-w-full',
};

export const PageLayout = ({ children, maxWidth = 'xl', className = '' }: PageLayoutProps) => {
  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className={`${maxWidthClasses[maxWidth]} mx-auto p-6 ${className}`}>
        {children}
      </div>
    </div>
  );
};

interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader = ({ icon, title, subtitle, actions }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {icon && <div className="text-blue-600">{icon}</div>}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageSection = ({ children, className = '' }: PageSectionProps) => {
  return <div className={`mb-6 ${className}`}>{children}</div>;
};
