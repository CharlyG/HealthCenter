/**
 * SlaSettingsPanel — Dialog for configuring SLA thresholds per pipeline stage.
 * Settings are persisted to localStorage for user preferences.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Settings2, RotateCcw, Save, Clock, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { PipelineStage } from '../../lib/referralPipelineTypes';
import { STAGE_CONFIGS } from '../../lib/referralPipelineTypes';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StageSlaConfig {
  onTrack: number;
  aging: number;
  atRisk: number;
}

export type SlaThresholdConfig = Record<PipelineStage, StageSlaConfig>;

const STORAGE_KEY = 'referral-pipeline-sla-thresholds';

export const DEFAULT_SLA_CONFIG: SlaThresholdConfig = {
  new_referral: { onTrack: 1, aging: 2, atRisk: 3 },
  insurance_verification: { onTrack: 2, aging: 4, atRisk: 6 },
  clinical_review: { onTrack: 2, aging: 5, atRisk: 7 },
  admission_scheduled: { onTrack: 3, aging: 5, atRisk: 7 },
  admitted: { onTrack: 7, aging: 14, atRisk: 21 },
  rejected: { onTrack: 7, aging: 14, atRisk: 21 },
};

export function loadSlaConfig(): SlaThresholdConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all stages exist
      return { ...DEFAULT_SLA_CONFIG, ...parsed };
    }
  } catch {}
  return DEFAULT_SLA_CONFIG;
}

export function saveSlaConfig(config: SlaThresholdConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// ─── Stage Row ──────────────────────────────────────────────────────────────

const SLA_STAGES = STAGE_CONFIGS.filter(s => s.id !== 'rejected' && s.id !== 'admitted');

interface StageRowProps {
  config: (typeof STAGE_CONFIGS)[number];
  sla: StageSlaConfig;
  onChange: (stage: PipelineStage, field: keyof StageSlaConfig, value: number) => void;
}

const StageRow = React.memo(function StageRow({ config, sla, onChange }: StageRowProps) {
  return (
    <div className={cn('rounded-lg border p-4', config.borderColor, config.bgColor)}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('w-3 h-3 rounded-full', config.iconBg)} />
        <span className={cn('text-sm font-semibold', config.color)}>{config.label}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-[10px] font-medium text-gray-500 uppercase flex items-center gap-1 mb-1">
            <Clock className="size-3" />
            On Track (days)
          </Label>
          <Input
            type="number"
            min={0}
            max={99}
            value={sla.onTrack}
            onChange={(e) => onChange(config.id, 'onTrack', Math.max(0, parseInt(e.target.value) || 0))}
            className="h-8 text-sm text-center"
          />
          <p className="text-[9px] text-green-600 mt-0.5">Normal processing</p>
        </div>
        <div>
          <Label className="text-[10px] font-medium text-gray-500 uppercase flex items-center gap-1 mb-1">
            <AlertTriangle className="size-3 text-amber-500" />
            Warning (days)
          </Label>
          <Input
            type="number"
            min={0}
            max={99}
            value={sla.aging}
            onChange={(e) => onChange(config.id, 'aging', Math.max(0, parseInt(e.target.value) || 0))}
            className="h-8 text-sm text-center"
          />
          <p className="text-[9px] text-amber-600 mt-0.5">Aging alert</p>
        </div>
        <div>
          <Label className="text-[10px] font-medium text-gray-500 uppercase flex items-center gap-1 mb-1">
            <AlertOctagon className="size-3 text-red-500" />
            Breach (days)
          </Label>
          <Input
            type="number"
            min={0}
            max={99}
            value={sla.atRisk}
            onChange={(e) => onChange(config.id, 'atRisk', Math.max(0, parseInt(e.target.value) || 0))}
            className="h-8 text-sm text-center"
          />
          <p className="text-[9px] text-red-600 mt-0.5">SLA breach</p>
        </div>
      </div>
    </div>
  );
});

// ─── Main Panel ─────────────────────────────────────────────────────────────

interface SlaSettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: SlaThresholdConfig) => void;
}

export function SlaSettingsPanel({ open, onOpenChange, onSave }: SlaSettingsPanelProps) {
  const [config, setConfig] = useState<SlaThresholdConfig>(DEFAULT_SLA_CONFIG);

  useEffect(() => {
    if (open) {
      setConfig(loadSlaConfig());
    }
  }, [open]);

  const handleChange = useCallback((stage: PipelineStage, field: keyof StageSlaConfig, value: number) => {
    setConfig(prev => ({
      ...prev,
      [stage]: { ...prev[stage], [field]: value },
    }));
  }, []);

  const handleSave = useCallback(() => {
    // Validate: onTrack < aging < atRisk
    for (const stage of SLA_STAGES) {
      const sla = config[stage.id];
      if (sla.onTrack >= sla.aging || sla.aging >= sla.atRisk) {
        toast.error(`${stage.label}: On Track < Warning < Breach required`);
        return;
      }
    }
    saveSlaConfig(config);
    onSave(config);
    onOpenChange(false);
    toast.success('SLA thresholds saved');
  }, [config, onSave, onOpenChange]);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_SLA_CONFIG);
    toast.info('Reset to defaults (save to apply)');
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="size-5 text-gray-600" />
            SLA Threshold Configuration
          </DialogTitle>
          <DialogDescription>
            Configure SLA time limits per pipeline stage. Referrals exceeding these thresholds
            will appear in the SLA Alerts view with escalation levels.
          </DialogDescription>
        </DialogHeader>

        {/* Legend */}
        <div className="flex items-center gap-4 px-1 py-2 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-gray-600 font-medium">On Track</span>
            <span className="text-gray-400">— Normal</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-gray-600 font-medium">Warning</span>
            <span className="text-gray-400">— Aging</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-gray-600 font-medium">Breach</span>
            <span className="text-gray-400">— Escalation</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {SLA_STAGES.map(stage => (
            <StageRow
              key={stage.id}
              config={stage}
              sla={config[stage.id]}
              onChange={handleChange}
            />
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" className="gap-1.5 text-xs" onClick={handleReset}>
            <RotateCcw className="size-3.5" />
            Reset Defaults
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="gap-1.5" onClick={handleSave}>
            <Save className="size-4" />
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SlaSettingsPanel;
