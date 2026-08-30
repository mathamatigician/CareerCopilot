import React from 'react';
import { X, Printer, Download, CheckCircle2, Building2, ShieldCheck } from 'lucide-react';
import { SubscriptionInvoice } from '../types';

interface InvoiceModalProps {
  isOpen: boolean;
  invoice: SubscriptionInvoice | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, invoice, onClose }) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const text = `
=====================================================
            TAILORFIT AI TECHNOLOGIES
                 TAX INVOICE & RECEIPT
=====================================================
Invoice Number : ${invoice.invoiceNumber}
Date           : ${new Date(invoice.createdAt).toLocaleString()}
Transaction ID : ${invoice.transactionId}
Payment Status : ${invoice.status.toUpperCase()}
Payment Method : ${invoice.paymentMethod}

CUSTOMER DETAILS:
User ID        : ${invoice.userId}
Currency       : INR (₹)

PLAN & BILLING SUMMARY:
Plan Name      : ${invoice.planName}
Coverage Period: ${new Date(invoice.periodStart).toLocaleDateString()} to ${
      invoice.periodEnd ? new Date(invoice.periodEnd).toLocaleDateString() : 'Lifetime'
    }

LINE ITEMS:
-----------------------------------------------------
Item Description                    Amount (INR)
-----------------------------------------------------
${invoice.planName.padEnd(35)} ₹${invoice.amountInr}.00
Integrated GST (18% inclusive)      ₹${((invoice.amountInr * 18) / 118).toFixed(2)}
-----------------------------------------------------
TOTAL PAID                         ₹${invoice.amountInr}.00 INR
-----------------------------------------------------

Thank you for choosing TailorFit AI!
For inquiries: support@tailorfit.ai | GSTIN: 27AABCT1234F1Z8
=====================================================
`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoice.invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Actions */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Paid & Active
            </span>
            <span className="font-mono text-xs text-slate-500 font-medium">#{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadText}
              title="Download Receipt Text File"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={handlePrint}
              title="Print Receipt"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 space-y-6 text-slate-800 text-sm">
          {/* Top Brand & Metadata */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-sm">
                  TF
                </div>
                <span className="font-black text-lg text-slate-900 tracking-tight">TailorFit AI</span>
              </div>
              <p className="text-xs text-slate-500">AI-Powered Resume Tailoring & ATS Scoring</p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">GSTIN: 27AABCT1234F1Z8</p>
            </div>
            <div className="text-left sm:text-right space-y-1 text-xs">
              <p className="font-mono font-bold text-slate-900 text-sm">{invoice.invoiceNumber}</p>
              <p className="text-slate-500">
                Date: {new Date(invoice.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-slate-500 font-mono text-[11px]">Txn: {invoice.transactionId}</p>
            </div>
          </div>

          {/* Bill To & Plan Info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Billed To</p>
              <p className="font-bold text-slate-800">{invoice.userId}</p>
              <p className="text-slate-500">Account holder • Verified Customer</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Payment Method</p>
              <p className="font-bold text-slate-800">{invoice.paymentMethod}</p>
              <p className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified & Settled
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 text-left">Description</th>
                  <th className="py-2.5 px-4 text-center">Period</th>
                  <th className="py-2.5 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{invoice.planName}</p>
                    <p className="text-[11px] text-slate-500">AI Tailoring, ATS Gap Scanner, DOCX & PDF Export</p>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 whitespace-nowrap">
                    {invoice.periodEnd
                      ? `${new Date(invoice.periodStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${new Date(invoice.periodEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'Lifetime Access'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                    ₹{invoice.amountInr}.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculations */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">₹{invoice.amountInr}.00</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST (18% Included):</span>
                <span className="font-mono">₹{((invoice.amountInr * 18) / 118).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                <span>Total Paid:</span>
                <span className="text-red-700 font-mono text-base">₹{invoice.amountInr} INR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl text-center">
          <p className="text-[11px] text-slate-500">
            This is a computer-generated tax invoice and requires no physical signature.
          </p>
        </div>
      </div>
    </div>
  );
};
