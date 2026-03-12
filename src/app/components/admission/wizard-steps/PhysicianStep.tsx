/**
 * Physician Assignment Step
 * Step 3 of Admission Setup Wizard
 */

import { useEffect, useState } from 'react';
import { Stethoscope, Search, AlertCircle, Loader2, X } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import type { WizardStepProps } from '../AdmissionSetupWizard';

export default function PhysicianStep({ data, onChange, onValidationChange, onNext }: WizardStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [physicians, setPhysicians] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const isValid = !!data.attending_physician_id;
    onValidationChange(isValid);
  }, [data, onValidationChange]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setPhysicians([]);
      return;
    }

    setIsSearching(true);

    // Simulate API delay
    setTimeout(() => {
      // Mock physicians - expanded list
      const mockPhysicians = [
        { id: 'PHY-001', name: 'Dr. Sarah Williams', npi: '1234567890', phone: '(555) 111-2222', specialty: 'Internal Medicine' },
        { id: 'PHY-002', name: 'Dr. Michael Chen', npi: '1234567891', phone: '(555) 222-3333', specialty: 'Family Medicine' },
        { id: 'PHY-003', name: 'Dr. Emily Rodriguez', npi: '1234567892', phone: '(555) 333-4444', specialty: 'Geriatrics' },
        { id: 'PHY-004', name: 'Dr. James Thompson', npi: '1234567893', phone: '(555) 444-5555', specialty: 'Cardiology' },
        { id: 'PHY-005', name: 'Dr. Lisa Anderson', npi: '1234567894', phone: '(555) 555-6666', specialty: 'Neurology' },
        { id: 'PHY-006', name: 'Dr. Robert Martinez', npi: '1234567895', phone: '(555) 666-7777', specialty: 'Pulmonology' },
        { id: 'PHY-007', name: 'Dr. Jennifer Lee', npi: '1234567896', phone: '(555) 777-8888', specialty: 'Nephrology' },
        { id: 'PHY-008', name: 'Dr. David Kumar', npi: '1234567897', phone: '(555) 888-9999', specialty: 'Endocrinology' },
      ];

      const filtered = mockPhysicians.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.npi.includes(searchQuery)
      );

      setPhysicians(filtered);
      setIsSearching(false);
    }, 300);
  };

  const handleSelect = (physician: any) => {
    onChange({
      attending_physician_id: physician.id,
      attending_physician_name: physician.name,
      physician_npi: physician.npi,
      physician_phone: physician.phone,
    });
    setPhysicians([]);
    setSearchQuery('');
  };

  const handleClearSelection = () => {
    onChange({
      attending_physician_id: '',
      attending_physician_name: '',
      physician_npi: '',
      physician_phone: '',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (physicians.length === 0 && searchQuery) {
        handleSearch();
      } else if (onNext) {
        onNext();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="size-4 text-blue-600 mt-0.5" />
          <p className="text-xs text-blue-800">
            <strong>Demo Mode:</strong> This search uses mock physician data. In production, this would connect to your physician directory or NPI registry.
          </p>
        </div>
      </Card>

      {/* Attending Physician */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Stethoscope className="size-5 text-blue-600" />
          Attending Physician <span className="text-red-500">*</span>
        </h4>

        {!data.attending_physician_name && (
          <>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search by physician name, specialty, or NPI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="size-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {physicians.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {physicians.length} physician{physicians.length !== 1 ? 's' : ''} found
                </p>
                {physicians.map((physician) => (
                  <Card
                    key={physician.id}
                    className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-gray-200 hover:border-blue-300"
                    onClick={() => handleSelect(physician)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{physician.name}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{physician.specialty}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          NPI: {physician.npi} • {physician.phone}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">Select</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {physicians.length === 0 && searchQuery && !isSearching && (
              <Card className="p-4 text-center border-dashed">
                <p className="text-sm text-gray-600">
                  No physicians found for "{searchQuery}". Try searching with different terms.
                </p>
              </Card>
            )}
          </>
        )}

        {data.attending_physician_name && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge className="bg-green-600 mb-2">Selected</Badge>
                <p className="text-sm font-semibold text-green-900">{data.attending_physician_name}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-green-800">
                  <div>NPI: {data.physician_npi}</div>
                  <div>Phone: {data.physician_phone}</div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearSelection}
              >
                <X className="size-4" />
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Referring Physician */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Referring Physician (Optional)</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Physician Name</Label>
            <Input
              placeholder="Full name"
              value={data.referring_physician_name}
              onChange={(e) => onChange({ referring_physician_name: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <Label>Physician ID / NPI</Label>
            <Input
              placeholder="ID or NPI"
              value={data.referring_physician_id}
              onChange={(e) => onChange({ referring_physician_id: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}