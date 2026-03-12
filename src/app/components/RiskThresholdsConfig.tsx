/**
 * Risk Thresholds Configuration Panel
 * Allows admins to tune risk scoring weights and severity cutoffs.
 * Used inside PlatformConfig page.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type React from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
  ShieldAlert,
  Save,
  RotateCcw,
  Loader2,
  Activity,
  CalendarX,
  UserX,
  FileWarning,
  DollarSign,
  Clock,
  Info,
} from 'lucide-react';
import { riskDashboardGateway } from '../lib/dataGateway';
import type { RiskThresholdConfig, CategoryThresholdConfig, RiskCategory } from '../lib/riskTypes';
import { DEFAULT_RISK_THRESHOLDS, RISK_CATEGORY_LABELS } from '../lib/riskTypes';

// ─── Weight Label Mapping ───────────────────────────────────────────────────

const WEIGHT_LABELS: Record<string, string> = {
  // Hospitalization
  priorHospitalizations2Plus: '2+ Prior Hospitalizations',
  priorHospitalizations1: '1 Prior Hospitalization',
  recentERVisit: 'Recent ER Visit',
  highFallRisk: 'High Fall Risk',
  livesAlone: 'Lives Alone',
  cognitiveImpairment: 'Cognitive Impairment',
  polypharmacy: 'Polypharmacy (10+ Meds)',
  lowADL: 'Low ADL Score (<=12)',
  highOASIS: 'High OASIS Score (>=60)',
  advancedAge: 'Advanced Age (85+)',
  // Missed Visits
  missedVisitPerVisit: 'Per Missed Visit (weekly)',
  consecutiveMissedPerVisit: 'Per Consecutive Miss',
  lowCompliance50: 'Compliance < 50%',
  lowCompliance75: 'Compliance < 75%',
  // Caregiver
  missedRate10Plus: 'Missed Rate >= 10%',
  missedRate5Plus: 'Missed Rate >= 5%',
  lateRate15Plus: 'Late Rate >= 15%',
  lateRate10Plus: 'Late Rate >= 10%',
  docDelay4hPlus: 'Doc Delay >= 4h',
  docDelay2hPlus: 'Doc Delay >= 2h',
  unsignedNotes3Plus: '3+ Unsigned Notes',
  // Documentation
  perMissingDoc: 'Per Missing Document',
  missingF2F: 'Missing Face-to-Face',
  missingInsurance: 'Missing Insurance Verification',
  // Expiring Auth
  expires3Days: 'Expires <= 3 Days',
  expires7Days: 'Expires <= 7 Days',
  expires14Days: 'Expires <= 14 Days',
  expires30Days: 'Expires <= 30 Days',
  visitsExhausted: 'All Visits Exhausted',
  visits2Remaining: '2 or Fewer Visits Left',
};

const CATEGORY_ICONS: Record<RiskCategory, React.ElementType> = {
  hospitalization: Activity,
  missed_visits: CalendarX,
  caregiver_reliability: UserX,
  missing_documentation: FileWarning,
  claim_rejection: DollarSign,
  expiring_authorization: Clock,
};

const CATEGORY_COLORS: Record<RiskCategory, string> = {
  hospitalization: 'text-red-600',
  missed_visits: 'text-orange-600',
  caregiver_reliability: 'text-purple-600',
  missing_documentation: 'text-amber-600',
  claim_rejection: 'text-blue-600',
  expiring_authorization: 'text-teal-600',
};

// ─── Threshold Input ────────────────────────────────────────────────────────

function ThresholdInput({
  label,
  value,
  onChange,
  tooltip,
  min = 0,
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  tooltip?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 min-w-0">
        <Label className="text-xs text-gray-700 whitespace-nowrap">{label}</Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3 text-gray-400 shrink-0 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px] text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 h-1.5 accent-blue-600"
        />
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v) && v >= min && v <= max) onChange(v);
          }}
          className="w-16 h-7 text-xs text-center px-1"
        />
      </div>
    </div>
  );
}

// ─── Category Config Panel ──────────────────────────────────────────────────

function CategoryConfigPanel({
  category,
  config,
  onChange,
}: {
  category: RiskCategory;
  config: CategoryThresholdConfig;
  onChange: (updated: CategoryThresholdConfig) => void;
}) {
  const Icon = CATEGORY_ICONS[category];
  const color = CATEGORY_COLORS[category];
  const weightKeys = Object.keys(config.weights);

  const updateThreshold = (key: keyof CategoryThresholdConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  const updateWeight = (key: string, value: number) => {
    onChange({ ...config, weights: { ...config.weights, [key]: value } });
  };

  return (
    <AccordionItem
      value={category}
      className="border border-gray-200 rounded-lg px-4 bg-white"
    >
      <AccordionTrigger className="hover:no-underline py-3">
        <div className="flex items-center gap-3">
          <Icon className={`size-5 ${color}`} />
          <span className="font-semibold text-sm">{RISK_CATEGORY_LABELS[category]}</span>
          <Badge variant="outline" className="text-[10px]">
            {weightKeys.length} weights
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-5 pt-2 pb-1">
          {/* Severity Cutoffs */}
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              Severity Cutoffs
            </div>
            <div className="space-y-2.5">
              <ThresholdInput
                label="Critical (>=)"
                value={config.criticalThreshold}
                onChange={(v) => updateThreshold('criticalThreshold', v)}
                tooltip="Score at or above this = Critical severity"
              />
              <ThresholdInput
                label="High (>=)"
                value={config.highThreshold}
                onChange={(v) => updateThreshold('highThreshold', v)}
                tooltip="Score at or above this = High severity"
              />
              <ThresholdInput
                label="Medium (>=)"
                value={config.mediumThreshold}
                onChange={(v) => updateThreshold('mediumThreshold', v)}
                tooltip="Score at or above this = Medium severity"
              />
              <ThresholdInput
                label="Min to Show"
                value={config.minScoreToShow}
                onChange={(v) => updateThreshold('minScoreToShow', v)}
                tooltip="Items below this score are hidden"
              />
            </div>
          </div>

          {/* Factor Weights */}
          {weightKeys.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Factor Weights (points)
              </div>
              <div className="space-y-2.5">
                {weightKeys.map((key) => (
                  <ThresholdInput
                    key={key}
                    label={WEIGHT_LABELS[key] || key}
                    value={config.weights[key]}
                    onChange={(v) => updateWeight(key, v)}
                    tooltip={`Points added when this factor is present`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function RiskThresholdsConfig() {
  const [config, setConfig] = useState<RiskThresholdConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalJSON, setOriginalJSON] = useState('');

  const categories: RiskCategory[] = [
    'hospitalization', 'missed_visits', 'caregiver_reliability',
    'missing_documentation', 'claim_rejection', 'expiring_authorization',
  ];

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const cfg = await riskDashboardGateway.getConfig();
      setConfig(cfg);
      setOriginalJSON(JSON.stringify(cfg));
      setHasChanges(false);
    } catch (err: any) {
      console.error('[RiskThresholdsConfig] Load error:', err);
      // Fall back to defaults
      setConfig({ ...DEFAULT_RISK_THRESHOLDS });
      setOriginalJSON(JSON.stringify(DEFAULT_RISK_THRESHOLDS));
      toast.error('Failed to load risk config, using defaults');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Track changes
  useEffect(() => {
    if (config && originalJSON) {
      setHasChanges(JSON.stringify(config) !== originalJSON);
    }
  }, [config, originalJSON]);

  const handleCategoryChange = useCallback((cat: RiskCategory, updated: CategoryThresholdConfig) => {
    setConfig((prev) => prev ? { ...prev, [cat]: updated } : prev);
  }, []);

  const handleSave = useCallback(async () => {
    if (!config) return;
    setSaving(true);
    try {
      const result = await riskDashboardGateway.updateConfig(config);
      setOriginalJSON(JSON.stringify(config));
      setHasChanges(false);
      toast.success('Risk thresholds saved', {
        description: `Updated at ${new Date(result.updatedAt).toLocaleTimeString()}`,
      });
    } catch (err: any) {
      console.error('[RiskThresholdsConfig] Save error:', err);
      toast.error('Failed to save thresholds', { description: err.message });
    } finally {
      setSaving(false);
    }
  }, [config]);

  const handleReset = useCallback(() => {
    setConfig({ ...DEFAULT_RISK_THRESHOLDS });
    toast.info('Reset to default thresholds', { description: 'Save to apply changes' });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading risk configuration...</span>
      </div>
    );
  }

  if (!config) return null;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="size-5 text-red-600" />
                Risk Scoring Thresholds
              </CardTitle>
              <CardDescription>
                Configure severity cutoffs and factor weights for each risk category.
                Changes affect how risk scores are computed and classified.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {config.updatedAt && (
                <span className="text-[10px] text-gray-400 mr-2">
                  Last saved: {new Date(config.updatedAt).toLocaleString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                Reset Defaults
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="gap-1.5"
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
          {hasChanges && (
            <div className="mt-2">
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                Unsaved Changes
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {categories.map((cat) => (
              <CategoryConfigPanel
                key={cat}
                category={cat}
                config={config[cat]}
                onChange={(updated) => handleCategoryChange(cat, updated)}
              />
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}