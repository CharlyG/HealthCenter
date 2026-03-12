/**
 * Permission Matrix Panel
 * 
 * Visual matrix interface for configuring role-based permissions across all modules and actions.
 * Provides clear overview of system access control.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  color: string;
}

interface Permission {
  id: string;
  category: string;
  name: string;
  description: string;
}

interface PermissionMatrixPanelProps {
  onConfigChange: () => void;
}

export default function PermissionMatrixPanel({ onConfigChange }: PermissionMatrixPanelProps) {
  const [roles, setRoles] = useState<Role[]>([
    { id: 'admin', name: 'Administrator', description: 'Full system access', userCount: 3, color: 'red' },
    { id: 'scheduler', name: 'Scheduler', description: 'Schedule management', userCount: 8, color: 'blue' },
    { id: 'clinician', name: 'Clinician', description: 'Clinical documentation', userCount: 45, color: 'green' },
    { id: 'qa', name: 'QA Reviewer', description: 'Quality assurance', userCount: 5, color: 'purple' },
    { id: 'billing', name: 'Billing Specialist', description: 'Billing operations', userCount: 6, color: 'amber' },
  ]);

  const [permissions] = useState<Permission[]>([
    // Clinical
    { id: 'view-patients', category: 'Clinical', name: 'View Patient Records', description: 'View patient demographics and clinical data' },
    { id: 'edit-patients', category: 'Clinical', name: 'Edit Patient Records', description: 'Modify patient information' },
    { id: 'create-documentation', category: 'Clinical', name: 'Create Documentation', description: 'Create visit notes and assessments' },
    { id: 'sign-documentation', category: 'Clinical', name: 'Sign Documentation', description: 'Electronically sign clinical documents' },
    
    // Scheduling
    { id: 'view-schedule', category: 'Scheduling', name: 'View Schedule', description: 'View visit schedules' },
    { id: 'edit-schedule', category: 'Scheduling', name: 'Edit Schedule', description: 'Create and modify visit schedules' },
    { id: 'assign-caregivers', category: 'Scheduling', name: 'Assign Caregivers', description: 'Assign caregivers to visits' },
    
    // QA & Compliance
    { id: 'view-qa-queue', category: 'QA & Compliance', name: 'View QA Queue', description: 'View documents pending review' },
    { id: 'approve-qa-reviews', category: 'QA & Compliance', name: 'Approve QA Reviews', description: 'Approve or reject clinical documentation' },
    { id: 'return-for-correction', category: 'QA & Compliance', name: 'Return for Correction', description: 'Return documents to clinicians for revision' },
    
    // Billing
    { id: 'view-billing', category: 'Billing', name: 'View Billing Data', description: 'View claims and billing information' },
    { id: 'submit-claims', category: 'Billing', name: 'Submit Claims', description: 'Submit claims to payers' },
    { id: 'adjust-billing', category: 'Billing', name: 'Adjust Billing', description: 'Make billing adjustments and corrections' },
    
    // Operations
    { id: 'manage-caregivers', category: 'Operations', name: 'Manage Caregivers', description: 'Add, edit, and deactivate caregivers' },
    { id: 'manage-credentials', category: 'Operations', name: 'Manage Credentials', description: 'Update caregiver licenses and certifications' },
    { id: 'view-analytics', category: 'Operations', name: 'View Analytics', description: 'Access business intelligence dashboards' },
    
    // Integrations & Configuration
    { id: 'configure-integrations', category: 'Integrations & Configuration', name: 'Configure Integrations', description: 'Manage external system integrations' },
    { id: 'system-configuration', category: 'Integrations & Configuration', name: 'System Configuration', description: 'Access platform configuration center' },
    
    // HR & Admin
    { id: 'manage-hr-data', category: 'HR & Admin', name: 'Manage HR Data', description: 'Access payroll and HR information' },
    { id: 'manage-users', category: 'HR & Admin', name: 'Manage Users', description: 'Create and manage user accounts' },
    { id: 'manage-roles', category: 'HR & Admin', name: 'Manage Roles', description: 'Create and configure user roles' },
  ]);

  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, Record<string, boolean>>>({
    admin: Object.fromEntries(permissions.map((p) => [p.id, true])),
    scheduler: {
      'view-patients': true,
      'view-schedule': true,
      'edit-schedule': true,
      'assign-caregivers': true,
      'view-analytics': true,
    },
    clinician: {
      'view-patients': true,
      'edit-patients': true,
      'create-documentation': true,
      'sign-documentation': true,
      'view-schedule': true,
    },
    qa: {
      'view-patients': true,
      'view-qa-queue': true,
      'approve-qa-reviews': true,
      'return-for-correction': true,
    },
    billing: {
      'view-patients': true,
      'view-billing': true,
      'submit-claims': true,
      'adjust-billing': true,
    },
  });

  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const togglePermission = (roleId: string, permissionId: string) => {
    setPermissionMatrix({
      ...permissionMatrix,
      [roleId]: {
        ...permissionMatrix[roleId],
        [permissionId]: !permissionMatrix[roleId]?.[permissionId],
      },
    });
    onConfigChange();
  };

  const getPermissionCount = (roleId: string) => {
    return Object.values(permissionMatrix[roleId] || {}).filter(Boolean).length;
  };

  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Permission Matrix
            </h2>
            <p className="text-sm text-gray-600">
              Configure role-based access control across all modules
            </p>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {roles.map((role) => {
            const permCount = getPermissionCount(role.id);
            return (
              <div key={role.id} className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="font-semibold text-gray-900">{role.name}</div>
                <div className="text-xs text-gray-600 mt-1">{role.userCount} users</div>
                <div className="text-sm font-medium text-blue-600 mt-2">
                  {permCount}/{permissions.length}
                </div>
                <div className="text-xs text-gray-600">permissions</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Permission Matrix Table */}
      <Card className="p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-semibold text-gray-900 sticky left-0 bg-white z-10">
                Permission
              </th>
              {roles.map((role) => (
                <th key={role.id} className="p-3 text-center">
                  <div className="font-semibold text-gray-900">{role.name}</div>
                  <div className="text-xs text-gray-600 font-normal">{role.userCount} users</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const categoryPerms = permissions.filter((p) => p.category === category);
              return (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr className="bg-gray-100">
                    <td
                      colSpan={roles.length + 1}
                      className="p-3 font-semibold text-gray-900 text-sm"
                    >
                      {category}
                    </td>
                  </tr>

                  {/* Permissions */}
                  {categoryPerms.map((permission) => (
                    <tr key={permission.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 sticky left-0 bg-white">
                        <div className="font-medium text-gray-900 text-sm">
                          {permission.name}
                        </div>
                        <div className="text-xs text-gray-600">{permission.description}</div>
                      </td>
                      {roles.map((role) => {
                        const hasPermission = permissionMatrix[role.id]?.[permission.id];
                        return (
                          <td key={role.id} className="p-3 text-center">
                            <button
                              onClick={() => togglePermission(role.id, permission.id)}
                              className={cn(
                                'inline-flex items-center justify-center w-8 h-8 rounded transition-colors',
                                hasPermission
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              )}
                            >
                              {hasPermission ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <XCircle className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Role Management */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Manage Roles</h3>
        <div className="space-y-3">
          {roles.map((role) => (
            <Card key={role.id} className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{role.name}</div>
                  <div className="text-sm text-gray-600">{role.description}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {getPermissionCount(role.id)} permissions • {role.userCount} users
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRole(role)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {role.id !== 'admin' && (
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Fix for React Fragment
import React from 'react';
