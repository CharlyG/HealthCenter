/**
 * Caregiver Availability View
 * Display staff availability and manage schedules
 */
import { useState } from 'react';
import { User, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { PageLayout, PageHeader, PageSection } from '../design-system/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Caregiver {
  id: string;
  name: string;
  discipline: string;
  status: 'available' | 'unavailable' | 'on-visit';
  visits_today: number;
  hours_today: number;
  max_hours: number;
  current_location?: string;
  next_visit_time?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  visit?: {
    patient_name: string;
    address: string;
  };
}

export default function CaregiverAvailabilityView() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>('all');

  // Mock caregiver data
  const caregivers: Caregiver[] = [
    {
      id: 'c1',
      name: 'Jane Smith',
      discipline: 'RN',
      status: 'on-visit',
      visits_today: 4,
      hours_today: 6.5,
      max_hours: 8,
      current_location: '123 Main St',
      next_visit_time: '14:00',
    },
    {
      id: 'c2',
      name: 'Mike Johnson',
      discipline: 'PT',
      status: 'available',
      visits_today: 3,
      hours_today: 4.5,
      max_hours: 8,
    },
    {
      id: 'c3',
      name: 'Sarah Williams',
      discipline: 'OT',
      status: 'unavailable',
      visits_today: 0,
      hours_today: 0,
      max_hours: 8,
    },
    {
      id: 'c4',
      name: 'Robert Brown',
      discipline: 'RN',
      status: 'available',
      visits_today: 2,
      hours_today: 3,
      max_hours: 8,
    },
  ];

  // Mock time slots for selected caregiver
  const timeSlots: TimeSlot[] = [
    { time: '08:00', available: false, visit: { patient_name: 'Smith, John', address: '123 Main St' } },
    { time: '09:00', available: false, visit: { patient_name: 'Smith, John', address: '123 Main St' } },
    { time: '10:00', available: true },
    { time: '11:00', available: true },
    { time: '12:00', available: true },
    { time: '13:00', available: false, visit: { patient_name: 'Davis, Mary', address: '456 Oak Ave' } },
    { time: '14:00', available: false, visit: { patient_name: 'Davis, Mary', address: '456 Oak Ave' } },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'on-visit':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisciplineColor = (discipline: string) => {
    const colors: Record<string, string> = {
      RN: 'bg-blue-100 text-blue-800',
      PT: 'bg-green-100 text-green-800',
      OT: 'bg-purple-100 text-purple-800',
      ST: 'bg-pink-100 text-pink-800',
      MSW: 'bg-orange-100 text-orange-800',
      AIDE: 'bg-gray-100 text-gray-800',
    };
    return colors[discipline] || 'bg-gray-100 text-gray-800';
  };

  const filteredCaregivers = selectedCaregiver === 'all'
    ? caregivers
    : caregivers.filter(c => c.id === selectedCaregiver);

  return (
    <PageLayout maxWidth="2xl">
      <PageHeader
        icon={<User className="size-8" />}
        title="Caregiver Availability"
        subtitle="View staff schedules and availability"
      />

      {/* Date and Caregiver Selection */}
      <PageSection>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Caregiver</label>
                <Select value={selectedCaregiver} onValueChange={setSelectedCaregiver}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Caregivers</SelectItem>
                    {caregivers.map(caregiver => (
                      <SelectItem key={caregiver.id} value={caregiver.id}>
                        {caregiver.name} ({caregiver.discipline})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Calendar className="size-4 mr-2" />
                  View Week
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Caregiver Status Cards */}
      <PageSection>
        <div className="space-y-4">
          {filteredCaregivers.map((caregiver) => {
            const hoursRemaining = caregiver.max_hours - caregiver.hours_today;
            const capacityPercentage = (caregiver.hours_today / caregiver.max_hours) * 100;
            const isNearCapacity = capacityPercentage > 80;

            return (
              <Card key={caregiver.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">{caregiver.name}</CardTitle>
                      <Badge className={getDisciplineColor(caregiver.discipline)}>
                        {caregiver.discipline}
                      </Badge>
                      <Badge className={getStatusColor(caregiver.status)}>
                        {caregiver.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Visits Today</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-gray-400" />
                        <p className="text-2xl font-bold text-gray-900">{caregiver.visits_today}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Hours Today</p>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-gray-400" />
                        <p className="text-2xl font-bold text-gray-900">
                          {caregiver.hours_today} / {caregiver.max_hours}
                        </p>
                      </div>
                    </div>

                    {caregiver.current_location && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Current Location</p>
                        <p className="text-sm text-gray-900">{caregiver.current_location}</p>
                      </div>
                    )}

                    {caregiver.next_visit_time && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Next Visit</p>
                        <p className="text-sm text-gray-900">{caregiver.next_visit_time}</p>
                      </div>
                    )}
                  </div>

                  {/* Capacity Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Daily Capacity</span>
                      <span className={`font-medium ${isNearCapacity ? 'text-orange-600' : 'text-gray-900'}`}>
                        {hoursRemaining.toFixed(1)} hours remaining
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isNearCapacity ? 'bg-orange-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${capacityPercentage}%` }}
                      />
                    </div>
                  </div>

                  {isNearCapacity && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="size-4 text-orange-600" />
                      <p className="text-sm text-orange-800">
                        Near daily capacity - limited availability for additional visits
                      </p>
                    </div>
                  )}

                  {/* Time Slots */}
                  {selectedCaregiver !== 'all' && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Today's Schedule</h4>
                      <div className="grid grid-cols-9 gap-2">
                        {timeSlots.map((slot) => (
                          <div
                            key={slot.time}
                            className={`p-2 rounded text-center text-xs cursor-pointer transition-colors ${
                              slot.available
                                ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                                : 'bg-gray-100 border border-gray-300'
                            }`}
                            title={slot.visit ? `${slot.visit.patient_name} - ${slot.visit.address}` : 'Available'}
                          >
                            <div className="font-semibold">{slot.time}</div>
                            {slot.available ? (
                              <CheckCircle className="size-3 mx-auto mt-1 text-green-600" />
                            ) : (
                              <XCircle className="size-3 mx-auto mt-1 text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </PageSection>
    </PageLayout>
  );
}
