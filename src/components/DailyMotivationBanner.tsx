import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  Zap,
  RotateCw,
  Copy,
  Check,
  Settings,
  List,
  Download,
  ChevronDown,
  ChevronUp,
  Quote as QuoteIcon,
  Heart,
  Shield,
  Compass,
  TrendingUp,
  Anchor,
  FileText,
} from 'lucide-react';
import { MotivationalQuote, QuoteSettings } from '../types';
import { quoteService, TimeSlotDetails } from '../services/quoteService';
import { QUOTE_TOPIC_CONFIG } from '../data/motivationalQuotes';
import { QuoteSettingsModal } from './QuoteSettingsModal';
import { QuoteListModal } from './QuoteListModal';

interface DailyMotivationBannerProps {
  onNotify?: (message: string) => void;
}

export const DailyMotivationBanner: React.FC<DailyMotivationBannerProps> = ({ onNotify }) => {
  const [settings, setSettings] = useState<QuoteSettings>(() => quoteService.getSettings());
  const [manualOffset, setManualOffset] = useState<number>(0);
  const [activeData, setActiveData] = useState<{ quote: MotivationalQuote; slot: TimeSlotDetails }>(() =>
    quoteService.getActiveQuote(settings, 0)
  );
  const [copied, setCopied] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(settings.isBannerCollapsed);
  const [isRotating, setIsRotating] = useState(false);

  // Listen for shortcut actions
  useEffect(() => {
    const handleShortcut = (e: any) => {
      const actionId = e.detail?.actionId;
      if (actionId === 'NEXT_QUOTE') {
        handleNextQuote();
      } else if (actionId === 'OPEN_QUOTES_LIBRARY') {
        setListModalOpen(true);
      }
    };
    window.addEventListener('tailorfit:shortcut', handleShortcut);
    return () => window.removeEventListener('tailorfit:shortcut', handleShortcut);
  }, []);

  // Update active quote whenever settings or manualOffset changes
  useEffect(() => {
    const data = quoteService.getActiveQuote(settings, manualOffset);
    setActiveData(data);
  }, [settings, manualOffset]);

  // Periodic check for time slot change (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = quoteService.getActiveQuote(settings, manualOffset);
      if (current.slot.slotIndex !== activeData.slot.slotIndex) {
        setActiveData(current);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [settings, manualOffset, activeData.slot.slotIndex]);

  const handleNextQuote = () => {
    setIsRotating(true);
    setManualOffset((prev) => prev + 1);
    setTimeout(() => setIsRotating(false), 400);
  };

  const handleCopyQuote = async () => {
    const { quote } = activeData;
    const text = `"${quote.text}" — ${quote.author}\n⚡ Action Micro-Cue: ${quote.actionCue}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (onNotify) onNotify('Copied motivation quote to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleExportAll = () => {
    const all = quoteService.getAllQuotes();
    quoteService.downloadQuotesAsTextFile(all, 'tailorfit-daily-motivation-quotes.txt');
    if (onNotify) onNotify('Downloaded motivation quotes text file (.txt)!');
  };

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    const updated = quoteService.saveSettings({ isBannerCollapsed: next });
    setSettings(updated);
  };

  const handleSettingsSaved = (newSettings: QuoteSettings) => {
    setSettings(newSettings);
    setManualOffset(0);
    if (onNotify) onNotify(`Quote schedule set to ${newSettings.frequencyPerDay}x daily!`);
  };

  const handleSelectQuoteFromList = (quote: MotivationalQuote) => {
    const slot = quoteService.getCurrentTimeSlot(settings.frequencyPerDay);
    setActiveData({ quote, slot });
    if (onNotify) onNotify('Selected quote set as active!');
  };

  const getSlotIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sunrise':
        return <Sunrise className="w-3.5 h-3.5 text-amber-500" />;
      case 'Sunset':
        return <Sunset className="w-3.5 h-3.5 text-indigo-500" />;
      case 'Sun':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'Moon':
        return <Moon className="w-3.5 h-3.5 text-purple-400" />;
      case 'Zap':
        return <Zap className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-red-500" />;
    }
  };

  const { quote, slot } = activeData;
  const topicConfig = QUOTE_TOPIC_CONFIG[quote.topic];

  return (
    <>
      <section
        aria-label="Daily Motivation and Purpose"
        className="max-w-7xl mx-auto mb-6 bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 rounded-2xl border border-red-100 shadow-sm shadow-red-950/5 relative overflow-hidden transition-all duration-200"
      >
        {/* Subtle decorative glow accents */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-red-100/40 via-amber-100/20 to-transparent pointer-events-none rounded-bl-full" />
        <div className="absolute -bottom-10 left-12 w-48 h-24 bg-rose-100/30 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Bar inside card */}
        <div className="px-4 sm:px-6 py-3 border-b border-rose-100/80 flex items-center justify-between gap-3 relative z-10 bg-white/60 backdrop-blur-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Slot Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-rose-200/90 shadow-2xs text-xs font-bold text-slate-800">
              {getSlotIcon(slot.iconName)}
              <span>{slot.label}</span>
              <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-md">
                {slot.timeRange}
              </span>
            </div>

            {/* Frequency indicator pill */}
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-800 bg-rose-100/80 hover:bg-rose-200/80 border border-rose-200 transition-colors cursor-pointer"
              title="Click to change daily rotation frequency (1 - 5 times daily)"
            >
              <span>{settings.frequencyPerDay}x Daily Rotation</span>
              <Settings className="w-3 h-3 text-red-600 ml-0.5" />
            </button>

            {/* Topic pill */}
            <span
              className={`hidden md:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                topicConfig?.accentColor || 'text-slate-700 bg-slate-50 border-slate-200'
              }`}
            >
              {topicConfig?.label || quote.categoryLabel}
            </span>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={handleNextQuote}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-red-700 hover:bg-white border border-transparent hover:border-slate-200 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Shuffle to another inspiring quote"
            >
              <RotateCw
                className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                  isRotating ? 'rotate-180 text-red-600' : ''
                }`}
              />
              <span className="hidden sm:inline">Next Quote</span>
            </button>

            <button
              onClick={handleCopyQuote}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-red-700 hover:bg-white border border-transparent hover:border-slate-200 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Copy quote and action prompt"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            <button
              onClick={() => setListModalOpen(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-red-700 hover:bg-white border border-transparent hover:border-slate-200 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="View entire library of motivation quotes"
            >
              <List className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">All Quotes</span>
            </button>

            <button
              onClick={handleExportAll}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-red-700 hover:bg-white border border-transparent hover:border-slate-200 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Export all quotes to a formatted .txt file"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Export Text</span>
            </button>

            <button
              onClick={() => setSettingsModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              title="Configure Quote Topics & Frequency"
            >
              <Settings className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-rose-200 mx-0.5" />

            <button
              onClick={handleToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand motivation card' : 'Collapse motivation card'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsed Compact View */}
        {isCollapsed ? (
          <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs bg-white/40">
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="font-semibold text-slate-800 italic truncate">
                "{quote.text}"
              </span>
              <span className="text-slate-500 shrink-0">— {quote.author}</span>
            </div>
            <button
              onClick={handleToggleCollapse}
              className="text-red-600 hover:text-red-700 font-bold shrink-0 text-[11px] cursor-pointer"
            >
              Expand View
            </button>
          </div>
        ) : (
          /* Expanded Full View */
          <div className="p-4 sm:p-6 space-y-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Quote Content */}
              <div className="space-y-2 flex-1 max-w-4xl">
                <div className="relative pl-6">
                  <QuoteIcon className="w-8 h-8 text-red-200 absolute -left-1 -top-2 -z-0 opacity-60" />
                  <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed tracking-tight italic relative z-10">
                    "{quote.text}"
                  </p>
                </div>
                <div className="pl-6 flex items-center gap-2 text-xs text-slate-600 font-semibold">
                  <span className="text-red-700 font-extrabold text-sm">— {quote.author}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{quote.categoryLabel}</span>
                </div>
              </div>

              {/* Action-Oriented Micro-Cue Box */}
              {settings.showActionCue && quote.actionCue && (
                <div className="w-full md:w-80 bg-white/90 p-3.5 rounded-xl border border-rose-200/90 shadow-2xs space-y-1.5 shrink-0 self-start">
                  <div className="flex items-center gap-1.5 text-red-700 font-extrabold text-xs">
                    <Zap className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                    <span>Action-Oriented Micro-Cue</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {quote.actionCue}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Settings Modal */}
      <QuoteSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onSettingsSaved={handleSettingsSaved}
      />

      {/* Full Quotes List & Export Modal */}
      <QuoteListModal
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        onSelectQuote={handleSelectQuoteFromList}
      />
    </>
  );
};
