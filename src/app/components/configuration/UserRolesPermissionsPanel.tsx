/**
 * User Roles & Permissions Panel
 * 
 * Configure custom roles and granular permission sets.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Users, Shield, Plus, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const PERMISSIONS = [
  { id: 'view-patients', category: 'Clinical', name: 'View Patients' },
  { id: 'edit-patients', category: 'Clinical', name: 'Edit Patients' },
  { id: 'create-visits', category: 'Clinical', name: 'Create Visits' },
  { id: 'complete-visits', category: 'Clinical', name: 'Complete Visits' },
  { id: 'view-schedule', category: 'Operations', name: 'View Schedule' },
  { id: 'edit-schedule', category: 'Operations', name: 'Edit Schedule' },
  { id: 'manage-caregivers', category: 'Operations', name: 'Manage Caregivers' },
  { id: 'qa-review', category: 'Compliance', name: 'QA Review' },
  { id: 'view-billing', category: 'Billing', name: 'View Billing' },
  { id: 'submit-claims', category: 'Billing', name: 'Submit Claims' },
  { id: 'system-config', category: 'Admin', name: 'System Configuration' },
];

export default function UserRolesPermissionsPanel({ onConfigChange }: { onConfigChange: () => void }) {
  const [roles, setRoles] = useState([
    { id: 'admin', name: 'Administrator', userCount: 3, permissions: PERMISSIONS.map((p) => p.id), color: 'red' },
    { id: 'clinician', name: 'Clinician', userCount: 45, permissions: ['view-patients', 'edit-patients', 'create-visits', 'complete-visits'], color: 'blue' },
    { id: 'scheduler', name: 'Scheduler', userCount: 8, permissions: ['view-patients', 'view-schedule', 'edit-schedule'], color: 'green' },
    { id: 'qa', name: 'QA Reviewer', userCount: 5, permissions: ['view-patients', 'qa-review'], color: 'purple' },
  ]);

  const [selectedRole, setSelectedRole] = useState(roles[0]);

  const handlePermissionToggle = (permId: string) => {
    const updated = {
      ...selectedRole,
      permissions: selectedRole.permissions.includes(permId)
        ? selectedRole.permissions.filter((p) => p !== permId)
        : [...selectedRole.permissions, permId],
    };
    setSelectedRole(updated);
    setRoles(roles.map((r) => (r.id === updated.id ? updated : r)));
    onConfigChange();
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Role List */}
      <Card className="p-4 col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Roles</h3>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        <div className="space-y-2">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={cn(
                'w-full text-left p-3 rounded-lg transition-colors',
                selectedRole.id === role.id ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
              )}
            >
              <div className="font-medium text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {role.name}
              </div>
              <div className="text-xs text-gray-600 mt-1">{role.userCount} users</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Permissions Grid */}
      <Card className="p-6 col-span-2">
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            {selectedRole.name} Permissions
          </h3>
          <p className="text-sm text-gray-600">
            {selectedRole.permissions.length} of {PERMISSIONS.length} permissions enabled
          </p>
        </div>

        {['Clinical', 'Operations', 'Compliance', 'Billing', 'Admin'].map((category) => {
          const categoryPerms = PERMISSIONS.filter((p) => p.category === category);
          if (categoryPerms.length === 0) return null;

          return (
            <div key={category} className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
              <div className="space-y-2">
                {categoryPerms.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {selectedRole.permissions.includes(perm.id) ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                      <span className="text-sm text-gray-900">{perm.name}</span>
                    </div>
                    <Switch
                      checked={selectedRole.permissions.includes(perm.id)}
                      onCheckedChange={() => handlePermissionToggle(perm.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
