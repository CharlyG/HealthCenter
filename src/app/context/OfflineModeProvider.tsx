/**
 * Offline Mode Provider
 * 
 * Wraps the application to provide global offline mode functionality.
 * Can be added to Root.tsx to enable offline mode across the entire app.
 * 
 * Features:
 * - Global offline/online detection
 * - Persistent sync queue across page navigation
 * - Auto-sync when connection restored
 * - Floating status badge always visible
 * - Top banner when offline or syncing
 */

import { ReactNode } from 'react';
import OfflineModeManager from '../components/offline/OfflineModeManager';

interface OfflineModeProviderProps {
  children: ReactNode;
}

export default function OfflineModeProvider({ children }: OfflineModeProviderProps) {
  return (
    <>
      {children}
      <OfflineModeManager />
    </>
  );
}
