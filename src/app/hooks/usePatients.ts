/**
 * Data Access Layer - Patients
 * Reusable hooks for patient data operations with proper loading, error, and auth states.
 */
import { useState, useEffect, useCallback } from 'react';
import * as dataGateway from '../lib/dataGateway';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  mrn: string;
  office_id: string;
  phone: string;
  address: string;
  status: string;
  email?: string;
  gender?: string;
  ssn?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at?: string;
  office_name?: string;
}

export interface UsePatientListResult {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  search: (query: string, officeId?: string) => Promise<void>;
}

/**
 * Hook for patient list with filtering
 */
export function usePatientList(officeId?: string, status?: string): UsePatientListResult {
  const { profile, isReady } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    if (!isReady || !profile?.org_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await dataGateway.getAllPatients(profile.org_id, officeId, status);
      setPatients(res.patients || []);
    } catch (err: any) {
      console.error('[usePatientList] Error loading patients:', err);
      if (!err.message?.includes('Authentication failed') && 
          !err.message?.includes('No active session')) {
        setError(err.message || 'Failed to load patients');
      }
    } finally {
      setLoading(false);
    }
  }, [isReady, profile?.org_id, officeId, status]);

  const search = useCallback(async (query: string, searchOfficeId?: string) => {
    if (!isReady || !profile?.org_id) return;

    try {
      setLoading(true);
      setError(null);
      const res = await dataGateway.searchPatients(profile.org_id, query, searchOfficeId);
      setPatients(res.patients || []);
    } catch (err: any) {
      console.error('[usePatientList] Error searching patients:', err);
      if (!err.message?.includes('Authentication failed')) {
        setError(err.message || 'Search failed');
        toast.error('Search failed');
      }
    } finally {
      setLoading(false);
    }
  }, [isReady, profile?.org_id]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return {
    patients,
    loading,
    error,
    reload: loadPatients,
    search,
  };
}

export interface UsePatientResult {
  patient: Patient | null;
  loading: boolean;
  error: string | null;
  update: (data: Partial<Patient>) => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * Hook for single patient operations
 */
export function usePatient(patientId?: string): UsePatientResult {
  const { isReady } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatient = useCallback(async () => {
    if (!patientId || patientId === 'new') {
      setLoading(false);
      return;
    }

    if (!isReady) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await dataGateway.getPatientById(patientId);
      setPatient(res.patient);
    } catch (err: any) {
      console.error('[usePatient] Error loading patient:', err);
      if (!err.message?.includes('Authentication failed')) {
        setError(err.message || 'Failed to load patient');
        toast.error('Failed to load patient');
      }
    } finally {
      setLoading(false);
    }
  }, [patientId, isReady]);

  const update = useCallback(async (data: Partial<Patient>) => {
    if (!patientId || !patient) return;

    try {
      const res = await dataGateway.updatePatient(patientId, data);
      setPatient(res.patient);
    } catch (err: any) {
      console.error('[usePatient] Error updating patient:', err);
      throw err;
    }
  }, [patientId, patient]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  return {
    patient,
    loading,
    error,
    update,
    reload: loadPatient,
  };
}

export interface CreatePatientData {
  office_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  mrn: string;
  phone: string;
  address: string;
}

/**
 * Hook for creating patients
 */
export function useCreatePatient() {
  const [creating, setCreating] = useState(false);

  const create = useCallback(async (data: CreatePatientData): Promise<Patient> => {
    try {
      setCreating(true);
      const res = await dataGateway.createPatient(
        data.office_id,
        data.first_name,
        data.last_name,
        data.dob,
        data.mrn,
        data.phone,
        data.address
      );
      return res.patient;
    } catch (err: any) {
      console.error('[useCreatePatient] Error creating patient:', err);
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  return { create, creating };
}
