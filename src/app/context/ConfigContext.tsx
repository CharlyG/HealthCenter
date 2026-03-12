import React, { createContext, useContext, useEffect, useState } from 'react';
import * as dataGateway from '../lib/dataGateway';
import { useAuth } from './AuthContext';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

interface Feature {
  id: string;
  moduleId: string;
  name: string;
  description: string;
}

interface ModuleSetting {
  org_id: string;
  module_id: string;
  enabled: boolean;
  office_overrides?: Record<string, boolean>;
}

interface FeatureSetting {
  org_id: string;
  feature_id: string;
  enabled: boolean;
  office_overrides?: Record<string, boolean>;
}

interface ConfigContextType {
  modules: Module[];
  features: Feature[];
  moduleSettings: ModuleSetting[];
  featureSettings: FeatureSetting[];
  loading: boolean;
  featuresLoading: boolean;
  isModuleEnabled: (moduleId: string, officeId?: string) => boolean;
  isFeatureEnabled: (featureId: string, officeId?: string) => boolean;
  refreshConfig: () => Promise<void>;
  loadFeatures: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const { profile, user, loading: authLoading } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [moduleSettings, setModuleSettings] = useState<ModuleSetting[]>([]);
  const [featureSettings, setFeatureSettings] = useState<FeatureSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [featuresLoaded, setFeaturesLoaded] = useState(false);

  // PHASE 1: Load only modules and module settings (needed for navigation)
  const loadMinimalConfig = React.useCallback(async () => {
    // Only load config if we have an authenticated user with a profile AND org_id
    if (!user || !profile || !profile.org_id) {
      console.log('[ConfigContext] Skipping config load - waiting for user and profile', { 
        hasUser: !!user, 
        hasProfile: !!profile, 
        hasOrgId: !!profile?.org_id 
      });
      setLoading(false);
      return;
    }

    // Double-check that we have a valid session before attempting any API calls
    try {
      const { data: sessionData, error: sessionError } = await dataGateway.supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) {
        console.log('[ConfigContext] No valid session found, skipping config load');
        setLoading(false);
        return;
      }
    } catch (err) {
      console.log('[ConfigContext] Session check failed, skipping config load');
      setLoading(false);
      return;
    }

    try {
      console.log('[ConfigContext] Loading minimal configuration (modules only) for org:', profile.org_id);

      // Only load modules and module settings for navigation
      const [modulesRes, moduleSettingsRes] = await Promise.all([
        dataGateway.getModules(),
        dataGateway.getModuleSettings(profile.org_id),
      ]);

      setModules(modulesRes.modules || []);
      setModuleSettings(moduleSettingsRes.settings || []);
      console.log('[ConfigContext] Minimal configuration loaded successfully');
    } catch (error: any) {
      // Silently handle all auth-related errors - they trigger redirect via handleAuthError
      if (error?.message === 'No active session' || 
          error?.message?.includes('Authentication failed') ||
          error?.message?.includes('Session error')) {
        console.log('[ConfigContext] Auth error during config load - session will be cleared');
        setLoading(false);
        return;
      }
      // Only log non-auth errors
      console.error('[ConfigContext] Error loading minimal config:', error);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  // PHASE 2: Lazy load features and feature settings (only when needed)
  const loadFeatures = React.useCallback(async () => {
    if (featuresLoaded || featuresLoading || !user || !profile?.org_id) {
      return;
    }

    try {
      setFeaturesLoading(true);
      console.log('[ConfigContext] Lazy loading features for org:', profile.org_id);

      const [featuresRes, featureSettingsRes] = await Promise.all([
        dataGateway.getFeatures(),
        dataGateway.getFeatureSettings(profile.org_id),
      ]);

      setFeatures(featuresRes.features || []);
      setFeatureSettings(featureSettingsRes.settings || []);
      setFeaturesLoaded(true);
      console.log('[ConfigContext] Features loaded successfully');
    } catch (error: any) {
      if (error?.message === 'No active session' || 
          error?.message?.includes('Authentication failed') ||
          error?.message?.includes('Session error')) {
        console.log('[ConfigContext] Auth error during features load');
        return;
      }
      console.error('[ConfigContext] Error loading features:', error);
    } finally {
      setFeaturesLoading(false);
    }
  }, [user, profile, featuresLoaded, featuresLoading]);

  useEffect(() => {
    // Wait for auth to finish loading AND confirm user exists before loading config
    if (authLoading) {
      return;
    }
    
    // If no user after auth loads, don't attempt to load config
    if (!user || !profile?.org_id) {
      setLoading(false);
      return;
    }
    
    // Add a small delay after login to ensure Supabase client has the session
    // This prevents race conditions where ConfigContext tries to load before
    // the session is fully propagated to the Supabase client
    const timer = setTimeout(() => {
      loadMinimalConfig();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [authLoading, loadMinimalConfig, user, profile?.org_id]);

  const isModuleEnabled = (moduleId: string, officeId?: string): boolean => {
    // Admin module is always enabled
    if (moduleId === 'admin') return true;

    const setting = moduleSettings.find(s => s.module_id === moduleId);
    
    if (!setting) {
      // If no setting exists, module is enabled by default
      return true;
    }

    // Check office override if officeId provided
    if (officeId && setting.office_overrides?.[officeId] !== undefined) {
      return setting.office_overrides[officeId];
    }

    // Return org-level setting
    return setting.enabled;
  };

  const isFeatureEnabled = (featureId: string, officeId?: string): boolean => {
    const setting = featureSettings.find(s => s.feature_id === featureId);
    
    if (!setting) {
      // If no setting exists, feature is enabled by default
      return true;
    }

    // Check office override if officeId provided
    if (officeId && setting.office_overrides?.[officeId] !== undefined) {
      return setting.office_overrides[officeId];
    }

    // Return org-level setting
    return setting.enabled;
  };

  const refreshConfig = async () => {
    setLoading(true);
    await loadMinimalConfig();
    // Also reload features if they were already loaded
    if (featuresLoaded) {
      setFeaturesLoaded(false);
      await loadFeatures();
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        modules,
        features,
        moduleSettings,
        featureSettings,
        loading,
        featuresLoading,
        isModuleEnabled,
        isFeatureEnabled,
        refreshConfig,
        loadFeatures,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    // Return safe defaults instead of throwing — prevents crashes during
    // initial render, HMR, or any component rendered before ConfigProvider mounts.
    // Note: This should rarely happen in production since ConfigProvider wraps
    // all authenticated routes via Root component.
    // Silently return defaults - the warning is too noisy during normal auth flow
    return {
      modules: [],
      features: [],
      moduleSettings: [],
      featureSettings: [],
      loading: true,
      featuresLoading: false,
      isModuleEnabled: (_moduleId: string, _officeId?: string) => true,
      isFeatureEnabled: (_featureId: string, _officeId?: string) => true,
      refreshConfig: async () => {},
      loadFeatures: async () => {},
    };
  }
  return context;
}