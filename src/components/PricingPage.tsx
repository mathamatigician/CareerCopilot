import React, { useState, useEffect } from 'react';
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Clock,
  Award,
  CreditCard,
  Infinity as InfinityIcon,
  FileCheck,
  AlertCircle,
  Receipt,
  RotateCcw,
  Star,
  Flame,
  ArrowRight,
  Gift,
} from 'lucide-react';
import { SubscriptionPlan, UserSubscription, SubscriptionInvoice, SubscriptionPlanId } from '../types';
import { subscriptionService } from '../services/subscriptionService';
import { CheckoutModal } from './CheckoutModal';
import { InvoiceModal } from './InvoiceModal';

interface PricingPageProps {
  userId?: string;
  onNavigateToTailor: () => void;
  onNotify?: (msg: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  userId,
  onNavigateToTailor,
  onNotify,
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionInvoice | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedPlans, fetchedSub] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getStatus(userId),
      ]);
      setPlans(fetchedPlans);
      setSubscription(fetchedSub);
    } catch (err) {
      console.error('Error loading pricing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (subscription?.planId === plan.id && subscription.status === 'active') {
      if (plan.id === 'free') {
        onNavigateToTailor();
        return;
      }
    }
    setSelectedPlanForCheckout(plan);
  };

  const handleCheckoutSuccess = (updatedSub: UserSubscription, invoice: SubscriptionInvoice) => {
    setSubscription(updatedSub);
    if (onNotify) {
      onNotify(`🎉 Successfully activated ${updatedSub.planName}!`);
    }
  };

  const handleResetCredits = async () => {
    setIsResetting(true);
    try {
      const res = await subscriptionService.resetCredits(userId);
      setSubscription(res.subscription);
      if (onNotify) {
        onNotify('Sample credits reset to 0/10 used for testing.');
      }
    } catch (err) {
      console.error('Failed to reset credits:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const faqs = [
    {
      q: 'How do the 10 free samples work?',
      a: 'Every new user receives 10 free AI tailorings and ATS gap analysis reports immediately upon sign up with zero payment needed. You can analyze job requirements, get keyword suggestions, and review match scores completely free.',
    },
    {
      q: 'What payment methods are supported in India (INR)?',
      a: 'We support all major Indian payment methods: UPI (Google Pay, PhonePe, Paytm, BHIM, CRED), BharatQR scan & pay, RuPay / Visa / Mastercard credit and debit cards, and Indian NetBanking with instant automated activation.',
    },
    {
      q: 'Can I upgrade from Monthly (₹50) to Yearly or Lifetime later?',
      a: 'Yes! You can upgrade to any tier at any time. When upgrading to Lifetime (₹500), your subscription is locked in forever with zero future renewal payments.',
    },
    {
      q: 'What is included in the Lifetime Founder Pass (₹500)?',
      a: 'The Lifetime Pass grants permanent unlimited access to all AI tailoring engines, Word DOCX exports, ATS radar scans, and upcoming AI features with a single one-time payment of ₹500 INR.',
    },
    {
      q: 'Are GST invoices provided for business or tax filing?',
      a: 'Yes, full tax invoices with GST breakdown, transaction IDs, and invoice numbers are automatically generated for every transaction and can be downloaded or printed anytime.',
    },
  ];

  const comparisonFeatures = [
    { name: 'AI Tailoring Samples Quota', free: '10 Free Credits', monthly: 'Unlimited', half_yearly: 'Unlimited', yearly: 'Unlimited', lifetime: 'Unlimited Forever' },
    { name: 'ATS Match Score & Health Radar', free: true, monthly: true, half_yearly: true, yearly: true, lifetime: true },
    { name: 'Skills Gap & Missing Keywords', free: true, monthly: true, half_yearly: true, yearly: true, lifetime: true },
    { name: 'Experience Bullet Point Rewriter', free: true, monthly: true, half_yearly: true, yearly: true, lifetime: true },
    { name: 'Formatted Word (.docx) Downloads', free: false, monthly: true, half_yearly: true, yearly: true, lifetime: true },
    { name: 'Custom ATS Scoring Weight Profiles', free: false, monthly: true, half_yearly: true, yearly: true, lifetime: true },
    { name: 'Certification & Badge Verification', free: false, monthly: true, half_yearly: true, yearly: true, lifetime: true },
    { name: 'Priority AI Processing Queue', free: false, monthly: false, half_yearly: true, yearly: true, lifetime: true },
    { name: 'VIP Lifetime Access & Future AI Updates', free: false, monthly: false, half_yearly: false, yearly: false, lifetime: true },
  ];

  const currentPlanId = subscription?.planId || 'free';

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16">
      {/* Top Banner / Hero */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200/80 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span>Simple, Transparent Pricing in INR (₹)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span className="text-slate-600">Start with 10 Free Samples</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Supercharge Your Job Search with TailorFit Pro
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Unlock unlimited AI-powered resume tailoring, instant ATS gap analysis, and tailored Word (.docx) exports.
          Plans range from as low as <strong className="text-slate-900">₹50</strong> up to a permanent <strong className="text-slate-900">₹500 Lifetime Pass</strong>.
        </p>

        {/* Current Active Plan Status Bar */}
        {subscription && (
          <div className="max-w-xl mx-auto mt-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                {subscription.planId === 'lifetime' ? (
                  <CrownIcon className="w-5 h-5 text-amber-600" />
                ) : (
                  <Zap className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Active Plan: {subscription.planName}</span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-100 text-emerald-800">
                    {subscription.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  {subscription.isUnlimited ? (
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <InfinityIcon className="w-3.5 h-3.5" /> Unlimited AI Tailorings Active
                    </span>
                  ) : (
                    <span>
                      <strong className="text-slate-800">{subscription.samplesUsed}</strong> / {subscription.samplesLimit} free samples used ({Math.max(0, subscription.samplesLimit - subscription.samplesUsed)} remaining)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {subscription.planId === 'free' && (
                <button
                  onClick={handleResetCredits}
                  disabled={isResetting}
                  title="Reset demo sample credits to test 10 samples limit"
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="text-[11px]">Reset Demo Credits</span>
                </button>
              )}
              <button
                onClick={onNavigateToTailor}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Go to Studio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Cards Grid (5 Tiers: Free, Monthly ₹10, Half-Yearly ₹100, Yearly ₹250, Lifetime ₹500) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const isPopular = plan.isPopular;
          const isLifetime = plan.id === 'lifetime';
          const isYearly = plan.id === 'yearly';

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl flex flex-col justify-between transition-all duration-200 ${
                isPopular
                  ? 'bg-white border-2 border-red-500 shadow-xl shadow-red-500/10 ring-2 ring-red-400/20'
                  : isLifetime
                  ? 'bg-gradient-to-b from-amber-50/40 via-white to-white border-2 border-amber-400/70 shadow-lg'
                  : 'bg-white border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={`px-3 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full shadow-xs ${
                      isPopular
                        ? 'bg-red-600 text-white'
                        : isLifetime
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Card Header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-extrabold text-slate-900">{plan.name}</h3>
                  {isLifetime && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  {isPopular && <Flame className="w-4 h-4 text-red-500 fill-red-500" />}
                </div>

                <p className="text-xs text-slate-500 min-h-[32px] leading-snug">{plan.tagline}</p>

                {/* Price Display */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-500">₹</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {plan.priceInr}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 ml-1">
                      {plan.priceInr === 0 ? 'INR' : 'INR'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{plan.billingPeriodLabel}</span>
                    {plan.originalPriceInr && (
                      <span className="line-through text-slate-400">₹{plan.originalPriceInr}</span>
                    )}
                  </div>

                  {plan.highlightText && (
                    <div className="mt-2.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-red-700 text-center">
                      {plan.highlightText}
                    </div>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="p-5 flex-1 space-y-2.5">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  What's Included:
                </p>
                <ul className="space-y-2 text-xs">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 leading-tight">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  id={`select-plan-${plan.id}-btn`}
                  disabled={isCurrent && plan.id === 'free'}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-700 border border-slate-300'
                      : isPopular
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md shadow-red-600/25 hover:scale-[1.02]'
                      : isLifetime
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md shadow-amber-600/25 hover:scale-[1.02]'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs hover:scale-[1.02]'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Current Active Plan</span>
                    </>
                  ) : (
                    <>
                      <span>{plan.ctaLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Compare Plans & Features</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive breakdown across all 5 tiers (Free, Monthly ₹50, Half-Yearly ₹150, Yearly ₹250, Lifetime ₹500).
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 text-xs font-bold">
            All prices in INR (₹)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-1/3">Feature</th>
                <th className="py-3 px-3 text-center">Free (₹0)</th>
                <th className="py-3 px-3 text-center">Monthly (₹50)</th>
                <th className="py-3 px-3 text-center bg-red-50/50 text-red-800">Half-Yearly (₹150)</th>
                <th className="py-3 px-3 text-center">Yearly (₹250)</th>
                <th className="py-3 px-3 text-center bg-amber-50/50 text-amber-900">Lifetime (₹500)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonFeatures.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">{row.name}</td>

                  {/* Free */}
                  <td className="py-3 px-3 text-center text-slate-600">
                    {typeof row.free === 'boolean' ? (
                      row.free ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )
                    ) : (
                      <span className="font-bold text-slate-700">{row.free}</span>
                    )}
                  </td>

                  {/* Monthly */}
                  <td className="py-3 px-3 text-center text-slate-600">
                    {typeof row.monthly === 'boolean' ? (
                      row.monthly ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )
                    ) : (
                      <span className="font-bold text-emerald-700">{row.monthly}</span>
                    )}
                  </td>

                  {/* Half-Yearly */}
                  <td className="py-3 px-3 text-center bg-red-50/30 text-slate-700">
                    {typeof row.half_yearly === 'boolean' ? (
                      row.half_yearly ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )
                    ) : (
                      <span className="font-bold text-emerald-700">{row.half_yearly}</span>
                    )}
                  </td>

                  {/* Yearly */}
                  <td className="py-3 px-3 text-center text-slate-600">
                    {typeof row.yearly === 'boolean' ? (
                      row.yearly ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )
                    ) : (
                      <span className="font-bold text-emerald-700">{row.yearly}</span>
                    )}
                  </td>

                  {/* Lifetime */}
                  <td className="py-3 px-3 text-center bg-amber-50/30 text-slate-800">
                    {typeof row.lifetime === 'boolean' ? (
                      row.lifetime ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )
                    ) : (
                      <span className="font-bold text-amber-800">{row.lifetime}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoices & Purchase History Section (if user has any invoices) */}
      {subscription && subscription.invoices && subscription.invoices.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Billing History & GST Invoices</h3>
            </div>
            <span className="text-xs text-slate-500">
              {subscription.invoices.length} receipt{subscription.invoices.length > 1 ? 's' : ''} on record
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {subscription.invoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{inv.planName}</span>
                    <span className="font-mono text-slate-500 text-[11px]">#{inv.invoiceNumber}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(inv.createdAt).toLocaleDateString()} • {inv.paymentMethod} • Txn: {inv.transactionId}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 text-sm">₹{inv.amountInr} INR</span>
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer transition-colors"
                  >
                    View Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl font-extrabold text-slate-900">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-500">Everything you need to know about plans, INR pricing, and credits</p>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3.5">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left flex justify-between items-center gap-4 text-xs font-bold text-slate-800 hover:text-red-700 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 font-mono text-sm">{activeFaq === idx ? '−' : '+'}</span>
              </button>
              {activeFaq === idx && (
                <p className="text-xs text-slate-600 mt-2 leading-relaxed pl-2 border-l-2 border-red-400 animate-in fade-in duration-150">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={!!selectedPlanForCheckout}
        plan={selectedPlanForCheckout}
        userId={userId}
        onClose={() => setSelectedPlanForCheckout(null)}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Invoice View Modal */}
      <InvoiceModal
        isOpen={!!selectedInvoice}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
};

function CrownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.735H5.81a1 1 0 0 1-.957-.735L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
      <path d="M5 21h14" />
    </svg>
  );
}
