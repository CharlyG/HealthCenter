/**
 * Patient Module - Patient List Table Component
 * Presentation component for displaying patient list with memoized rows
 */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { DataTable, Column } from '../../design-system/DataTable';
import { StatusBadge } from '../../design-system/StatusBadge';
import { Patient } from '../../../hooks/usePatients';
import { calculateAge, formatDate } from '../../../lib/utils/dateUtils';

interface PatientListTableProps {
  patients: Patient[];
  offices: Array<{ id: string; name: string }>;
  loading?: boolean;
}

export const PatientListTable = React.memo(({ 
  patients, 
  offices,
  loading 
}: PatientListTableProps) => {
  const navigate = useNavigate();

  const columns = useMemo<Column<Patient>[]>(() => [
    {
      id: 'name',
      header: 'Patient Name',
      accessor: (patient) => (
        <div>
          <div className="font-semibold text-gray-900">
            {patient.last_name}, {patient.first_name}
          </div>
        </div>
      ),
      sortable: true,
      width: '20%',
    },
    {
      id: 'dob',
      header: 'DOB / Age',
      accessor: (patient) => (
        <div className="text-gray-900">
          <div>{formatDate(patient.dob)}</div>
          <div className="text-xs text-gray-500">{calculateAge(patient.dob)} years</div>
        </div>
      ),
      sortable: true,
      width: '15%',
    },
    {
      id: 'mrn',
      header: 'MRN',
      accessor: (patient) => (
        <span className="font-mono text-gray-900">{patient.mrn}</span>
      ),
      sortable: true,
      width: '12%',
    },
    {
      id: 'office',
      header: 'Office',
      accessor: (patient) => {
        const office = offices.find(o => o.id === patient.office_id);
        return <span className="text-gray-900">{office?.name || patient.office_id}</span>;
      },
      sortable: true,
      width: '18%',
    },
    {
      id: 'phone',
      header: 'Phone',
      accessor: (patient) => (
        <span className="text-gray-900">{patient.phone}</span>
      ),
      width: '15%',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (patient) => (
        <StatusBadge status={patient.status} size="sm" />
      ),
      sortable: true,
      width: '12%',
    },
  ], [offices]);

  const handleRowClick = (patient: Patient) => {
    navigate(`/patient/${patient.id}/chart`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <DataTable
      data={patients}
      columns={columns}
      keyExtractor={(patient) => patient.id}
      onRowClick={handleRowClick}
      emptyState={
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium mb-2">No patients found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      }
    />
  );
});

PatientListTable.displayName = 'PatientListTable';