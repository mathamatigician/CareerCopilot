import React, { useState } from 'react';
import {
  X,
  Settings,
  Clock,
  Check,
  RotateCcw,
  Sparkles,
  Shield,
  Zap,
  Compass,
  Heart,
  TrendingUp,
  Anchor,
  HelpCircle,
} from 'lucide-react';
import { QuoteSettings, QuoteTopic } from '../types';
import { ALL_QUOTE_TOPICS, quoteService } from '../services/quoteService';
import { QUOTE_TOPIC_CONFIG } from '../data/motivationalQuotes';

interface QuoteSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved: (newSettings: QuoteSettings) => void;
}

export const QuoteSettingsModal: React.FC<QuoteSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved,
}) => {
  const currentSettings = quoteService.getSettings();
  const [frequency, setFrequency] = useState<number>(currentSettings.frequencyPerDay);
  const [selectedTopics, setSelectedTopics] = useState<QuoteTopic[]>(currentSettings.selectedTopics);
  const [showActionCue, setShowActionCue] = useState<boolean>(currentSettings.showActionCue);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFrequencyChange = (val: number) => {
    // constrain between 1 and 5
    const clamped = Math.max(1, Math.min(5, val || 1));
    setFrequency(clamped);
  };

  const toggleTopic = (topic: QuoteTopic) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) {
        if (prev.length === 1) return prev; // keep at least 1 topic selected
        return prev.filter((t) => t !== topic);
      } else {
        return [...prev, topic];
      }
    });
  };

  const handleSelectAllTopics = () => {
    setSelectedTopics(ALL_QUOTE_TOPICS);
  };

  const handleSave = () => {
    const updated = quoteService.saveSettings({
      frequencyPerDay: frequency,
      selectedTopics,
      showActionCue,
    });
    onSettingsSaved(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  const handleResetDefaults = () => {
    setFrequency(2);
    setSelectedTopics(ALL_QUOTE_TOPICS);
    setShowActionCue(true);
  };

  const getTopicIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-4 h-4 text-rose-600" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-indigo-600" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-red-600" />;
      case 'Heart':
        return <Heart className="w-4 h-4 text-emerald-600" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'Anchor':
        return <Anchor className="w-4 h-4 text-violet-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50/60 via-slate-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Daily Motivation & Quote Settings
              </h2>
              <p className="text-xs text-slate-500">
                Configure quote rotation frequency and uplifting focus topics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
          {/* 1. Daily Frequency Input */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <label
                  htmlFor="quote-frequency-input"
                  className="font-bold text-slate-900 flex items-center gap-1.5"
                >
                  <Clock className="w-4 h-4 text-red-600" />
                  <span>Daily Quote Change Frequency</span>
                </label>
                <p className="text-xs text-slate-500">
                  Default is <strong>2 times daily</strong> (Morning & Evening). Choose between 1 and 5.
                </p>
              </div>

              {/* Numeric Input Field */}
              <div className="flex items-center gap-2">
                <input
                  id="quote-frequency-input"
                  type="number"
                  min={1}
                  max={5}
                  step={1}
                  value={frequency}
                  onChange={(e) => handleFrequencyChange(parseInt(e.target.value, 10))}
                  className="w-20 px-3 py-2 text-center text-base font-extrabold text-slate-900 bg-white border-2 border-red-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 rounded-xl outline-hidden transition-all shadow-xs"
                />
                <span className="text-xs font-bold text-slate-600 shrink-0">
                  {frequency === 1 ? 'time / day' : 'times / day'}
                </span>
              </div>
            </div>

            {/* Visual Schedule Preview */}
            <div className="pt-2 border-t border-slate-200/60">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Active Daily Schedule ({frequency} Intervals):</span>
                <span className="text-red-700 font-semibold lowercase">
                  {frequency === 2 ? 'default morning & evening' : `${frequency} equal day phases`}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {frequency === 1 && (
                  <div className="col-span-2 p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">☀️ 1. All-Day Purpose</span>
                    <span className="text-slate-500 font-mono text-[11px]">00:00 - 24:00 (24h)</span>
                  </div>
                )}
                {frequency === 2 && (
                  <>
                    <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                      <span className="font-bold text-amber-900">🌅 1. Morning Spark</span>
                      <span className="text-amber-800 font-mono text-[11px]">06:00 - 18:00</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between">
                      <span className="font-bold text-indigo-900">🌇 2. Evening Reflection</span>
                      <span className="text-indigo-800 font-mono text-[11px]">18:00 - 06:00</span>
                    </div>
                  </>
                )}
                {frequency === 3 && (
                  <>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">🌅 Morning</span>
                      <span className="text-slate-500 font-mono text-[11px]">06:00 - 14:00</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">☀️ Afternoon</span>
                      <span className="text-slate-500 font-mono text-[11px]">14:00 - 20:00</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">🌙 Night Peace</span>
                      <span className="text-slate-500 font-mono text-[11px]">20:00 - 06:00</span>
                    </div>
                  </>
                )}
                {frequency === 4 && (
                  <>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">🌅 Morning (06-12)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">⚡ Midday (12-17)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">🌇 Evening (17-21)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">🌙 Night (21-06)</span>
                    </div>
                  </>
                )}
                {frequency === 5 && (
                  <>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">🌅 Dawn (06-10)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">⚡ Midday (10-14)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">☀️ Afternoon (14-18)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">🌇 Twilight (18-22)</span>
                    </div>
                    <div className="col-span-2 p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">🌙 Night Serenity (22-06)</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 2. Topic Selection Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span>Curated Inspiration Topics</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select which themes you want included in your daily quote rotation
                </p>
              </div>
              <button
                type="button"
                onClick={handleSelectAllTopics}
                className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
              >
                Select All
              </button>
            </div>

            <div className="space-y-2">
              {ALL_QUOTE_TOPICS.map((topicKey) => {
                const config = QUOTE_TOPIC_CONFIG[topicKey];
                const isSelected = selectedTopics.includes(topicKey);

                return (
                  <div
                    key={topicKey}
                    onClick={() => toggleTopic(topicKey)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-rose-50/40 border-red-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getTopicIcon(config.icon)}</div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                          <span>{config.label}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {config.description}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                        isSelected
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Action Cue Micro-Habit Toggle */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-xs text-slate-900 block">
                Show Action-Oriented Micro-Cues
              </span>
              <span className="text-xs text-slate-500 block">
                Displays a tangible 1-minute action prompt to break analysis paralysis and reduce depression
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowActionCue(!showActionCue)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                showActionCue ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  showActionCue ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
