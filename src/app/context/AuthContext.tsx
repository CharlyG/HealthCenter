import React, { createContext, useContext, useEffect, useState } from 'react';
import * as dataGateway from '../lib/dataGateway';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  org_id: string;
  office_ids: string[];
}

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // loading = true only until we know whether a session exists or not.
  // Profile loading happens in the background and does NOT block this flag.
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  // ─── Build profile from user_metadata (zero API calls) ────────────────────
  const buildProfileFromMeta = (supabaseUser: any): Profile | null => {
    const meta = supabaseUser?.user_metadata;
    if (meta?.role && meta?.org_id) {
      return {
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        name: meta.name ?? '',
        role: meta.role,
        org_id: meta.org_id,
        office_ids: meta.office_ids ?? [],
      };
    }
    return null;
  };

  // Write profile fields to user_metadata so future sessions use the fast path
  const syncMetadata = async (p: Profile) => {
    try {
      await dataGateway.supabase.auth.updateUser({
        data: { name: p.name, role: p.role, org_id: p.org_id, office_ids: p.office_ids },
      });
    } catch (err) {
      console.warn('Failed to sync profile to user_metadata:', err);
    }
  };

  // Slow path: fetch profile from server (legacy users without metadata)
  // Forces a token refresh first to guarantee a valid JWT.
  const loadProfileFromAPI = async (): Promise<Profile | null> => {
    try {
      const { data, error } = await dataGateway.supabase.auth.refreshSession();
      if (error || !data.session) {
        console.error('Could not refresh session for profile load:', error?.message);
        return null;
      }
      const result = await dataGateway.getCurrentProfile(data.session.access_token);
      const p: Profile = result.profile;
      await syncMetadata(p);
      return p;
    } catch (err) {
      console.error('Error loading profile from API:', err);
      return null;
    }
  };

  // Resolve profile: fast path first, slow path fallback
  const resolveProfile = async (supabaseUser: any): Promise<Profile | null> => {
    const meta = buildProfileFromMeta(supabaseUser);
    if (meta) return meta;
    return loadProfileFromAPI();
  };

  // ─── Initial session check ─────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log('[Auth] Checking initial session...');
        const { data, error } = await dataGateway.supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('[Auth] Session check error:', error.message);
          setUser(null);
          setProfile(null);
          setLoading(false);
          setSessionChecked(true);
          return;
        }

        if (data.session?.user) {
          console.log('[Auth] Active session found');
          
          // Check if the session is fresh (less than 5 minutes old)
          // Fresh sessions from login don't need validation
          const sessionAge = Date.now() - (data.session.user.last_sign_in_at ? new Date(data.session.user.last_sign_in_at).getTime() : 0);
          const isFreshLogin = sessionAge < 5 * 60 * 1000; // 5 minutes
          
          if (isFreshLogin) {
            // Session is from a recent login - trust it without re-validation
            console.log('[Auth] Fresh login session detected, skipping validation');
            setUser(data.session.user);
            setLoading(false);
            setSessionChecked(true);

            const fastProfile = buildProfileFromMeta(data.session.user);
            if (fastProfile) {
              setProfile(fastProfile);
            } else {
              resolveProfile(data.session.user).then((p) => {
                if (mounted) setProfile(p);
              });
            }
          } else {
            // Older session - validate by attempting to refresh it
            console.log('[Auth] Validating older session...');
            const { data: refreshData, error: refreshError } = await dataGateway.supabase.auth.refreshSession();
            
            if (!mounted) return;
            
            if (refreshError || !refreshData.session) {
              console.log('[Auth] Session refresh failed, clearing stale session');
              // Clear the invalid session silently
              await dataGateway.supabase.auth.signOut().catch(() => {});
              setUser(null);
              setProfile(null);
              setLoading(false);
              setSessionChecked(true);
              return;
            }
            
            // Session is valid - use the refreshed session
            console.log('[Auth] Session validated successfully');
            setUser(refreshData.session.user);
            setLoading(false);
            setSessionChecked(true);

            // Try fast path first
            const fastProfile = buildProfileFromMeta(refreshData.session.user);
            if (fastProfile) {
              setProfile(fastProfile);
            } else {
              // Slow path in background
              resolveProfile(refreshData.session.user).then((p) => {
                if (mounted) setProfile(p);
              });
            }
          }
        } else {
          console.log('[Auth] No active session');
          setUser(null);
          setProfile(null);
          setLoading(false);
          setSessionChecked(true);
        }
      } catch (err) {
        console.error('[Auth] Unexpected error during session check:', err);
        if (mounted) {
          // Clear session on any error
          await dataGateway.supabase.auth.signOut().catch(() => {});
          setUser(null);
          setProfile(null);
          setLoading(false);
          setSessionChecked(true);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  // ─── Auth state change listener ────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = dataGateway.supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] State change event:', event, 'has session:', !!session);

        if (!mounted) return;

        // Handle token refresh
        if (event === 'TOKEN_REFRESHED') {
          console.log('[Auth] Token refreshed successfully');
          if (session?.user) {
            setUser(session.user);
            const fastProfile = buildProfileFromMeta(session.user);
            if (fastProfile) {
              setProfile(fastProfile);
            }
          }
          return;
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('[Auth] User signed out');
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        // Handle sign in
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('[Auth] SIGNED_IN event - setting user and profile');
          setUser(session.user);
          setLoading(false);

          const fastProfile = buildProfileFromMeta(session.user);
          if (fastProfile) {
            console.log('[Auth] SIGNED_IN event - using fast profile');
            setProfile(fastProfile);
          } else {
            console.log('[Auth] SIGNED_IN event - fetching profile from API');
            resolveProfile(session.user).then((p) => {
              if (mounted) setProfile(p);
            });
          }
          return;
        }

        // Handle initial session or other events
        if (session?.user) {
          console.log('[Auth] Other event with session:', event);
          setUser(session.user);
          if (!sessionChecked) {
            setLoading(false);
          }

          const fastProfile = buildProfileFromMeta(session.user);
          if (fastProfile) {
            setProfile(fastProfile);
          } else {
            resolveProfile(session.user).then((p) => {
              if (mounted) setProfile(p);
            });
          }
        } else if (event !== 'INITIAL_SESSION') {
          // No session and not initial check
          console.log('[Auth] No session for event:', event, '- clearing user');
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [sessionChecked]);

  // ─── signIn ────────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    console.log('[Auth] signIn called for:', email);
    const data = await dataGateway.signIn(email, password);
    if (!data.session?.access_token) {
      throw new Error('Sign in succeeded but no session was returned');
    }

    console.log('[Auth] signIn successful, setting user and profile');
    setUser(data.user);
    setLoading(false);

    const fastProfile = buildProfileFromMeta(data.user);
    if (fastProfile) {
      console.log('[Auth] Using fast profile from metadata');
      setProfile(fastProfile);
    } else {
      console.log('[Auth] Fetching profile from API');
      try {
        const result = await dataGateway.getCurrentProfile(data.session.access_token);
        const p: Profile = result.profile;
        setProfile(p);
        await syncMetadata(p);
      } catch (err) {
        console.error('Error loading profile after sign-in:', err);
        setProfile(null);
      }
    }
    console.log('[Auth] signIn completed - user should be set');
  };

  // ─── signUp ────────────────────────────────────────────────────────────────
  const signUp = async (email: string, password: string, name: string) => {
    await dataGateway.signUp(email, password, name, 'user', '');
    await signIn(email, password);
  };

  // ─── signOut ───────────────────────────────────────────────────────────────
  const signOut = async () => {
    await dataGateway.signOut();
    setUser(null);
    setProfile(null);
  };

  // ─── refreshProfile ────────────────────────────────────────────────────────
  const refreshProfile = async () => {
    const { data } = await dataGateway.supabase.auth.getSession();
    if (data.session?.user) {
      const p = await resolveProfile(data.session.user);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return safe defaults instead of throwing — prevents crashes during
    // HMR, hot-reload races, or any component rendered outside a provider.
    // Note: This should rarely happen in production since AuthProvider wraps
    // the entire router tree via AuthLayout.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[useAuth] Called outside AuthProvider — returning safe defaults');
    }
    return {
      user: null,
      profile: null,
      loading: true,
      signIn: async (_email: string, _password: string) => {},
      signUp: async (_email: string, _password: string, _name: string) => {},
      signOut: async () => {},
      refreshProfile: async () => {},
    };
  }
  return context;
}