import React, { useState, useRef } from 'react';
import {
  X,
  Award,
  Link as LinkIcon,
  Image as ImageIcon,
  FileText,
  Upload,
  Check,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building,
  Hash,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { CertificationItem } from '../types';

interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cert: CertificationItem) => void;
  initialData?: CertificationItem | null;
}

export const CertificationModal: React.FC<CertificationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [issuer, setIssuer] = useState(initialData?.issuer || '');
  const [issueDate, setIssueDate] = useState(initialData?.issueDate || '');
  const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate || '');
  const [credentialId, setCredentialId] = useState(initialData?.credentialId || '');
  const [type, setType] = useState<'image' | 'url' | 'pdf'>(initialData?.type || 'url');
  const [sourceValue, setSourceValue] = useState(initialData?.sourceValue || '');
  const [fileName, setFileName] = useState(initialData?.fileName || '');
  const [fileSize, setFileSize] = useState(initialData?.fileSize || '');
  const [selectedForResume, setSelectedForResume] = useState(
    initialData ? initialData.selectedForResume !== false : true
  );
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be under 15MB');
      return;
    }

    const readableSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setFileName(file.name);
    setFileSize(readableSize);
    setError(null);

    // If no name set yet, infer from filename
    if (!name.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setName(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      setSourceValue(result);
    };
    reader.readAsDataURL(file);
  };

  const handleQuickPreset = (presetName: string, presetIssuer: string) => {
    setName(presetName);
    setIssuer(presetIssuer);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Certification Name is required');
      return;
    }
    if (!issuer.trim()) {
      setError('Issuing Organization is required');
      return;
    }
    if (type === 'url' && !sourceValue.trim()) {
      setError('Verification URL is required for URL certificates');
      return;
    }
    if ((type === 'image' || type === 'pdf') && !sourceValue.trim()) {
      setError(`Please upload a ${type.toUpperCase()} certificate file`);
      return;
    }

    const certItem: CertificationItem = {
      id: initialData?.id || `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      issuer: issuer.trim(),
      issueDate: issueDate.trim() || undefined,
      expiryDate: expiryDate.trim() || undefined,
      credentialId: credentialId.trim() || undefined,
      type,
      sourceValue: sourceValue.trim(),
      fileName: fileName.trim() || undefined,
      fileSize: fileSize || undefined,
      selectedForResume,
    };

    onSave(certItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        id="certification-modal"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-50/50 via-rose-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {initialData ? 'Edit Certification' : 'Add New Certification & Credential'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Add verifiable credentials via URL, PDF, or certificate image
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Presets */}
          {!initialData && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Popular Credentials (1-Click Fill)
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('AWS Certified Solutions Architect', 'Amazon Web Services')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer border border-slate-200"
                >
                  AWS Solutions Architect
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleQuickPreset('Certified Kubernetes Application Developer (CKAD)', 'Cloud Native Computing Foundation')
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer border border-slate-200"
                >
                  Kubernetes (CKAD)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Google Cloud Professional Architect', 'Google Cloud')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer border border-slate-200"
                >
                  GCP Cloud Architect
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Meta Front-End Developer Certificate', 'Meta')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer border border-slate-200"
                >
                  Meta Front-End
                </button>
              </div>
            </div>
          )}

          {/* Type Selector (URL / Image / PDF) */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
              Verification Proof Type <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('url');
                  setError(null);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start gap-1.5 ${
                  type === 'url'
                    ? 'border-red-600 bg-red-50/50 text-red-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <LinkIcon className={`w-4 h-4 ${type === 'url' ? 'text-red-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Online URL</span>
                </div>
                <span className="text-[10px] text-slate-500 hidden sm:inline">Credly, AWS, Coursera link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('pdf');
                  setError(null);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start gap-1.5 ${
                  type === 'pdf'
                    ? 'border-red-600 bg-red-50/50 text-red-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <FileText className={`w-4 h-4 ${type === 'pdf' ? 'text-red-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">PDF Document</span>
                </div>
                <span className="text-[10px] text-slate-500 hidden sm:inline">Official diploma / PDF file</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('image');
                  setError(null);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start gap-1.5 ${
                  type === 'image'
                    ? 'border-red-600 bg-red-50/50 text-red-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ImageIcon className={`w-4 h-4 ${type === 'image' ? 'text-red-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Image / Badge</span>
                </div>
                <span className="text-[10px] text-slate-500 hidden sm:inline">PNG, JPG, or Screenshot</span>
              </button>
            </div>
          </div>

          {/* Name and Issuer Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Certification Name <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Award className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AWS Solutions Architect"
                  required
                  className="w-full pl-8.5 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Issuing Organization <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="e.g. Amazon Web Services, Google"
                  required
                  className="w-full pl-8.5 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Date & Credential ID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Issue Date / Year</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  placeholder="e.g. 2024 or Oct 2023"
                  className="w-full pl-8.5 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-red-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expiration (Optional)</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="e.g. 2027 or No Expiry"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Credential ID (Optional)</label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  placeholder="e.g. AWS-SAA-839210"
                  className="w-full pl-8.5 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Proof Upload / URL input */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              {type === 'url' ? 'Verification URL / Public Badge Link' : `Upload ${type.toUpperCase()} Certificate`} <span className="text-red-600">*</span>
            </label>

            {type === 'url' ? (
              <div className="space-y-2">
                <div className="relative flex items-center">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                  <input
                    type="url"
                    value={sourceValue}
                    onChange={(e) => setSourceValue(e.target.value)}
                    placeholder="https://www.credly.com/badges/..."
                    className="w-full pl-8.5 pr-20 py-2 text-xs rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                  />
                  {sourceValue && (
                    <a
                      href={sourceValue.startsWith('http') ? sourceValue : `https://${sourceValue}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg flex items-center gap-1"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Provide a public verification URL (e.g., Credly, Coursera, AWS CertMetrics, LinkedIn certification link).
                </p>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept={type === 'pdf' ? '.pdf' : '.png,.jpg,.jpeg,.webp'}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-red-200 bg-red-50/20 hover:bg-red-50/50 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                >
                  {sourceValue ? (
                    <div className="flex items-center gap-3 w-full bg-white p-3 rounded-xl border border-red-100 shadow-2xs">
                      {type === 'image' ? (
                        <img
                          src={sourceValue}
                          alt="Certificate preview"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 text-left overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {fileName || `${name || 'Certificate'}.${type === 'pdf' ? 'pdf' : 'png'}`}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {fileSize || 'Uploaded'} • Click to replace file
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Ready</span>
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Click or drag & drop to upload your {type.toUpperCase()} certificate
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {type === 'pdf'
                            ? 'Supports PDF files up to 15MB'
                            : 'Supports PNG, JPG, JPEG, and WEBP images up to 15MB'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Toggle: Include in Resume */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={selectedForResume}
                onChange={(e) => setSelectedForResume(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded-md border-slate-300 focus:ring-red-500 cursor-pointer accent-red-600"
              />
              <div className="flex-1">
                <span className="text-xs font-extrabold text-slate-900 block">
                  Include on Tailored Resumes
                </span>
                <span className="text-[11px] text-slate-500 block">
                  When selected, this certification will automatically be reflected in the resume's Certifications section.
                </span>
              </div>
              <ShieldCheck className={`w-4 h-4 ${selectedForResume ? 'text-red-600' : 'text-slate-300'}`} />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-certification-btn"
              className="px-5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialData ? 'Save Changes' : 'Add Certification'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
