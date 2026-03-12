/**
 * Visit Alert Rules Panel
 * 
 * Configure automated alert rules for visit-related events including late visits,
 * missed visits, documentation overdue, and credential compliance.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertTriangle,
  Clock,
  FileText,
  Shield,
  Plus,
  Edit,
  Trash2,
  XCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AlertRule {
  id: string;
  name: string;
  triggerCondition: string;
  notificationChannel: string[];
  recipientGroup: string[];
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  icon: any;
  color: string;
}

interface VisitAlertRulesPanelProps {
  onConfigChange: () => void;
}

export default function VisitAlertRulesPanel({ onConfigChange }: VisitAlertRulesPanelProps) {
  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: 'late-visit',
      name: 'Late Visit Alert',
      triggerCondition: 'Visit not started within 15 minutes of scheduled time',
      notificationChannel: ['sms', 'push'],
      recipientGroup: ['scheduler', 'supervisor'],
      severityLevel: 'medium',
      enabled: true,
      icon: Clock,
      color: 'amber',
    },
    {
      id: 'missed-visit',
      name: 'Missed Visit Alert',
      triggerCondition: 'Visit not completed and scheduled time passed by 2 hours',
      notificationChannel: ['sms', 'email', 'push'],
      recipientGroup: ['scheduler', 'supervisor', 'administrator'],
      severityLevel: 'critical',
      enabled: true,
      icon: XCircle,
      color: 'red',
    },
    {
      id: 'doc-overdue',
      name: 'Documentation Overdue Alert',
      triggerCondition: 'Visit completed but documentation not submitted within 24 hours',
      notificationChannel: ['email', 'push'],
      recipientGroup: ['qa-reviewer', 'supervisor'],
      severityLevel: 'high',
      enabled: true,
      icon: FileText,
      color: 'orange',
    },
    {
      id: 'credential-expiring',
      name: 'Credential Compliance Alert',
      triggerCondition: 'Caregiver credential expiring within 30 days',
      notificationChannel: ['email'],
      recipientGroup: ['hr', 'supervisor', 'caregiver'],
      severityLevel: 'high',
      enabled: true,
      icon: Shield,
      color: 'purple',
    },
    {
      id: 'visit-early',
      name: 'Early Visit Alert',
      triggerCondition: 'Visit started more than 30 minutes before scheduled time',
      notificationChannel: ['push'],
      recipientGroup: ['scheduler'],
      severityLevel: 'low',
      enabled: false,
      icon: Clock,
      color: 'blue',
    },
  ]);

  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  const handleToggle = (ruleId: string) => {
    setRules(rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r)));
    onConfigChange();
  };

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
  };

  const handleSaveRule = () => {
    if (editingRule) {
      setRules(rules.map((r) => (r.id === editingRule.id ? editingRule : r)));
      setEditingRule(null);
      onConfigChange();
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this alert rule?')) {
      setRules(rules.filter((r) => r.id !== ruleId));
      onConfigChange();
    }
  };

  const enabledCount = rules.filter((r) => r.enabled).length;

  const severityConfig = {
    low: { color: 'blue', label: 'Low' },
    medium: { color: 'amber', label: 'Medium' },
    high: { color: 'orange', label: 'High' },
    critical: { color: 'red', label: 'Critical' },
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Visit Alert Rules</h2>
            <p className="text-sm text-gray-600">
              Configure automated alerts for visit-related events
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {enabledCount}/{rules.length}
              </div>
              <div className="text-xs text-gray-600">Rules Active</div>
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Rule
            </Button>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Automated Alert System</p>
            <p>
              Alert rules automatically monitor visit status and trigger notifications based on
              configured conditions. Recipients will be notified via selected channels.
            </p>
          </div>
        </div>
      </Card>

      {/* Alert Rules */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <AlertRuleCard
            key={rule.id}
            rule={rule}
            severityConfig={severityConfig}
            onToggle={() => handleToggle(rule.id)}
            onEdit={() => handleEdit(rule)}
            onDelete={() => handleDeleteRule(rule.id)}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      {editingRule && (
        <AlertRuleEditDialog
          rule={editingRule}
          onSave={handleSaveRule}
          onCancel={() => setEditingRule(null)}
          onChange={setEditingRule}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT RULE CARD
// ═══════════════════════════════════════════════════════════════════════════

function AlertRuleCard({
  rule,
  severityConfig,
  onToggle,
  onEdit,
  onDelete,
}: {
  rule: AlertRule;
  severityConfig: any;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = rule.icon;
  const severity = severityConfig[rule.severityLevel];

  return (
    <Card
      className={cn(
        'p-5 transition-all',
        rule.enabled ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200 opacity-75'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-5 h-5 text-${rule.color}-600`} />
            <h3 className="font-semibold text-gray-900">{rule.name}</h3>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                severity.color === 'red'
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : severity.color === 'orange'
                  ? 'bg-orange-100 text-orange-700 border-orange-300'
                  : severity.color === 'amber'
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-blue-100 text-blue-700 border-blue-300'
              )}
            >
              {severity.label}
            </Badge>
          </div>

          <p className="text-sm text-gray-700 mb-3">{rule.triggerCondition}</p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-gray-700">Channels:</span>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {rule.notificationChannel.map((channel) => (
                  <Badge key={channel} variant="outline" className="text-xs">
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Recipients:</span>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {rule.recipientGroup.map((group) => (
                  <Badge key={group} variant="outline" className="text-xs">
                    {group}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Switch checked={rule.enabled} onCheckedChange={onToggle} />
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT RULE EDIT DIALOG
// ═══════════════════════════════════════════════════════════════════════════

function AlertRuleEditDialog({
  rule,
  onSave,
  onCancel,
  onChange,
}: {
  rule: AlertRule;
  onSave: () => void;
  onCancel: () => void;
  onChange: (rule: AlertRule) => void;
}) {
  const channels = ['sms', 'email', 'push', 'in-app'];
  const recipients = ['scheduler', 'supervisor', 'administrator', 'qa-reviewer', 'hr', 'caregiver'];

  const toggleChannel = (channel: string) => {
    const newChannels = rule.notificationChannel.includes(channel)
      ? rule.notificationChannel.filter((c) => c !== channel)
      : [...rule.notificationChannel, channel];
    onChange({ ...rule, notificationChannel: newChannels });
  };

  const toggleRecipient = (recipient: string) => {
    const newRecipients = rule.recipientGroup.includes(recipient)
      ? rule.recipientGroup.filter((r) => r !== recipient)
      : [...rule.recipientGroup, recipient];
    onChange({ ...rule, recipientGroup: newRecipients });
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Alert Rule</DialogTitle>
          <DialogDescription>Configure alert rule settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="rule-name">Rule Name</Label>
            <Input
              id="rule-name"
              value={rule.name}
              onChange={(e) => onChange({ ...rule, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="trigger">Trigger Condition</Label>
            <Input
              id="trigger"
              value={rule.triggerCondition}
              onChange={(e) => onChange({ ...rule, triggerCondition: e.target.value })}
            />
          </div>

          <div>
            <Label>Severity Level</Label>
            <div className="flex items-center gap-2 mt-2">
              {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
                <Button
                  key={level}
                  variant={rule.severityLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onChange({ ...rule, severityLevel: level })}
                  className="capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Notification Channels</Label>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {channels.map((channel) => (
                <Badge
                  key={channel}
                  variant={rule.notificationChannel.includes(channel) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleChannel(channel)}
                >
                  {channel}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Recipient Groups</Label>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {recipients.map((recipient) => (
                <Badge
                  key={recipient}
                  variant={rule.recipientGroup.includes(recipient) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleRecipient(recipient)}
                >
                  {recipient}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
