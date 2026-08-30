import React, { useState } from 'react';
import { User, UserProfile, CertificationItem, UserSubscription } from '../types';
import { api } from '../services/api';
import { subscriptionService } from '../services/subscriptionService';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Briefcase,
  Award,
  Sparkles,
  Save,
  Check,
  FileText,
  Plus,
  X,
  Target,
  ExternalLink,
  Image as ImageIcon,
  ShieldCheck,
  Eye,
  Trash2,
  Edit3,
  Calendar,
  AlertCircle,
  CreditCard,
  Zap,
  RotateCcw,
  Infinity as InfinityIcon,
  Crown,
} from 'lucide-react';
import { CertificationModal } from './CertificationModal';
import { CertificationProofViewerModal } from './CertificationProofViewerModal';

interface ProfileViewProps {
  user: User | null;
  profile: UserProfile | null;
  userSubscription?: UserSubscription | null;
  onNavigateToPricing?: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onSubscriptionUpdated?: (sub: UserSubscription) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  profile,
  userSubscription,
  onNavigateToPricing,
  onProfileUpdated,
  onSubscriptionUpdated,
}) => {
  const [formData, setFormData] = useState<UserProfile>(
    profile || {
      userId: user?.id || 'usr_demo_1',
      fullName: user?.name || 'Alex Morgan',
      targetRoles: ['Senior Full-Stack Engineer', 'Lead Frontend Architect'],
      targetJobTitles: ['Senior Full-Stack Engineer', 'Lead Frontend Architect'],
      targetSeniority: 'Senior',
      yearsOfExperience: 6,
      skills: ['TypeScript', 'React', 'Node.js', 'Express', 'FastAPI', 'Python', 'Tailwind CSS', 'Docker'],
      certifications: [
        {
          id: 'cert_1',
          name: 'AWS Certified Solutions Architect - Associate',
          issuer: 'Amazon Web Services',
          issueDate: '2024',
          expiryDate: '2027',
          credentialId: 'AWS-SAA-839210',
          type: 'url',
          sourceValue: 'https://aws.amazon.com/verification/AWS-SAA-839210',
          selectedForResume: true,
        },
        {
          id: 'cert_2',
          name: 'Certified Kubernetes Application Developer (CKAD)',
          issuer: 'Cloud Native Computing Foundation (CNCF)',
          issueDate: '2023',
          expiryDate: '2026',
          credentialId: 'CKAD-981245',
          type: 'pdf',
          sourceValue: 'CKAD_Certificate_Alex_Morgan.pdf',
          fileName: 'CKAD_Certificate_Alex_Morgan.pdf',
          fileSize: '1.2 MB',
          selectedForResume: true,
        },
      ],
      defaultResumeText: `Alex Morgan
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
B.S. in Computer Science | UC Berkeley (2016 - 2020)`,
      phone: '(555) 234-8901',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
      githubOrPortfolioUrl: 'https://alexmorgan.dev',
      portfolioUrl: 'https://alexmorgan.dev',
      updatedAt: new Date().toISOString(),
    }
  );

  const [newSkill, setNewSkill] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Certification Modal States
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificationItem | null>(null);
  const [viewingProofCert, setViewingProofCert] = useState<CertificationItem | null>(null);

  const targetRolesList = formData.targetRoles || formData.targetJobTitles || [];
  const certsList: CertificationItem[] = formData.certifications || [];
  const selectedCertsCount = certsList.filter((c) => c.selectedForResume !== false).length;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleAddTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (!targetRolesList.includes(newTitle.trim())) {
      const updated = [...targetRolesList, newTitle.trim()];
      setFormData({
        ...formData,
        targetRoles: updated,
        targetJobTitles: updated,
      });
    }
    setNewTitle('');
  };

  const handleRemoveTitle = (title: string) => {
    const updated = targetRolesList.filter((t) => t !== title);
    setFormData({
      ...formData,
      targetRoles: updated,
      targetJobTitles: updated,
    });
  };

  // Certification Handlers
  const handleSaveCertification = (cert: CertificationItem) => {
    let updatedCerts: CertificationItem[];
    if (editingCert) {
      updatedCerts = certsList.map((c) => (c.id === cert.id ? cert : c));
    } else {
      updatedCerts = [...certsList, cert];
    }
    setFormData({
      ...formData,
      certifications: updatedCerts,
    });
    setEditingCert(null);
  };

  const handleToggleCertSelection = (certId: string) => {
    const updatedCerts = certsList.map((c) => {
      if (c.id === certId) {
        return {
          ...c,
          selectedForResume: c.selectedForResume === false ? true : false,
        };
      }
      return c;
    });
    setFormData({
      ...formData,
      certifications: updatedCerts,
    });
  };

  const handleDeleteCert = (certId: string) => {
    const updatedCerts = certsList.filter((c) => c.id !== certId);
    setFormData({
      ...formData,
      certifications: updatedCerts,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateProfile(formData);
      onProfileUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-red-600/20">
            {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {formData.fullName || user?.name || user?.username}
              </h1>
              <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                {formData.targetSeniority || 'Senior'} Candidate
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              @{user?.username || 'jobseeker'} • {user?.email || 'alex.morgan@example.com'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          id="save-profile-top-btn"
          className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Saved Successfully!</span>
            </>
          ) : saving ? (
            <span>Saving Changes...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Career Profile</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-red-600" />
              <span>Candidate Details & Contact Info</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-red-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location / Timezone</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={formData.linkedinUrl || ''}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Portfolio / GitHub</label>
                  <input
                    type="text"
                    value={formData.githubOrPortfolioUrl || formData.portfolioUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        githubOrPortfolioUrl: e.target.value,
                        portfolioUrl: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-red-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Career & Target Goals */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-red-600" />
              <span>Target Role & Seniority</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seniority Level</label>
                  <select
                    value={formData.targetSeniority || 'Senior'}
                    onChange={(e) => setFormData({ ...formData, targetSeniority: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-red-500 outline-none font-semibold"
                  >
                    <option value="Entry-Level">Entry-Level (0-2 yrs)</option>
                    <option value="Mid-Level">Mid-Level (2-5 yrs)</option>
                    <option value="Senior">Senior (5-8 yrs)</option>
                    <option value="Lead / Staff">Lead / Staff (8+ yrs)</option>
                    <option value="Executive">Director / VP / Exec</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-red-500 outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Target Job Titles */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Roles & Titles</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {targetRolesList.map((title) => (
                    <span
                      key={title}
                      className="bg-red-50 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-red-200 flex items-center gap-1"
                    >
                      <span>{title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTitle(title)}
                        className="text-red-400 hover:text-red-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Add target role (e.g. Staff Backend Engineer)"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 focus:border-red-500 outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTitle}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Certifications & Credentials Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4" id="profile-certifications-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-red-600" />
                  <span>Professional Certifications & Credentials ({certsList.length})</span>
                </h2>
                <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-[10px] font-bold">
                  {selectedCertsCount} selected for resume
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Add credentials via Verification URL, PDF document, or Certificate Image to boost your ATS match and showcase verified mastery.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingCert(null);
                setIsCertModalOpen(true);
              }}
              id="add-certification-btn"
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Certification</span>
            </button>
          </div>

          {/* Certifications Grid / List */}
          {certsList.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/80 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-800">No Certifications Added Yet</h3>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Add your AWS, GCP, Kubernetes, Scrum, or other certifications in PDF, Image, or URL format to automatically enrich your tailored resumes.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingCert(null);
                  setIsCertModalOpen(true);
                }}
                className="mt-2 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-red-600" />
                <span>Add Your First Certificate</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {certsList.map((cert) => {
                const isSelected = cert.selectedForResume !== false;
                return (
                  <div
                    key={cert.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-br from-white to-rose-50/20 border-rose-200/80 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            cert.type === 'pdf'
                              ? 'bg-red-100 text-red-700'
                              : cert.type === 'image'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-sky-100 text-sky-700'
                          }`}
                        >
                          {cert.type === 'pdf' ? (
                            <FileText className="w-5 h-5" />
                          ) : cert.type === 'image' ? (
                            <ImageIcon className="w-5 h-5" />
                          ) : (
                            <ExternalLink className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{cert.name}</h4>
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide ${
                                cert.type === 'pdf'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : cert.type === 'image'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-sky-50 text-sky-700 border border-sky-200'
                              }`}
                            >
                              {cert.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                            {cert.issuer}
                          </p>
                          {(cert.issueDate || cert.credentialId) && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                              {cert.issueDate && <span>Issued: {cert.issueDate}</span>}
                              {cert.credentialId && <span>• ID: {cert.credentialId}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Top Right Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingProofCert(cert)}
                          title="View certificate proof"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCert(cert);
                            setIsCertModalOpen(true);
                          }}
                          title="Edit certification"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCert(cert.id)}
                          title="Delete certification"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Status & Resume Reflection Toggle */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleCertSelection(cert.id)}
                          className="w-3.5 h-3.5 rounded-md text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                        />
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-red-700' : 'text-slate-400'}`}>
                          {isSelected ? 'Reflected on Resume' : 'Excluded from Resume'}
                        </span>
                      </label>

                      {cert.type === 'url' ? (
                        <a
                          href={cert.sourceValue.startsWith('http') ? cert.sourceValue : `https://${cert.sourceValue}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 hover:underline"
                        >
                          <span>Verify Link</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setViewingProofCert(cert)}
                          className="text-[10px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                        >
                          <span>View Proof</span>
                          <Eye className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Master Skill Bank */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>Master Skill Bank ({formData.skills.length} skills)</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">Used by AI matching engine during auto-tailoring</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-red-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md pt-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. GraphQL, Kubernetes, Next.js)"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-red-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>
        </div>

        {/* Subscription & Membership Plan */}
        {userSubscription && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-red-600" />
                <span>Subscription & Tailoring Quota</span>
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">INR Pricing & Plan Status</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  {userSubscription.planId === 'lifetime' ? (
                    <Crown className="w-5 h-5 text-amber-600" />
                  ) : (
                    <Zap className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{userSubscription.planName}</span>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-100 text-emerald-800">
                      {userSubscription.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {userSubscription.isUnlimited ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <InfinityIcon className="w-3.5 h-3.5" /> Unlimited AI Applications Enabled
                      </span>
                    ) : (
                      <span>
                        <strong className="text-slate-800">{userSubscription.samplesUsed}</strong> of {userSubscription.samplesLimit} free starter samples used
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {onNavigateToPricing && (
                  <button
                    type="button"
                    onClick={onNavigateToPricing}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    View Plans & Upgrade (from ₹50)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Default Starter Resume Text */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              <span>Default Starter Resume</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">Auto-loaded when starting a new job tailoring</span>
          </div>

          <textarea
            rows={14}
            value={formData.defaultResumeText}
            onChange={(e) => setFormData({ ...formData, defaultResumeText: e.target.value })}
            className="w-full p-4 text-xs text-slate-800 rounded-2xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none font-mono transition-all"
            placeholder="Paste your base resume here..."
          />
        </div>
      </form>

      {/* Certification Add/Edit Modal */}
      <CertificationModal
        isOpen={isCertModalOpen}
        onClose={() => {
          setIsCertModalOpen(false);
          setEditingCert(null);
        }}
        onSave={handleSaveCertification}
        initialData={editingCert}
      />

      {/* Certification Proof Lightbox Viewer Modal */}
      <CertificationProofViewerModal
        cert={viewingProofCert}
        onClose={() => setViewingProofCert(null)}
      />
    </div>
  );
};

