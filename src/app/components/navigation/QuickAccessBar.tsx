/**
 * Quick Access Bar
 * 
 * Top application shell bar providing fast access to frequent actions and global tools.
 * Remains accessible from anywhere in the application.
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Search,
  UserPlus,
  Plus,
  Calendar,
  FileText,
  Activity,
  Bell,
  Settings,
  User,
  LogOut,
  Command,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface QuickAccessBarProps {
  onSearch?: () => void;
  onCommandPalette?: () => void;
  notificationCount?: number;
  userName?: string;
  userRole?: string;
}

export default function QuickAccessBar({
  onSearch,
  onCommandPalette,
  notificationCount = 0,
  userName = 'John Smith',
  userRole = 'Administrator',
}: QuickAccessBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  return (
    <div className="h-14 bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Quick Search */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onSearch}
            className="w-64 justify-start text-gray-500"
          >
            <Search className="w-4 h-4 mr-2" />
            Search patients, admissions, visits...
            <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-gray-100 rounded border">
              Ctrl K
            </kbd>
          </Button>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Create Menu */}
          <div className="relative">
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowQuickCreate(!showQuickCreate)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>

            {showQuickCreate && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
                <QuickCreateMenuItem
                  icon={UserPlus}
                  label="New Patient"
                  description="Create patient record"
                  onClick={() => {
                    console.log('Create patient');
                    setShowQuickCreate(false);
                  }}
                />
                <QuickCreateMenuItem
                  icon={Plus}
                  label="New Admission"
                  description="Start admission process"
                  onClick={() => {
                    console.log('Create admission');
                    setShowQuickCreate(false);
                  }}
                />
                <QuickCreateMenuItem
                  icon={Calendar}
                  label="Schedule Visit"
                  description="Create new visit"
                  onClick={() => {
                    console.log('Schedule visit');
                    setShowQuickCreate(false);
                  }}
                />
                <QuickCreateMenuItem
                  icon={FileText}
                  label="Start Documentation"
                  description="Begin clinical note"
                  onClick={() => {
                    console.log('Start documentation');
                    setShowQuickCreate(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Command Center */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCommandPalette}
            title="Command Palette (Ctrl+K)"
          >
            <Command className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="gap-2"
            >
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-sm font-medium text-gray-900">{userName}</div>
                <div className="text-xs text-gray-600">{userRole}</div>
              </div>
            </Button>

            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-3 border-b">
                  <div className="font-medium text-gray-900">{userName}</div>
                  <div className="text-sm text-gray-600">{userRole}</div>
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK CREATE MENU ITEM
// ═══════════════════════════════════════════════════════════════════════════

function QuickCreateMenuItem({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: any;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors"
    >
      <Icon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </div>
    </button>
  );
}