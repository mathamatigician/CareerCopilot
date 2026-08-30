import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  X,
  Search,
  Sparkles,
  Command,
  ArrowRight,
  Check,
  Zap,
  Layers,
  FileText,
  TrendingUp,
  LayoutDashboard,
  Award,
} from 'lucide-react';
import { KEYBOARD_SHORTCUTS, ShortcutDefinition, triggerShortcutAction } from '../utils/shortcutEvents';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: ShortcutDefinition[];
  onExecuteShortcut?: (actionId: string) => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcuts = KEYBOARD_SHORTCUTS,
  onExecuteShortcut,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [executedAction, setExecutedAction] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['All', 'Navigation', 'Application Tailoring', 'Skills & Gap Analysis', 'Document Studio', 'System & Modals'];

  const filteredShortcuts = shortcuts.filter((s) => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch =
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.keys.some((k) => k.toLowerCase().includes(search.toLowerCase())) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRunAction = (shortcut: ShortcutDefinition) => {
    setExecutedAction(shortcut.id);
    if (onExecuteShortcut) {
      onExecuteShortcut(shortcut.actionId);
    } else {
      triggerShortcutAction(shortcut.actionId);
    }
    setTimeout(() => {
      setExecutedAction(null);
      onClose();
    }, 500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Navigation':
        return <LayoutDashboard className="w-3.5 h-3.5 text-rose-600" />;
      case 'Application Tailoring':
        return <Sparkles className="w-3.5 h-3.5 text-red-600" />;
      case 'Skills & Gap Analysis':
        return <TrendingUp className="w-3.5 h-3.5 text-amber-600" />;
      case 'Document Studio':
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Command className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      id="keyboard-shortcuts-modal"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-600 to-rose-600 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">Keyboard Shortcuts</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wide">
                  Pro Navigation
                </span>
              </div>
              <p className="text-xs text-rose-100 font-medium mt-0.5">
                Speed up tailoring, review past applications, and highlight critical skill gaps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shortcuts (e.g., past applications, generate, skills, cv)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat !== 'All' && getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredShortcuts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Keyboard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">No shortcuts matching "{search}"</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching for navigation, skills, or tailoring</p>
            </div>
          ) : (
            filteredShortcuts.map((shortcut) => {
              const isExecuted = executedAction === shortcut.id;
              return (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 bg-white hover:border-rose-200 hover:bg-rose-50/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-red-50 flex items-center justify-center shrink-0 transition-colors">
                      {getCategoryIcon(shortcut.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800">{shortcut.description}</span>
                        {shortcut.badge && (
                          <span className="px-1.5 py-0.2 bg-red-50 text-red-700 border border-red-200 rounded text-[9px] font-extrabold">
                            {shortcut.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                        {shortcut.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Key Combination Keycaps */}
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-mono font-bold text-slate-700 shadow-2xs group-hover:border-red-300 group-hover:bg-white transition-colors">
                            {key}
                          </kbd>
                          {kIdx < shortcut.keys.length - 1 && (
                            <span className="text-slate-400 text-xs font-bold">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Quick Trigger Button */}
                    <button
                      onClick={() => handleRunAction(shortcut)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isExecuted
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title={`Execute: ${shortcut.description}`}
                    >
                      {isExecuted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-semibold text-slate-600">
              Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold font-mono">?</kbd> anywhere to open this dialog
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold font-mono">Esc</kbd> to dismiss
          </span>
        </div>
      </div>
    </div>
  );
};
