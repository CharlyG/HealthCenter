/**
 * RiskThresholdSettings — Configurable risk threshold alert rules.
 * Allows supervisors to enable/disable threshold rules, adjust score thresholds,
 * set alert severities, and configure cooldown periods.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Switch } from '../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Settings2,
  ShieldAlert,
  Bell,
  Clock,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { riskScoringGateway } from '../../lib/dataGateway';
import type { RiskThresholdConfig, RiskThresholdRule } from '../../lib/riskScoringTypes';
import { getRiskColor } from '../../lib/riskScoringTypes';

// ─── Severity Icon ──────────────────────────────────────────────────────────

const SEVERITY_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  critical: { icon: AlertTriangle, color: 'text-red-600' },
  high: { icon: AlertCircle, color: 'text-orange-600' },
  warning: { icon: Bell, color: 'text-amber-600' },
  info: { icon: Info, color: 'text-blue-600' },
};

// ─── Rule Editor Row ────────────────────────────────────────────────────────

interface RuleEditorProps {
  rule: RiskThresholdRule;
  onChange: (updated: RiskThresholdRule) => void;
}

const RuleEditor = React.memo(function RuleEditor({ rule, onChange }: RuleEditorProps) {
  const colors = getRiskColor(rule.level);
  const severityConfig = SEVERITY_ICONS[rule.alertSeverity] || SEVERITY_ICONS.info;
  const SevIcon = severityConfig.icon;

  return (
    <div className={cn(
      'border rounded-lg p-3 transition-all',
      rule.enabled ? colors.border : 'border-gray-200 opacity-60',
      rule.enabled && colors.bg,
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SevIcon className={cn('size-4', rule.enabled ? severityConfig.color : 'text-gray-400')} />
          <span className="text-xs font-semibold text-gray-900">{rule.name}</span>
          <Badge
            variant="outline"
            className={cn('text-[7px] h-3.5 px-1', colors.bg, colors.border, colors.text)}
          >
            {rule.level.toUpperCase()}
          </Badge>
        </div>
        <Switch
          checked={rule.enabled}
          onCheckedChange={(enabled) => onChange({ ...rule, enabled })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[9px] text-gray-500 uppercase tracking-wider">
            Score Threshold
          </Label>
          <div className="flex items-center gap-1.5 mt-1">
            <Input
              type="number"
              min={0}
              max={100}
              value={rule.scoreThreshold}
              onChange={(e) =>
                onChange({
                  ...rule,
                  scoreThreshold: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                })
              }
              className="h-7 text-xs w-20"
              disabled={!rule.enabled}
            />
            <span className="text-[9px] text-gray-400">/100</span>
          </div>
        </div>

        <div>
          <Label className="text-[9px] text-gray-500 uppercase tracking-wider">
            Alert Severity
          </Label>
          <select
            value={rule.alertSeverity}
            onChange={(e) =>
              onChange({ ...rule, alertSeverity: e.target.value as any })
            }
            className="mt-1 h-7 text-xs border border-gray-200 rounded-md px-2 w-full bg-white"
            disabled={!rule.enabled}
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {rule.enabled && (
        <div className="mt-2">
          <Label className="text-[9px] text-gray-500 uppercase tracking-wider">
            Notify Roles
          </Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {['clinician', 'supervisor', 'physician', 'admin'].map((role) => {
              const isSelected = rule.notifyRoles.includes(role);
              return (
                <button
                  key={role}
                  onClick={() => {
                    const updated = isSelected
                      ? rule.notifyRoles.filter((r) => r !== role)
                      : [...rule.notifyRoles, role];
                    onChange({ ...rule, notifyRoles: updated });
                  }}
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[8px] font-medium border transition-colors',
                    isSelected
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  )}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Main Component ─────────────────────────────────────────────────────────

interface RiskThresholdSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RiskThresholdSettings = React.memo(function RiskThresholdSettings({
  open,
  onOpenChange,
}: RiskThresholdSettingsProps) {
  const [config, setConfig] = useState<RiskThresholdConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await riskScoringGateway.getThresholdConfig();
      setConfig(res.config);
    } catch (err: any) {
      console.error('[ThresholdSettings] Load error:', err);
      toast.error('Failed to load threshold settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadConfig();
  }, [open, loadConfig]);

  const handleSave = useCallback(async () => {
    if (!config) return;
    try {
      setSaving(true);
      await riskScoringGateway.updateThresholdConfig(config);
      toast.success('Threshold settings saved');
      onOpenChange(false);
    } catch (err: any) {
      console.error('[ThresholdSettings] Save error:', err);
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [config, onOpenChange]);

  const handleRuleChange = useCallback((updated: RiskThresholdRule) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rules: prev.rules.map((r) => (r.id === updated.id ? updated : r)),
      };
    });
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="size-5 text-indigo-600" />
            Risk Threshold Alert Settings
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-gray-400" />
          </div>
        ) : config ? (
          <>
            {/* Global Toggle */}
            <div className="flex items-center justify-between px-1 py-2 border-b border-gray-100 shrink-0">
              <div>
                <span className="text-xs font-semibold text-gray-900">
                  Threshold Alert System
                </span>
                <p className="text-[9px] text-gray-500 mt-0.5">
                  When enabled, alerts fire automatically when patient scores cross thresholds
                </p>
              </div>
              <Switch
                checked={config.globalEnabled}
                onCheckedChange={(globalEnabled) =>
                  setConfig({ ...config, globalEnabled })
                }
              />
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-2 py-2">
                {/* Cooldown Setting */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Clock className="size-4 text-gray-500 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] font-semibold text-gray-700">
                      Re-alert Cooldown
                    </span>
                    <p className="text-[8px] text-gray-500">
                      Prevents repeated alerts for the same patient within this window
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      max={168}
                      value={config.cooldownHours}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          cooldownHours: Math.max(1, parseInt(e.target.value) || 24),
                        })
                      }
                      className="h-7 text-xs w-16"
                    />
                    <span className="text-[9px] text-gray-500">hours</span>
                  </div>
                </div>

                {/* Threshold Rules */}
                <div>
                  <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Threshold Rules
                  </h3>
                  <div className="space-y-2">
                    {config.rules.map((rule) => (
                      <RuleEditor
                        key={rule.id}
                        rule={rule}
                        onChange={handleRuleChange}
                      />
                    ))}
                  </div>
                </div>

                {/* Visual Guide */}
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="size-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <div className="text-[9px] text-blue-700 space-y-1">
                      <p className="font-semibold">How threshold alerts work:</p>
                      <ul className="list-disc pl-3 space-y-0.5 text-blue-600">
                        <li>Alerts fire when a patient's risk score crosses <b>above</b> a threshold</li>
                        <li>An informational alert is generated when scores drop <b>below</b> a threshold</li>
                        <li>The cooldown prevents repeated alerts for the same patient</li>
                        <li>Alerts appear in the clinical notification center and patient chart</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="shrink-0 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between w-full">
                <p className="text-[8px] text-gray-400">
                  Last updated: {new Date(config.updatedAt).toLocaleString()} by {config.updatedBy}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                    {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
                    Save Settings
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center text-xs text-gray-500">
            Failed to load configuration
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

export default RiskThresholdSettings;
