import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  RotateCcw,
  Zap,
  Briefcase,
  Layers,
  ChevronDown,
  Info,
  ShieldCheck,
  Building2,
  FileCheck,
} from 'lucide-react';
import { api } from '../services/api';
import {
  UserProfile,
  SkillsGapItem,
  ExperienceAlignment,
  ScoringBreakdown,
  TailoredResumeData,
  TailoredCoverLetterData,
  JobApplicationRecord,
} from '../types';
import { SkillsGapRadar } from './SkillsGapRadar';
import { ExperienceAlignmentView } from './ExperienceAlignmentView';
import { ResumeLetterStudio } from './ResumeLetterStudio';
import { SCORING_PRESETS, ScoringProfileName } from '../../server/scoringEngine';

interface TailorStudioProps {
  userProfile: UserProfile | null;
  onApplicationSaved?: (app: JobApplicationRecord) => void;
}

export const TailorStudio: React.FC<TailorStudioProps> = ({ userProfile, onApplicationSaved }) => {
  // Step tracker: 1 = Inputs, 2 = Results (Decision & Tailored Output)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Resume Input state
  const [resumeType, setResumeType] = useState<'text' | 'pdf' | 'image' | 'profile'>('text');
  const [resumeText, setResumeText] = useState(userProfile?.defaultResumeText || '');
  const [resumeFileBase64, setResumeFileBase64] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);

  // Job Description Input state
  const [jobType, setJobType] = useState<'text' | 'url' | 'linkedin' | 'image'>('text');
  const [jobText, setJobText] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobImageBase64, setJobImageBase64] = useState<string | null>(null);
  const [jobImagePreviewUrl, setJobImagePreviewUrl] = useState<string | null>(null);
  const [fetchingUrl, setFetchingUrl] = useState(false);

  // Modular Scoring Config
  const [scoringProfile, setScoringProfile] = useState<ScoringProfileName>('standard');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customWeights, setCustomWeights] = useState({
    skillsWeight: 35,
    experienceWeight: 30,
    keywordsAtsWeight: 15,
    educationCertWeight: 10,
    impactMetricsWeight: 10,
  });

  // Processing & Results State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Certifications selection state for tailoring
  const [selectedCertIds, setSelectedCertIds] = useState<string[]>(() => {
    return (userProfile?.certifications || [])
      .filter((c) => c.selectedForResume !== false)
      .map((c) => c.id);
  });

  const toggleCertSelection = (certId: string) => {
    setSelectedCertIds((prev) =>
      prev.includes(certId) ? prev.filter((id) => id !== certId) : [...prev, certId]
    );
  };

  // Result Data
  const [activeResultTab, setActiveResultTab] = useState<'decision_matrix' | 'tailored_docs'>('decision_matrix');
  const [jobMeta, setJobMeta] = useState<any>(null);
  const [skillsGap, setSkillsGap] = useState<SkillsGapItem[]>([]);
  const [skillsFilter, setSkillsFilter] = useState<'all' | 'matched' | 'missing_required' | 'missing_bonus' | 'partial'>('all');
  const [highlightCategory, setHighlightCategory] = useState<'matched' | 'missing_required' | null>(null);
  const [experienceAlignments, setExperienceAlignments] = useState<ExperienceAlignment[]>([]);
  const [scoringResult, setScoringResult] = useState<ScoringBreakdown | null>(null);
  const [tailoredResume, setTailoredResume] = useState<TailoredResumeData | null>(null);
  const [tailoredCoverLetter, setTailoredCoverLetter] = useState<TailoredCoverLetterData | null>(null);
  const [savedRecord, setSavedRecord] = useState<JobApplicationRecord | null>(null);

  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const jobImageInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleShortcut = (e: any) => {
      const actionId = e.detail?.actionId;
      if (!actionId) return;

      if (actionId === 'GENERATE_APPLICATION') {
        if (currentStep === 1) {
          handleAnalyzeAndTailor();
        } else {
          setActiveResultTab('tailored_docs');
        }
      } else if (actionId === 'HIGHLIGHT_MATCHING_SKILLS') {
        if (currentStep === 1 && scoringResult) {
          setCurrentStep(2);
        }
        setActiveResultTab('decision_matrix');
        setSkillsFilter('matched');
        setHighlightCategory('matched');
        setTimeout(() => {
          document.getElementById('skills-gap-radar-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        setTimeout(() => setHighlightCategory(null), 3000);
      } else if (actionId === 'HIGHLIGHT_MISSING_SKILLS') {
        if (currentStep === 1 && scoringResult) {
          setCurrentStep(2);
        }
        setActiveResultTab('decision_matrix');
        setSkillsFilter('missing_required');
        setHighlightCategory('missing_required');
        setTimeout(() => {
          document.getElementById('skills-gap-radar-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        setTimeout(() => setHighlightCategory(null), 3000);
      } else if (actionId === 'SHOW_ALL_SKILLS') {
        setActiveResultTab('decision_matrix');
        setSkillsFilter('all');
        setHighlightCategory(null);
      } else if (actionId === 'TOGGLE_DOCS_VIEW') {
        if (currentStep === 2) {
          setActiveResultTab((prev) => (prev === 'decision_matrix' ? 'tailored_docs' : 'decision_matrix'));
        }
      }
    };

    window.addEventListener('tailorfit:shortcut', handleShortcut);
    return () => window.removeEventListener('tailorfit:shortcut', handleShortcut);
  }, [currentStep, scoringResult, resumeText, jobText, jobType, resumeType, selectedCertIds, scoringProfile]);

  // Sample Scenarios for 1-Click Testing
  const loadSampleJob = (sampleKey: 'ai_engineer' | 'frontend_lead' | 'product_manager') => {
    if (sampleKey === 'ai_engineer') {
      setJobTitle('Senior Full-Stack Engineer (AI Products)');
      setJobCompany('NovaByte Cloud Labs');
      setJobType('text');
      setJobText(`Position: Senior Full-Stack Engineer (AI Products)
Company: NovaByte Cloud Labs
Location: San Francisco, CA / Remote

About NovaByte:
NovaByte builds AI-assisted developer velocity and cloud analytics tools. We are seeking an experienced Full-Stack Engineer to architect end-to-end applications powered by LLMs and high-concurrency event streams.

Requirements:
- 5+ years of software development experience with modern TypeScript and React.
- Proven backend expertise with Node.js, Express, or Python (FastAPI).
- Direct experience integrating LLM APIs (Gemini/OpenAI), streaming tokens, and prompt chaining.
- Solid understanding of SQL/NoSQL databases (PostgreSQL, MongoDB) and cloud architectures (Docker, AWS/GCP).
- Strong track record of shipping performant UI/UX with attention to Core Web Vitals and low latency.`);

      if (!resumeText) {
        setResumeText(userProfile?.defaultResumeText || `Alex Morgan
San Francisco, CA | (555) 234-8901 | alex.morgan@example.com | github.com/alexmorgan-code

SUMMARY
Senior Full-Stack Software Engineer with 6+ years of experience specializing in scalable TypeScript, React, Python, and cloud infrastructure. Proven track record of boosting user engagement by 40% and cutting latency by 65%.

EXPERIENCE
Senior Software Engineer | Apex Cloud Technologies (2023 - Present)
- Architected microservices architecture handling 15M+ daily requests using Node.js, Express, and Redis.
- Led frontend redesign in React and TypeScript, improving Core Web Vitals and lowering page load time by 48%.
- Mentored a squad of 5 engineers, running code reviews and agile sprints.

Full-Stack Developer | Nexus Labs (2020 - 2023)
- Built interactive analytics dashboards with React, TailwindCSS, and Python FastAPI backend.
- Designed MongoDB schemas and optimized aggregation pipelines for 2TB+ dataset.

EDUCATION
B.S. in Computer Science | UC Berkeley (2016 - 2020)`);
      }
    } else if (sampleKey === 'frontend_lead') {
      setJobTitle('Lead Frontend Architect');
      setJobCompany('Aura Design Systems');
      setJobType('text');
      setJobText(`Role: Lead Frontend Architect
Company: Aura Design Systems
Location: New York, NY (Hybrid)

We need a visionary Lead Frontend Architect to spearhead our next-generation component library, micro-frontends, and performance benchmarks.

Key Qualifications:
- 6+ years of modern JavaScript/TypeScript and React ecosystem leadership.
- Deep expertise in accessibility (WCAG AA), Web Performance, and Vite build systems.
- Experience managing component libraries, Tailwind CSS, and Figma-to-code token pipelines.
- Excellent architectural mentorship and engineering design documentation skills.`);
    } else {
      setJobTitle('Staff Systems Engineer');
      setJobCompany('Vanguard Distributed');
      setJobType('text');
      setJobText(`Role: Staff Systems Engineer
Company: Vanguard Distributed
Location: Remote

Seeking a Staff Systems Engineer to design high-throughput message streaming, resilient distributed caches, and cloud native Kubernetes services.`);
    }
  };

  // Resume File Upload Handler
  const handleResumeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);
    const reader = new FileReader();

    if (file.type.includes('image')) {
      reader.onload = () => {
        const result = reader.result as string;
        setResumeFileBase64(result);
        setResumePreviewUrl(result);
        setResumeType('image');
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      reader.onload = () => {
        const result = reader.result as string;
        setResumeFileBase64(result);
        setResumeType('pdf');
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text or markdown
      reader.onload = () => {
        const result = reader.result as string;
        setResumeText(result);
        setResumeType('text');
      };
      reader.readAsText(file);
    }
  };

  // Job Screenshot Upload Handler
  const handleJobImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setJobImageBase64(result);
      setJobImagePreviewUrl(result);
      setJobType('image');
    };
    reader.readAsDataURL(file);
  };

  // Parse Job URL helper
  const handleFetchUrl = async () => {
    if (!jobUrl.trim()) return;
    setFetchingUrl(true);
    setAnalysisError(null);
    try {
      const extracted = await api.parseJobUrl(jobUrl.trim());
      if (extracted.title) setJobTitle(extracted.title);
      if (extracted.company) setJobCompany(extracted.company);
      if (extracted.description) setJobText(extracted.description);
    } catch (err: any) {
      setAnalysisError(`Could not auto-extract URL. You can paste the job text directly below. (${err.message})`);
    } finally {
      setFetchingUrl(false);
    }
  };

  // Main Submit: Run AI Analysis & Tailoring
  const handleAnalyzeAndTailor = async () => {
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      // Prepare Resume Payload
      let resumeContent = '';
      let activeResumeType: 'pdf' | 'text' | 'image' = 'text';

      if (resumeType === 'pdf' && resumeFileBase64) {
        resumeContent = resumeFileBase64;
        activeResumeType = 'pdf';
      } else if (resumeType === 'image' && resumeFileBase64) {
        resumeContent = resumeFileBase64;
        activeResumeType = 'image';
      } else if (resumeType === 'profile' && userProfile?.defaultResumeText) {
        resumeContent = userProfile.defaultResumeText;
        activeResumeType = 'text';
      } else {
        resumeContent = resumeText;
        activeResumeType = 'text';
      }

      if (!resumeContent.trim()) {
        throw new Error('Please provide your starter resume (via text, PDF, image, or profile).');
      }

      // Prepare Job Payload
      let jobContent = '';
      let activeJobType: 'url' | 'text' | 'linkedin' | 'image' = jobType;

      if (jobType === 'image' && jobImageBase64) {
        jobContent = jobImageBase64;
      } else if (jobType === 'url') {
        jobContent = jobUrl || jobText;
      } else {
        jobContent = jobText;
      }

      if (!jobContent.trim()) {
        throw new Error('Please provide the target job description (text, URL, LinkedIn post, or screenshot).');
      }

      // Filter selected certifications from user profile
      const activeCertifications = (userProfile?.certifications || []).filter((c) =>
        selectedCertIds.includes(c.id)
      );

      const result = await api.analyzeAndTailor({
        resume: {
          type: activeResumeType,
          content: resumeContent,
          fileName: resumeFileName || undefined,
        },
        job: {
          type: activeJobType,
          content: jobContent,
          title: jobTitle,
          company: jobCompany,
        },
        selectedCertifications: activeCertifications,
        scoringProfile,
        saveImmediately: true,
      });

      setJobMeta(result.jobMetadata);
      setSkillsGap(result.skillsGap);
      setExperienceAlignments(result.experienceAlignments);
      setScoringResult(result.scoringResult);
      setTailoredResume(result.tailoredResume);
      setTailoredCoverLetter(result.tailoredCoverLetter);
      if (result.savedRecord) {
        setSavedRecord(result.savedRecord);
        if (onApplicationSaved) onApplicationSaved(result.savedRecord);
      }

      setCurrentStep(2);
    } catch (err: any) {
      console.error('Tailor error:', err);
      setAnalysisError(err.message || 'Failed to analyze and tailor application.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* View Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-red-600/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-bold backdrop-blur-xs border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-rose-200" />
              <span>AI Job Match & Tailoring Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tailor Your Application for Any Job
            </h1>
            <p className="text-xs sm:text-sm text-rose-100 max-w-2xl font-medium">
              Analyze skills gaps, assess work experience alignment, recalculate ATS compatibility scores, and generate targeted resumes and cover letters in DOCX & PDF format.
            </p>
          </div>

          {/* Quick Presets Badge */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs flex flex-col gap-1.5 self-stretch sm:self-auto min-w-[220px]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-100">Scoring Engine Mode:</span>
              <button
                onClick={() => setShowConfigModal(true)}
                className="text-[11px] text-white underline hover:text-rose-200 cursor-pointer font-semibold"
              >
                Configure
              </button>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-white uppercase text-[11px] bg-red-800/40 px-2.5 py-1 rounded-lg">
              <Sliders className="w-3.5 h-3.5 text-rose-300" />
              <span>{scoringProfile.replace('_', ' ')} Weights</span>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: INPUT WORKSPACE */}
      {currentStep === 1 ? (
        <div className="space-y-6">
          {/* Sample Loaders */}
          <div className="bg-white p-4 rounded-2xl border border-rose-100/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
              <Zap className="w-4 h-4 text-red-600" />
              <span>Try a 1-Click Job Sample:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadSampleJob('ai_engineer')}
                className="text-xs font-bold text-slate-700 hover:text-red-700 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                🚀 AI Full-Stack Engineer (NovaByte)
              </button>
              <button
                type="button"
                onClick={() => loadSampleJob('frontend_lead')}
                className="text-xs font-bold text-slate-700 hover:text-red-700 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                🎨 Lead Frontend Architect (Aura)
              </button>
              <button
                type="button"
                onClick={() => loadSampleJob('product_manager')}
                className="text-xs font-bold text-slate-700 hover:text-red-700 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                ⚡ Staff Systems Engineer (Vanguard)
              </button>
            </div>
          </div>

          {/* Two-Column Input Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: RESUME INPUT */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Your Starter Resume</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Upload PDF, image, paste text, or load master profile</p>
                    </div>
                  </div>

                  {userProfile?.defaultResumeText && (
                    <button
                      type="button"
                      onClick={() => {
                        setResumeType('profile');
                        setResumeText(userProfile.defaultResumeText || '');
                      }}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-100 cursor-pointer"
                    >
                      Use Profile Resume
                    </button>
                  )}
                </div>

                {/* Resume Mode Selectors */}
                <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setResumeType('text')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      resumeType === 'text' || resumeType === 'profile'
                        ? 'bg-white text-red-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeType('pdf');
                      resumeFileInputRef.current?.click();
                    }}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      resumeType === 'pdf'
                        ? 'bg-white text-red-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeType('image');
                      resumeFileInputRef.current?.click();
                    }}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      resumeType === 'image'
                        ? 'bg-white text-red-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (userProfile?.defaultResumeText) {
                        setResumeText(userProfile.defaultResumeText);
                        setResumeType('profile');
                      }
                    }}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      resumeType === 'profile'
                        ? 'bg-white text-red-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Profile</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={resumeFileInputRef}
                  onChange={handleResumeFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                  className="hidden"
                  id="resume-file-hidden-input"
                />

                {/* File Drop / Preview Zone */}
                {resumeType === 'pdf' || resumeType === 'image' ? (
                  <div
                    onClick={() => resumeFileInputRef.current?.click()}
                    className="border-2 border-dashed border-red-200 bg-red-50/30 hover:bg-red-50/60 rounded-xl p-6 text-center cursor-pointer transition-colors"
                  >
                    {resumeFileName ? (
                      <div className="space-y-2">
                        <FileCheck className="w-8 h-8 text-red-600 mx-auto" />
                        <p className="font-bold text-xs text-slate-800">{resumeFileName}</p>
                        <p className="text-[11px] text-slate-500">Click to replace file ({resumeType.toUpperCase()})</p>
                        {resumePreviewUrl && (
                          <img
                            src={resumePreviewUrl}
                            alt="Resume Preview"
                            className="max-h-40 mx-auto rounded-lg shadow-sm border border-slate-200 mt-2 object-contain"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-red-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-800">
                          Drop your {resumeType.toUpperCase()} resume here, or click to browse
                        </p>
                        <p className="text-[11px] text-slate-500">Supports PDF, PNG, JPG, or Screenshots</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <textarea
                      rows={12}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your existing resume text here... (Work Experience, Skills, Education, Projects)"
                      className="w-full p-3.5 text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none font-mono transition-all"
                      id="starter-resume-textarea"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{resumeText ? `${resumeText.split(/\s+/).length} words` : 'No text entered'}</span>
                      <button
                        type="button"
                        onClick={() => setResumeText('')}
                        className="text-slate-400 hover:text-red-600 text-[11px] cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* Candidate Certifications to Include Widget */}
                {userProfile?.certifications && userProfile.certifications.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-red-600" />
                        <span>Include Certifications ({selectedCertIds.length}/{userProfile.certifications.length})</span>
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">Reflected on tailored resume</span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {userProfile.certifications.map((cert) => {
                        const isSelected = selectedCertIds.includes(cert.id);
                        return (
                          <label
                            key={cert.id}
                            className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                              isSelected
                                ? 'bg-rose-50/50 border-rose-200 text-slate-900'
                                : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleCertSelection(cert.id)}
                                className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500 cursor-pointer accent-red-600 shrink-0"
                              />
                              <div className="truncate">
                                <span className="font-bold block truncate text-[11px]">{cert.name}</span>
                                <span className="text-[10px] text-slate-500 block truncate">{cert.issuer}</span>
                              </div>
                            </div>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase shrink-0 bg-white border border-slate-200 text-slate-600">
                              {cert.type}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: JOB DESCRIPTION INPUT */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Target Job Listing</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Link, text, LinkedIn post, or ad screenshot</p>
                    </div>
                  </div>
                </div>

                {/* Job Mode Selectors */}
                <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setJobType('text')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      jobType === 'text'
                        ? 'bg-white text-red-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobType('url')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      jobType === 'url'
                        ? 'bg-white text-red-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobType('linkedin')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      jobType === 'linkedin'
                        ? 'bg-white text-red-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setJobType('image');
                      jobImageInputRef.current?.click();
                    }}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      jobType === 'image'
                        ? 'bg-white text-red-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Image</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={jobImageInputRef}
                  onChange={handleJobImageUpload}
                  accept=".png,.jpg,.jpeg,.webp"
                  className="hidden"
                  id="job-image-hidden-input"
                />

                {/* URL Input Form */}
                {jobType === 'url' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                        placeholder="https://careers.example.com/job/senior-engineer"
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleFetchUrl}
                        disabled={fetchingUrl || !jobUrl}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                      >
                        {fetchingUrl ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Fetch Details</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Job Metadata inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Job Title (e.g. Senior Full-Stack Engineer)"
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-red-500 outline-none"
                  />
                  <input
                    type="text"
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                    placeholder="Company Name (e.g. Starlight Corp)"
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-red-500 outline-none"
                  />
                </div>

                {/* Job Screenshot or Text */}
                {jobType === 'image' ? (
                  <div
                    onClick={() => jobImageInputRef.current?.click()}
                    className="border-2 border-dashed border-red-200 bg-red-50/30 hover:bg-red-50/60 rounded-xl p-6 text-center cursor-pointer transition-colors"
                  >
                    {jobImagePreviewUrl ? (
                      <div className="space-y-2">
                        <FileCheck className="w-8 h-8 text-red-600 mx-auto" />
                        <p className="font-bold text-xs text-slate-800">Job Posting Screenshot Uploaded</p>
                        <img
                          src={jobImagePreviewUrl}
                          alt="Job Preview"
                          className="max-h-40 mx-auto rounded-lg shadow-sm border border-slate-200 mt-2 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-red-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-800">
                          Upload screenshot of Job Description / LinkedIn listing
                        </p>
                        <p className="text-[11px] text-slate-500">Gemini OCR will parse responsibilities & skills automatically</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={jobType === 'url' ? 8 : 10}
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    placeholder={
                      jobType === 'linkedin'
                        ? 'Paste the full LinkedIn job post snippet, responsibilities, and requirements...'
                        : 'Paste job description, required qualifications, tech stack, and responsibilities...'
                    }
                    className="w-full p-3.5 text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none font-mono transition-all"
                    id="target-job-textarea"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Error notice if any */}
          {analysisError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* Big Launch CTA Button */}
          <div className="flex flex-col items-center pt-2">
            <button
              type="button"
              onClick={handleAnalyzeAndTailor}
              disabled={analyzing}
              id="analyze-and-tailor-cta-btn"
              title="Analyze and tailor application (Ctrl/⌘ + Enter)"
              className="w-full sm:w-auto min-w-[340px] px-8 py-4 bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scanning Skills, Experience & Tailoring Application...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-rose-200" />
                  <span>Analyze Match & Tailor Application</span>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md text-xs font-mono font-bold tracking-tight">
                    <span>⌘</span>
                    <span>↵</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-rose-200" />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              Calculates granular skills gap, ATS health, work experience fit, and generates custom resume & cover letter.
            </p>
          </div>
        </div>
      ) : (
        /* STEP 2: RESULTS, DECISION MATRIX & TAILORED SUITE */
        <div className="space-y-6">
          {/* Top Bar: Back to Edit Inputs + Job Badge */}
          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="p-2 rounded-xl text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Adjust Inputs</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-base text-slate-900">
                    {jobMeta?.title || jobTitle || 'Target Position'}
                  </h2>
                  <span className="bg-red-50 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full border border-red-100">
                    {jobMeta?.company || jobCompany || 'Company'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {jobMeta?.location} • {jobMeta?.jobType} {jobMeta?.salaryRange ? `• ${jobMeta.salaryRange}` : ''}
                </p>
              </div>
            </div>

            {/* Switch between Decision Center & Tailored Studio */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold self-stretch sm:self-auto">
              <button
                onClick={() => setActiveResultTab('decision_matrix')}
                title="Toggle Document / Match Matrix (Alt + D)"
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeResultTab === 'decision_matrix'
                    ? 'bg-white text-red-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Match & Gap Decision Center</span>
              </button>

              <button
                onClick={() => setActiveResultTab('tailored_docs')}
                title="Toggle Document / Match Matrix (Alt + D)"
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeResultTab === 'tailored_docs'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tailored Documents Studio</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-red-700/60 text-white rounded">
                  Alt+D
                </kbd>
              </button>
            </div>
          </div>

          {/* HERO METRIC GAUGE CARD */}
          {scoringResult && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left: Big Radial Match Score */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-50/60 via-rose-50/40 to-white rounded-2xl border border-red-100 text-center">
                  <div className="relative w-36 h-36 flex items-center justify-center mb-3">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-red-600 transition-all duration-1000 ease-out"
                        strokeDasharray={`${scoringResult.overallScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {scoringResult.overallScore}%
                      </span>
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                        Match Score
                      </span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold border border-red-200">
                    <Award className="w-3.5 h-3.5 text-red-600" />
                    <span>
                      {scoringResult.overallScore >= 85
                        ? 'High Interview Likelihood'
                        : scoringResult.overallScore >= 70
                        ? 'Strong Candidate Fit'
                        : 'Moderate Alignment (Review Gaps)'}
                    </span>
                  </div>
                </div>

                {/* Right: Subcategory Breakdown Metrics */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block">Skills Fit</span>
                      <span className="text-lg font-extrabold text-slate-900">{scoringResult.skillsScore}%</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block">Experience Match</span>
                      <span className="text-lg font-extrabold text-slate-900">{scoringResult.experienceScore}%</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block">ATS Keywords</span>
                      <span className="text-lg font-extrabold text-slate-900">{scoringResult.keywordsScore}%</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block">Metric Impact</span>
                      <span className="text-lg font-extrabold text-slate-900">{scoringResult.impactScore}%</span>
                    </div>
                  </div>

                  {/* Summary Notes */}
                  <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-100 text-xs text-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-red-800">
                      <Sparkles className="w-4 h-4 text-red-600" />
                      <span>Recruiter Assessment Summary:</span>
                    </div>
                    <p className="leading-relaxed font-medium">{scoringResult.summary}</p>
                  </div>

                  {/* Strengths & Action items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Key Application Strengths:
                      </span>
                      <ul className="space-y-0.5 text-slate-700 pl-4 list-disc marker:text-emerald-500">
                        {scoringResult.strengths?.slice(0, 3).map((st, sIdx) => (
                          <li key={sIdx}>{st}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-red-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        Gaps to Address in Interview:
                      </span>
                      <ul className="space-y-0.5 text-slate-700 pl-4 list-disc marker:text-red-500">
                        {scoringResult.criticalGaps?.slice(0, 2).map((gp, gIdx) => (
                          <li key={gIdx}>{gp}</li>
                        ))}
                        {(!scoringResult.criticalGaps || scoringResult.criticalGaps.length === 0) && (
                          <li className="text-emerald-700 font-medium">No critical must-have gaps detected!</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: DECISION MATRIX (SKILLS & EXPERIENCE) */}
          {activeResultTab === 'decision_matrix' && (
            <div className="space-y-8">
              {/* Skills Gap Radar Matrix */}
              <div id="skills-gap-radar-container" className="space-y-3 scroll-mt-20">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>Skills Gap Analysis & Positioning Plan</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {skillsGap.length} Total Skills Evaluated
                  </span>
                </div>
                <SkillsGapRadar
                  skillsGap={skillsGap}
                  externalFilter={skillsFilter}
                  onFilterChange={setSkillsFilter}
                  highlightCategory={highlightCategory}
                  onAddSkillToResume={(skill) => {
                    if (tailoredResume) {
                      setTailoredResume({
                        ...tailoredResume,
                        coreCompetencies: [...new Set([...tailoredResume.coreCompetencies, skill])],
                      });
                      setActiveResultTab('tailored_docs');
                    }
                  }}
                />
              </div>

              {/* Work Experience Alignment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>Work Experience & Seniority Alignment</span>
                  </h3>
                </div>
                <ExperienceAlignmentView alignments={experienceAlignments} />
              </div>

              {/* Bottom Next Step CTA */}
              <div className="p-6 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-red-600/20">
                <div>
                  <h4 className="font-extrabold text-base">Ready to review your tailored documents?</h4>
                  <p className="text-xs text-rose-100 font-medium mt-0.5">
                    Your tailored resume & cover letter are ready with ATS keywords highlighted and Google X-Y-Z metrics.
                  </p>
                </div>
                <button
                  onClick={() => setActiveResultTab('tailored_docs')}
                  className="px-6 py-3 bg-white hover:bg-rose-50 text-red-700 font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
                >
                  Open Tailored Studio →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TAILORED RESUME & COVER LETTER STUDIO */}
          {activeResultTab === 'tailored_docs' && tailoredResume && tailoredCoverLetter && (
            <ResumeLetterStudio
              resume={tailoredResume}
              coverLetter={tailoredCoverLetter}
              jobTitle={jobMeta?.title || jobTitle}
              companyName={jobMeta?.company || jobCompany}
              onUpdateResume={(up) => setTailoredResume(up)}
              onUpdateCoverLetter={(up) => setTailoredCoverLetter(up)}
            />
          )}
        </div>
      )}

      {/* MODULAR SCORING WEIGHTS CONFIGURATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-100 w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                <h3 className="font-bold text-sm">Configure Resume Scoring Engine</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-white/80 hover:text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Choose a pre-calibrated evaluation profile or customize the mathematical weights used by the scoring engine:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(['standard', 'technical', 'executive', 'entry_level'] as ScoringProfileName[]).map((prof) => (
                  <button
                    key={prof}
                    type="button"
                    onClick={() => {
                      setScoringProfile(prof);
                      const p = SCORING_PRESETS[prof];
                      setCustomWeights({
                        skillsWeight: Math.round(p.skillsWeight * 100),
                        experienceWeight: Math.round(p.experienceWeight * 100),
                        keywordsAtsWeight: Math.round(p.keywordsAtsWeight * 100),
                        educationCertWeight: Math.round(p.educationCertWeight * 100),
                        impactMetricsWeight: Math.round(p.impactMetricsWeight * 100),
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      scoringProfile === prof
                        ? 'border-red-500 bg-red-50/50 font-bold text-red-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="capitalize block text-xs">{prof.replace('_', ' ')} Profile</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {prof === 'technical'
                        ? '45% Skills, 25% Exp'
                        : prof === 'executive'
                        ? '45% Exp, 20% Skills'
                        : 'Balanced ATS Weights'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div>
                  <div className="flex justify-between text-slate-700 font-bold mb-1">
                    <span>Technical & Functional Skills Weight:</span>
                    <span>{customWeights.skillsWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={customWeights.skillsWeight}
                    onChange={(e) =>
                      setCustomWeights({ ...customWeights, skillsWeight: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-red-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 font-bold mb-1">
                    <span>Work Experience & Seniority Weight:</span>
                    <span>{customWeights.experienceWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={customWeights.experienceWeight}
                    onChange={(e) =>
                      setCustomWeights({ ...customWeights, experienceWeight: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-red-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 font-bold mb-1">
                    <span>ATS Keyword & Acronym Mapping Weight:</span>
                    <span>{customWeights.keywordsAtsWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={customWeights.keywordsAtsWeight}
                    onChange={(e) =>
                      setCustomWeights({ ...customWeights, keywordsAtsWeight: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-red-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 font-bold mb-1">
                    <span>Quantifiable Metrics & Action Verbs Weight:</span>
                    <span>{customWeights.impactMetricsWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={customWeights.impactMetricsWeight}
                    onChange={(e) =>
                      setCustomWeights({ ...customWeights, impactMetricsWeight: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-red-600"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Apply Scoring Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
