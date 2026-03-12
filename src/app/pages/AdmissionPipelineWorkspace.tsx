/**
 * Admission Pipeline Workspace
 * 
 * Production-ready workspace for intake coordinators
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useConfig } from '../context/ConfigContext';
import AdmissionPipeline from '../components/admission/AdmissionPipeline';

export default function AdmissionPipelineWorkspace() {
  const { isModuleEnabled } = useConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isModuleEnabled('admissions')) {
      navigate('/module-disabled');
    }
  }, [isModuleEnabled, navigate]);

  return <AdmissionPipeline />;
}
