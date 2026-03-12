/**
 * Scheduling Settings Panel
 * 
 * Configure scheduling rules, optimization, and validation settings.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Calendar, Clock, Route, Users } from 'lucide-react';

export default function SchedulingSettingsPanel({ onConfigChange }: { onConfigChange: () => void }) {
  const [settings, setSettings] = useState({
    enableRouteOptimization: true,
    maxDailyVisits: 8,
    minTimeBetweenVisits: 30,
    allowOverlappingVisits: false,
    requireSkillMatch: true,
    autoAssignCaregivers: false,
    sendScheduleReminders: true,
    reminderHoursBefore: 24,
    enforcePreferredCaregivers: true,
    allowWeekendScheduling: true,
  });

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
    onConfigChange();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Scheduling Rules
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Label className="flex-1">Max Daily Visits per Caregiver:</Label>
            <Input
              type="number"
              value={settings.maxDailyVisits}
              onChange={(e) => handleChange('maxDailyVisits', parseInt(e.target.value))}
              className="w-24"
            />
          </div>

          <div className="flex items-center gap-3">
            <Label className="flex-1">Min Time Between Visits (minutes):</Label>
            <Input
              type="number"
              value={settings.minTimeBetweenVisits}
              onChange={(e) => handleChange('minTimeBetweenVisits', parseInt(e.target.value))}
              className="w-24"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Overlapping Visits</Label>
              <p className="text-sm text-gray-600">Permit concurrent visit assignments</p>
            </div>
            <Switch
              checked={settings.allowOverlappingVisits}
              onCheckedChange={(v) => handleChange('allowOverlappingVisits', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Require Skill Match</Label>
              <p className="text-sm text-gray-600">Match caregiver discipline to visit type</p>
            </div>
            <Switch
              checked={settings.requireSkillMatch}
              onCheckedChange={(v) => handleChange('requireSkillMatch', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Weekend Scheduling</Label>
              <p className="text-sm text-gray-600">Enable Saturday and Sunday visits</p>
            </div>
            <Switch
              checked={settings.allowWeekendScheduling}
              onCheckedChange={(v) => handleChange('allowWeekendScheduling', v)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Route className="w-5 h-5 text-green-600" />
          Optimization
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Route Optimization</Label>
              <p className="text-sm text-gray-600">Optimize visit sequence by geography</p>
            </div>
            <Switch
              checked={settings.enableRouteOptimization}
              onCheckedChange={(v) => handleChange('enableRouteOptimization', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Assign Caregivers</Label>
              <p className="text-sm text-gray-600">Automatically suggest caregiver assignments</p>
            </div>
            <Switch
              checked={settings.autoAssignCaregivers}
              onCheckedChange={(v) => handleChange('autoAssignCaregivers', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enforce Preferred Caregivers</Label>
              <p className="text-sm text-gray-600">Prioritize patient caregiver preferences</p>
            </div>
            <Switch
              checked={settings.enforcePreferredCaregivers}
              onCheckedChange={(v) => handleChange('enforcePreferredCaregivers', v)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Reminders
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Send Schedule Reminders</Label>
              <p className="text-sm text-gray-600">Notify caregivers of upcoming visits</p>
            </div>
            <Switch
              checked={settings.sendScheduleReminders}
              onCheckedChange={(v) => handleChange('sendScheduleReminders', v)}
            />
          </div>

          {settings.sendScheduleReminders && (
            <div className="ml-6 flex items-center gap-3">
              <Label>Reminder Hours Before Visit:</Label>
              <Input
                type="number"
                value={settings.reminderHoursBefore}
                onChange={(e) => handleChange('reminderHoursBefore', parseInt(e.target.value))}
                className="w-24"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
