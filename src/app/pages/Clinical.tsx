/**
 * Clinical Documentation Hub
 * Landing page for clinical module showing live counts from visit notes,
 * plans of care, verbal orders, and QA review sub-modules.
 */
import { useEffect, useState, useCallback } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, ClipboardList, FileSignature, ClipboardCheck, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  fetchVisitNotes,
  fetchPlansOfCare,
  fetchVerbalOrders,
  fetchQADocuments,
} from '../lib/clinicalApi';

interface ClinicalCounts {
  visitNotes: { total: number; inProgress: number };
  plansOfCare: { total: number; pending: number };
  verbalOrders: { total: number; unsigned: number };
  qaDocuments: { total: number; inQueue: number };
}

export default function Clinical() {
  const { isModuleEnabled } = useConfig();
  const navigate = useNavigate();
  const [counts, setCounts] = useState<ClinicalCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isModuleEnabled('clinical')) {
      navigate('/module-disabled');
    }
  }, [isModuleEnabled, navigate]);

  const loadCounts = useCallback(async () => {
    setLoading(true);
    try {
      const [visitNotes, plansOfCare, verbalOrders, qaDocuments] = await Promise.all([
        fetchVisitNotes().catch(() => []),
        fetchPlansOfCare().catch(() => []),
        fetchVerbalOrders().catch(() => []),
        fetchQADocuments().catch(() => []),
      ]);
      setCounts({
        visitNotes: {
          total: visitNotes.length,
          inProgress: visitNotes.filter((v: any) => v.status === 'in_progress' || v.qaStatus === 'in_progress').length,
        },
        plansOfCare: {
          total: plansOfCare.length,
          pending: plansOfCare.filter((p: any) => p.status === 'pending' || p.qaStatus === 'in_progress').length,
        },
        verbalOrders: {
          total: verbalOrders.length,
          unsigned: verbalOrders.filter((o: any) => !o.physicianSignedAt).length,
        },
        qaDocuments: {
          total: qaDocuments.length,
          inQueue: qaDocuments.filter((d: any) => d.qaStatus === 'completed' || d.qaStatus === 'corrected').length,
        },
      });
    } catch (err: any) {
      console.error('[Clinical] Error loading counts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const modules = [
    {
      id: 'visit-notes',
      title: 'Visit Notes',
      description: 'Discipline-specific clinical visit documentation',
      icon: FileText,
      path: '/clinical/visit-notes',
      color: 'blue',
      stats: { total: counts?.visitNotes.total ?? 0, pending: counts?.visitNotes.inProgress ?? 0, pendingLabel: 'In Progress' },
    },
    {
      id: 'plans-of-care',
      title: 'Plans of Care',
      description: 'POC creation, updates, and signature tracking',
      icon: ClipboardList,
      path: '/clinical/plans-of-care',
      color: 'green',
      stats: { total: counts?.plansOfCare.total ?? 0, pending: counts?.plansOfCare.pending ?? 0, pendingLabel: 'Pending' },
    },
    {
      id: 'verbal-orders',
      title: 'Verbal Orders',
      description: 'Track verbal orders and physician signatures',
      icon: FileSignature,
      path: '/clinical/verbal-orders',
      color: 'amber',
      stats: { total: counts?.verbalOrders.total ?? 0, pending: counts?.verbalOrders.unsigned ?? 0, pendingLabel: 'Unsigned' },
    },
    {
      id: 'qa-review',
      title: 'QA Review',
      description: 'Quality assurance and document review workflow',
      icon: ClipboardCheck,
      path: '/clinical/qa-review',
      color: 'purple',
      stats: { total: counts?.qaDocuments.total ?? 0, pending: counts?.qaDocuments.inQueue ?? 0, pendingLabel: 'In Queue' },
    },
  ];

  // Summary stats
  const summaryStats = {
    inProgress: (counts?.visitNotes.inProgress ?? 0) + (counts?.plansOfCare.pending ?? 0),
    pendingSignatures: counts?.verbalOrders.unsigned ?? 0,
    inQA: counts?.qaDocuments.inQueue ?? 0,
    completedThisWeek:
      (counts?.visitNotes.total ?? 0) +
      (counts?.plansOfCare.total ?? 0) -
      (counts?.visitNotes.inProgress ?? 0) -
      (counts?.plansOfCare.pending ?? 0),
  };

  return (
    <div className="size-full bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="size-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Clinical Documentation</h1>
                <p className="text-gray-600">Visit notes, plans of care, and quality assurance</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={loadCounts} disabled={loading}>
              <RefreshCw className={`size-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Documents In Progress</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? <Loader2 className="size-6 animate-spin text-gray-400" /> : summaryStats.inProgress}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Signatures</CardDescription>
              <CardTitle className="text-3xl text-amber-600">
                {loading ? <Loader2 className="size-6 animate-spin text-gray-400" /> : summaryStats.pendingSignatures}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In QA Review</CardDescription>
              <CardTitle className="text-3xl text-purple-600">
                {loading ? <Loader2 className="size-6 animate-spin text-gray-400" /> : summaryStats.inQA}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed This Week</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {loading ? <Loader2 className="size-6 animate-spin text-gray-400" /> : summaryStats.completedThisWeek}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            const colorClasses = {
              blue: 'text-blue-600 bg-blue-50',
              green: 'text-green-600 bg-green-50',
              amber: 'text-amber-600 bg-amber-50',
              purple: 'text-purple-600 bg-purple-50',
            }[module.color];

            return (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${colorClasses}`}>
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{module.title}</CardTitle>
                        <CardDescription className="mt-1">{module.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Total:</span>{' '}
                        <span className="font-semibold">
                          {loading ? '...' : module.stats.total}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">{module.stats.pendingLabel}:</span>{' '}
                        <span className={`font-semibold ${module.stats.pending > 0 ? 'text-amber-600' : ''}`}>
                          {loading ? '...' : module.stats.pending}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(module.path)}
                    className="w-full"
                    variant="outline"
                  >
                    Open {module.title}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
