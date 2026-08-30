import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Zap,
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  ArrowRight,
  Sparkles,
  Lock,
  Receipt,
  FileText,
} from 'lucide-react';
import { SubscriptionPlan, SubscriptionInvoice, UserSubscription } from '../types';
import { subscriptionService } from '../services/subscriptionService';

interface CheckoutModalProps {
  isOpen: boolean;
  plan: SubscriptionPlan | null;
  userId?: string;
  onClose: () => void;
  onSuccess: (subscription: UserSubscription, invoice: SubscriptionInvoice) => void;
}

type PaymentMethodType = 'upi_app' | 'upi_id' | 'qr_code' | 'card' | 'netbanking';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  plan,
  userId,
  onClose,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('upi_app');
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<SubscriptionInvoice | null>(null);
  const [completedSubscription, setCompletedSubscription] = useState<UserSubscription | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !plan) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      let paymentLabel = 'UPI';
      if (selectedMethod === 'upi_app') {
        const appNames = { gpay: 'Google Pay UPI', phonepe: 'PhonePe UPI', paytm: 'Paytm UPI', bhim: 'BHIM UPI' };
        paymentLabel = appNames[selectedUpiApp] || 'UPI App';
      } else if (selectedMethod === 'upi_id') {
        if (!upiId || !upiId.includes('@')) {
          throw new Error('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or phone@upi)');
        }
        paymentLabel = `UPI (${upiId})`;
      } else if (selectedMethod === 'qr_code') {
        paymentLabel = 'BharatQR / Scan & Pay';
      } else if (selectedMethod === 'card') {
        if (cardNumber.replace(/\s+/g, '').length < 12) {
          throw new Error('Please enter a valid card number');
        }
        paymentLabel = `Card (Ending in ${cardNumber.slice(-4) || '8842'})`;
      } else if (selectedMethod === 'netbanking') {
        paymentLabel = `NetBanking (${selectedBank})`;
      }

      // Simulate network checkout latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const res = await subscriptionService.checkout(plan.id, paymentLabel, undefined, userId);
      setCompletedInvoice(res.invoice);
      setCompletedSubscription(res.subscription);
      onSuccess(res.subscription, res.invoice);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setCompletedInvoice(null);
    setCompletedSubscription(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[92vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {completedInvoice ? 'Payment Successful' : 'Secure Checkout & Activation'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {completedInvoice ? 'Subscription activated instantly' : 'Instant activation • 256-bit encrypted'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {completedInvoice ? (
            /* Success Receipt View */
            <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
                  Plan Activated
                </span>
                <h4 className="text-2xl font-black text-slate-900">
                  Welcome to {completedInvoice.planName}!
                </h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto mt-1">
                  Your payment of <strong className="text-slate-900">₹{completedInvoice.amountInr} INR</strong> was processed successfully.
                  {plan.id === 'lifetime'
                    ? ' You now have unlimited AI tailoring for life with zero recurring charges.'
                    : ' You have full unlimited access to ATS gap analysis and tailoring.'}
                </p>
              </div>

              {/* Order Receipt Box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Invoice Number</span>
                  <span className="font-mono font-bold text-slate-800">{completedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Transaction ID</span>
                  <span className="font-mono text-slate-700">{completedInvoice.transactionId}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Payment Method</span>
                  <span className="font-bold text-slate-800">{completedInvoice.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Active Plan</span>
                  <span className="font-bold text-red-700">{completedInvoice.planName}</span>
                </div>
                {completedInvoice.periodEnd && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                    <span className="text-slate-500 font-medium">Valid Until</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(completedInvoice.periodEnd).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 font-bold text-sm">
                  <span className="text-slate-800">Total Paid</span>
                  <span className="text-red-700 text-base">₹{completedInvoice.amountInr} INR</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleClose}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  Start Tailoring Resumes
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handlePay} className="space-y-5">
              {/* Plan Summary Card */}
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-200/70 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900">{plan.name}</h4>
                    {plan.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-red-600 text-white">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{plan.tagline}</p>
                </div>
                <div className="text-right pl-3 border-l border-red-200">
                  <div className="text-xl font-black text-red-700">₹{plan.priceInr}</div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                    {plan.priceInr === 0 ? 'Free Forever' : plan.billingPeriodLabel}
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              {plan.priceInr > 0 ? (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Payment Method (INR)
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('upi_app')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedMethod === 'upi_app'
                          ? 'border-red-600 bg-red-50/60 text-red-900 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold">UPI Apps</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('upi_id')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedMethod === 'upi_id'
                          ? 'border-red-600 bg-red-50/60 text-red-900 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold">UPI ID / VPA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('qr_code')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedMethod === 'qr_code'
                          ? 'border-red-600 bg-red-50/60 text-red-900 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold">Scan QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('card')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedMethod === 'card'
                          ? 'border-red-600 bg-red-50/60 text-red-900 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold">Card</span>
                    </button>
                  </div>

                  {/* Method Details */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    {selectedMethod === 'upi_app' && (
                      <div className="space-y-3">
                        <p className="font-semibold text-slate-700">Choose your preferred UPI application:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'gpay', label: 'Google Pay', color: 'text-blue-600' },
                            { id: 'phonepe', label: 'PhonePe', color: 'text-purple-600' },
                            { id: 'paytm', label: 'Paytm', color: 'text-cyan-600' },
                            { id: 'bhim', label: 'BHIM UPI', color: 'text-emerald-600' },
                          ].map((app) => (
                            <label
                              key={app.id}
                              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                selectedUpiApp === app.id
                                  ? 'bg-white border-red-500 shadow-xs ring-1 ring-red-400'
                                  : 'bg-white/60 border-slate-200 hover:bg-white'
                              }`}
                            >
                              <input
                                type="radio"
                                name="upiApp"
                                checked={selectedUpiApp === app.id}
                                onChange={() => setSelectedUpiApp(app.id as any)}
                                className="text-red-600 focus:ring-red-500"
                              />
                              <span className="font-bold text-slate-800 text-xs">{app.label}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-2">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          Simulated instant verification with zero gateway surcharges.
                        </p>
                      </div>
                    )}

                    {selectedMethod === 'upi_id' && (
                      <div className="space-y-2">
                        <label className="block font-semibold text-slate-700">
                          Enter UPI Virtual Payment Address (VPA):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. mobile@upi or username@okhdfcbank"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-500">Quick fill:</span>
                          {['user@okaxis', 'alex@okhdfcbank', '9876543210@paytm'].map((demo) => (
                            <button
                              key={demo}
                              type="button"
                              onClick={() => setUpiId(demo)}
                              className="text-[11px] font-mono text-red-600 hover:underline cursor-pointer"
                            >
                              {demo}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'qr_code' && (
                      <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                        <div className="w-24 h-24 bg-white p-2 border border-slate-300 rounded-xl shadow-xs flex flex-col items-center justify-center">
                          <QrCode className="w-16 h-16 text-slate-800" />
                          <span className="text-[9px] font-black text-red-600 uppercase tracking-tighter">BharatQR</span>
                        </div>
                        <div className="space-y-1 text-center sm:text-left">
                          <p className="font-bold text-slate-800">Scan using any UPI App</p>
                          <p className="text-slate-500 text-[11px]">
                            Open GPay, PhonePe, Paytm, or CRED to scan & pay ₹{plan.priceInr} INR instantly.
                          </p>
                          <span className="inline-block text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Merchant: TailorFit AI Technologies
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'card' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Card Number (RuPay, Visa, Mastercard)</label>
                          <input
                            type="text"
                            placeholder="4532 •••• •••• 8842"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Expiry</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">CVV</label>
                            <input
                              type="password"
                              placeholder="•••"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Card Holder</label>
                            <input
                              type="text"
                              placeholder="Name on card"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Complimentary Free Starter Plan
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    No credit card or payment required. Includes 10 free AI resume tailoring credits.
                  </p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal ({plan.name})</span>
                  <span className="font-mono">₹{plan.priceInr}.00</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxes & GST (Included)</span>
                  <span className="font-mono">₹0.00</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-100">
                  <span>Total Amount Due</span>
                  <span className="text-red-700 text-base">₹{plan.priceInr} INR</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  id="confirm-payment-btn"
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing INR Payment...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {plan.priceInr === 0 ? 'Activate Free 10 Samples' : `Pay ₹${plan.priceInr} & Activate ${plan.name}`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  Bank-Grade Encryption
                </span>
                <span>•</span>
                <span>Instant Activation</span>
                <span>•</span>
                <span>GST Compliant Invoices</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
