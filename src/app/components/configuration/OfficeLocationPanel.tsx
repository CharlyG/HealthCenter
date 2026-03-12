/**
 * Office & Location Configuration Panel
 * 
 * Configure multiple office locations with contact information, timezone, and user/caregiver assignments.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Building2, MapPin, Clock, Phone, Mail, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Office {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  timezone: string;
  contact: {
    phone: string;
    fax?: string;
    email: string;
  };
  status: 'active' | 'inactive';
  assignedUsers: number;
  assignedCaregivers: number;
}

interface OfficeLocationPanelProps {
  onConfigChange: () => void;
}

export default function OfficeLocationPanel({ onConfigChange }: OfficeLocationPanelProps) {
  const [offices, setOffices] = useState<Office[]>([
    {
      id: 'hq',
      name: 'Headquarters - Main Office',
      address: {
        street: '123 Healthcare Blvd',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
      },
      timezone: 'America/Chicago',
      contact: {
        phone: '(555) 123-4567',
        fax: '(555) 123-4568',
        email: 'main@agency.com',
      },
      status: 'active',
      assignedUsers: 45,
      assignedCaregivers: 120,
    },
    {
      id: 'north',
      name: 'North Branch',
      address: {
        street: '456 North Ave',
        city: 'Northfield',
        state: 'IL',
        zip: '60093',
      },
      timezone: 'America/Chicago',
      contact: {
        phone: '(555) 234-5678',
        email: 'north@agency.com',
      },
      status: 'active',
      assignedUsers: 12,
      assignedCaregivers: 35,
    },
    {
      id: 'south',
      name: 'South Branch',
      address: {
        street: '789 South Rd',
        city: 'Carbondale',
        state: 'IL',
        zip: '62901',
      },
      timezone: 'America/Chicago',
      contact: {
        phone: '(555) 345-6789',
        email: 'south@agency.com',
      },
      status: 'active',
      assignedUsers: 8,
      assignedCaregivers: 28,
    },
  ]);

  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [showNewOfficeForm, setShowNewOfficeForm] = useState(false);

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu',
  ];

  const handleDeleteOffice = (officeId: string) => {
    const office = offices.find((o) => o.id === officeId);
    if (office && office.assignedUsers > 0) {
      alert(
        `Cannot delete ${office.name}. ${office.assignedUsers} users and ${office.assignedCaregivers} caregivers are assigned to this office. Please reassign them first.`
      );
      return;
    }
    if (confirm('Are you sure you want to delete this office?')) {
      setOffices(offices.filter((o) => o.id !== officeId));
      onConfigChange();
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Office Locations
            </h2>
            <p className="text-sm text-gray-600">
              Manage multiple office locations and assign users/caregivers
            </p>
          </div>
          <Button size="sm" onClick={() => setShowNewOfficeForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Office
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-700">{offices.length}</div>
            <div className="text-sm text-blue-700">Total Offices</div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-700">
              {offices.reduce((sum, o) => sum + o.assignedUsers, 0)}
            </div>
            <div className="text-sm text-green-700">Total Users</div>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-700">
              {offices.reduce((sum, o) => sum + o.assignedCaregivers, 0)}
            </div>
            <div className="text-sm text-purple-700">Total Caregivers</div>
          </div>
        </div>
      </Card>

      {/* Office List */}
      <div className="space-y-4">
        {offices.map((office) => (
          <Card key={office.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{office.name}</h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      office.status === 'active'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    )}
                  >
                    {office.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingOffice(office)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteOffice(office.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-3">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <div>{office.address.street}</div>
                    <div>
                      {office.address.city}, {office.address.state} {office.address.zip}
                    </div>
                  </div>
                </div>

                {/* Timezone */}
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="text-sm text-gray-700">{office.timezone}</div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                {/* Phone */}
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <div>{office.contact.phone}</div>
                    {office.contact.fax && <div>Fax: {office.contact.fax}</div>}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="text-sm text-gray-700">{office.contact.email}</div>
                </div>

                {/* Assignments */}
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <div>{office.assignedUsers} users assigned</div>
                    <div>{office.assignedCaregivers} caregivers assigned</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Office Dialog */}
      {editingOffice && (
        <OfficeEditDialog
          office={editingOffice}
          timezones={timezones}
          onSave={(updated) => {
            setOffices(offices.map((o) => (o.id === updated.id ? updated : o)));
            setEditingOffice(null);
            onConfigChange();
          }}
          onCancel={() => setEditingOffice(null)}
        />
      )}

      {/* New Office Dialog */}
      {showNewOfficeForm && (
        <OfficeEditDialog
          office={{
            id: `office-${Date.now()}`,
            name: '',
            address: { street: '', city: '', state: '', zip: '' },
            timezone: 'America/Chicago',
            contact: { phone: '', email: '' },
            status: 'active',
            assignedUsers: 0,
            assignedCaregivers: 0,
          }}
          timezones={timezones}
          onSave={(newOffice) => {
            setOffices([...offices, newOffice]);
            setShowNewOfficeForm(false);
            onConfigChange();
          }}
          onCancel={() => setShowNewOfficeForm(false)}
          isNew
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// OFFICE EDIT DIALOG
// ═══════════════════════════════════════════════════════════════════════════

function OfficeEditDialog({
  office,
  timezones,
  onSave,
  onCancel,
  isNew = false,
}: {
  office: Office;
  timezones: string[];
  onSave: (office: Office) => void;
  onCancel: () => void;
  isNew?: boolean;
}) {
  const [editedOffice, setEditedOffice] = useState(office);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {isNew ? 'Add New Office' : 'Edit Office'}
        </h2>

        <div className="space-y-4 mb-6">
          {/* Office Name */}
          <div>
            <Label htmlFor="office-name">Office Name</Label>
            <Input
              id="office-name"
              value={editedOffice.name}
              onChange={(e) => setEditedOffice({ ...editedOffice, name: e.target.value })}
              placeholder="Main Office"
            />
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={editedOffice.address.street}
              onChange={(e) =>
                setEditedOffice({
                  ...editedOffice,
                  address: { ...editedOffice.address, street: e.target.value },
                })
              }
              placeholder="123 Healthcare Blvd"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={editedOffice.address.city}
                onChange={(e) =>
                  setEditedOffice({
                    ...editedOffice,
                    address: { ...editedOffice.address, city: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={editedOffice.address.state}
                onChange={(e) =>
                  setEditedOffice({
                    ...editedOffice,
                    address: { ...editedOffice.address, state: e.target.value },
                  })
                }
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="zip">ZIP</Label>
              <Input
                id="zip"
                value={editedOffice.address.zip}
                onChange={(e) =>
                  setEditedOffice({
                    ...editedOffice,
                    address: { ...editedOffice.address, zip: e.target.value },
                  })
                }
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <Label htmlFor="timezone">Time Zone</Label>
            <select
              id="timezone"
              value={editedOffice.timezone}
              onChange={(e) => setEditedOffice({ ...editedOffice, timezone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Contact */}
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={editedOffice.contact.phone}
              onChange={(e) =>
                setEditedOffice({
                  ...editedOffice,
                  contact: { ...editedOffice.contact, phone: e.target.value },
                })
              }
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="fax">Fax (Optional)</Label>
            <Input
              id="fax"
              value={editedOffice.contact.fax || ''}
              onChange={(e) =>
                setEditedOffice({
                  ...editedOffice,
                  contact: { ...editedOffice.contact, fax: e.target.value },
                })
              }
              placeholder="(555) 123-4568"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={editedOffice.contact.email}
              onChange={(e) =>
                setEditedOffice({
                  ...editedOffice,
                  contact: { ...editedOffice.contact, email: e.target.value },
                })
              }
              placeholder="office@agency.com"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editedOffice)}>
            {isNew ? 'Create Office' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
