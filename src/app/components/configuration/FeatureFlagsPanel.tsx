/**
 * Feature Flags Panel
 * 
 * Enable/disable experimental features and gradual rollouts.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Flag, Zap, Beaker, Rocket, AlertTriangle } from 'lucide-react';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  status: 'stable' | 'beta' | 'experimental';
  enabled: boolean;
  category: string;
}

export default function FeatureFlagsPanel({ onConfigChange }: { onConfigChange: () => void }) {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    {
      id: 'ai-documentation',
      name: 'AI-Assisted Documentation',
      description: 'Use AI to suggest documentation content and auto-complete notes',
      status: 'beta',
      enabled: true,
      category: 'Clinical',
    },
    {
      id: 'predictive-scheduling',
      name: 'Predictive Scheduling',
      description: 'Machine learning-based schedule optimization',
      status: 'experimental',
      enabled: false,
      category: 'Operations',
    },
    {
      id: 'voice-commands',
      name: 'Voice Commands',
      description: 'Hands-free voice control for mobile app',
      status: 'beta',
      enabled: false,
      category: 'UX',
    },
    {
      id: 'realtime-collaboration',
      name: 'Real-time Collaboration',
      description: 'Multiple users editing same document simultaneously',
      status: 'experimental',
      enabled: false,
      category: 'Clinical',
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Enhanced business intelligence dashboards',
      status: 'stable',
      enabled: true,
      category: 'Analytics',
    },
    {
      id: 'offline-mode',
      name: 'Offline Mode',
      description: 'Full offline support with background sync',
      status: 'stable',
      enabled: true,
      category: 'Mobile',
    },
    {
      id: 'telehealth',
      name: 'Telehealth Integration',
      description: 'Video visits and remote patient monitoring',
      status: 'beta',
      enabled: false,
      category: 'Clinical',
    },
  ]);

  const handleToggle = (flagId: string) => {
    setFlags(flags.map((f) => (f.id === flagId ? { ...f, enabled: !f.enabled } : f)));
    onConfigChange();
  };

  const categories = [...new Set(flags.map((f) => f.category))];

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <Flag className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Feature Flags</p>
            <p>
              Control experimental and gradual feature rollouts. Beta and experimental features may have bugs or
              incomplete functionality.
            </p>
          </div>
        </div>
      </Card>

      {categories.map((category) => {
        const categoryFlags = flags.filter((f) => f.category === category);
        return (
          <Card key={category} className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{category} Features</h3>
            <div className="space-y-3">
              {categoryFlags.map((flag) => {
                const statusConfig = {
                  stable: { color: 'green', icon: Rocket, label: 'Stable' },
                  beta: { color: 'blue', icon: Zap, label: 'Beta' },
                  experimental: { color: 'amber', icon: Beaker, label: 'Experimental' },
                };
                const config = statusConfig[flag.status];
                const Icon = config.icon;

                return (
                  <div
                    key={flag.id}
                    className={`p-4 rounded-lg border ${
                      flag.enabled ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{flag.name}</h4>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              config.color === 'green'
                                ? 'bg-green-100 text-green-700 border-green-300'
                                : config.color === 'blue'
                                ? 'bg-blue-100 text-blue-700 border-blue-300'
                                : 'bg-amber-100 text-amber-700 border-amber-300'
                            }`}
                          >
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{flag.description}</p>
                        {flag.status === 'experimental' && flag.enabled && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-amber-700">
                            <AlertTriangle className="w-3 h-3" />
                            Experimental feature - use with caution
                          </div>
                        )}
                      </div>
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={() => handleToggle(flag.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
