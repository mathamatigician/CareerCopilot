import React, { useState } from 'react';
import { Briefcase, CheckCircle2, AlertCircle, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
import { ExperienceAlignment } from '../types';

interface ExperienceAlignmentViewProps {
  alignments: ExperienceAlignment[];
  onApplyBullet?: (bullet: string) => void;
}

export const ExperienceAlignmentView: React.FC<ExperienceAlignmentViewProps> = ({
  alignments,
  onApplyBullet,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyBullet = (bullet: string, idx: number) => {
    navigator.clipboard.writeText(bullet);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex items-start gap-3">
        <Briefcase className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Experience & Seniority Fit Breakdown</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Compare each core responsibility in the job post against your background. Use the recommended Google X-Y-Z bullet rewrites to maximize ATS scoring and interview impact.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {alignments.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3.5"
          >
            {/* Top row: Requirement + Score */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <h5 className="font-extrabold text-sm text-slate-900 leading-snug">
                  {item.jobRequirement}
                </h5>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getProgressBarColor(item.candidateMatchScore)}`}
                    style={{ width: `${item.candidateMatchScore}%` }}
                  />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getScoreColor(item.candidateMatchScore)}`}>
                  {item.candidateMatchScore}% Match
                </span>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px] block mb-1">
                  Your Current Experience
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {item.candidateExperience}
                </p>
              </div>

              <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-100">
                <span className="font-bold text-red-700 uppercase tracking-wider text-[10px] block mb-1">
                  Recruiter Gap Assessment
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {item.gapAnalysis}
                </p>
              </div>
            </div>

            {/* Strategic Advice */}
            {item.actionableAdvice && (
              <div className="text-xs text-slate-700 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 block text-[11px]">Strategic Positioning Tip:</span>
                  <p className="mt-0.5">{item.actionableAdvice}</p>
                </div>
              </div>
            )}

            {/* Suggested Tailored Bullet Point */}
            {item.tailoredBulletSuggestion && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 p-3.5 rounded-xl border border-red-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                    <Sparkles className="w-3.5 h-3.5 text-red-600" />
                    <span>ATS-Optimized Impact Bullet (Formula: Action + Impact + Metric)</span>
                  </div>
                  <button
                    onClick={() => handleCopyBullet(item.tailoredBulletSuggestion, idx)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-md shadow-2xs border border-red-100 transition-all hover:scale-105"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Bullet</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-900 font-semibold bg-white p-2.5 rounded-lg border border-red-100 shadow-2xs leading-relaxed">
                  • {item.tailoredBulletSuggestion}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
