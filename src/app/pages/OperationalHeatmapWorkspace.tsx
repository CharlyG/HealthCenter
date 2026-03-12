/**
 * Operational Heatmap Workspace
 * 
 * Production workspace for operational heatmap analytics
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useConfig } from '../context/ConfigContext';
import OperationalHeatmap from '../components/heatmap/OperationalHeatmap';

export default function OperationalHeatmapWorkspace() {
  const { isModuleEnabled } = useConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isModuleEnabled('analytics')) {
      navigate('/module-disabled');
    }
  }, [isModuleEnabled, navigate]);

  return <OperationalHeatmap />;
}
