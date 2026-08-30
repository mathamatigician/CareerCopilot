import React from 'react';
import { X, ExternalLink, Download, FileText, Image as ImageIcon, Award, ShieldCheck } from 'lucide-react';
import { CertificationItem } from '../types';

interface CertificationProofViewerModalProps {
  cert: CertificationItem | null;
  onClose: () => void;
}

export const CertificationProofViewerModal: React.FC<CertificationProofViewerModalProps> = ({
  cert,
  onClose,
}) => {
  if (!cert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        id="cert-proof-modal"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">{cert.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified {cert.type.toUpperCase()}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {cert.issuer} {cert.issueDate && `• Issued ${cert.issueDate}`} {cert.credentialId && `• ID: ${cert.credentialId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewer */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-100/50 min-h-[350px]">
          {cert.type === 'image' && (
            <div className="max-w-full flex flex-col items-center">
              <img
                src={cert.sourceValue}
                alt={cert.name}
                className="max-h-[60vh] object-contain rounded-2xl border border-slate-200 shadow-md bg-white p-2"
              />
              <p className="text-xs text-slate-500 mt-3 font-medium">
                {cert.fileName || `${cert.name}.png`} {cert.fileSize && `(${cert.fileSize})`}
              </p>
            </div>
          )}

          {cert.type === 'pdf' && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {cert.sourceValue.startsWith('data:application/pdf') ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <iframe
                    src={cert.sourceValue}
                    title={cert.name}
                    className="w-full h-[55vh] rounded-2xl border border-slate-200 shadow-xs bg-white"
                  />
                  <a
                    href={cert.sourceValue}
                    download={cert.fileName || `${cert.name}.pdf`}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Certificate</span>
                  </a>
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{cert.fileName || `${cert.name}.pdf`}</h4>
                  <p className="text-xs text-slate-500 mb-4">Official PDF Certificate Document on Record</p>
                  <a
                    href={cert.sourceValue}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Open in New Window</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {cert.type === 'url' && (
            <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md w-full">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <ExternalLink className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Official Online Credential Verification</h4>
              <p className="text-xs text-slate-500 mb-4 break-all px-2 font-mono">
                {cert.sourceValue}
              </p>
              <a
                href={cert.sourceValue.startsWith('http') ? cert.sourceValue : `https://${cert.sourceValue}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-red-600/20"
              >
                <span>Visit Verification URL</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Status on Tailored Resumes:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                cert.selectedForResume !== false
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {cert.selectedForResume !== false ? 'Active & Included' : 'Excluded from Resumes'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
