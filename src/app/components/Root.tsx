import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ConfigProvider } from '../context/ConfigContext';
import { setAuthErrorHandler } from '../lib/dataGateway';
import { useTokenRefresh } from '../hooks/useTokenRefresh';
import Sidebar from './Sidebar';
import PatientContextHeader from './PatientContextHeader';
import { CommandPalette } from './design-system/CommandPalette';
import { GlobalSearch } from './design-system/GlobalSearch';
import { AlertProvider } from '../context/AlertContext';
import { NotificationCenter } from './alerts/NotificationCenter';
import { DocNotificationBell } from './documentation/DocNotificationBell';
import { User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Root component - Protected layout with auth check (AuthProvider from App.tsx)
export default function Root() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // ─── Auto-refresh tokens before expiry ─────────────────────────────────────
  useTokenRefresh();

  // ─── Register auth error handler ───────────────────────────────────────────
  useEffect(() => {
    let isHandlingError = false; // Prevent multiple simultaneous calls
    
    const handleAuthError = async () => {
      if (isHandlingError) {
        console.log('[Root] Auth error already being handled, skipping duplicate');
        return;
      }
      
      isHandlingError = true;
      console.log('[Root] Auth error detected, clearing session and redirecting to login');
      
      try {
        // Force sign out to clear stale/invalid session
        await signOut();
      } catch (err) {
        // Ignore sign out errors - just clear local state
        console.log('[Root] Sign out failed during auth error, clearing anyway');
      }
      
      // Always redirect regardless of sign out success
      navigate('/login', { replace: true });
      
      // Reset flag after a delay
      setTimeout(() => {
        isHandlingError = false;
      }, 1000);
    };

    setAuthErrorHandler(handleAuthError);
  }, [navigate, signOut]);

  // ─── Redirect to login if not authenticated ───────────────────────────────���
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Sign out error:', err);
      // Force redirect even if signOut throws
      navigate('/login', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  // Not authenticated — show redirect spinner while navigate() takes effect
  // DO NOT render ConfigProvider or any app components
  if (!user) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-gray-500">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  // ─── Authenticated — render app with ConfigProvider ───────────────────────
  // IMPORTANT: ConfigProvider is ONLY rendered when user is authenticated
  // This prevents any API calls from happening during logout/redirect
  return (
    <ConfigProvider>
      <AlertProvider>
      {/* Command Palette (Cmd+K) */}
      <CommandPalette />
      
      <div className="size-full flex flex-col bg-gray-50">
        {/* Top Bar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HC</span>
              </div>
              <span className="font-semibold text-gray-900">HealthCare Platform</span>
            </div>
            
            {/* Global Search */}
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Center */}
            <NotificationCenter />
            <DocNotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="size-4" />
                  <span>{profile?.name ?? user?.email ?? 'User'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="text-sm font-normal text-gray-500">{profile?.email ?? user?.email}</div>
                  <div className="text-xs font-normal text-gray-400 mt-1">Role: {profile?.role ?? '…'}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="size-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Patient Context Header - shows when patient selected */}
        {selectedPatient && (
          <PatientContextHeader
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Outlet context={{ selectedPatient, setSelectedPatient }} />
          </main>
        </div>
      </div>
      </AlertProvider>
    </ConfigProvider>
  );
}