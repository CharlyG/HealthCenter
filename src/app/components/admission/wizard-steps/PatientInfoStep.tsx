/**
 * Patient Information Step
 * Step 1 of Admission Setup Wizard
 */

import { useState, useEffect } from 'react';
import { Search, User, Calendar, MapPin, Phone, Users } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import type { WizardStepProps } from '../AdmissionSetupWizard';

export default function PatientInfoStep({ data, onChange, onValidationChange, onNext }: WizardStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Validate step
  useEffect(() => {
    const isValid = 
      !!data.selected_patient &&
      !!data.admission_date &&
      !!data.start_of_care_date &&
      !!data.service_type &&
      !!data.referral_source;
    
    onValidationChange(isValid);
  }, [data, onValidationChange]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      // TODO: Search patients via dataGateway
      // Mock search results
      const mockResults = [
        {
          id: 'PAT-001',
          first_name: 'Mary',
          last_name: 'Johnson',
          mrn: 'MRN10001',
          dob: '1945-03-15',
          address: '123 Main St, Chicago, IL 60601',
          phone: '(555) 123-4567',
        },
        {
          id: 'PAT-002',
          first_name: 'Robert',
          last_name: 'Smith',
          mrn: 'MRN10002',
          dob: '1938-07-22',
          address: '456 Oak Ave, Chicago, IL 60602',
          phone: '(555) 234-5678',
        },
      ];
      
      setSearchResults(
        mockResults.filter(p =>
          p.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPatient = (patient: any) => {
    onChange({
      patient_id: patient.id,
      selected_patient: patient,
    });
    setSearchResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onNext) onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Search */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Search for Patient <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by name or MRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 space-y-2 max-h-64 overflow-auto">
            {searchResults.map((patient) => (
              <Card
                key={patient.id}
                className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSelectPatient(patient)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </p>
                    <p className="text-sm text-gray-600">MRN: {patient.mrn}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      DOB: {new Date(patient.dob).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Select
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Selected Patient */}
      {data.selected_patient && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <User className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-900">Selected Patient</p>
              <p className="text-sm text-green-800 mt-1">
                {data.selected_patient.first_name} {data.selected_patient.last_name} (MRN: {data.selected_patient.mrn})
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-green-800">
                <div>DOB: {new Date(data.selected_patient.dob).toLocaleDateString()}</div>
                <div>Phone: {data.selected_patient.phone}</div>
                <div className="col-span-2">Address: {data.selected_patient.address}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Admission Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="admission_date">
            Admission Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="admission_date"
            type="date"
            value={data.admission_date}
            onChange={(e) => onChange({ admission_date: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div>
          <Label htmlFor="start_of_care_date">
            Start of Care Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="start_of_care_date"
            type="date"
            value={data.start_of_care_date}
            onChange={(e) => onChange({ start_of_care_date: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="service_type">
            Service Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.service_type}
            onValueChange={(value: any) => onChange({ service_type: value })}
          >
            <SelectTrigger id="service_type">
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Home Health">Home Health</SelectItem>
              <SelectItem value="Hospice">Hospice</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="referral_source">
            Referral Source <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.referral_source}
            onValueChange={(value) => onChange({ referral_source: value })}
          >
            <SelectTrigger id="referral_source">
              <SelectValue placeholder="Select referral source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hospital">Hospital</SelectItem>
              <SelectItem value="Physician">Physician</SelectItem>
              <SelectItem value="Skilled Nursing Facility">Skilled Nursing Facility</SelectItem>
              <SelectItem value="Self-Referral">Self-Referral</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="referral_date">Referral Date</Label>
        <Input
          id="referral_date"
          type="date"
          value={data.referral_date}
          onChange={(e) => onChange({ referral_date: e.target.value })}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Emergency Contact */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="size-5" />
          Emergency Contact
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergency_contact_name">Contact Name</Label>
            <Input
              id="emergency_contact_name"
              placeholder="Full name"
              value={data.emergency_contact_name}
              onChange={(e) => onChange({ emergency_contact_name: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
            <Input
              id="emergency_contact_phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={data.emergency_contact_phone}
              onChange={(e) => onChange({ emergency_contact_phone: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
