/**
 * Vendor Switching Workflow
 * 
 * Guided workflow for switching integration vendors with impact warnings,
 * configuration migration, and pre-activation testing.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  XCircle,
  Shield,
  Play,
  Loader2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { INTEGRATION_CATEGORIES, VENDORS } from '../../lib/integrationTypes';
import type { IntegrationCategory, VendorId } from '../../lib/integrationTypes';

interface VendorSwitchingWorkflowProps {
  category: IntegrationCategory;
  currentVendorId: VendorId;
  newVendorId: VendorId;
  onClose: () => void;
  onComplete: () => void;
}

type WorkflowStep = 'review' | 'configure' | 'test' | 'activate';

export default function VendorSwitchingWorkflow({
  category,
  currentVendorId,
  newVendorId,
  onClose,
  onComplete,
}: VendorSwitchingWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('review');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failure'>('idle');
  const [configComplete, setConfigComplete] = useState(false);

  const categoryConfig = INTEGRATION_CATEGORIES[category];
  const currentVendor = VENDORS[currentVendorId];
  const newVendor = VENDORS[newVendorId];

  const impactAreas = [
    {
      area: 'Active Workflows',
      impact: 'high',
      description: 'All active processes using this integration will be affected',
      affectedItems: ['24 pending EVV transmissions', '12 scheduled notifications', '3 active fax jobs'],
    },
    {
      area: 'Historical Data',
      impact: 'medium',
      description: 'Historical logs and records will remain with the previous vendor',
      affectedItems: ['2,450 historical transactions', '180 days of log data'],
    },
    {
      area: 'API Configuration',
      impact: 'high',
      description: 'New API endpoints and credentials must be configured',
      affectedItems: ['API endpoint URL', 'Authentication credentials', 'Webhook callbacks'],
    },
    {
      area: 'Data Migration',
      impact: 'low',
      description: 'No automatic data migration between vendors',
      affectedItems: ['Manual export required if needed'],
    },
  ];

  const configRequirements = [
    { field: 'API Endpoint', required: true, configured: configComplete },
    { field: 'API Key', required: true, configured: configComplete },
    { field: 'API Secret', required: true, configured: configComplete },
    { field: 'Account ID', required: true, configured: configComplete },
    { field: 'Webhook URL', required: false, configured: false },
  ];

  const handleTest = async () => {
    setTestStatus('testing');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTestStatus(Math.random() > 0.3 ? 'success' : 'failure');
  };

  const handleActivate = () => {
    // In production, activate the new vendor
    onComplete();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Switch Vendor - {categoryConfig.label}
          </DialogTitle>
          <DialogDescription>
            Change from {currentVendor.name} to {newVendor.name}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {(['review', 'configure', 'test', 'activate'] as WorkflowStep[]).map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                    currentStep === step
                      ? 'bg-blue-600 text-white'
                      : index <
                        (['review', 'configure', 'test', 'activate'] as WorkflowStep[]).indexOf(
                          currentStep
                        )
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {index <
                  (['review', 'configure', 'test', 'activate'] as WorkflowStep[]).indexOf(
                    currentStep
                  ) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="text-xs mt-1 capitalize font-medium">{step}</div>
              </div>
              {index < 3 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-2',
                    index <
                      (['review', 'configure', 'test', 'activate'] as WorkflowStep[]).indexOf(
                        currentStep
                      )
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          {/* Step 1: Review */}
          {currentStep === 'review' && (
            <>
              {/* Vendor Comparison */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Vendor Comparison</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Current Vendor */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <Badge variant="outline" className="mb-2">
                        Current
                      </Badge>
                      <h4 className="font-semibold text-gray-900">{currentVendor.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{currentVendor.description}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tier:</span>
                        <span className="font-medium capitalize">{currentVendor.tier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Popularity:</span>
                        <span className="text-amber-600">{'★'.repeat(currentVendor.popularity)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Setup Time:</span>
                        <span className="font-medium">{currentVendor.estimatedSetupTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-8 h-8 text-blue-600" />
                  </div>

                  {/* New Vendor */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 mb-2">
                        New
                      </Badge>
                      <h4 className="font-semibold text-gray-900">{newVendor.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{newVendor.description}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tier:</span>
                        <span className="font-medium capitalize">{newVendor.tier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Popularity:</span>
                        <span className="text-amber-600">{'★'.repeat(newVendor.popularity)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Setup Time:</span>
                        <span className="font-medium">{newVendor.estimatedSetupTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Impact Analysis */}
              <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">Impact Analysis</h3>
                    <p className="text-sm text-amber-800">
                      Switching vendors will affect existing workflows and require reconfiguration
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {impactAreas.map((item) => (
                    <div
                      key={item.area}
                      className="bg-white rounded-lg p-3 border border-amber-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{item.area}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            item.impact === 'high'
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : item.impact === 'medium'
                              ? 'bg-amber-100 text-amber-700 border-amber-300'
                              : 'bg-blue-100 text-blue-700 border-blue-300'
                          )}
                        >
                          {item.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                      <ul className="space-y-1">
                        {item.affectedItems.map((affectedItem, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-400 rounded-full" />
                            {affectedItem}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* Step 2: Configure */}
          {currentStep === 'configure' && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Configuration Requirements</h3>
              <div className="space-y-3 mb-4">
                {configRequirements.map((req) => (
                  <div
                    key={req.field}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{req.field}</span>
                      {req.required && (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    {req.configured ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                ))}
              </div>

              {!configComplete && (
                <Button onClick={() => setConfigComplete(true)} className="w-full">
                  Complete Configuration
                </Button>
              )}
            </Card>
          )}

          {/* Step 3: Test */}
          {currentStep === 'test' && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Test New Vendor</h3>
              <p className="text-sm text-gray-600 mb-4">
                Run a test connection to verify the new vendor configuration before activating
              </p>

              {testStatus === 'idle' && (
                <Button onClick={handleTest} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Run Test Connection
                </Button>
              )}

              {testStatus === 'testing' && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              )}

              {testStatus === 'success' && (
                <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">Test Successful</h4>
                      <p className="text-sm text-green-700">
                        Connection to {newVendor.name} verified successfully. Ready to activate.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {testStatus === 'failure' && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-700 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">Test Failed</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Unable to connect to {newVendor.name}. Please verify your configuration.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStep('configure')}
                      >
                        Back to Configuration
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Step 4: Activate */}
          {currentStep === 'activate' && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Activate New Vendor</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Ready to Activate</h4>
                      <p className="text-sm text-blue-700 mb-2">
                        {newVendor.name} has been configured and tested successfully. Activating
                        will immediately switch all {categoryConfig.label} operations to the new
                        vendor.
                      </p>
                      <ul className="space-y-1 text-xs text-blue-700">
                        <li className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Configuration complete
                        </li>
                        <li className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Test connection successful
                        </li>
                        <li className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Ready for production use
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900 mb-1">Rollback Available</h4>
                      <p className="text-sm text-amber-700">
                        If issues occur, you can immediately switch back to {currentVendor.name}
                        from the integration management dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {currentStep !== 'review' && (
              <Button
                variant="outline"
                onClick={() => {
                  const steps: WorkflowStep[] = ['review', 'configure', 'test', 'activate'];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex > 0) {
                    setCurrentStep(steps[currentIndex - 1]);
                  }
                }}
              >
                Back
              </Button>
            )}

            {currentStep === 'review' && (
              <Button onClick={() => setCurrentStep('configure')}>Continue to Configuration</Button>
            )}

            {currentStep === 'configure' && (
              <Button onClick={() => setCurrentStep('test')} disabled={!configComplete}>
                Continue to Testing
              </Button>
            )}

            {currentStep === 'test' && (
              <Button onClick={() => setCurrentStep('activate')} disabled={testStatus !== 'success'}>
                Continue to Activation
              </Button>
            )}

            {currentStep === 'activate' && (
              <Button onClick={handleActivate} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate {newVendor.name}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
