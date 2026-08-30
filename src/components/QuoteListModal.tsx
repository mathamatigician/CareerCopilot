import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Download,
  Copy,
  Check,
  Sparkles,
  Quote as QuoteIcon,
  Filter,
  CheckCircle2,
  Heart,
  FileText,
  Share2,
} from 'lucide-react';
import { MotivationalQuote, QuoteTopic } from '../types';
import { ALL_QUOTE_TOPICS, quoteService } from '../services/quoteService';
import { QUOTE_TOPIC_CONFIG, MOTIVATIONAL_QUOTES } from '../data/motivationalQuotes';

interface QuoteListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuote?: (quote: MotivationalQuote) => void;
}

export const QuoteListModal: React.FC<QuoteListModalProps> = ({
  isOpen,
  onClose,
  onSelectQuote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<QuoteTopic | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => quoteService.getFavoriteQuoteIds());

  if (!isOpen) return null;

  const allQuotes = MOTIVATIONAL_QUOTES;

  const filteredQuotes = useMemo(() => {
    return allQuotes.filter((q) => {
      const matchesTopic =
        selectedTopicFilter === 'all' || q.topic === selectedTopicFilter;
      const matchesSearch =
        searchTerm.trim() === '' ||
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.actionCue.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTopic && matchesSearch;
    });
  }, [allQuotes, selectedTopicFilter, searchTerm]);

  const handleCopySingle = async (quote: MotivationalQuote) => {
    const text = `"${quote.text}" — ${quote.author}\n⚡ Action Micro-Cue: ${quote.actionCue}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(quote.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportTextFile = () => {
    quoteService.downloadQuotesAsTextFile(
      filteredQuotes,
      `tailorfit-quotes-${selectedTopicFilter}-${Date.now()}.txt`
    );
  };

  const handleCopyAllAsText = async () => {
    const ok = await quoteService.copyQuotesToClipboard(filteredQuotes);
    if (ok) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = quoteService.toggleFavoriteQuote(id);
    setFavorites(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50/70 via-slate-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-xs">
              <QuoteIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Daily Motivation & Resilience Collection</span>
                <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  {filteredQuotes.length} Quotes
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Action-oriented mindset reminders to overcome rejection and maintain daily momentum
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

        {/* Toolbar: Search & Actions */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quotes, authors, themes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white border border-slate-200 focus:border-red-600 focus:ring-2 focus:ring-red-100 rounded-xl outline-hidden transition-all shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyAllAsText}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Copy all currently filtered quotes as plain text to clipboard"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied All!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy All Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportTextFile}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-red-600/20"
              title="Download quotes collection as a formatted .txt document"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export as .txt File</span>
            </button>
          </div>
        </div>

        {/* Topic Filter Chips */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setSelectedTopicFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
              selectedTopicFilter === 'all'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Themes ({allQuotes.length})
          </button>
          {ALL_QUOTE_TOPICS.map((topicKey) => {
            const config = QUOTE_TOPIC_CONFIG[topicKey];
            const isSelected = selectedTopicFilter === topicKey;
            const count = allQuotes.filter((q) => q.topic === topicKey).length;

            return (
              <button
                key={topicKey}
                onClick={() => setSelectedTopicFilter(topicKey)}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{config.label.split('&')[0]}</span>
                <span
                  className={`text-[10px] px-1 rounded-md ${
                    isSelected ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quotes List Container */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
          {filteredQuotes.map((q, idx) => {
            const config = QUOTE_TOPIC_CONFIG[q.topic];
            const isFav = favorites.includes(q.id);

            return (
              <div
                key={q.id}
                className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3 relative group"
              >
                {/* Top Meta */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        config?.accentColor || 'text-slate-700 bg-slate-50 border-slate-200'
                      }`}
                    >
                      {q.categoryLabel}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(q.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isFav
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-600 text-red-600' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Quote Text */}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed italic">
                    "{q.text}"
                  </p>
                  <p className="text-xs font-bold text-slate-500 text-right">
                    — {q.author}
                  </p>
                </div>

                {/* Action Cue */}
                {q.actionCue && (
                  <div className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100/80 flex items-start gap-2 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-red-800">Action Micro-Cue: </span>
                      <span className="text-slate-700">{q.actionCue}</span>
                    </div>
                  </div>
                )}

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleCopySingle(q)}
                    className="text-slate-500 hover:text-slate-800 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedId === q.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Quote</span>
                      </>
                    )}
                  </button>

                  {onSelectQuote && (
                    <button
                      onClick={() => {
                        onSelectQuote(q);
                        onClose();
                      }}
                      className="text-red-600 hover:text-red-700 font-extrabold inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Set as Active Quote</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredQuotes.length === 0 && (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 space-y-2">
              <QuoteIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700">No quotes match your filter.</p>
              <p className="text-xs text-slate-400">
                Try searching for another keyword or clear the active theme filter.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Total {allQuotes.length} quotes loaded</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
