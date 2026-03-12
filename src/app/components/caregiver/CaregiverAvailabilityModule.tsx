/**
 * Caregiver Availability Module
 * 
 * Weekly availability schedule with working days, hours, visit limits,
 * and geographic preferences.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CaregiverAvailability, DayAvailability, GeographicPreference } from '../../lib/caregiverManagementTypes';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CaregiverAvailabilityModuleProps {
  availability: CaregiverAvailability;
  onUpdate?: (availability: CaregiverAvailability) => void;
  mode?: 'view' | 'edit';
}

export default function CaregiverAvailabilityModule({
  availability,
  onUpdate,
  mode = 'view',
}: CaregiverAvailabilityModuleProps) {
  const [isEditing, setIsEditing] = useState(mode === 'edit');

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleSave = () => {
    onUpdate?.(availability);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Availability & Preferences</h2>
              <p className="text-sm text-gray-600">
                Weekly schedule and geographic preferences
              </p>
            </div>
          </div>

          {mode === 'view' && !isEditing && onUpdate && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Availability
            </Button>
          )}

          {isEditing && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Weekly Schedule */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Weekly Schedule</h3>
        
        <div className="space-y-3 mb-6">
          {days.map((day, index) => {
            const daySchedule = availability.weeklySchedule.find(
              (d) => d.dayOfWeek === index
            );

            return (
              <DayScheduleRow
                key={index}
                day={day}
                dayOfWeek={index as 0 | 1 | 2 | 3 | 4 | 5 | 6}
                schedule={daySchedule}
                isEditing={isEditing}
              />
            );
          })}
        </div>

        {/* Capacity Limits */}
        <div className="pt-6 border-t">
          <h4 className="font-semibold text-gray-900 mb-3">Capacity Limits</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700 mb-1">Max Visits Per Day</div>
              <div className="text-2xl font-bold text-blue-900">
                {availability.maxVisitsPerDay}
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-700 mb-1">Max Visits Per Week</div>
              <div className="text-2xl font-bold text-purple-900">
                {availability.maxVisitsPerWeek}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Geographic Preferences */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Geographic Preferences
          </h3>
          {isEditing && (
            <Button variant="outline" size="sm">
              <Plus className="w-3 h-3 mr-1" />
              Add Area
            </Button>
          )}
        </div>

        {availability.preferredGeographicAreas.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No geographic preferences set
          </div>
        ) : (
          <div className="space-y-3">
            {availability.preferredGeographicAreas.map((area, index) => (
              <GeographicAreaCard key={index} area={area} isEditing={isEditing} />
            ))}
          </div>
        )}
      </Card>

      {/* Restrictions & Notes */}
      {(availability.restrictions.length > 0 || availability.notes) && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Restrictions & Notes</h3>
          
          {availability.restrictions.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Restrictions:</div>
              <div className="flex flex-wrap gap-2">
                {availability.restrictions.map((restriction, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-red-100 text-red-700 border-red-300"
                  >
                    {restriction}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {availability.notes && (
            <div>
              <div className="text-sm text-gray-600 mb-2">Notes:</div>
              <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
                {availability.notes}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Metadata */}
      <div className="text-xs text-gray-600">
        Effective Date: {new Date(availability.effectiveDate).toLocaleDateString()} •
        Last Updated: {new Date(availability.lastUpdated).toLocaleDateString()}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DAY SCHEDULE ROW
// ═══════════════════════════════════════════════════════════════════════════

function DayScheduleRow({
  day,
  dayOfWeek,
  schedule,
  isEditing,
}: {
  day: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  schedule?: DayAvailability;
  isEditing: boolean;
}) {
  const isAvailable = schedule?.isAvailable ?? false;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 transition-all',
        isAvailable
          ? 'border-green-300 bg-green-50'
          : 'border-gray-200 bg-gray-50'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Day Name */}
          <div className="w-24">
            <div className="font-semibold text-gray-900">{day}</div>
            <div className="text-xs text-gray-600">
              {isAvailable ? 'Available' : 'Not Available'}
            </div>
          </div>

          {/* Time Range */}
          {isAvailable && schedule && (
            <>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  {schedule.startTime} - {schedule.endTime}
                </span>
              </div>

              {/* Break Time */}
              {schedule.breakStartTime && schedule.breakEndTime && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Break:</span>
                  <span className="text-xs font-medium text-gray-700">
                    {schedule.breakStartTime} - {schedule.breakEndTime}
                  </span>
                </div>
              )}

              {/* Max Visits */}
              {schedule.maxVisits && (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                  Max {schedule.maxVisits} visits
                </Badge>
              )}
            </>
          )}

          {!isAvailable && (
            <span className="text-sm text-gray-500">No hours scheduled</span>
          )}
        </div>

        {/* Edit Button */}
        {isEditing && (
          <Button variant="ghost" size="sm">
            <Edit className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GEOGRAPHIC AREA CARD
// ═══════════════════════════════════════════════════════════════════════════

function GeographicAreaCard({
  area,
  isEditing,
}: {
  area: GeographicPreference;
  isEditing: boolean;
}) {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <MapPin className="w-5 h-5 text-blue-600" />
        <div>
          <div className="font-medium text-gray-900">
            {area.territory || area.city || area.zipCode || 'Unspecified'}
          </div>
          <div className="text-xs text-gray-600">
            Travel radius: {area.travelRadiusMiles} miles
          </div>
        </div>
      </div>

      {isEditing && (
        <Button variant="ghost" size="sm">
          <Trash2 className="w-3 h-3 text-red-600" />
        </Button>
      )}
    </div>
  );
}
