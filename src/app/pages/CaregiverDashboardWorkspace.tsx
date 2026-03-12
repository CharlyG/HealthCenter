/**
 * Caregiver Dashboard Workspace
 * 
 * Production workspace for caregivers
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import CaregiverDashboard from '../components/caregiver/CaregiverDashboard';

export default function CaregiverDashboardWorkspace() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <CaregiverDashboard
      caregiverId={user.id}
      caregiverName={user.name}
    />
  );
}
