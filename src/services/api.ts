import {
  User,
  UserProfile,
  CertificationItem,
  JobApplicationRecord,
  ActivityLog,
  DashboardStats,
  ScoringBreakdown,
  TailoredResumeData,
  TailoredCoverLetterData,
  SkillsGapItem,
  ExperienceAlignment,
  ScoringWeightsConfig,
} from '../types';

const AUTH_USER_KEY = 'tailorfit_auth_user';
const AUTH_TOKEN_KEY = 'tailorfit_auth_token';

class ApiService {
  private getHeaders(): HeadersInit {
    const user = this.getCurrentUser();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (user?.id) {
      headers['x-user-id'] = user.id;
    }
    return headers;
  }

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return {
      id: 'usr_demo_1',
      username: 'jobseeker_alex',
      email: 'alex.morgan@example.com',
      name: 'Alex Morgan',
      createdAt: '2026-08-20T10:00:00.000Z',
    };
  }

  setCurrentUser(user: User | null, token?: string): void {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }

  async signup(data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    name?: string;
  }): Promise<{ user: User; profile: UserProfile; token: string }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Signup failed');
    this.setCurrentUser(result.user, result.token);
    return result;
  }

  async signin(data: {
    username: string;
    password: string;
  }): Promise<{ user: User; profile: UserProfile; token: string }> {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Sign in failed');
    this.setCurrentUser(result.user, result.token);
    return result;
  }

  async getMe(): Promise<{ user: User; profile: UserProfile }> {
    const res = await fetch('/api/auth/me', {
      headers: this.getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch user');
    return result;
  }

  async getProfile(): Promise<UserProfile> {
    const res = await fetch('/api/profile', {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  }

  async parseJobUrl(url: string): Promise<{ title: string; company: string; description: string }> {
    const res = await fetch('/api/parse-url', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ url }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to parse URL');
    return result;
  }

  async analyzeAndTailor(payload: {
    resume: { type: 'pdf' | 'text' | 'image'; content: string; fileName?: string };
    job: { type: 'url' | 'text' | 'linkedin' | 'image'; content: string; title?: string; company?: string };
    selectedCertifications?: CertificationItem[];
    scoringProfile?: string;
    saveImmediately?: boolean;
  }): Promise<{
    jobMetadata: { title: string; company: string; location: string; jobType: string; salaryRange?: string; summary: string };
    parsedResumeSummary: string;
    skillsGap: SkillsGapItem[];
    experienceAlignments: ExperienceAlignment[];
    scoringResult: ScoringBreakdown;
    tailoredResume: TailoredResumeData;
    tailoredCoverLetter: TailoredCoverLetterData;
    savedRecord?: JobApplicationRecord;
  }> {
    const res = await fetch('/api/analyze-and-tailor', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Analysis failed');
    return result;
  }

  async recomputeScoring(payload: {
    skillsGap: SkillsGapItem[];
    experienceAlignments: ExperienceAlignment[];
    tailoredResume?: TailoredResumeData;
    weights?: Partial<ScoringWeightsConfig>;
    customSummary?: string;
  }): Promise<ScoringBreakdown> {
    const res = await fetch('/api/scoring/recompute', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Recomputing score failed');
    return result;
  }

  async getApplications(): Promise<JobApplicationRecord[]> {
    const res = await fetch('/api/applications', {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  }

  async getApplicationById(id: string): Promise<JobApplicationRecord> {
    const res = await fetch(`/api/applications/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch application');
    return res.json();
  }

  async saveApplication(appData: Partial<JobApplicationRecord>): Promise<JobApplicationRecord> {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(appData),
    });
    if (!res.ok) throw new Error('Failed to save application');
    return res.json();
  }

  async updateApplication(id: string, updates: Partial<JobApplicationRecord>): Promise<JobApplicationRecord> {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update application');
    return res.json();
  }

  async deleteApplication(id: string): Promise<void> {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete application');
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('/api/dashboard/stats', {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  }

  async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
    const res = await fetch(`/api/activity-logs?limit=${limit}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch activity logs');
    return res.json();
  }

  async downloadDocx(type: 'resume' | 'cover_letter', data: any, fileName?: string): Promise<void> {
    const res = await fetch('/api/export/docx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data, fileName }),
    });
    if (!res.ok) throw new Error('Failed to download DOCX');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || (type === 'resume' ? 'Tailored_Resume.docx' : 'Tailored_Cover_Letter.docx');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export const api = new ApiService();
