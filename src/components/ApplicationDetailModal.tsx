import React, { useState } from 'react';
import { X, Calendar, Building2, MapPin, Award, FileText, Mail, Download, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { JobApplicationRecord, ApplicationStatus } from '../types';
import { ResumeLetterStudio } from './ResumeLetterStudio';
import { SkillsGapRadar } from './SkillsGapRadar';
import { ExperienceAlignmentView } from './ExperienceAlignmentView';
import { api } from '../services/api';

interface ApplicationDetailModalProps {
  application: JobApplicationRecord | null;
  onClose: () => void;
  onStatusUpdated?: (updatedApp: JobApplicationRecord) => void;
  onDelete?: (appId: string) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  onClose,
  onStatusUpdated,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'skills' | 'experience' | 'notes'>('docs');
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus>(
    application?.status || 'tailored'
  );
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notes, setNotes] = useState(application?.notes || '');
  const [interviewDate, setInterviewDate] = useState(
    application?.interviewDate ? application.interviewDate.split('T')[0] : ''
  );
  const [savingNotes, setSavingNotes] = useState(false);

  if (!application) return null;

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    setCurrentStatus(newStatus);
    setUpdatingStatus(true);
    try {
      const updated = await api.updateApplication(application.id, {
        status: newStatus,
      });
      if (onStatusUpdated) onStatusUpdated(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const updated = await api.updateApplication(application.id, {
        notes,
        interviewDate: interviewDate ? new Date(interviewDate).toISOString() : undefined,
      });
      if (onStatusUpdated) onStatusUpdated(updated);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const statusList: { key: ApplicationStatus; label: string; color: string }[] = [
    { key: 'tailored', label: 'Tailored', color: 'bg-slate-100 text-slate-700' },
    { key: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
    { key: 'interviewing', label: 'Interviewing', color: 'bg-amber-100 text-amber-800' },
    { key: 'offer', label: 'Offer Received', color: 'bg-emerald-100 text-emerald-800' },
    { key: 'rejected', label: 'Archived', color: 'bg-rose-100 text-rose-800' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                Saved Application
              </span>
              <span className="text-rose-200 text-xs">
                {new Date(application.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">{application.jobTitle}</h2>
            <div className="flex items-center gap-3 text-xs text-rose-100 mt-1">
              <span className="flex items-center gap-1 font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                {application.companyName}
              </span>
              {application.jobLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {application.jobLocation}
                </span>
              )}
              <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full font-bold">
                <Award className="w-3.5 h-3.5" />
                {(application.scoringResult || application.scoringBreakdown)?.overallScore || 85}% Match
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Status Pills */}
            <div className="flex bg-black/20 p-1 rounded-xl gap-1">
              {statusList.map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleStatusChange(s.key)}
                  disabled={updatingStatus}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    currentStatus === s.key
                      ? 'bg-white text-red-700 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Subtabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('docs')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'docs'
                ? 'border-red-600 text-red-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tailored Documents</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'skills'
                ? 'border-red-600 text-red-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Skills Gap Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('experience')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'experience'
                ? 'border-red-600 text-red-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Experience Alignment</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-red-600 text-red-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Private Notes & Interview Dates</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {activeTab === 'docs' && (
            <ResumeLetterStudio
              resume={application.tailoredResume}
              coverLetter={application.tailoredCoverLetter}
              jobTitle={application.jobTitle}
              companyName={application.companyName}
            />
          )}

          {activeTab === 'skills' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <SkillsGapRadar skillsGap={application.skillsGap} />
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <ExperienceAlignmentView alignments={application.experienceAlignments} />
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h3 className="font-extrabold text-sm text-slate-900">Application Pipeline Notes</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Upcoming Interview Date:</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Private Application & Recruiter Notes:
                </label>
                <textarea
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Spoke with recruiter Jane, technical round scheduled on Tuesday focusing on system design and React performance..."
                  className="w-full p-3 text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-red-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this tailored application?')) {
                        onDelete(application.id);
                        onClose();
                      }
                    }}
                    className="text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                  >
                    Delete Application
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
