/**
 * RightDrawer Component
 * Slide-out panel from the right for secondary content, inspectors, and details
 * Built on top of Sheet for consistency
 */

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { ReactNode } from 'react';

export interface RightDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

const widthClasses = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[32rem]',
  xl: 'w-[48rem]',
};

export function RightDrawer({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  width = 'md',
  footer,
}: RightDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className={`flex flex-col ${widthClasses[width]}`} side="right">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
          {children}
        </div>

        {footer && (
          <div className="border-t pt-4 -mx-6 px-6">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/**
 * Controlled RightDrawer variant for programmatic control
 */
export interface ControlledRightDrawerProps extends Omit<RightDrawerProps, 'trigger'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ControlledRightDrawer(props: ControlledRightDrawerProps) {
  return <RightDrawer {...props} />;
}
