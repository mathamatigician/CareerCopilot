import { SubscriptionPlan, UserSubscription, SubscriptionInvoice, SubscriptionPlanId } from '../types';

export const subscriptionService = {
  // Fetch all available subscription plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const res = await fetch('/api/subscription/plans');
      if (!res.ok) throw new Error('Failed to fetch subscription plans');
      return await res.json();
    } catch (err) {
      console.error('getPlans error:', err);
      // Fallback local plans
      return [
        {
          id: 'free',
          name: 'Free Starter',
          tagline: 'Perfect for evaluating ATS gap analysis with complimentary sample credits.',
          priceInr: 0,
          billingPeriodLabel: 'Free Forever',
          samplesLimit: 10,
          features: [
            '10 Free AI Application Tailoring Samples',
            'Instant ATS Match Score & Breakdown',
            'Skills Gap Radar & Keyword Analysis',
            'Experience Alignment Suggestions',
            'Standard Plain Text & Markdown Exports',
          ],
          highlightText: '10 Free Credits Included',
          ctaLabel: 'Current Plan',
        },
        {
          id: 'monthly',
          name: 'Monthly Pro Pass',
          tagline: 'Ultra-low barrier micro-pass for fast job hunting over the next 30 days.',
          priceInr: 50,
          originalPriceInr: 99,
          billingPeriodLabel: 'per month',
          durationInMonths: 1,
          samplesLimit: 999999,
          features: [
            'Unlimited AI Tailorings for 30 Days',
            'Zero Sample Quotas / No Daily Limits',
            'Instant Word (.docx) & Clean PDF Exports',
            'Custom Scoring Weight Profiles',
            'Activity History & Application Tracking',
            'Dedicated Email Support',
          ],
          highlightText: 'Special price of ₹50 / month',
          ctaLabel: 'Upgrade to Monthly',
        },
        {
          id: 'half_yearly',
          name: 'Half-Yearly Pass (6 Months)',
          tagline: 'Continuous support through active interview cycles and career transitions.',
          priceInr: 150,
          originalPriceInr: 299,
          billingPeriodLabel: 'for 6 months (₹25/mo)',
          durationInMonths: 6,
          samplesLimit: 999999,
          isPopular: true,
          badge: 'Most Popular',
          features: [
            'Unlimited Tailorings for 6 Full Months',
            'Deep ATS Keyword Density & Health Audits',
            'Priority AI Model Processing',
            'Certification & Credential Verification Badges',
            'Cover Letter & Executive Summary Studio',
            'Save 50% compared to regular renewals',
          ],
          highlightText: 'Ideal for multi-round interview prep',
          ctaLabel: 'Get 6-Month Pass',
        },
        {
          id: 'yearly',
          name: 'Yearly Annual Pro',
          tagline: 'Full year of unlimited tailoring, ATS audits, and ongoing career progression.',
          priceInr: 250,
          originalPriceInr: 599,
          billingPeriodLabel: 'per year (₹20.8/mo)',
          durationInMonths: 12,
          samplesLimit: 999999,
          isBestValue: true,
          badge: 'Best Value',
          features: [
            'Unlimited Tailorings for 365 Days',
            'All AI Model Upgrades & Next-Gen Engines',
            'Custom ATS Weight Profiles & Scoring Presets',
            'Unlimited Word (.docx) & PDF Downloads',
            'Interview Question Prep & Actionable Prompts',
            'Highest value for active career builders',
          ],
          highlightText: 'Save 58% + Complete 1-Year Coverage',
          ctaLabel: 'Get Yearly Plan',
        },
        {
          id: 'lifetime',
          name: 'Lifetime Founder Pass',
          tagline: 'Pay once, unlock unlimited AI tailoring forever with no recurring bills ever.',
          priceInr: 500,
          originalPriceInr: 1499,
          billingPeriodLabel: 'One-Time Payment',
          durationInMonths: undefined,
          samplesLimit: 999999,
          badge: 'Founder Edition',
          features: [
            'Unlimited AI Tailorings For Life',
            'Zero Subscription Fees — Pay Once Forever',
            'VIP Priority AI Processing Queue',
            'All Future ATS & Feature Updates Included',
            'Unlimited Application Records & Export Vault',
            'Founder Distinction Badge in User Profile',
          ],
          highlightText: 'One-time ₹500 payment. Never pay again.',
          ctaLabel: 'Unlock Lifetime Access',
        },
      ];
    }
  },

  // Get current user's subscription status
  async getStatus(userId?: string): Promise<UserSubscription> {
    try {
      const headers: Record<string, string> = {};
      if (userId) headers['x-user-id'] = userId;
      const res = await fetch('/api/subscription/status', { headers });
      if (!res.ok) throw new Error('Failed to fetch subscription status');
      return await res.json();
    } catch (err) {
      console.error('getStatus error:', err);
      return {
        userId: userId || 'usr_demo_1',
        planId: 'free',
        planName: 'Free Starter',
        status: 'active',
        samplesUsed: 2,
        samplesLimit: 10,
        isUnlimited: false,
        startDate: new Date().toISOString(),
        expiryDate: null,
        autoRenew: false,
        invoices: [],
      };
    }
  },

  // Checkout and activate subscription
  async checkout(
    planId: SubscriptionPlanId,
    paymentMethod: string = 'UPI',
    transactionId?: string,
    userId?: string
  ): Promise<{ success: boolean; subscription: UserSubscription; invoice: SubscriptionInvoice; message: string }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (userId) headers['x-user-id'] = userId;

    const res = await fetch('/api/subscription/checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify({ planId, paymentMethod, transactionId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Checkout failed');
    }

    return await res.json();
  },

  // Cancel auto-renewal
  async cancelAutoRenew(userId?: string): Promise<{ success: boolean; subscription: UserSubscription; message: string }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (userId) headers['x-user-id'] = userId;

    const res = await fetch('/api/subscription/cancel', {
      method: 'POST',
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to cancel auto-renewal');
    }

    return await res.json();
  },

  // Reset sample usage for demo/testing
  async resetCredits(userId?: string): Promise<{ success: boolean; subscription: UserSubscription }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (userId) headers['x-user-id'] = userId;

    const res = await fetch('/api/subscription/reset-credits', {
      method: 'POST',
      headers,
    });

    if (!res.ok) throw new Error('Failed to reset credits');
    return await res.json();
  },
};
