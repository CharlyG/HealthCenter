/**
 * Integration Permissions Panel
 * 
 * Role-based access control for integration management including permissions
 * for configuration, logs, testing, and environment mode changes.
 */

import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Shield, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

const PERMISSIONS = [
  { id: 'configure', name: 'Configure Vendors', description: 'Add, edit, and remove vendor configurations' },
  { id: 'view-logs', name: 'View Integration Logs', description: 'Access to all integration logs and history' },
  { id: 'run-tests', name: 'Run Integration Tests', description: 'Execute test connections and actions' },
  { id: 'change-mode', name: 'Change Environment Modes', description: 'Switch between disabled/mock/test/production' },
  { id: 'switch-vendors', name: 'Switch Vendors', description: 'Change active vendor for integration categories' },
  { id: 'view-credentials', name: 'View Credentials', description: 'See unmasked API keys and secrets' },
];

const ROLES = [
  {
    id: 'admin',
    name: 'System Administrator',
    color: 'red',
    permissions: ['configure', 'view-logs', 'run-tests', 'change-mode', 'switch-vendors', 'view-credentials'],
  },
  {
    id: 'integration-manager',
    name: 'Integration Manager',
    color: 'blue',
    permissions: ['configure', 'view-logs', 'run-tests', 'change-mode', 'switch-vendors'],
  },
  {
    id: 'support',
    name: 'Support Staff',
    color: 'green',
    permissions: ['view-logs', 'run-tests'],
  },
  {
    id: 'developer',
    name: 'Developer',
    color: 'purple',
    permissions: ['view-logs', 'run-tests', 'change-mode'],
  },
  {
    id: 'viewer',
    name: 'Viewer',
    color: 'gray',
    permissions: [],
  },
];

export default function IntegrationPermissionsPanel() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Access Control</h2>
            <p className="text-sm text-gray-600">
              Role-based permissions for integration management
            </p>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                  Permission
                </th>
                {ROLES.map((role) => (
                  <th key={role.id} className="text-center py-3 px-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        role.color === 'red'
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : role.color === 'blue'
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : role.color === 'green'
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : role.color === 'purple'
                          ? 'bg-purple-100 text-purple-700 border-purple-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      )}
                    >
                      {role.name}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((permission) => (
                <tr key={permission.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                      <div className="text-xs text-gray-600">{permission.description}</div>
                    </div>
                  </td>
                  {ROLES.map((role) => (
                    <td key={role.id} className="text-center py-3 px-2">
                      {role.permissions.includes(permission.id) ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Users</h3>
            <p className="text-sm text-gray-600">Users with integration management access</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { name: 'John Smith', email: 'john.smith@agency.com', role: 'admin' },
            { name: 'Sarah Johnson', email: 'sarah.j@agency.com', role: 'integration-manager' },
            { name: 'Mike Williams', email: 'mike.w@agency.com', role: 'support' },
          ].map((user, i) => {
            const role = ROLES.find((r) => r.id === user.role)!;
            return (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-600">{user.email}</div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    role.color === 'red'
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : role.color === 'blue'
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-green-100 text-green-700 border-green-300'
                  )}
                >
                  {role.name}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
