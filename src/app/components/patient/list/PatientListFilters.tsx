/**
 * Patient Module - List Filters Component
 * Reusable filter controls for patient list
 */
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Card, CardContent } from '../../ui/card';

interface PatientListFiltersProps {
  searchQuery: string;
  selectedOffice: string;
  selectedStatus: string;
  offices: Array<{ id: string; name: string }>;
  isSearching?: boolean;
  onSearchChange: (query: string) => void;
  onOfficeChange: (officeId: string) => void;
  onStatusChange: (status: string) => void;
  onSearch: () => void;
}

export const PatientListFilters = React.memo(({
  searchQuery,
  selectedOffice,
  selectedStatus,
  offices,
  isSearching,
  onSearchChange,
  onOfficeChange,
  onStatusChange,
  onSearch,
}: PatientListFiltersProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search by name, MRN, or phone..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={onSearch}
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {/* Office Filter */}
          <div>
            <Select value={selectedOffice} onValueChange={onOfficeChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Offices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Offices</SelectItem>
                {offices.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PatientListFilters.displayName = 'PatientListFilters';
