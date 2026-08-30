export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  type: 'image' | 'url' | 'pdf';
  sourceValue: string; // URL string, base64 data URL, or file name
  fileName?: string;
  fileSize?: string;
  selectedForResume?: boolean;
}

export interface UserProfile {
  id?: string;
  userId: string;
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  headline?: string;
  bio?: string;
  currentRole?: string;
  yearsOfExperience: number;
  targetRoles: string[];
  targetJobTitles?: string[];
  targetSeniority?: string;
  skills: string[];
  certifications?: CertificationItem[];
  linkedinUrl?: string;
  githubOrPortfolioUrl?: string;
  portfolioUrl?: string;
  preferredJobTypes?: string[];
  defaultResumeText?: string;
  updatedAt: string;
}

export interface SkillsGapItem {
  skill: string;
  category: 'matched' | 'missing_required' | 'missing_bonus' | 'partial';
  importance: 'high' | 'medium' | 'low';
  recommendation: string;
  contextInJob?: string;
  contextInResume?: string;
}

export interface ExperienceAlignment {
  jobRequirement: string;
  candidateMatchScore: number; // 0 - 100
  candidateExperience: string;
  gapAnalysis: string;
  actionableAdvice: string;
  tailoredBulletSuggestion: string;
}

export interface ScoringWeightsConfig {
  skillsWeight: number; // e.g. 35%
  experienceWeight: number; // e.g. 30%
  keywordsAtsWeight: number; // e.g. 15%
  educationCertWeight: number; // e.g. 10%
  impactMetricsWeight: number; // e.g. 10%
}

export interface ScoringBreakdown {
  overallScore: number; // 0 - 100
  atsHealthScore: number; // 0 - 100
  skillsScore: number;
  experienceScore: number;
  keywordsScore: number;
  impactScore: number;
  educationScore: number;
  summary: string;
  strengths: string[];
  criticalGaps: string[];
  interviewTalkingPoints: string[];
  recommendedActionPlan: string[];
}

export interface WorkExperienceItem {
  role: string;
  company: string;
  period: string;
  location: string;
  accomplishments: string[];
}

export interface EducationItem {
  degree: string;
  school: string;
  year: string;
  details?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  techStack: string[];
  link?: string;
}

export interface TailoredResumeData {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio?: string;
  summary: string;
  coreCompetencies: string[];
  matchedKeywords: string[];
  experience: WorkExperienceItem[];
  education: EducationItem[];
  certifications?: string[];
  certificationItems?: CertificationItem[];
  projects?: ProjectItem[];
}

export interface TailoredCoverLetterData {
  candidateName: string;
  candidateContact: string;
  date: string;
  hiringManager: string;
  companyName: string;
  companyAddress?: string;
  jobTitle: string;
  salutation: string;
  openingParagraph: string;
  bodyParagraphs: string[];
  closingParagraph: string;
  signOff: string;
  fullLetterText: string;
}

export type ApplicationStatus = 'tailored' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'archived';

export interface JobApplicationRecord {
  id: string;
  userId: string;
  jobTitle: string;
  companyName: string;
  jobLocation?: string;
  jobUrl?: string;
  jobType?: string;
  salaryRange?: string;
  rawJobDescription: string;
  rawResumeInputSummary: string;
  resumeInputType: 'pdf' | 'text' | 'image';
  jobInputType: 'url' | 'text' | 'linkedin' | 'image';
  scoringResult: ScoringBreakdown;
  scoringBreakdown?: ScoringBreakdown;
  skillsGap: SkillsGapItem[];
  experienceAlignments: ExperienceAlignment[];
  tailoredResume: TailoredResumeData;
  tailoredCoverLetter: TailoredCoverLetterData;
  status: ApplicationStatus;
  notes?: string;
  interviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  actionType?: string;
  details: string;
  description?: string;
  timestamp: string;
  applicationId?: string;
  metadata?: Record<string, any>;
}

export interface DashboardStats {
  totalApplications: number;
  averageScore?: number;
  averageMatchScore: number;
  statusCounts: Record<ApplicationStatus, number>;
  byStatus?: Record<string, number>;
  topSkillsIdentified: { skill: string; count: number }[];
  recentApplications: JobApplicationRecord[];
  activityLogs: ActivityLog[];
}

export type QuoteTopic =
  | 'resilience'
  | 'action_momentum'
  | 'purpose_meaning'
  | 'confidence_worth'
  | 'calm_peace'
  | 'career_growth'
  | 'stoic_wisdom';

export interface MotivationalQuote {
  id: string;
  text: string;
  author: string;
  topic: QuoteTopic;
  categoryLabel: string;
  actionCue: string;
  targetSlot?: 'morning' | 'evening' | 'any';
}

export interface QuoteSettings {
  frequencyPerDay: number; // 1 to 5, default 2 (morning & evening)
  selectedTopics: QuoteTopic[];
  autoRotate: boolean;
  showActionCue: boolean;
  isBannerCollapsed: boolean;
}

export type SubscriptionPlanId = 'free' | 'monthly' | 'half_yearly' | 'yearly' | 'lifetime';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  priceInr: number;
  originalPriceInr?: number;
  billingPeriodLabel: string;
  durationInMonths?: number; // null for lifetime or free
  samplesLimit: number; // 10 for free, 999999 for paid (unlimited)
  isPopular?: boolean;
  isBestValue?: boolean;
  badge?: string;
  features: string[];
  highlightText?: string;
  ctaLabel: string;
}

export interface SubscriptionInvoice {
  id: string;
  userId: string;
  planId: SubscriptionPlanId;
  planName: string;
  amountInr: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  createdAt: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd?: string;
}

export interface UserSubscription {
  userId: string;
  planId: SubscriptionPlanId;
  planName: string;
  status: 'active' | 'trialing' | 'expired' | 'canceled';
  samplesUsed: number;
  samplesLimit: number;
  isUnlimited: boolean;
  startDate: string;
  expiryDate: string | null; // null for lifetime or free
  autoRenew: boolean;
  lastPaymentDate?: string;
  lastPaymentMethod?: string;
  lastTransactionId?: string;
  invoices: SubscriptionInvoice[];
}

