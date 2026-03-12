/**
 * Patient Context Header
 * 
 * Sticky header displayed when a patient is open, showing patient info and quick actions.
 * Switches interface into patient-context mode.
 */

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  User,
  Calendar,
  MapPin,
  AlertTriangle,
  Phone,
  Mail,
  FileText,
  Activity,
  X,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface PatientAlert {
  id: string;
  type: 'allergy' | 'infection' | 'fall-risk' | 'other';
  message: string;
}

interface PatientContextHeaderProps {
  patient: {
    id: string;
    name: string;
    mrn: string;
    dob: string;
    age: number;
    office: string;
    phone?: string;
    address?: string;
  };
  alerts?: PatientAlert[];
  onClose?: () => void;
}

export default function PatientContextHeader({
  patient,
  alerts = [],
  onClose,
}: PatientContextHeaderProps) {
  const alertConfig = {
    allergy: { color: 'red', icon: AlertTriangle },
    infection: { color: 'orange', icon: Activity },
    'fall-risk': { color: 'amber', icon: AlertTriangle },
    other: { color: 'blue', icon: AlertTriangle },
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Patient Info */}
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>

            {/* Details */}
            <div className="flex items-center gap-8">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">{patient.name}</h2>
                  {alerts.length > 0 && (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="font-mono">MRN: {patient.mrn}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    DOB: {patient.dob} ({patient.age}y)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {patient.office}
                  </span>
                </div>
              </div>

              {/* Alerts */}
              {alerts.length > 0 && (
                <div className="flex items-center gap-2">
                  {alerts.slice(0, 3).map((alert) => {
                    const config = alertConfig[alert.type];
                    const Icon = config.icon;
                    return (
                      <Badge
                        key={alert.id}
                        variant="outline"
                        className={cn(
                          'text-xs',
                          config.color === 'red'
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : config.color === 'orange'
                            ? 'bg-orange-100 text-orange-700 border-orange-300'
                            : config.color === 'amber'
                            ? 'bg-amber-100 text-amber-700 border-amber-300'
                            : 'bg-blue-100 text-blue-700 border-blue-300'
                        )}
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {alert.message}
                      </Badge>
                    );
                  })}
                  {alerts.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{alerts.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {patient.phone && (
              <Button variant="ghost" size="sm" title={`Call ${patient.phone}`}>
                <Phone className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" title="Send Message">
              <Mail className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="View Documents">
              <FileText className="w-4 h-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} title="Close Patient">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Patient-Level Navigation Tabs */}
      <PatientLevelTabs />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PATIENT-LEVEL TABS
// ═══════════════════════════════════════════════════════════════════════════

function PatientLevelTabs() {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'demographics', label: 'Demographics' },
    { id: 'locations', label: 'Locations' },
    { id: 'documents', label: 'Documents' },
    { id: 'referral-history', label: 'Referral History' },
  ];

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex items-center gap-1 px-6 bg-gray-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2',
            activeTab === tab.id
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

import { useState } from 'react';