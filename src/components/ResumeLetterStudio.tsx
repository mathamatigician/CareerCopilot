import React, { useState } from 'react';
import {
  FileText,
  Mail,
  Download,
  Copy,
  Check,
  Printer,
  Edit3,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  Layers,
  FileCode,
  Award,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TailoredResumeData, TailoredCoverLetterData, CertificationItem } from '../types';
import { exportResumeToPdf, exportCoverLetterToPdf } from '../utils/exportUtils';
import { api } from '../services/api';
import { CertificationProofViewerModal } from './CertificationProofViewerModal';

interface ResumeLetterStudioProps {
  resume: TailoredResumeData;
  coverLetter: TailoredCoverLetterData;
  jobTitle?: string;
  companyName?: string;
  onUpdateResume?: (updated: TailoredResumeData) => void;
  onUpdateCoverLetter?: (updated: TailoredCoverLetterData) => void;
}

export type DocumentTemplate = 'modern_crimson' | 'classic_executive' | 'minimalist_ats';

export const ResumeLetterStudio: React.FC<ResumeLetterStudioProps> = ({
  resume,
  coverLetter,
  jobTitle = 'Target Role',
  companyName = 'Company',
  onUpdateResume,
  onUpdateCoverLetter,
}) => {
  const [activeTab, setActiveTab] = useState<'resume' | 'cover_letter'>('resume');
  const [template, setTemplate] = useState<DocumentTemplate>('modern_crimson');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [viewingProofCert, setViewingProofCert] = useState<CertificationItem | null>(null);

  // Local editable state
  const [localResume, setLocalResume] = useState<TailoredResumeData>(resume);
  const [localLetter, setLocalLetter] = useState<TailoredCoverLetterData>(coverLetter);

  // Keyboard shortcut listener for edit mode
  React.useEffect(() => {
    const handleShortcut = (e: any) => {
      if (e.detail?.actionId === 'TOGGLE_EDIT_MODE') {
        setIsEditing((prev) => !prev);
      }
    };
    window.addEventListener('tailorfit:shortcut', handleShortcut);
    return () => window.removeEventListener('tailorfit:shortcut', handleShortcut);
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#e11d48', '#f43f5e', '#fb7185'],
    });
  };

  const handleDownloadDocx = async () => {
    setExportingDocx(true);
    try {
      if (activeTab === 'resume') {
        await api.downloadDocx(
          'resume',
          localResume,
          `${(localResume.fullName || 'Candidate').replace(/\s+/g, '_')}_Tailored_Resume.docx`
        );
      } else {
        await api.downloadDocx(
          'cover_letter',
          localLetter,
          `${(localLetter.candidateName || 'Candidate').replace(/\s+/g, '_')}_Tailored_Cover_Letter.docx`
        );
      }
      triggerConfetti();
    } catch (err) {
      console.error('Docx export failed:', err);
    } finally {
      setExportingDocx(false);
    }
  };

  const handleDownloadPdf = () => {
    if (activeTab === 'resume') {
      exportResumeToPdf(
        localResume,
        `${(localResume.fullName || 'Candidate').replace(/\s+/g, '_')}_Tailored_Resume.pdf`
      );
    } else {
      exportCoverLetterToPdf(
        localLetter,
        `${(localLetter.candidateName || 'Candidate').replace(/\s+/g, '_')}_Tailored_Cover_Letter.pdf`
      );
    }
    triggerConfetti();
  };

  const handleCopyText = () => {
    if (activeTab === 'resume') {
      const text = `${localResume.fullName.toUpperCase()}
${localResume.headline}
${localResume.location} | ${localResume.phone} | ${localResume.email} | ${localResume.linkedin}

SUMMARY
${localResume.summary}

CORE COMPETENCIES
${localResume.coreCompetencies.join(' | ')}

EXPERIENCE
${localResume.experience
  .map(
    (exp) => `${exp.role} | ${exp.company} (${exp.period})
${exp.accomplishments.map((b) => `• ${b}`).join('\n')}`
  )
  .join('\n\n')}

EDUCATION
${localResume.education.map((e) => `${e.degree} - ${e.school} (${e.year})`).join('\n')}`;

      navigator.clipboard.writeText(text);
    } else {
      navigator.clipboard.writeText(localLetter.fullLetterText || localLetter.openingParagraph);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResumeFieldChange = (field: keyof TailoredResumeData, val: any) => {
    const updated = { ...localResume, [field]: val };
    setLocalResume(updated);
    if (onUpdateResume) onUpdateResume(updated);
  };

  const handleCoverLetterFieldChange = (field: keyof TailoredCoverLetterData, val: any) => {
    const updated = { ...localLetter, [field]: val };
    setLocalLetter(updated);
    if (onUpdateCoverLetter) onUpdateCoverLetter(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-rose-100/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Document Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('resume')}
            id="tab-tailored-resume"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'resume'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tailored Resume</span>
          </button>

          <button
            onClick={() => setActiveTab('cover_letter')}
            id="tab-tailored-cover-letter"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cover_letter'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Tailored Cover Letter</span>
          </button>
        </div>

        {/* Template Style Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 hidden sm:inline flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Theme:
          </span>
          <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setTemplate('modern_crimson')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                template === 'modern_crimson'
                  ? 'bg-white text-red-700 font-bold shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Modern Crimson
            </button>
            <button
              onClick={() => setTemplate('classic_executive')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                template === 'classic_executive'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Executive Classic
            </button>
            <button
              onClick={() => setTemplate('minimalist_ats')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                template === 'minimalist_ats'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              Minimalist ATS
            </button>
          </div>
        </div>

        {/* Export & Edit Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsEditing(!isEditing)}
            id="toggle-edit-mode-btn"
            title="Toggle Edit / Preview Mode (Ctrl/⌘ + E)"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-colors ${
              isEditing
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Preview Mode' : 'Edit Mode'}</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] font-mono font-bold bg-slate-100 text-slate-500 rounded border border-slate-200">
              ⌘E
            </kbd>
          </button>

          <button
            onClick={handleCopyText}
            id="copy-text-btn"
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadDocx}
            disabled={exportingDocx}
            id="export-docx-btn"
            title="Download Word Document"
            className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportingDocx ? 'Generating...' : 'Export DOCX'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            id="export-pdf-btn"
            title="Download PDF Document"
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <FileCode className="w-3.5 h-3.5 text-rose-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Document Preview Sheet */}
      <div className="bg-slate-100/70 p-4 sm:p-8 rounded-2xl border border-slate-200/80 flex justify-center overflow-x-auto">
        <div
          className={`w-full max-w-[850px] bg-white min-h-[1050px] p-8 sm:p-12 rounded-xl shadow-xl border ${
            template === 'modern_crimson'
              ? 'border-red-100 font-sans'
              : template === 'classic_executive'
              ? 'border-slate-300 font-serif'
              : 'border-slate-300 font-mono text-xs'
          }`}
          id="document-print-container"
        >
          {activeTab === 'resume' ? (
            /* --- TAILORED RESUME DOCUMENT VIEW --- */
            <div className="space-y-6">
              {/* Header */}
              <div
                className={`text-center pb-4 border-b ${
                  template === 'modern_crimson'
                    ? 'border-red-600'
                    : template === 'classic_executive'
                    ? 'border-slate-800'
                    : 'border-black'
                }`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={localResume.fullName}
                      onChange={(e) => handleResumeFieldChange('fullName', e.target.value)}
                      className="w-full text-center font-extrabold text-2xl text-red-700 border-b border-dashed border-red-300 outline-none"
                    />
                    <input
                      type="text"
                      value={localResume.headline}
                      onChange={(e) => handleResumeFieldChange('headline', e.target.value)}
                      className="w-full text-center text-sm italic text-slate-600 border-b border-dashed border-slate-300 outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <h1
                      className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                        template === 'modern_crimson'
                          ? 'text-red-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {localResume.fullName || 'Candidate Name'}
                    </h1>
                    {localResume.headline && (
                      <p className="text-sm font-semibold text-slate-600 mt-1 italic">
                        {localResume.headline}
                      </p>
                    )}
                  </>
                )}

                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2 font-medium">
                  {localResume.location && <span>{localResume.location}</span>}
                  {localResume.phone && <span>• {localResume.phone}</span>}
                  {localResume.email && <span>• {localResume.email}</span>}
                  {localResume.linkedin && <span>• {localResume.linkedin}</span>}
                  {localResume.portfolio && <span>• {localResume.portfolio}</span>}
                </div>
              </div>

              {/* Summary Section */}
              <div className="space-y-2">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider pb-1 border-b ${
                    template === 'modern_crimson'
                      ? 'text-red-700 border-red-200'
                      : 'text-slate-900 border-slate-200'
                  }`}
                >
                  Professional Summary
                </h2>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={localResume.summary}
                    onChange={(e) => handleResumeFieldChange('summary', e.target.value)}
                    className="w-full text-xs text-slate-800 p-2 border border-slate-300 rounded-lg outline-none focus:border-red-500"
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {localResume.summary}
                  </p>
                )}
              </div>

              {/* Core Competencies & Matched Keywords */}
              <div className="space-y-2">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider pb-1 border-b ${
                    template === 'modern_crimson'
                      ? 'text-red-700 border-red-200'
                      : 'text-slate-900 border-slate-200'
                  }`}
                >
                  Core Competencies & ATS Keywords
                </h2>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {localResume.coreCompetencies?.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="bg-red-50/80 text-red-900 text-xs font-bold px-2.5 py-1 rounded-md border border-red-200/70"
                    >
                      {skill}
                    </span>
                  ))}
                  {localResume.matchedKeywords?.map((kw, kIdx) => (
                    <span
                      key={`kw_${kIdx}`}
                      className="bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Section */}
              <div className="space-y-4">
                <h2
                  className={`text-xs font-bold uppercase tracking-wider pb-1 border-b ${
                    template === 'modern_crimson'
                      ? 'text-red-700 border-red-200'
                      : 'text-slate-900 border-slate-200'
                  }`}
                >
                  Professional Experience
                </h2>

                <div className="space-y-4">
                  {localResume.experience?.map((exp, expIdx) => (
                    <div key={expIdx} className="space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs sm:text-sm">
                        <div>
                          <span className="font-extrabold text-slate-900">{exp.role}</span>
                          <span className="text-red-700 font-bold"> | {exp.company}</span>
                        </div>
                        <span className="text-slate-500 font-medium text-xs">
                          {exp.period} {exp.location ? `• ${exp.location}` : ''}
                        </span>
                      </div>

                      <ul className="space-y-1 text-xs text-slate-800 pt-1 list-disc pl-4 marker:text-red-600">
                        {exp.accomplishments?.map((bullet, bIdx) => (
                          <li key={bIdx} className="leading-relaxed">
                            {isEditing ? (
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => {
                                  const newExp = [...localResume.experience];
                                  newExp[expIdx].accomplishments[bIdx] = e.target.value;
                                  handleResumeFieldChange('experience', newExp);
                                }}
                                className="w-full text-xs text-slate-800 p-1 border-b border-slate-300 outline-none"
                              />
                            ) : (
                              <span>{bullet}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education & Certs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {localResume.education && localResume.education.length > 0 && (
                  <div className="space-y-2">
                    <h2
                      className={`text-xs font-bold uppercase tracking-wider pb-1 border-b ${
                        template === 'modern_crimson'
                          ? 'text-red-700 border-red-200'
                          : 'text-slate-900 border-slate-200'
                      }`}
                    >
                      Education
                    </h2>
                    <div className="space-y-2 text-xs">
                      {localResume.education.map((edu, idx) => (
                        <div key={idx}>
                          <p className="font-bold text-slate-900">{edu.degree}</p>
                          <p className="text-slate-600">
                            {edu.school} ({edu.year})
                          </p>
                          {edu.details && <p className="text-slate-500 italic mt-0.5">{edu.details}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {((localResume.certifications && localResume.certifications.length > 0) || (localResume.certificationItems && localResume.certificationItems.length > 0) || isEditing) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-red-200">
                      <h2
                        className={`text-xs font-bold uppercase tracking-wider ${
                          template === 'modern_crimson'
                            ? 'text-red-700'
                            : 'text-slate-900'
                        }`}
                      >
                        Certifications & Credentials
                      </h2>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            const current = localResume.certifications || [];
                            handleResumeFieldChange('certifications', [...current, 'New Certification Name - Issuer (Year)']);
                          }}
                          className="text-[10px] font-bold text-red-600 hover:text-red-800 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Item</span>
                        </button>
                      )}
                    </div>

                    {/* Rich Verified Certification Items */}
                    {localResume.certificationItems && localResume.certificationItems.length > 0 && !isEditing ? (
                      <div className="space-y-2 pt-1">
                        {localResume.certificationItems.map((cert, idx) => (
                          <div key={cert.id || idx} className="flex items-start justify-between gap-2 text-xs">
                            <div className="flex items-start gap-1.5">
                              <span className="text-red-600 font-bold leading-none mt-1">•</span>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900">{cert.name}</span>
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-red-50 text-red-700 border border-red-200">
                                    {cert.type}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                                  {cert.issuer}
                                  {cert.issueDate ? ` (${cert.issueDate})` : ''}
                                  {cert.credentialId ? ` • ID: ${cert.credentialId}` : ''}
                                </div>
                              </div>
                            </div>

                            {/* View Proof link/trigger */}
                            <div className="shrink-0">
                              {cert.type === 'url' ? (
                                <a
                                  href={cert.sourceValue.startsWith('http') ? cert.sourceValue : `https://${cert.sourceValue}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 hover:underline"
                                >
                                  <span>Verify</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setViewingProofCert(cert)}
                                  className="text-[10px] font-bold text-slate-600 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-2.5 h-2.5" />
                                  <span>Proof</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : isEditing ? (
                      <div className="space-y-1.5">
                        {(localResume.certifications || []).map((cert, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={cert}
                              onChange={(e) => {
                                const current = [...(localResume.certifications || [])];
                                current[idx] = e.target.value;
                                handleResumeFieldChange('certifications', current);
                              }}
                              className="flex-1 text-xs text-slate-800 p-1 border-b border-slate-300 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const current = (localResume.certifications || []).filter((_, i) => i !== idx);
                                handleResumeFieldChange('certifications', current);
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4 marker:text-red-600">
                        {(localResume.certifications || []).map((cert, idx) => (
                          <li key={idx} className="font-medium">
                            {cert}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Projects */}
              {localResume.projects && localResume.projects.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h2
                    className={`text-xs font-bold uppercase tracking-wider pb-1 border-b ${
                      template === 'modern_crimson'
                        ? 'text-red-700 border-red-200'
                        : 'text-slate-900 border-slate-200'
                    }`}
                  >
                    Notable Projects
                  </h2>
                  <div className="space-y-2 text-xs">
                    {localResume.projects.map((proj, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{proj.name}</span>
                          {proj.techStack && (
                            <span className="text-slate-500 italic text-[11px]">
                              ({proj.techStack.join(', ')})
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* --- TAILORED COVER LETTER VIEW --- */
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              {/* Header Contact */}
              <div className="border-b border-red-600 pb-3">
                <h1 className="text-2xl font-extrabold text-red-700 tracking-tight">
                  {localLetter.candidateName || 'Candidate Name'}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">{localLetter.candidateContact}</p>
              </div>

              {/* Date & Recipient */}
              <div className="text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">{localLetter.date}</p>
                <div className="pt-2 font-medium">
                  <p className="font-bold text-slate-900">{localLetter.hiringManager}</p>
                  <p>{localLetter.companyName}</p>
                  {localLetter.companyAddress && <p className="text-slate-500">{localLetter.companyAddress}</p>}
                </div>
              </div>

              {/* Salutation */}
              <p className="text-xs sm:text-sm font-bold text-slate-900">{localLetter.salutation}</p>

              {/* Letter Paragraphs */}
              <div className="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed">
                {isEditing ? (
                  <>
                    <textarea
                      rows={3}
                      value={localLetter.openingParagraph}
                      onChange={(e) => handleCoverLetterFieldChange('openingParagraph', e.target.value)}
                      className="w-full text-xs text-slate-800 p-2 border border-slate-300 rounded-lg outline-none"
                    />
                    {localLetter.bodyParagraphs?.map((para, pIdx) => (
                      <textarea
                        key={pIdx}
                        rows={4}
                        value={para}
                        onChange={(e) => {
                          const newBody = [...localLetter.bodyParagraphs];
                          newBody[pIdx] = e.target.value;
                          handleCoverLetterFieldChange('bodyParagraphs', newBody);
                        }}
                        className="w-full text-xs text-slate-800 p-2 border border-slate-300 rounded-lg outline-none"
                      />
                    ))}
                    <textarea
                      rows={3}
                      value={localLetter.closingParagraph}
                      onChange={(e) => handleCoverLetterFieldChange('closingParagraph', e.target.value)}
                      className="w-full text-xs text-slate-800 p-2 border border-slate-300 rounded-lg outline-none"
                    />
                  </>
                ) : (
                  <>
                    <p>{localLetter.openingParagraph}</p>
                    {localLetter.bodyParagraphs?.map((para, pIdx) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                    <p>{localLetter.closingParagraph}</p>
                  </>
                )}
              </div>

              {/* Signoff */}
              <div className="pt-4 text-xs sm:text-sm text-slate-800 space-y-3">
                <p>{localLetter.signOff}</p>
                <p className="font-extrabold text-red-700 text-base">{localLetter.candidateName}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certification Proof Viewer Modal */}
      <CertificationProofViewerModal
        cert={viewingProofCert}
        onClose={() => setViewingProofCert(null)}
      />
    </div>
  );
};
