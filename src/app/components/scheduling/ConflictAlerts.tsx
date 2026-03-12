/**
 * Conflict Alerts Panel
 * Highlights scheduling issues: overlapping visits, missing caregivers,
 * authorization conflicts, documentation gaps, EVV errors
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertTriangle, Clock, Users, FileX, Shield, Radio,
  Loader2, RefreshCw, Filter, ChevronRight,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { visitGateway } from '../../lib/dataGateway';

interface Conflict {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  visitIds: string[];
  caregiverId?: string;
  caregiverName?: string;
  date: string;
  discipline?: string;
  suggestedAction: string;
}

const CONFLICT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  overlap:           { icon: <Clock className="size-4" />,       color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
  missing_caregiver: { icon: <Users className="size-4" />,       color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  authorization:     { icon: <Shield className="size-4" />,      color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200' },
  documentation:     { icon: <FileX className="size-4" />,       color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200' },
  evv_error:         { icon: <Radio className="size-4" />,       color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
};

const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
  high:   { color: 'bg-red-100 text-red-800 border-red-200',     label: 'High' },
  medium: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Medium' },
  low:    { color: 'bg-gray-100 text-gray-600 border-gray-200',  label: 'Low' },
};

export default function ConflictAlerts() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await visitGateway.getConflicts();
      setConflicts(data.conflicts || []);
      setSummary(data.summary || {});
    } catch (err) {
      console.error('[ConflictAlerts] error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = conflicts;
    if (typeFilter !== 'all') result = result.filter(c => c.type === typeFilter);
    if (severityFilter !== 'all') result = result.filter(c => c.severity === severityFilter);
    return result;
  }, [conflicts, typeFilter, severityFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-500">Scanning for conflicts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3">
        <Card className={summary.overlapping > 0 ? 'ring-1 ring-red-200' : ''}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="size-4 text-red-500" />
              <span className="text-xs font-medium text-gray-600">Overlapping</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{summary.overlapping || 0}</p>
          </CardContent>
        </Card>
        <Card className={summary.missingCaregiver > 0 ? 'ring-1 ring-orange-200' : ''}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="size-4 text-orange-500" />
              <span className="text-xs font-medium text-gray-600">Missing CG</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{summary.missingCaregiver || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <FileX className="size-4 text-blue-500" />
              <span className="text-xs font-medium text-gray-600">Doc Gaps</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{summary.documentation || 0}</p>
          </CardContent>
        </Card>
        <Card className={summary.evvErrors > 0 ? 'ring-1 ring-red-200' : ''}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="size-4 text-red-500" />
              <span className="text-xs font-medium text-gray-600">EVV Errors</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{summary.evvErrors || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="size-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.total || 0}</p>
            <div className="flex items-center gap-1 mt-1">
              {summary.high > 0 && <Badge className="text-[9px] h-4 bg-red-600">{summary.high} high</Badge>}
              {summary.medium > 0 && <Badge className="text-[9px] h-4 bg-amber-500">{summary.medium} med</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs">
              <Filter className="size-3.5 mr-1 text-gray-400" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="overlap">Overlapping</SelectItem>
              <SelectItem value="missing_caregiver">Missing Caregiver</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="evv_error">EVV Error</SelectItem>
              <SelectItem value="authorization">Authorization</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[120px] h-9 text-xs">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="sm" onClick={load} className="h-8 gap-1 text-xs">
          <RefreshCw className="size-3.5" /> Re-scan
        </Button>
      </div>

      {/* Conflict List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="size-12 mx-auto mb-3 text-green-300" />
            <p className="text-lg font-semibold text-green-700">No conflicts detected</p>
            <p className="text-sm text-gray-500 mt-1">All schedules are clear</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(conflict => {
            const tc = CONFLICT_TYPE_CONFIG[conflict.type] || CONFLICT_TYPE_CONFIG.documentation;
            const sc = SEVERITY_CONFIG[conflict.severity] || SEVERITY_CONFIG.low;

            return (
              <div
                key={conflict.id}
                className={`flex items-start gap-3 p-4 border rounded-lg ${tc.bg} transition-colors`}
              >
                <div className={`flex-shrink-0 mt-0.5 ${tc.color}`}>
                  {tc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">{conflict.title}</h4>
                    <Badge variant="outline" className={`text-[10px] h-4 px-1 ${sc.color}`}>
                      {sc.label}
                    </Badge>
                    <span className="text-[10px] text-gray-400">{conflict.date}</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{conflict.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <ChevronRight className="size-3 text-gray-400" />
                    <span className="text-[10px] text-gray-500 italic">{conflict.suggestedAction}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
