/**
 * AI Clinical Assistant Panel
 * Contextual slide-over panel that provides clinical intelligence
 * within the patient chart. Supports proactive insights and Q&A.
 *
 * Performance: memoized sub-components, callback stability, lazy analysis.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Sparkles,
  X,
  Send,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Info,
  Brain,
  MessageSquare,
  Lightbulb,
  ChevronRight,
  Stethoscope,
  Pill,
  FileSearch,
  ShieldAlert,
  CalendarCheck,
  ClipboardList,
  HeartPulse,
  Zap,
  User,
  Activity,
} from 'lucide-react';

import { clinicalAssistantGateway } from '../../lib/dataGateway';
import type {
  AssistantAnalysis,
  ConversationMessage,
  InsightCategory,
  QuickAction,
} from '../../lib/clinicalAssistantTypes';
import { INSIGHT_CATEGORY_LABELS } from '../../lib/clinicalAssistantTypes';
import { InsightCard } from './InsightCard';

// ─── Quick Actions ──────────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'summary', label: 'Summarize Patient', prompt: 'Give me a summary of this patient\'s current status', icon: 'user', category: 'history_summary' },
  { id: 'medications', label: 'Medication Review', prompt: 'What is this patient\'s medication status? Any polypharmacy concerns?', icon: 'pill', category: 'medication_alert' },
  { id: 'visits', label: 'Visit Compliance', prompt: 'How is visit compliance? Are there any missed visits?', icon: 'calendar', category: 'risk_flag' },
  { id: 'docs', label: 'Doc Gaps', prompt: 'What documentation is missing or incomplete?', icon: 'file', category: 'documentation_gap' },
  { id: 'falls', label: 'Fall Risk', prompt: 'What is the fall risk status and what safety measures are in place?', icon: 'shield', category: 'risk_flag' },
  { id: 'auths', label: 'Authorizations', prompt: 'What is the authorization status? Any expiring soon?', icon: 'clipboard', category: 'risk_flag' },
  { id: 'billing', label: 'Billing Risks', prompt: 'Are there any claims at risk of rejection?', icon: 'zap', category: 'risk_flag' },
  { id: 'careplan', label: 'Care Plan', prompt: 'What is the care plan status? Any updates needed?', icon: 'heart', category: 'care_suggestion' },
];

const QUICK_ACTION_ICONS: Record<string, React.ElementType> = {
  user: User,
  pill: Pill,
  calendar: CalendarCheck,
  file: FileSearch,
  shield: ShieldAlert,
  clipboard: ClipboardList,
  zap: Zap,
  heart: HeartPulse,
};

// ─── Severity Count Badge ───────────────────────────────────────────────────

const SeverityDot = React.memo(function SeverityDot({
  severity,
  count,
}: {
  severity: string;
  count: number;
}) {
  if (count === 0) return null;
  const colors: Record<string, string> = {
    critical: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    positive: 'bg-emerald-500',
  };
  return (
    <span className="flex items-center gap-1 text-[10px] text-gray-600">
      <span className={cn('w-2 h-2 rounded-full', colors[severity])} />
      {count}
    </span>
  );
});

// ─── Conversation Bubble ────────────────────────────────────────────────────

const ConversationBubble = React.memo(function ConversationBubble({
  message,
  onNavigate,
}: {
  message: ConversationMessage;
  onNavigate: (route: string) => void;
}) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <Avatar className="size-7 shrink-0">
        <AvatarFallback
          className={cn(
            'text-white font-bold text-[10px]',
            isUser ? 'bg-blue-500' : 'bg-gradient-to-br from-violet-500 to-indigo-600'
          )}
        >
          {isUser ? 'You' : 'AI'}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'flex-1 min-w-0',
          isUser ? 'text-right' : 'text-left'
        )}
      >
        <div
          className={cn(
            'inline-block max-w-full rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          )}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" />
              <span className="text-xs opacity-70">Analyzing patient data...</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-left">{message.content}</div>
          )}
        </div>

        {/* Inline insights from Q&A */}
        {message.insights && message.insights.length > 0 && (
          <div className="mt-2 space-y-1.5 text-left">
            {message.insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onNavigate={onNavigate}
                compact
              />
            ))}
          </div>
        )}

        <div className="text-[9px] text-gray-400 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
});

// ─── Filter Tabs ────────────────────────────────────────────────────────────

type ViewTab = 'insights' | 'conversation';

// ─── Main Panel Component ───────────────────────────────────────────────────

interface AssistantPanelProps {
  patientId: string;
  patientName: string;
  open: boolean;
  onClose: () => void;
}

export default function AssistantPanel({
  patientId,
  patientName,
  open,
  onClose,
}: AssistantPanelProps) {
  const navigate = useNavigate();

  // ─── State ──────────────────────────────────────────────────────────
  const [analysis, setAnalysis] = useState<AssistantAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewTab>('insights');
  const [insightFilter, setInsightFilter] = useState<'all' | InsightCategory>('all');

  // Conversation
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [asking, setAsking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Fetch Analysis ─────────────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await clinicalAssistantGateway.analyze(patientId);
      setAnalysis(result);
    } catch (err: any) {
      console.error('[AssistantPanel] Analysis error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (open && !analysis && !loading) {
      runAnalysis();
    }
  }, [open, analysis, loading, runAnalysis]);

  // ─── Ask Question ───────────────────────────────────────────────────
  const handleAsk = useCallback(
    async (question: string) => {
      if (!question.trim() || asking) return;

      const userMsg: ConversationMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: question.trim(),
        timestamp: new Date().toISOString(),
      };

      const loadingMsg: ConversationMessage = {
        id: `msg-${Date.now()}-loading`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isLoading: true,
      };

      setConversation((prev) => [...prev, userMsg, loadingMsg]);
      setQuestionInput('');
      setAsking(true);
      setActiveView('conversation');

      // Scroll to bottom
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

      try {
        const result = await clinicalAssistantGateway.ask(patientId, question);

        const assistantMsg: ConversationMessage = {
          id: `msg-${Date.now()}-answer`,
          role: 'assistant',
          content: result.answer,
          timestamp: new Date().toISOString(),
          insights: result.insights,
        };

        setConversation((prev) =>
          prev.filter((m) => !m.isLoading).concat(assistantMsg)
        );
      } catch (err: any) {
        console.error('[AssistantPanel] Ask error:', err);
        const errMsg: ConversationMessage = {
          id: `msg-${Date.now()}-err`,
          role: 'assistant',
          content: `I encountered an error analyzing the patient data: ${err.message}. Please try again.`,
          timestamp: new Date().toISOString(),
        };
        setConversation((prev) => prev.filter((m) => !m.isLoading).concat(errMsg));
      } finally {
        setAsking(false);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    },
    [patientId, asking]
  );

  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      handleAsk(action.prompt);
    },
    [handleAsk]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleAsk(questionInput);
    },
    [questionInput, handleAsk]
  );

  const handleNavigate = useCallback(
    (route: string) => {
      navigate(route);
    },
    [navigate]
  );

  // ─── Filtered Insights ─────────────────────────────────────────────
  const filteredInsights = useMemo(() => {
    if (!analysis) return [];
    if (insightFilter === 'all') return analysis.insights;
    return analysis.insights.filter((i) => i.category === insightFilter);
  }, [analysis, insightFilter]);

  const insightCounts = useMemo(() => {
    if (!analysis) return { critical: 0, warning: 0, info: 0, positive: 0 };
    return {
      critical: analysis.insights.filter((i) => i.severity === 'critical').length,
      warning: analysis.insights.filter((i) => i.severity === 'warning').length,
      info: analysis.insights.filter((i) => i.severity === 'info').length,
      positive: analysis.insights.filter((i) => i.severity === 'positive').length,
    };
  }, [analysis]);

  const uniqueCategories = useMemo(() => {
    if (!analysis) return [];
    return [...new Set(analysis.insights.map((i) => i.category))];
  }, [analysis]);

  // ─── Render ─────────────────────────────────────────────────────────

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[440px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-gray-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-blue-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <Brain className="size-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  Clinical Assistant
                  <Badge className="bg-violet-100 text-violet-700 border-0 text-[9px] px-1 py-0 h-4">
                    AI
                  </Badge>
                </h3>
                <p className="text-[10px] text-gray-500">
                  Analyzing {patientName}'s records
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={runAnalysis}
                disabled={loading}
                className="size-7 p-0"
                title="Re-analyze"
              >
                <RefreshCw
                  className={cn('size-3.5', loading && 'animate-spin')}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="size-7 p-0"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Severity summary */}
          {analysis && (
            <div className="flex items-center gap-3">
              <SeverityDot severity="critical" count={insightCounts.critical} />
              <SeverityDot severity="warning" count={insightCounts.warning} />
              <SeverityDot severity="info" count={insightCounts.info} />
              <SeverityDot severity="positive" count={insightCounts.positive} />
              <span className="text-[10px] text-gray-400 ml-auto">
                {analysis.insights.length} insights generated
              </span>
            </div>
          )}
        </div>

        {/* View tabs */}
        <div className="flex px-4 gap-0.5">
          {[
            { id: 'insights' as ViewTab, label: 'Insights', icon: Lightbulb },
            { id: 'conversation' as ViewTab, label: 'Ask AI', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="size-3.5" />
                {tab.label}
                {tab.id === 'conversation' && conversation.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[9px] flex items-center justify-center font-bold">
                    {conversation.filter((m) => m.role === 'user').length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {loading && !analysis ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mx-auto mb-3">
                <Brain className="size-7 text-indigo-600 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-gray-700">Analyzing Patient Records</p>
              <p className="text-xs text-gray-500 mt-1">
                Reviewing clinical data, visit history, and documentation...
              </p>
              <div className="flex items-center justify-center gap-1 mt-3">
                {['bg-violet-400', 'bg-indigo-400', 'bg-blue-400'].map((c, i) => (
                  <span
                    key={i}
                    className={cn('w-1.5 h-1.5 rounded-full animate-bounce', c)}
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : error && !analysis ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <AlertTriangle className="size-10 text-amber-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">Analysis Unavailable</p>
              <p className="text-xs text-gray-500 mt-1 mb-3">{error}</p>
              <Button size="sm" onClick={runAnalysis}>
                <RefreshCw className="size-3.5 mr-1.5" /> Retry
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Insights View ─────────────────────────────────────────── */}
            {activeView === 'insights' && (
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Patient Summary */}
                {analysis?.patientSummary && (
                  <div className="shrink-0 px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-start gap-2">
                      <Stethoscope className="size-4 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {analysis.patientSummary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Top Concerns Banner */}
                {analysis && analysis.topConcerns.length > 0 && (
                  <div className="shrink-0 px-4 py-2.5 bg-red-50 border-b border-red-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="size-3 text-red-600" />
                      <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
                        Top Concerns
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {analysis.topConcerns.map((concern, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-red-700">
                          <ChevronRight className="size-2.5 shrink-0" />
                          <span>{concern}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Filter */}
                <div className="shrink-0 px-4 py-2 border-b border-gray-100 flex items-center gap-1 overflow-x-auto">
                  <button
                    onClick={() => setInsightFilter('all')}
                    className={cn(
                      'text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap transition-colors',
                      insightFilter === 'all'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:bg-gray-100'
                    )}
                  >
                    All ({analysis?.insights.length || 0})
                  </button>
                  {uniqueCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setInsightFilter(cat)}
                      className={cn(
                        'text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap transition-colors',
                        insightFilter === cat
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-500 hover:bg-gray-100'
                      )}
                    >
                      {INSIGHT_CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>

                {/* Insights List */}
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-2">
                    {filteredInsights.map((insight) => (
                      <InsightCard
                        key={insight.id}
                        insight={insight}
                        onNavigate={handleNavigate}
                      />
                    ))}
                    {filteredInsights.length === 0 && (
                      <div className="text-center py-8">
                        <Info className="size-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-xs text-gray-500">
                          No insights in this category
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* ── Conversation View ─────────────────────────────────────── */}
            {activeView === 'conversation' && (
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Quick Actions */}
                {conversation.length === 0 && (
                  <div className="shrink-0 p-4">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Zap className="size-3.5 text-amber-500" />
                      <span className="text-xs font-semibold text-gray-700">
                        Quick Actions
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {QUICK_ACTIONS.map((action) => {
                        const Icon = QUICK_ACTION_ICONS[action.icon] || Activity;
                        return (
                          <button
                            key={action.id}
                            onClick={() => handleQuickAction(action)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left group"
                          >
                            <div className="w-7 h-7 rounded-md bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 transition-colors">
                              <Icon className="size-3.5 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <span className="text-[11px] font-medium text-gray-700 group-hover:text-indigo-700 transition-colors">
                              {action.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Conversation Thread */}
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {conversation.length === 0 && (
                      <div className="text-center py-6">
                        <MessageSquare className="size-10 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-medium text-gray-500">
                          Ask me anything about this patient
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          I can answer questions about medications, visits,
                          documentation, risks, and more.
                        </p>
                      </div>
                    )}
                    {conversation.map((msg) => (
                      <ConversationBubble
                        key={msg.id}
                        message={msg}
                        onNavigate={handleNavigate}
                      />
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="shrink-0 border-t border-gray-200 p-3 bg-gray-50">
                  <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                      ref={inputRef}
                      value={questionInput}
                      onChange={(e) => setQuestionInput(e.target.value)}
                      placeholder="Ask about this patient..."
                      className="h-9 text-sm flex-1"
                      disabled={asking}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="h-9 w-9 p-0 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700"
                      disabled={!questionInput.trim() || asking}
                    >
                      {asking ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                    </Button>
                  </form>
                  <p className="text-[9px] text-gray-400 mt-1.5 text-center">
                    AI-generated insights for clinical support — always verify with clinical judgment
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Disclaimer Footer ──────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-[9px] text-gray-400 text-center leading-snug">
          <Sparkles className="size-2.5 inline mr-0.5 -mt-0.5" />
          AI-assisted analysis — does not replace clinical judgment. Verify all information before clinical decisions.
        </p>
      </div>
    </div>
  );
}