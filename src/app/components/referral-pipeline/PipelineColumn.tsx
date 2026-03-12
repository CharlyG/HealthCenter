/**
 * PipelineColumn — A single stage column in the Kanban board.
 * Drop target with color-coded header, count badges, scroll area,
 * batch-select overlays, and "Select All / Deselect All" header buttons.
 */
import React, { useRef, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Inbox, CheckCircle2, CheckSquare, Square } from 'lucide-react';
import type { Referral, PipelineStageConfig, PipelineStage } from '../../lib/referralPipelineTypes';
import { ReferralCard, REFERRAL_DND_TYPE } from './ReferralCard';

interface PipelineColumnProps {
  config: PipelineStageConfig;
  referrals: Referral[];
  onMoveReferral: (referralId: string, toStage: PipelineStage) => void;
  onCardClick: (referral: Referral) => void;
  batchMode?: boolean;
  selectedIds?: Set<string>;
  onSelectAll?: (ids: string[]) => void;
  onDeselectAll?: (ids: string[]) => void;
}

export const PipelineColumn = React.memo(function PipelineColumn({
  config,
  referrals,
  onMoveReferral,
  onCardClick,
  batchMode = false,
  selectedIds = new Set(),
  onSelectAll,
  onDeselectAll,
}: PipelineColumnProps) {
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: REFERRAL_DND_TYPE,
    drop: (item: { id: string; currentStage: string }) => {
      if (item.currentStage !== config.id) {
        onMoveReferral(item.id, config.id);
      }
    },
    canDrop: (item: { id: string; currentStage: string }) => item.currentStage !== config.id && !batchMode,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drop(dropRef);

  const statCount = referrals.filter((r) => r.urgency === 'stat').length;
  const urgentCount = referrals.filter((r) => r.urgency === 'urgent').length;
  const selectedInColumn = referrals.filter((r) => selectedIds.has(r.id)).length;
  const allSelectedInColumn = referrals.length > 0 && selectedInColumn === referrals.length;

  const handleToggleAll = useCallback(() => {
    const ids = referrals.map((r) => r.id);
    if (allSelectedInColumn) {
      onDeselectAll?.(ids);
    } else {
      onSelectAll?.(ids);
    }
  }, [referrals, allSelectedInColumn, onSelectAll, onDeselectAll]);

  return (
    <div
      ref={dropRef}
      className={cn(
        'flex flex-col rounded-xl transition-all duration-200 shrink-0',
        'w-[300px] min-w-[300px]',
        isOver && canDrop
          ? 'ring-2 ring-blue-400 bg-blue-50/40'
          : 'bg-gray-50/70',
      )}
    >
      {/* ── Column Header ────────────────────────────────────────────────── */}
      <div className={cn('px-3 py-3 rounded-t-xl border-b-2', config.borderColor)}>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2">
            <div className={cn('w-2.5 h-2.5 rounded-full', config.iconBg)} />
            <span className={cn('text-sm font-bold', config.color)}>{config.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {batchMode && selectedInColumn > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                {selectedInColumn} sel
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={cn(
                'text-xs h-6 w-6 p-0 flex items-center justify-center font-bold rounded-full',
                config.bgColor,
                config.color,
              )}
            >
              {referrals.length}
            </Badge>
          </div>
        </div>

        {/* Urgency sub-counts or batch select-all */}
        <div className="flex items-center justify-between gap-1.5 mt-1">
          <div className="flex items-center gap-1.5">
            {statCount > 0 && (
              <Badge variant="outline" className="text-[10px] h-[18px] px-1.5 bg-red-50 border-red-200 text-red-600 rounded-full font-semibold">
                {statCount} STAT
              </Badge>
            )}
            {urgentCount > 0 && (
              <Badge variant="outline" className="text-[10px] h-[18px] px-1.5 bg-orange-50 border-orange-200 text-orange-600 rounded-full font-semibold">
                {urgentCount} Urgent
              </Badge>
            )}
            {!batchMode && statCount === 0 && urgentCount === 0 && (
              <span className="text-[10px] text-gray-400">{config.description}</span>
            )}
          </div>

          {/* Select All / Deselect All button */}
          {batchMode && referrals.length > 0 && (
            <button
              onClick={handleToggleAll}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors',
                allSelectedInColumn
                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {allSelectedInColumn ? (
                <>
                  <CheckSquare className="size-3" />
                  Deselect All
                </>
              ) : (
                <>
                  <Square className="size-3" />
                  Select All
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Card Area ────────────────────────────────────────────────────── */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-340px)]">
        <div className="p-2 space-y-2.5">
          {referrals.length === 0 ? (
            <div
              className={cn(
                'border-2 border-dashed rounded-lg py-10 flex flex-col items-center gap-2 transition-colors',
                isOver && canDrop ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white/50',
              )}
            >
              <Inbox className={cn('size-6', isOver && canDrop ? 'text-blue-400' : 'text-gray-300')} />
              <p className={cn('text-xs font-medium', isOver && canDrop ? 'text-blue-500' : 'text-gray-400')}>
                {isOver && canDrop ? 'Drop referral here' : 'No referrals'}
              </p>
            </div>
          ) : (
            referrals.map((referral) => (
              <div key={referral.id} className="relative">
                {/* Batch selection checkbox overlay */}
                {batchMode && (
                  <div
                    className={cn(
                      'absolute top-2 left-2 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer',
                      selectedIds.has(referral.id)
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'bg-white border-gray-300 hover:border-indigo-400',
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCardClick(referral);
                    }}
                  >
                    {selectedIds.has(referral.id) && (
                      <CheckCircle2 className="size-3.5 text-white" />
                    )}
                  </div>
                )}
                <div className={cn(
                  batchMode && 'transition-all',
                  batchMode && selectedIds.has(referral.id) && 'ring-2 ring-indigo-400 rounded-lg',
                )}>
                  <ReferralCard referral={referral} onClick={onCardClick} />
                </div>
              </div>
            ))
          )}

          {referrals.length > 0 && isOver && canDrop && (
            <div className="border-2 border-dashed border-blue-300 rounded-lg py-5 text-center bg-blue-50 transition-colors">
              <p className="text-xs text-blue-500 font-medium">Drop here</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

export default PipelineColumn;
