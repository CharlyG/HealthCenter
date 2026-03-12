import { useEffect, useRef } from 'react';
import { supabase } from '../lib/dataGateway';

/**
 * Hook to automatically refresh auth tokens before they expire.
 * Supabase access tokens typically expire after 1 hour.
 * This hook refreshes them proactively at 50 minutes.
 *
 * Guards against "Refresh Token Not Found" by verifying
 * the session actually contains a refresh_token before calling
 * refreshSession().
 */
export function useTokenRefresh() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    const clearTimer = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const startRefreshTimer = () => {
      clearTimer();

      // Refresh token every 50 minutes (access tokens expire after 60 min)
      const REFRESH_INTERVAL = 50 * 60 * 1000;

      intervalRef.current = setInterval(async () => {
        try {
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.warn('[TokenRefresh] Error checking session:', error.message);
            return;
          }

          // Only attempt refresh when there is both a session AND a refresh token
          if (!data.session?.refresh_token) {
            // No session or no refresh token — nothing to refresh.
            // Stop polling until the user signs in again.
            console.log('[TokenRefresh] No active session / refresh token, stopping timer');
            clearTimer();
            return;
          }

          console.log('[TokenRefresh] Proactively refreshing token...');
          const { error: refreshError } = await supabase.auth.refreshSession();

          if (refreshError) {
            // If the refresh token is revoked / expired, stop retrying
            if (
              refreshError.message?.includes('Refresh Token Not Found') ||
              refreshError.message?.includes('Invalid Refresh Token')
            ) {
              console.warn('[TokenRefresh] Refresh token invalid, stopping timer');
              clearTimer();
            } else {
              console.warn('[TokenRefresh] Error refreshing token:', refreshError.message);
            }
          } else {
            console.log('[TokenRefresh] Token refreshed successfully');
          }
        } catch (err) {
          console.warn('[TokenRefresh] Unexpected error during token refresh:', err);
        }
      }, REFRESH_INTERVAL);

      console.log('[TokenRefresh] Auto-refresh timer started (every 50 minutes)');
    };

    // Re-start the timer whenever auth state changes (sign-in restarts it,
    // sign-out will let the next tick detect no session and stop).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        startRefreshTimer();
      } else if (event === 'SIGNED_OUT') {
        clearTimer();
      }
    });

    // Kick off the timer on mount
    startRefreshTimer();

    return () => {
      clearTimer();
      subscription.unsubscribe();
    };
  }, []);
}