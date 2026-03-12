import { useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useNavigate } from 'react-router';
import SchedulingWorkspace from './SchedulingWorkspace';

export default function Scheduling() {
  const { isModuleEnabled } = useConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isModuleEnabled('scheduling')) {
      navigate('/module-disabled');
    }
  }, [isModuleEnabled, navigate]);

  return <SchedulingWorkspace />;
}