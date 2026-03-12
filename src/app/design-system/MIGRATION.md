# Migration-Friendly UI Rules

Guidelines to ensure the React UI can migrate from Supabase to .NET 8 API without redesigning screens.

## Overview

The UI should remain stable during backend migration. Do not couple page components directly to Supabase-specific concepts.

## Data Access Abstraction Layer

### ❌ DON'T: Couple to Supabase

```tsx
// BAD: Direct Supabase coupling
import { supabase } from '@/lib/supabase';

function PatientList() {
  const [patients, setPatients] = useState([]);
  
  useEffect(() => {
    // Tightly coupled to Supabase
    supabase
      .from('patients')
      .select('*')
      .eq('status', 'active')
      .then(({ data }) => setPatients(data));
  }, []);
  
  return <PatientTable patients={patients} />;
}
```

### ✅ DO: Use Abstraction Layer

```tsx
// GOOD: Abstracted data access
import { usePatients } from '@/hooks/data/usePatients';

function PatientList() {
  const { patients, loading, error } = usePatients({
    status: 'active'
  });
  
  return <PatientTable patients={patients} loading={loading} />;
}
```

## Data Gateway Pattern

### Structure

```
/src/app/lib/
  /dataGateway/
    index.ts                 # Main gateway export
    patients.ts              # Patient data access
    admissions.ts            # Admission data access
    visits.ts                # Visit data access
    orders.ts                # Order data access
    /implementations/
      supabase/              # Supabase implementation
        patients.ts
        admissions.ts
      dotnet/                # Future .NET implementation
        patients.ts
        admissions.ts
```

### Gateway Interface

```tsx
// /src/app/lib/dataGateway/patients.ts

export interface PatientFilters {
  status?: string;
  branch?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PatientGateway {
  getPatients(filters: PatientFilters): Promise<PaginatedResponse<Patient>>;
  getPatient(id: string): Promise<Patient>;
  createPatient(data: CreatePatientRequest): Promise<Patient>;
  updatePatient(id: string, data: UpdatePatientRequest): Promise<Patient>;
  deletePatient(id: string): Promise<void>;
}
```

### Supabase Implementation

```tsx
// /src/app/lib/dataGateway/implementations/supabase/patients.ts

import { supabase } from '@/lib/supabase';
import type { PatientGateway, PatientFilters } from '../../patients';

export const supabasePatientGateway: PatientGateway = {
  async getPatients(filters: PatientFilters) {
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' });
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
    }
    
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 25;
    const offset = (page - 1) * pageSize;
    
    query = query.range(offset, offset + pageSize - 1);
    
    const { data, count, error } = await query;
    
    if (error) throw new Error(error.message);
    
    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  },
  
  async getPatient(id: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },
  
  async createPatient(data: CreatePatientRequest) {
    const { data: patient, error } = await supabase
      .from('patients')
      .insert(data)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return patient;
  },
  
  async updatePatient(id: string, data: UpdatePatientRequest) {
    const { data: patient, error } = await supabase
      .from('patients')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return patient;
  },
  
  async deletePatient(id: string) {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }
};
```

### Future .NET Implementation

```tsx
// /src/app/lib/dataGateway/implementations/dotnet/patients.ts

import type { PatientGateway, PatientFilters } from '../../patients';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.example.com';

export const dotnetPatientGateway: PatientGateway = {
  async getPatients(filters: PatientFilters) {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.branch) params.append('branch', filters.branch);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    const response = await fetch(`${API_BASE_URL}/api/patients?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch patients: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  async getPatient(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch patient: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  async createPatient(data: CreatePatientRequest) {
    const response = await fetch(`${API_BASE_URL}/api/patients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create patient: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  async updatePatient(id: string, data: UpdatePatientRequest) {
    const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update patient: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  async deletePatient(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete patient: ${response.statusText}`);
    }
  }
};
```

### Gateway Configuration

```tsx
// /src/app/lib/dataGateway/index.ts

import { supabasePatientGateway } from './implementations/supabase/patients';
import { dotnetPatientGateway } from './implementations/dotnet/patients';

// Environment-based selection
const USE_DOTNET_API = import.meta.env.VITE_USE_DOTNET_API === 'true';

export const patientGateway = USE_DOTNET_API
  ? dotnetPatientGateway
  : supabasePatientGateway;

// Or feature flag based
export const getPatientGateway = () => {
  if (featureFlags.useDotNetAPI) {
    return dotnetPatientGateway;
  }
  return supabasePatientGateway;
};
```

## React Hooks Abstraction

### Custom Data Hook

```tsx
// /src/app/hooks/data/usePatients.ts

import { useState, useEffect } from 'react';
import { patientGateway } from '@/lib/dataGateway';
import type { PatientFilters } from '@/lib/dataGateway/patients';

export function usePatients(filters: PatientFilters = {}) {
  const [data, setData] = useState<PaginatedResponse<Patient> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await patientGateway.getPatients(filters);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(filters)]);
  
  return {
    patients: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    loading,
    error
  };
}
```

### Mutation Hook

```tsx
// /src/app/hooks/data/useCreatePatient.ts

import { useState } from 'react';
import { patientGateway } from '@/lib/dataGateway';
import type { CreatePatientRequest } from '@/lib/dataGateway/patients';

export function useCreatePatient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createPatient = async (data: CreatePatientRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const patient = await patientGateway.createPatient(data);
      return patient;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    createPatient,
    loading,
    error
  };
}
```

## Authentication Abstraction

### Auth Interface

```tsx
// /src/app/lib/auth/interface.ts

export interface AuthProvider {
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  refreshSession(): Promise<AuthSession>;
  resetPassword(email: string): Promise<void>;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}
```

### Supabase Auth Implementation

```tsx
// /src/app/lib/auth/implementations/supabase.ts

import { supabase } from '@/lib/supabase';
import type { AuthProvider } from '../interface';

export const supabaseAuth: AuthProvider = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    return {
      user: data.user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at!
    };
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  async getSession() {
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) return null;
    
    return {
      user: data.session.user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at!
    };
  },
  
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    
    return {
      user: data.session!.user,
      accessToken: data.session!.access_token,
      refreshToken: data.session!.refresh_token,
      expiresAt: data.session!.expires_at!
    };
  },
  
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
};
```

### .NET Auth Implementation

```tsx
// /src/app/lib/auth/implementations/dotnet.ts

import type { AuthProvider } from '../interface';

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'https://auth.example.com';

export const dotnetAuth: AuthProvider = {
  async signIn(email: string, password: string) {
    const response = await fetch(`${AUTH_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Sign in failed');
    }
    
    return response.json();
  },
  
  async signOut() {
    const token = getAccessToken();
    
    await fetch(`${AUTH_URL}/api/auth/signout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    clearTokens();
  },
  
  async getSession() {
    const token = getStoredAccessToken();
    if (!token) return null;
    
    try {
      const response = await fetch(`${AUTH_URL}/api/auth/session`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) return null;
      
      return response.json();
    } catch {
      return null;
    }
  },
  
  async refreshSession() {
    const refreshToken = getStoredRefreshToken();
    
    const response = await fetch(`${AUTH_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh session');
    }
    
    const session = await response.json();
    storeTokens(session);
    
    return session;
  },
  
  async resetPassword(email: string) {
    await fetch(`${AUTH_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  }
};
```

## Migration Checklist

### Before Migration

- [ ] All data access uses gateway pattern
- [ ] No direct Supabase imports in components
- [ ] Auth abstracted behind interface
- [ ] Permissions logic abstracted
- [ ] Integration behaviors abstracted
- [ ] Environment variables configured
- [ ] Feature flags ready

### During Migration

- [ ] Implement .NET gateway
- [ ] Test gateway parity
- [ ] Deploy .NET API
- [ ] Enable feature flag
- [ ] Monitor errors
- [ ] Gradual rollout
- [ ] Verify functionality

### After Migration

- [ ] Remove Supabase implementation
- [ ] Update documentation
- [ ] Clean up old code
- [ ] Remove unused dependencies
- [ ] Update environment configs

## Best Practices

### DO ✅

- Use data gateway pattern
- Abstract authentication
- Abstract permissions
- Use environment variables
- Implement feature flags
- Test both implementations
- Document migration path
- Keep interfaces stable
- Version APIs properly

### DON'T ❌

- Import Supabase in components
- Couple to backend specifics
- Hardcode API endpoints
- Skip abstraction layer
- Forget error handling
- Mix implementations
- Break contracts
- Rush migration
- Skip testing

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
