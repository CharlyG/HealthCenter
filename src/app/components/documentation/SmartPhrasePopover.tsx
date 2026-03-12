/**
 * SmartPhrasePopover — Popover with commonly used clinical phrases.
 * When a textarea field has a smartPhraseCategory, this button appears.
 * Clicking a phrase inserts it into the field.
 *
 * Enhancements:
 * - System phrases tab + Personal phrases tab
 * - "Save as Personal Phrase" action
 * - Delete personal phrases
 */
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Sparkles, Search, TrendingUp, Copy, User, Library, Trash2, BookmarkPlus } from 'lucide-react';
import { documentationGateway } from '../../lib/dataGateway';
import type { SmartPhrase } from '../../lib/documentationTypes';
import { SavePhraseDialog } from './SavePhraseDialog';

interface SmartPhrasePopoverProps {
  category: string;
  onInsert: (text: string) => void;
  disabled?: boolean;
  /** Current field value, used to pre-fill "Save as Phrase" dialog */
  currentValue?: string;
}

export const SmartPhrasePopover = React.memo(function SmartPhrasePopover({
  category,
  onInsert,
  disabled,
  currentValue,
}: SmartPhrasePopoverProps) {
  const [open, setOpen] = useState(false);
  const [phrases, setPhrases] = useState<SmartPhrase[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'system' | 'personal'>('system');

  const loadPhrases = useCallback(() => {
    setLoading(true);
    documentationGateway
      .getPhrases(category)
      .then((res) => setPhrases(res.phrases || []))
      .catch((err) => console.error('[SmartPhrases] Load error:', err))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    if (open) {
      loadPhrases();
    }
  }, [open, loadPhrases]);

  const systemPhrases = phrases.filter((p) => !p.isPersonal);
  const personalPhrases = phrases.filter((p) => p.isPersonal);

  const activePhrases = tab === 'system' ? systemPhrases : personalPhrases;

  const filtered = search.trim()
    ? activePhrases.filter(
        (p) =>
          p.label.toLowerCase().includes(search.toLowerCase()) ||
          p.text.toLowerCase().includes(search.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : activePhrases;

  const handleInsert = useCallback(
    (phrase: SmartPhrase) => {
      onInsert(phrase.text);
      documentationGateway.usePhrase(phrase.id).catch(() => {});
      setOpen(false);
    },
    [onInsert]
  );

  const handleDeletePersonal = useCallback(
    async (e: React.MouseEvent, phrase: SmartPhrase) => {
      e.stopPropagation();
      try {
        await documentationGateway.deletePhrase(phrase.id);
        setPhrases((prev) => prev.filter((p) => p.id !== phrase.id));
        toast.success('Personal phrase deleted');
      } catch (err: any) {
        console.error('[SmartPhrases] Delete error:', err);
        toast.error(`Failed to delete phrase: ${err.message}`);
      }
    },
    []
  );

  const handlePhraseSaved = useCallback(() => {
    loadPhrases();
    setTab('personal');
  }, [loadPhrases]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 gap-1 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
          disabled={disabled}
          type="button"
        >
          <Sparkles className="size-3" />
          <span className="text-[10px] font-medium">Smart Phrases</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="start" sideOffset={6}>
        {/* Header */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-violet-500" />
              <h4 className="text-sm font-semibold text-gray-900">Smart Phrases</h4>
            </div>
            {/* Save as phrase button */}
            <SavePhraseDialog
              initialText={currentValue || ''}
              category={category}
              onSaved={handlePhraseSaved}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 gap-1 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                type="button"
              >
                <BookmarkPlus className="size-3" />
                <span className="text-[10px] font-medium">Save New</span>
              </Button>
            </SavePhraseDialog>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => setTab('system')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors',
                tab === 'system'
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
            >
              <Library className="size-3" />
              System ({systemPhrases.length})
            </button>
            <button
              onClick={() => setTab('personal')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors',
                tab === 'personal'
                  ? 'bg-teal-100 text-teal-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
            >
              <User className="size-3" />
              Personal ({personalPhrases.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phrases..."
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        <ScrollArea className="max-h-72">
          {loading ? (
            <div className="p-6 text-center">
              <p className="text-xs text-gray-500">Loading phrases...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center">
              {tab === 'personal' ? (
                <>
                  <User className="size-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs text-gray-500 mb-2">No personal phrases yet</p>
                  <p className="text-[10px] text-gray-400">
                    Click &ldquo;Save New&rdquo; above to create your first personal phrase
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-500">No phrases found</p>
              )}
            </div>
          ) : (
            <div className="p-1.5 space-y-1">
              {filtered.map((phrase) => (
                <button
                  key={phrase.id}
                  onClick={() => handleInsert(phrase)}
                  className={cn(
                    'w-full text-left p-2.5 rounded-lg transition-colors group',
                    phrase.isPersonal
                      ? 'hover:bg-teal-50'
                      : 'hover:bg-violet-50'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {phrase.isPersonal && (
                        <Badge variant="outline" className="text-[7px] h-3.5 px-1 bg-teal-50 border-teal-200 text-teal-600">
                          Personal
                        </Badge>
                      )}
                      <span className={cn(
                        'text-xs font-semibold',
                        phrase.isPersonal
                          ? 'text-gray-800 group-hover:text-teal-700'
                          : 'text-gray-800 group-hover:text-violet-700'
                      )}>
                        {phrase.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                        <TrendingUp className="size-2.5" />
                        {phrase.usageCount}
                      </span>
                      {phrase.isPersonal && (
                        <button
                          onClick={(e) => handleDeletePersonal(e, phrase)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100"
                          title="Delete personal phrase"
                          type="button"
                        >
                          <Trash2 className="size-3 text-red-400 hover:text-red-600" />
                        </button>
                      )}
                      <Copy className={cn(
                        'size-3',
                        phrase.isPersonal
                          ? 'text-gray-300 group-hover:text-teal-500'
                          : 'text-gray-300 group-hover:text-violet-500'
                      )} />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">
                    {phrase.text}
                  </p>
                  {phrase.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {phrase.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[8px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
});

export default SmartPhrasePopover;
