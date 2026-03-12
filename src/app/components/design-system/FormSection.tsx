/**
 * Design System - Form Section
 * Reusable form section with consistent layout and sticky action bar
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Save, Loader2, Clock } from 'lucide-react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  isDirty?: boolean;
  isSaving?: boolean;
  lastSaved?: Date | null;
  onSave?: () => void;
  className?: string;
}

export const FormSection = ({
  title,
  children,
  actions,
  isDirty,
  isSaving,
  lastSaved,
  onSave,
  className = '',
}: FormSectionProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="size-4" />
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            {isDirty && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                Unsaved changes
              </Badge>
            )}
            {actions || (onSave && (
              <Button
                onClick={onSave}
                disabled={isSaving || !isDirty}
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

interface FormFieldGroupProps {
  title: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const FormFieldGroup = ({ 
  title, 
  children, 
  columns = 2,
  className = '' 
}: FormFieldGroupProps) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <>
      <div className="col-span-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      </div>
      <div className={`col-span-full grid ${gridCols[columns]} gap-6 ${className}`}>
        {children}
      </div>
    </>
  );
};

interface StickyFormActionsProps {
  children: React.ReactNode;
  show?: boolean;
}

export const StickyFormActions = ({ children, show = true }: StickyFormActionsProps) => {
  if (!show) return null;

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-end gap-3">
          {children}
        </div>
      </div>
    </div>
  );
};
