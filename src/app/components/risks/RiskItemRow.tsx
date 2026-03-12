/**
 * Risk Item Row — clickable row in the risk list for quick investigation.
 */
import React, { useState } from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { RiskSeverityBadge } from './RiskSeverityBadge';
import type { RiskItem } from '../../lib/riskTypes';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Zap,
  User,
  FileText,
  DollarSign,
  Clock,
  Shield,
} from 'lucide-react';

const ENTITY_ICON: Record<string, React.ElementType> = {
  patient: User,
  caregiver: Shield,
  admission: FileText,
  claim: DollarSign,
  authorization: Clock,
};

interface RiskItemRowProps {
  risk: RiskItem;
  onInvestigate: (risk: RiskItem) => void;
}

export const RiskItemRow = React.memo(function RiskItemRow({
  risk,
  onInvestigate,
}: RiskItemRowProps) {
  const [expanded, setExpanded] = useState(false);
  const EntityIcon = ENTITY_ICON[risk.entityType] || User;

  return (
    <div className={cn(
      'border rounded-lg transition-all',
      risk.severity === 'critical' ? 'border-red-200 bg-red-50/30' :
      risk.severity === 'high' ? 'border-orange-200 bg-orange-50/20' :
      'border-gray-200 bg-white',
    )}>
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50"
        onClick={() => setExpanded(!expanded)}
      >
        <button className="shrink-0 text-gray-400">
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        {/* Score circle */}
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
          risk.riskScore >= 70 ? 'bg-red-100 text-red-700' :
          risk.riskScore >= 50 ? 'bg-orange-100 text-orange-700' :
          risk.riskScore >= 30 ? 'bg-amber-100 text-amber-700' :
          'bg-emerald-100 text-emerald-700',
        )}>
          {risk.riskScore}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-gray-900 truncate">{risk.title}</span>
          </div>
          <div className="text-xs text-gray-500 truncate">{risk.description}</div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-[10px] px-1.5 h-5 gap-1">
            <EntityIcon className="size-2.5" />
            {risk.entityType}
          </Badge>
          <RiskSeverityBadge severity={risk.severity} />
          {risk.daysUntilDue !== undefined && risk.daysUntilDue <= 14 && (
            <Badge className={cn(
              'text-[10px] px-1.5 h-5 border-0',
              risk.daysUntilDue <= 3 ? 'bg-red-100 text-red-700' :
              risk.daysUntilDue <= 7 ? 'bg-orange-100 text-orange-700' :
              'bg-amber-100 text-amber-700',
            )}>
              {risk.daysUntilDue}d left
            </Badge>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 ml-8">
          <div className="grid grid-cols-2 gap-4">
            {/* Risk Factors */}
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Risk Factors</div>
              <ul className="space-y-1.5">
                {risk.factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0 mt-1',
                      i === 0 ? 'bg-red-400' : i === 1 ? 'bg-orange-400' : 'bg-amber-400',
                    )} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action + Metadata */}
            <div>
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Suggested Action</div>
              <div className="flex items-start gap-2 bg-blue-50 rounded-lg px-3 py-2 mb-3">
                <Zap className="size-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-xs text-blue-800">{risk.suggestedAction}</span>
              </div>

              {risk.dueDate && (
                <div className="text-xs text-gray-500 mb-3">
                  <span className="font-medium">Due:</span> {new Date(risk.dueDate).toLocaleDateString()}
                </div>
              )}

              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onInvestigate(risk);
                }}
              >
                <ExternalLink className="size-3" />
                Investigate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default RiskItemRow;
