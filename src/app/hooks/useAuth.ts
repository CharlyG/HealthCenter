/**
 * useAuth Hook
 * Provides authentication state and ensures auth is ready before data operations.
 * This hook should be used by all data hooks to ensure session is valid.
 */
import { useAuth as useAuthContext } from '../context/AuthContext';

export interface AuthState {
  user: any | null;
  profile: {
    id: string;
    email: string;
    name: string;
    role: string;
    org_id: string;
    office_ids: string[];
  } | null;
  loading: boolean;
  isReady: boolean;
}

export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
} {
  const context = useAuthContext();
  
  return {
    ...context,
    // isReady = auth loading is complete AND we have a valid session
    isReady: !context.loading && !!context.user && !!context.profile?.org_id,
  };
}
