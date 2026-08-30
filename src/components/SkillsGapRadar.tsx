import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, PlusCircle, Sparkles, Filter, ChevronRight, Copy, Check, Zap } from 'lucide-react';
import { SkillsGapItem } from '../types';

interface SkillsGapRadarProps {
  skillsGap: SkillsGapItem[];
  onAddSkillToResume?: (skill: string) => void;
  externalFilter?: 'all' | 'matched' | 'missing_required' | 'missing_bonus' | 'partial';
  onFilterChange?: (filter: 'all' | 'matched' | 'missing_required' | 'missing_bonus' | 'partial') => void;
  highlightCategory?: string | null;
}

export const SkillsGapRadar: React.FC<SkillsGapRadarProps> = ({
  skillsGap,
  onAddSkillToResume,
  externalFilter,
  onFilterChange,
  highlightCategory,
}) => {
  const [internalFilter, setInternalFilter] = useState<'all' | 'matched' | 'missing_required' | 'missing_bonus' | 'partial'>('all');
  const [copiedSkill, setCopiedSkill] = useState<string | null>(null);

  const filter = externalFilter || internalFilter;
  const setFilter = (f: 'all' | 'matched' | 'missing_required' | 'missing_bonus' | 'partial') => {
    if (onFilterChange) onFilterChange(f);
    else setInternalFilter(f);
  };

  const matchedCount = skillsGap.filter((s) => s.category === 'matched').length;
  const missingReqCount = skillsGap.filter((s) => s.category === 'missing_required').length;
  const missingBonusCount = skillsGap.filter((s) => s.category === 'missing_bonus').length;
  const partialCount = skillsGap.filter((s) => s.category === 'partial').length;

  const filteredSkills = skillsGap.filter((s) => {
    if (filter === 'all') return true;
    return s.category === filter;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSkill(id);
    setTimeout(() => setCopiedSkill(null), 2000);
  };

  const getBadgeStyle = (category: SkillsGapItem['category'], importance: SkillsGapItem['importance']) => {
    switch (category) {
      case 'matched':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          label: 'Direct Match',
          accent: 'border-l-4 border-l-emerald-500',
          highlightRing: 'ring-2 ring-emerald-500 ring-offset-2',
        };
      case 'missing_required':
        return {
          bg: 'bg-red-50 border-red-200 text-red-800',
          icon: <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />,
          label: importance === 'high' ? 'Critical Gap (Must-Have)' : 'Missing Requirement',
          accent: 'border-l-4 border-l-red-500',
          highlightRing: 'ring-2 ring-red-500 ring-offset-2',
        };
      case 'missing_bonus':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          icon: <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />,
          label: 'Bonus / Nice-to-Have Gap',
          accent: 'border-l-4 border-l-amber-400',
          highlightRing: 'ring-2 ring-amber-500 ring-offset-2',
        };
      case 'partial':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />,
          label: 'Partial Match / Adjacent Skill',
          accent: 'border-l-4 border-l-blue-500',
          highlightRing: 'ring-2 ring-blue-500 ring-offset-2',
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 text-slate-800',
          icon: <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />,
          label: 'Skill Identified',
          accent: 'border-l-4 border-l-slate-400',
          highlightRing: '',
        };
    }
  };

  return (
    <div className="space-y-4" id="skills-gap-radar-container">
      {/* Top Category Filter Bar with Shortcut Hints */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/80">
        <button
          onClick={() => setFilter('all')}
          id="skills-filter-all-btn"
          title="Show All Skills (Alt + S)"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'all'
              ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>All Skills ({skillsGap.length})</span>
          <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] font-mono font-bold bg-slate-200/70 text-slate-600 rounded">
            Alt+S
          </kbd>
        </button>

        <button
          onClick={() => setFilter('matched')}
          id="skills-filter-matched-btn"
          title="Highlight Matching Skills (Alt + M)"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'matched'
              ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/50'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Matched ({matchedCount})</span>
          <kbd
            className={`hidden sm:inline-block px-1 py-0.2 text-[9px] font-mono font-bold rounded ${
              filter === 'matched' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            Alt+M
          </kbd>
        </button>

        <button
          onClick={() => setFilter('missing_required')}
          id="skills-filter-musthave-btn"
          title="Highlight Missing / Gap Skills (Alt + X)"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'missing_required'
              ? 'bg-red-600 text-white shadow-xs ring-2 ring-red-400/50'
              : 'text-red-700 hover:bg-red-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Must-Have Gaps ({missingReqCount})</span>
          <kbd
            className={`hidden sm:inline-block px-1 py-0.2 text-[9px] font-mono font-bold rounded ${
              filter === 'missing_required' ? 'bg-red-700 text-red-100' : 'bg-red-100 text-red-800'
            }`}
          >
            Alt+X
          </kbd>
        </button>

        <button
          onClick={() => setFilter('partial')}
          id="skills-filter-partial-btn"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'partial'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-blue-700 hover:bg-blue-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Partial / Adjacent ({partialCount})</span>
        </button>

        <button
          onClick={() => setFilter('missing_bonus')}
          id="skills-filter-bonus-btn"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'missing_bonus'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-700 hover:bg-amber-50'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Nice-to-Have Gaps ({missingBonusCount})</span>
        </button>
      </div>

      {/* Grid of Skill Cards with Highlight Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredSkills.map((item, idx) => {
          const badge = getBadgeStyle(item.category, item.importance);
          const isCategoryHighlighted = highlightCategory && item.category === highlightCategory;
          return (
            <div
              key={idx}
              className={`bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all ${
                badge.accent
              } ${isCategoryHighlighted ? badge.highlightRing : ''} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900">{item.skill}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  </div>
                  {item.importance === 'high' && item.category !== 'matched' && (
                    <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0">
                      High Impact
                    </span>
                  )}
                </div>

                {/* Contexts */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-3 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  {item.contextInJob && (
                    <div>
                      <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Job Requirement: </span>
                      <span>{item.contextInJob}</span>
                    </div>
                  )}
                  {item.contextInResume && (
                    <div>
                      <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">In Your Resume: </span>
                      <span className="italic">{item.contextInResume}</span>
                    </div>
                  )}
                </div>

                {/* Actionable Advice */}
                <div className="text-xs text-slate-700 bg-rose-50/40 p-2.5 rounded-lg border border-rose-100/70">
                  <div className="flex items-center gap-1 text-red-700 font-bold text-[11px] mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>How to Bridge This Gap:</span>
                  </div>
                  <p className="leading-relaxed">{item.recommendation}</p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleCopy(item.recommendation, `rec_${idx}`)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedSkill === `rec_${idx}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied Advice!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Strategy</span>
                    </>
                  )}
                </button>

                {item.category !== 'matched' && onAddSkillToResume && (
                  <button
                    onClick={() => onAddSkillToResume(item.skill)}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add to Tailored Skills</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
          <p className="text-sm font-medium">No skills found for this filter.</p>
        </div>
      )}
    </div>
  );
};
