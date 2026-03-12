/**
 * Care Operations Command Center Workspace
 * 
 * Production workspace for operations managers
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useConfig } from '../context/ConfigContext';
import CareOpsCommandCenter from '../components/command-center/CareOpsCommandCenter';

export default function CareOpsCommandCenterWorkspace() {
  const { isModuleEnabled } = useConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isModuleEnabled('operations')) {
      navigate('/module-disabled');
    }
  }, [isModuleEnabled, navigate]);

  return <CareOpsCommandCenter />;
}
