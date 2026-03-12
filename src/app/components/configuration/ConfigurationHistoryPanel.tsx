/**
 * Configuration History Panel
 * 
 * Audit log of all platform configuration changes with rollback capability.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { History, RotateCcw, User, Clock, FileText } from 'lucide-react';

interface ConfigChange {
  id: string;
  timestamp: string;
  user: string;
  section: string;
  action: string;
  details: string;
  canRollback: boolean;
}

export default function ConfigurationHistoryPanel() {
  const [history] = useState<ConfigChange[]>([
    {
      id: 'ch-001',
      timestamp: '2024-03-10T14:30:00Z',
      user: 'John Smith',
      section: 'Module Management',
      action: 'Enabled Module',
      details: 'Enabled "Billing Workspace" module',
      canRollback: true,
    },
    {
      id: 'ch-002',
      timestamp: '2024-03-10T13:15:00Z',
      user: 'Sarah Johnson',
      section: 'Clinical Settings',
      action: 'Changed Setting',
      details: 'Enabled "Require Supervisor Review"',
      canRollback: true,
    },
    {
      id: 'ch-003',
      timestamp: '2024-03-10T11:00:00Z',
      user: 'John Smith',
      section: 'Feature Flags',
      action: 'Toggled Feature',
      details: 'Enabled "AI-Assisted Documentation" (Beta)',
      canRollback: true,
    },
    {
      id: 'ch-004',
      timestamp: '2024-03-09T16:45:00Z',
      user: 'Mike Williams',
      section: 'Scheduling Settings',
      action: 'Changed Setting',
      details: 'Set "Max Daily Visits" to 8',
      canRollback: true,
    },
    {
      id: 'ch-005',
      timestamp: '2024-03-09T14:20:00Z',
      user: 'Sarah Johnson',
      section: 'Roles & Permissions',
      action: 'Modified Role',
      details: 'Updated "Clinician" role permissions',
      canRollback: false,
    },
  ]);

  const handleRollback = (changeId: string) => {
    if (confirm('Are you sure you want to rollback this configuration change?')) {
      console.log('Rolling back:', changeId);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Configuration History
            </h2>
            <p className="text-sm text-gray-600">
              Complete audit trail of platform configuration changes
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
            {history.length} changes logged
          </Badge>
        </div>

        <div className="space-y-3">
          {history.map((change) => (
            <Card key={change.id} className="p-4 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {change.section}
                    </Badge>
                    <span className="font-medium text-gray-900">{change.action}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{change.details}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {change.user}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(change.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                {change.canRollback && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRollback(change.id)}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Rollback
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
