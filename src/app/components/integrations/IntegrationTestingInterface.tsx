/**
 * Integration Testing Interface
 * 
 * Test integration actions with real-time feedback including request/response
 * payloads, status codes, and execution timestamps.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  Code,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { INTEGRATION_CATEGORIES } from '../../lib/integrationTypes';
import type { IntegrationCardData } from '../../pages/IntegrationManagementWorkspace';

interface TestAction {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface TestResult {
  action: string;
  success: boolean;
  timestamp: string;
  requestPayload: any;
  responsePayload: any;
  statusCode: number;
  responseTime: number;
}

const TEST_ACTIONS: Record<string, TestAction[]> = {
  sms: [
    {
      id: 'send-sms',
      name: 'Send Test SMS',
      description: 'Send a test message to verify SMS delivery',
      category: 'sms',
    },
  ],
  email: [
    {
      id: 'send-email',
      name: 'Send Test Email',
      description: 'Send a test email to verify delivery',
      category: 'email',
    },
  ],
  evv: [
    {
      id: 'transmit-visit',
      name: 'Transmit Test Visit',
      description: 'Submit a test EVV visit record',
      category: 'evv',
    },
    {
      id: 'verify-location',
      name: 'Verify Location',
      description: 'Test GPS location verification',
      category: 'evv',
    },
  ],
  medication: [
    {
      id: 'lookup-drug',
      name: 'Validate Medication Lookup',
      description: 'Search for a test medication',
      category: 'medication',
    },
    {
      id: 'check-interactions',
      name: 'Check Drug Interactions',
      description: 'Test interaction checking between medications',
      category: 'medication',
    },
  ],
  fax: [
    {
      id: 'send-fax',
      name: 'Send Test Fax',
      description: 'Send a test fax document',
      category: 'fax',
    },
  ],
  'push-notifications': [
    {
      id: 'send-push',
      name: 'Send Test Push Notification',
      description: 'Send a test push to a device',
      category: 'push-notifications',
    },
  ],
  'maps-routing': [
    {
      id: 'geocode-address',
      name: 'Geocode Address',
      description: 'Convert test address to coordinates',
      category: 'maps-routing',
    },
    {
      id: 'calculate-route',
      name: 'Calculate Route',
      description: 'Calculate route between two test locations',
      category: 'maps-routing',
    },
  ],
  'electronic-signatures': [
    {
      id: 'create-envelope',
      name: 'Create Test Envelope',
      description: 'Create a test signature request',
      category: 'electronic-signatures',
    },
  ],
};

interface IntegrationTestingInterfaceProps {
  integration: IntegrationCardData;
  onClose: () => void;
}

export default function IntegrationTestingInterface({
  integration,
  onClose,
}: IntegrationTestingInterfaceProps) {
  const category = INTEGRATION_CATEGORIES[integration.category];
  const actions = TEST_ACTIONS[integration.category] || [];

  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

  const runTest = async (action: TestAction) => {
    setRunning(true);

    const startTime = Date.now();

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const success = Math.random() > 0.2;
    const endTime = Date.now();

    const result: TestResult = {
      action: action.name,
      success,
      timestamp: new Date().toISOString(),
      requestPayload: generateMockRequest(action.id),
      responsePayload: generateMockResponse(action.id, success),
      statusCode: success ? 200 : 400,
      responseTime: endTime - startTime,
    };

    setTestResults((prev) => [result, ...prev]);
    setRunning(false);
  };

  const toggleResultExpansion = (index: number) => {
    setExpandedResults((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{category.icon}</span>
            {category.label} Testing
          </DialogTitle>
          <DialogDescription>
            Run test actions to verify {integration.vendor || 'integration'} connectivity
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Test Actions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Available Test Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {actions.map((action) => (
                <Card key={action.id} className="p-4">
                  <h4 className="font-medium text-gray-900 mb-1">{action.name}</h4>
                  <p className="text-xs text-gray-600 mb-3">{action.description}</p>
                  <Button
                    size="sm"
                    onClick={() => runTest(action)}
                    disabled={running}
                    className="w-full"
                  >
                    {running ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-2" />
                        Run Test
                      </>
                    )}
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Test Results</h3>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <TestResultCard
                    key={index}
                    result={result}
                    expanded={expandedResults.has(index)}
                    onToggle={() => toggleResultExpansion(index)}
                  />
                ))}
              </div>
            </div>
          )}

          {testResults.length === 0 && (
            <Card className="p-12 text-center">
              <Code className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No tests run yet. Select an action above to begin.</p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST RESULT CARD
// ═══════════════════════════════════════════════════════════════════════════

function TestResultCard({
  result,
  expanded,
  onToggle,
}: {
  result: TestResult;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card
      className={cn(
        'border-l-4',
        result.success ? 'border-l-green-500' : 'border-l-red-500'
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {result.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <h4 className="font-medium text-gray-900">{result.action}</h4>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  result.success
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-red-100 text-red-700 border-red-300'
                )}
              >
                {result.statusCode}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(result.timestamp).toLocaleTimeString()}
              </div>
              <div>Response time: {result.responseTime}ms</div>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onToggle}>
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3">
            {/* Request Payload */}
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Request Payload</div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(result.requestPayload, null, 2)}
              </pre>
            </div>

            {/* Response Payload */}
            <div>
              <div className="text-xs font-medium text-gray-700 mb-1">Response Payload</div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(result.responsePayload, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

function generateMockRequest(actionId: string): any {
  const requests: Record<string, any> = {
    'send-sms': {
      to: '+15551234567',
      message: 'This is a test SMS from your healthcare platform',
      from: '+15559876543',
    },
    'send-email': {
      to: 'test@example.com',
      subject: 'Test Email from Healthcare Platform',
      body: 'This is a test email to verify email delivery.',
      from: 'noreply@yourplatform.com',
    },
    'transmit-visit': {
      visitId: 'VST-12345',
      caregiverId: 'CG-001',
      patientId: 'PT-001',
      clockIn: '2024-03-10T09:00:00Z',
      clockOut: '2024-03-10T10:00:00Z',
      location: { lat: 42.3601, lng: -71.0589 },
    },
    'lookup-drug': {
      query: 'Lisinopril',
      limit: 10,
    },
    'send-fax': {
      to: '+15551234567',
      documentUrl: 'https://yourplatform.com/docs/test.pdf',
    },
  };

  return requests[actionId] || { test: true };
}

function generateMockResponse(actionId: string, success: boolean): any {
  if (!success) {
    return {
      error: 'Test error',
      message: 'Simulated failure for testing purposes',
      code: 'TEST_ERROR',
    };
  }

  const responses: Record<string, any> = {
    'send-sms': {
      messageId: 'MSG-' + Math.random().toString(36).substr(2, 9),
      status: 'sent',
      timestamp: new Date().toISOString(),
    },
    'send-email': {
      messageId: 'EMAIL-' + Math.random().toString(36).substr(2, 9),
      status: 'delivered',
      timestamp: new Date().toISOString(),
    },
    'transmit-visit': {
      visitId: 'VST-12345',
      status: 'accepted',
      confirmationNumber: 'CONF-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    },
    'lookup-drug': {
      results: [
        {
          ndc: '0000000000',
          name: 'Lisinopril 10mg Tablet',
          manufacturer: 'Test Pharma',
        },
      ],
      count: 1,
    },
    'send-fax': {
      faxId: 'FAX-' + Math.random().toString(36).substr(2, 9),
      status: 'queued',
      timestamp: new Date().toISOString(),
    },
  };

  return responses[actionId] || { success: true };
}
