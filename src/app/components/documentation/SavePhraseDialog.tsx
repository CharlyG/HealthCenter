/**
 * SavePhraseDialog — Save selected text as a personal smart phrase.
 * Appears as a button next to textarea fields and in the SmartPhrasePopover.
 */
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { BookmarkPlus, Loader2, Tag, X } from 'lucide-react';
import { documentationGateway } from '../../lib/dataGateway';

interface SavePhraseDialogProps {
  /** Pre-filled text from the field the user is saving from */
  initialText?: string;
  /** Category to assign the phrase to */
  category: string;
  /** Callback after successful save */
  onSaved?: () => void;
  /** Trigger element */
  children?: React.ReactNode;
}

export const SavePhraseDialog = React.memo(function SavePhraseDialog({
  initialText = '',
  category,
  onSaved,
  children,
}: SavePhraseDialogProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [text, setText] = useState(initialText);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Reset form when opening
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen) {
        setText(initialText);
        setLabel('');
        setTags([]);
        setTagInput('');
      }
    },
    [initialText]
  );

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      }
    },
    [addTag]
  );

  const handleSave = useCallback(async () => {
    if (!label.trim()) {
      toast.error('Please provide a phrase name');
      return;
    }
    if (!text.trim()) {
      toast.error('Phrase text cannot be empty');
      return;
    }

    try {
      setSaving(true);
      await documentationGateway.createPhrase({
        category,
        label: label.trim(),
        text: text.trim(),
        tags,
      });
      toast.success('Personal phrase saved');
      setOpen(false);
      onSaved?.();
    } catch (err: any) {
      console.error('[SavePhrase] Error:', err);
      toast.error(`Failed to save phrase: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [label, text, tags, category, onSaved]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 gap-1 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            type="button"
          >
            <BookmarkPlus className="size-3" />
            <span className="text-[10px] font-medium">Save as Phrase</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkPlus className="size-5 text-teal-600" />
            Save Personal Phrase
          </DialogTitle>
          <DialogDescription>
            Save this text as a reusable smart phrase for quick insertion in future documentation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Phrase name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Phrase Name <span className="text-red-400">*</span>
            </Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., My Standard Assessment"
              className="h-9 text-sm"
              maxLength={100}
            />
          </div>

          {/* Phrase text */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Phrase Text <span className="text-red-400">*</span>
            </Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="The text that will be inserted..."
              className="min-h-[120px] text-sm leading-relaxed"
              maxLength={3000}
            />
            <p className="text-[9px] text-gray-400 text-right">
              {text.length}/3000
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Tags (optional)</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-gray-400" />
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add tag & press Enter..."
                  className="h-8 pl-7 text-xs"
                  maxLength={30}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                type="button"
              >
                Add
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[9px] h-5 px-1.5 gap-1 bg-teal-50 border-teal-200 text-teal-700"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500"
                      type="button"
                    >
                      <X className="size-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !label.trim() || !text.trim()}
            className="gap-1.5 bg-teal-600 hover:bg-teal-700"
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <BookmarkPlus className="size-3.5" />
            )}
            Save Phrase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default SavePhraseDialog;
