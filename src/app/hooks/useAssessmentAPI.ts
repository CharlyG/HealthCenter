/**
 * Clinical Assessment API Hook
 * React hook for interacting with assessment backend
 */

import { useState } from 'react';
import { useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import type { AssessmentInstance } from '../components/clinical-assessment/types';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-845bc545`;

interface UseAssessmentAPIReturn {
  loading: boolean;
  error: string | null;
  createAssessment: (data: {
    type: string;
    patientId: string;
    patientName: string;
    admissionId: string;
    episodeId?: string;
    clinicianId: string;
    clinicianName: string;
  }) => Promise<AssessmentInstance | null>;
  getAssessment: (id: string) => Promise<AssessmentInstance | null>;
  updateAssessment: (id: string, data: { data: Record<string, any>; sectionProgress?: Record<string, string> }) => Promise<AssessmentInstance | null>;
  submitAssessment: (id: string, data: Record<string, any>) => Promise<AssessmentInstance | null>;
  getPatientAssessments: (patientId: string) => Promise<AssessmentInstance[]>;
  getAdmissionAssessments: (admissionId: string) => Promise<AssessmentInstance[]>;
  listAssessments: (filters?: { status?: string; type?: string; clinicianId?: string }) => Promise<AssessmentInstance[]>;
  deleteAssessment: (id: string) => Promise<boolean>;
  signAssessment: (id: string, data: {
    signedBy: string;
    signedByRole: string;
    signature: string;
    ipAddress?: string;
  }) => Promise<any>;
  submitQAReview: (id: string, data: {
    reviewerId: string;
    reviewerName: string;
    status: 'approved' | 'rejected';
    comments?: string;
    issues?: Array<{
      sectionId: string;
      questionId: string;
      issue: string;
      severity: 'critical' | 'warning' | 'info';
    }>;
  }) => Promise<any>;
}

export function useAssessmentAPI(): UseAssessmentAPIReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('[Assessment API] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAssessment = useCallback(async (data: {
    type: string;
    patientId: string;
    patientName: string;
    admissionId: string;
    episodeId?: string;
    clinicianId: string;
    clinicianName: string;
  }): Promise<AssessmentInstance | null> => {
    try {
      const result = await apiRequest('/assessments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result.assessment;
    } catch (err) {
      return null;
    }
  }, [apiRequest]);

  const getAssessment = useCallback(async (id: string): Promise<AssessmentInstance | null> => {
    try {
      const result = await apiRequest(`/assessments/${id}`);
      return result.assessment;
    } catch (err) {
      return null;
    }
  }, [apiRequest]);

  const updateAssessment = useCallback(async (
    id: string,
    data: { data: Record<string, any>; sectionProgress?: Record<string, string> }
  ): Promise<AssessmentInstance | null> => {
    try {
      const result = await apiRequest(`/assessments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return result.assessment;
    } catch (err) {
      return null;
    }
  }, [apiRequest]);

  const submitAssessment = useCallback(async (
    id: string,
    data: Record<string, any>
  ): Promise<AssessmentInstance | null> => {
    try {
      const result = await apiRequest(`/assessments/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ data }),
      });
      return result.assessment;
    } catch (err) {
      return null;
    }
  }, [apiRequest]);

  const getPatientAssessments = useCallback(async (patientId: string): Promise<AssessmentInstance[]> => {
    try {
      const result = await apiRequest(`/patients/${patientId}/assessments`);
      return result.assessments || [];
    } catch (err) {
      return [];
    }
  }, [apiRequest]);

  const getAdmissionAssessments = useCallback(async (admissionId: string): Promise<AssessmentInstance[]> => {
    try {
      const result = await apiRequest(`/admissions/${admissionId}/assessments`);
      return result.assessments || [];
    } catch (err) {
      return [];
    }
  }, [apiRequest]);

  const listAssessments = useCallback(async (filters?: {
    status?: string;
    type?: string;
    clinicianId?: string;
  }): Promise<AssessmentInstance[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.clinicianId) params.append('clinicianId', filters.clinicianId);

      const query = params.toString();
      const endpoint = query ? `/assessments?${query}` : '/assessments';

      const result = await apiRequest(endpoint);
      return result.assessments || [];
    } catch (err) {
      return [];
    }
  }, [apiRequest]);

  const deleteAssessment = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiRequest(`/assessments/${id}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      return false;
    }
  }, [apiRequest]);

  const signAssessment = useCallback(async (id: string, data: {
    signedBy: string;
    signedByRole: string;
    signature: string;
    ipAddress?: string;
  }): Promise<any> => {
    try {
      const result = await apiRequest(`/assessments/${id}/sign`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result;
    } catch (err) {
      return null;
    }
  }, [apiRequest]);

  const submitQAReview = useCallback(async (id: string, data: {
    reviewerId: string;
    reviewerName: string;
    status: 'approved' | 'rejected';
    comments?: string;
    issues?: Array<{
      sectionId: string;
      questionId: string;
      issue: string;
      severity: 'critical' | 'warning' | 'info';
    }>;
  }): Promise<any> => {
    try {
      const result = await apiRequest(`/assessments/${id}/qa-review`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result;
    } catch (err) {
      return null;
    }
  }, [apiRequest]);

  return {
    loading,
    error,
    createAssessment,
    getAssessment,
    updateAssessment,
    submitAssessment,
    getPatientAssessments,
    getAdmissionAssessments,
    listAssessments,
    deleteAssessment,
    signAssessment,
    submitQAReview,
  };
}