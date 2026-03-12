/**
 * Admissions Page
 * 
 * REFACTORED TO COMPLY WITH:
 * - SCREEN_GENERATION.md - Uses ListPageShell, semantic tokens, pagination
 * - LARGE_DATA.md - Server-side pagination and filtering
 * - PATTERNS.md - Standard StatusBadge component
 * - MIGRATION.md - Uses dataGateway (not direct fetch)
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import * as dataGateway from '../lib/dataGateway';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus, UserPlus, Clock, CalendarCheck, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import ListPageShell from '../components/shells/ListPageShell';
import { StatusBadge } from '../components/design-system/StatusBadge';
import { textColor, space, typography, status } from '../design-system/semantic/tokens';

export default function Admissions() {
  const navigate = useNavigate();
  const { isModuleEnabled } = useConfig();
  const { profile, user, loading: authLoading } = useAuth();
  
  // Check module access
  useEffect(() => {
    if (!authLoading && !isModuleEnabled('admissions')) {
      navigate('/module-disabled');
    }
  }, [isModuleEnabled, navigate, authLoading]);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Data state
  const [data, setData] = useState<dataGateway.PaginatedResponse<dataGateway.AdmissionSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load paginated data (OPTIMIZED - server-side pagination)
  const loadData = useCallback(async () => {
    if (!profile?.org_id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('[Admissions] Loading paginated data:', { page, pageSize, searchQuery, selectedStatus, selectedType });
      
      const result = await dataGateway.getAdmissionsPaginated(profile.org_id, {
        page,
        pageSize,
        filters: {
          search: searchQuery || undefined,
          status: selectedStatus !== 'all' ? (selectedStatus as any) : undefined,
          type: selectedType !== 'all' ? selectedType : undefined,
        }
      });
      
      setData(result);
      console.log('[Admissions] Loaded data:', result);
    } catch (error: any) {
      console.error('[Admissions] Error loading admissions:', error);
      if (!error.message?.includes('Authentication failed') && 
          !error.message?.includes('No active session')) {
        toast.error(error.message || 'Failed to load admissions');
      }
    } finally {
      setLoading(false);
    }
  }, [profile?.org_id, page, pageSize, searchQuery, selectedStatus, selectedType]);
  
  // Load on mount and when filters change
  useEffect(() => {
    if (!authLoading && user && profile?.org_id) {
      loadData();
    }
  }, [authLoading, user, profile?.org_id, loadData]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedStatus, selectedType]);
  
  // Calculate stats from current data
  const stats = useMemo(() => {
    if (!data) return { active: 0, pending: 0, discharged: 0, total: 0 };
    
    // Note: These are stats from current page only
    // For accurate totals, we'd need summary endpoint
    const active = data.data.filter(a => a.status === 'active').length;
    const pending = data.data.filter(a => a.status === 'pending').length;
    const discharged = data.data.filter(a => a.status === 'discharged').length;
    
    return { active, pending, discharged, total: data.total };
  }, [data]);
  
  // Active filters count
  const activeFiltersCount = 
    (selectedStatus !== 'all' ? 1 : 0) +
    (selectedType !== 'all' ? 1 : 0);
  
  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ListPageShell
      title="Admissions"
      subtitle="Patient admission, discharge, and referral management"
      primaryAction={{
        label: 'New Admission',
        icon: <Plus className="w-4 h-4 mr-2" />,
        onClick: () => navigate('/new-admission')
      }}
      searchPlaceholder="Search by patient name, MRN, diagnosis..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      summaryChips={[
        {
          id: 'active',
          label: 'Active',
          value: stats.active,
          variant: 'success',
          icon: <UserPlus className="w-4 h-4" />,
          onClick: () => setSelectedStatus('active')
        },
        {
          id: 'pending',
          label: 'Pending',
          value: stats.pending,
          variant: 'warning',
          icon: <Clock className="w-4 h-4" />,
          onClick: () => setSelectedStatus('pending')
        },
        {
          id: 'discharged',
          label: 'Discharged',
          value: stats.discharged,
          variant: 'default',
          icon: <UserMinus className="w-4 h-4" />,
          onClick: () => setSelectedStatus('discharged')
        },
        {
          id: 'total',
          label: 'Total',
          value: stats.total,
          variant: 'info',
          icon: <CalendarCheck className="w-4 h-4" />
        }
      ]}
      filterPanel={
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: space.md 
        }}>
          <div>
            <label 
              style={{ 
                display: 'block',
                fontSize: typography.helper.size, 
                color: textColor.secondary,
                marginBottom: space.xs,
                fontWeight: 500
              }}
            >
              Status
            </label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
                <SelectItem value="hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label 
              style={{ 
                display: 'block',
                fontSize: typography.helper.size, 
                color: textColor.secondary,
                marginBottom: space.xs,
                fontWeight: 500
              }}
            >
              Type
            </label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="home_health">Home Health</SelectItem>
                <SelectItem value="hospice">Hospice</SelectItem>
                <SelectItem value="palliative">Palliative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      }
      activeFiltersCount={activeFiltersCount}
      onRefresh={loadData}
      loading={loading}
      totalCount={data?.total}
    >
      {/* Admissions Table */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.5rem', 
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <th style={{ 
                padding: space.md, 
                textAlign: 'left', 
                fontSize: typography.helper.size, 
                fontWeight: 600, 
                color: textColor.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Patient
              </th>
              <th style={{ 
                padding: space.md, 
                textAlign: 'left', 
                fontSize: typography.helper.size, 
                fontWeight: 600, 
                color: textColor.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                MRN
              </th>
              <th style={{ 
                padding: space.md, 
                textAlign: 'left', 
                fontSize: typography.helper.size, 
                fontWeight: 600, 
                color: textColor.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Admission Date
              </th>
              <th style={{ 
                padding: space.md, 
                textAlign: 'left', 
                fontSize: typography.helper.size, 
                fontWeight: 600, 
                color: textColor.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Status
              </th>
              <th style={{ 
                padding: space.md, 
                textAlign: 'left', 
                fontSize: typography.helper.size, 
                fontWeight: 600, 
                color: textColor.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Primary Diagnosis
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: space.xl, textAlign: 'center' }}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p style={{ fontSize: typography.body.size, color: textColor.muted }}>
                    Loading admissions...
                  </p>
                </td>
              </tr>
            ) : data && data.data.length > 0 ? (
              data.data.map((admission) => (
                <tr
                  key={admission.id}
                  onClick={() => navigate(`/admissions/${admission.id}`)}
                  style={{ 
                    cursor: 'pointer', 
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <td style={{ padding: space.md }}>
                    <div style={{ 
                      fontSize: typography.body.size, 
                      fontWeight: 500, 
                      color: textColor.primary 
                    }}>
                      {admission.patientName || 'Unknown Patient'}
                    </div>
                  </td>
                  <td style={{ 
                    padding: space.md, 
                    fontSize: typography.body.size, 
                    color: textColor.secondary 
                  }}>
                    {admission.patientMrn || '—'}
                  </td>
                  <td style={{ 
                    padding: space.md, 
                    fontSize: typography.body.size, 
                    color: textColor.secondary 
                  }}>
                    {formatDate(admission.admissionDate)}
                  </td>
                  <td style={{ padding: space.md }}>
                    <StatusBadge status={admission.status} size="sm" />
                  </td>
                  <td style={{ 
                    padding: space.md, 
                    fontSize: typography.body.size, 
                    color: textColor.secondary 
                  }}>
                    {admission.primaryDiagnosis || '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: space.xl, textAlign: 'center' }}>
                  <p style={{ fontSize: typography.body.size, color: textColor.muted }}>
                    No admissions found
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {data && data.total > 0 && (
          <div style={{ 
            padding: space.md, 
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, data.total)} of {data.total}
            </div>
            
            <div style={{ display: 'flex', gap: space.sm }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span style={{ 
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                fontSize: typography.body.size,
                color: textColor.primary,
                fontWeight: 500
              }}>
                {page} / {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(data.totalPages)}
                disabled={page === data.totalPages}
              >
                Last
              </Button>
            </div>
            
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
              Page {page} of {data.totalPages}
            </div>
          </div>
        )}
      </div>
    </ListPageShell>
  );
}
