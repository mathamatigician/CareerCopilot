import { GoogleGenAI } from '@google/genai';
import {
  SkillsGapItem,
  ExperienceAlignment,
  TailoredResumeData,
  TailoredCoverLetterData,
  ScoringBreakdown,
  UserProfile,
  CertificationItem,
} from '../src/types';
import { defaultScoringEngine, ScoringProfileName, SCORING_PRESETS } from './scoringEngine';
import { performHeuristicTailoring, extractJobMetadata } from './fallbackAnalyzer';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
    });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
    return null;
  }
}

export interface InputPayload {
  resume: {
    type: 'pdf' | 'text' | 'image';
    content: string; // raw text or base64 dataUrl (e.g. data:image/png;base64,... or data:application/pdf;base64,...)
    fileName?: string;
  };
  job: {
    type: 'url' | 'text' | 'linkedin' | 'image';
    content: string; // raw text, url string, or base64 image dataUrl
    title?: string;
    company?: string;
  };
  userProfile?: UserProfile;
  selectedCertifications?: CertificationItem[];
  scoringProfile?: ScoringProfileName;
}

export interface AnalysisAndTailoringOutput {
  jobMetadata: {
    title: string;
    company: string;
    location: string;
    jobType: string;
    salaryRange?: string;
    summary: string;
  };
  parsedResumeSummary: string;
  skillsGap: SkillsGapItem[];
  experienceAlignments: ExperienceAlignment[];
  scoringResult: ScoringBreakdown;
  tailoredResume: TailoredResumeData;
  tailoredCoverLetter: TailoredCoverLetterData;
}

/**
 * Fetch and extract text from a job URL
 */
export async function extractJobFromUrl(url: string): Promise<{ title: string; company: string; description: string }> {
  const ai = getAiClient();

  let fetchedText = '';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timeout);
    if (resp.ok) {
      const html = await resp.text();
      // Strip script and style tags to keep body text clean
      fetchedText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .substring(0, 15000);
    }
  } catch (err) {
    console.warn('Direct URL fetch failed, falling back to heuristic parsing:', err);
  }

  if (ai) {
    const prompt = `You are an expert technical recruiter and job parser. 
Job URL: ${url}
${fetchedText ? `HTML Content snippet: ${fetchedText.substring(0, 8000)}` : 'Could not fetch raw HTML directly.'}

Please extract and return a JSON object with:
1. "title": The exact Job Title
2. "company": The Company Name
3. "description": A clean, comprehensive Markdown summary of the Job Description, Key Responsibilities, Required Qualifications, Tech Stack, and Benefits.

Respond ONLY with valid JSON in the format:
{
  "title": "Senior Frontend Engineer",
  "company": "TechCorp",
  "description": "..."
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      return JSON.parse(text);
    } catch (err) {
      console.warn('Gemini URL extraction failed, falling back to heuristics:', err);
    }
  }

  // Heuristic extraction fallback
  const meta = extractJobMetadata(fetchedText || url);
  return {
    title: meta.title,
    company: meta.company,
    description: fetchedText
      ? `## Position: ${meta.title}\n**Company**: ${meta.company}\n**Location**: ${meta.location}\n\n### Job Description & Summary\n${fetchedText.substring(0, 3000)}...`
      : `Job Listing extracted from ${url}. Positions candidate for ${meta.title} role.`,
  };
}

/**
 * Main AI Engine: Parses inputs, performs skills gap analysis, matches experience, calculates modular scores,
 * and synthesizes tailored resume + tailored cover letter.
 */
export async function analyzeAndTailorApplication(payload: InputPayload): Promise<AnalysisAndTailoringOutput> {
  const ai = getAiClient();

  // If Gemini client is not initialized (no API key configured), use heuristic tailoring engine
  if (!ai) {
    console.info('No GEMINI_API_KEY detected. Utilizing heuristic ATS & tailoring engine.');
    const resumeText =
      payload.resume.type === 'text'
        ? payload.resume.content
        : payload.userProfile?.defaultResumeText || 'Candidate starter resume';
    const jobText = payload.job.content;

    return performHeuristicTailoring({
      resumeText,
      jobText,
      userProfile: payload.userProfile,
      scoringProfile: payload.scoringProfile,
      jobTitle: payload.job.title,
      jobCompany: payload.job.company,
      selectedCertifications: payload.selectedCertifications,
    });
  }

  const contentsParts: any[] = [];

  // Helper to extract base64 data and mimeType
  const parseDataUrl = (dataUrl: string, defaultMime = 'image/png') => {
    if (!dataUrl) return null;
    if (dataUrl.startsWith('data:')) {
      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        return { mimeType: matches[1], data: matches[2] };
      }
    }
    return { mimeType: defaultMime, data: dataUrl };
  };

  // Add Resume input
  if (payload.resume.type === 'image') {
    const parsed = parseDataUrl(payload.resume.content, 'image/png');
    if (parsed) {
      contentsParts.push({
        inlineData: {
          mimeType: parsed.mimeType,
          data: parsed.data,
        },
      });
      contentsParts.push({ text: 'The image above is the candidate\'s starter resume document/screenshot.' });
    }
  } else if (payload.resume.type === 'pdf') {
    const parsed = parseDataUrl(payload.resume.content, 'application/pdf');
    if (parsed) {
      contentsParts.push({
        inlineData: {
          mimeType: parsed.mimeType || 'application/pdf',
          data: parsed.data,
        },
      });
      contentsParts.push({ text: 'The PDF document above contains the candidate\'s starter resume.' });
    }
  } else {
    contentsParts.push({
      text: `CANDIDATE STARTER RESUME (TEXT):\n${payload.resume.content}`,
    });
  }

  // Add Job Description input
  if (payload.job.type === 'image') {
    const parsed = parseDataUrl(payload.job.content, 'image/png');
    if (parsed) {
      contentsParts.push({
        inlineData: {
          mimeType: parsed.mimeType,
          data: parsed.data,
        },
      });
      contentsParts.push({ text: 'The image above is the target job listing / LinkedIn post screenshot.' });
    }
  } else if (payload.job.type === 'url') {
    contentsParts.push({
      text: `TARGET JOB LISTING URL & METADATA:\nURL: ${payload.job.content}\nTitle: ${payload.job.title || 'To Be Extracted'}\nCompany: ${payload.job.company || 'To Be Extracted'}`,
    });
  } else {
    contentsParts.push({
      text: `TARGET JOB DESCRIPTION (TEXT / LINKEDIN POST):\nTitle: ${payload.job.title || ''}\nCompany: ${payload.job.company || ''}\nContent:\n${payload.job.content}`,
    });
  }

  // Add User Profile context if provided
  if (payload.userProfile) {
    contentsParts.push({
      text: `CANDIDATE PROFILE CONTEXT:
Name: ${payload.userProfile.fullName}
Email: ${payload.userProfile.email}
Phone: ${payload.userProfile.phone || '(555) 019-2834'}
Location: ${payload.userProfile.location || 'United States'}
Headline: ${payload.userProfile.headline || ''}
Years of Experience: ${payload.userProfile.yearsOfExperience}
Known Skills: ${payload.userProfile.skills?.join(', ') || ''}
LinkedIn: ${payload.userProfile.linkedinUrl || ''}
Portfolio: ${payload.userProfile.githubOrPortfolioUrl || ''}`,
    });
  }

  // Add User Selected Certifications explicitly so they are reflected in the tailored resume
  const activeCerts =
    payload.selectedCertifications ||
    payload.userProfile?.certifications?.filter((c) => c.selectedForResume !== false) ||
    [];

  if (activeCerts.length > 0) {
    const certDetails = activeCerts
      .map(
        (c) =>
          `• ${c.name} (Issued by: ${c.issuer}${c.issueDate ? `, Year: ${c.issueDate}` : ''}${c.credentialId ? `, ID: ${c.credentialId}` : ''}${c.type ? `, Verified Proof Type: ${c.type}` : ''})`
      )
      .join('\n');
    contentsParts.push({
      text: `CANDIDATE CERTIFICATIONS & CREDENTIALS (Selected by user to be reflected on the tailored resume):\n${certDetails}\nIMPORTANT: Please ensure these exact certifications are reflected in the "certifications" array of the tailored resume.`,
    });
  }

  const systemInstructions = `You are a world-class Executive Career Strategist, ATS Optimization Specialist, and Technical Recruiter.
Analyze the candidate's starter resume against the target job listing.

Perform the following 4 core tasks:
1. Extract Job Metadata & Overview (Job Title, Company Name, Location, Job Type, Salary if mentioned, concise summary).
2. Skills Gap Analysis:
   - Identify direct MATCHED skills (technical, domain, soft skills).
   - Identify MISSING REQUIRED must-have skills (flagged as missing_required, importance: high).
   - Identify MISSING BONUS / nice-to-have skills (category: missing_bonus).
   - Identify PARTIAL skills (category: partial).
   - Provide concrete, actionable recommendations for how the candidate can position adjacent or rapid-learning experience to bridge each gap.
3. Work Experience Alignment:
   - Compare each core job requirement against candidate's past work experience.
   - Assign candidateMatchScore (0 to 100).
   - Provide clear gap analysis and actionable advice.
   - Provide a "tailoredBulletSuggestion" using the Google X-Y-Z formula ("Accomplished [X] as measured by [Y], by doing [Z]") with strong action verbs and metrics.
4. Synthesize Tailored Resume & Tailored Cover Letter:
   - Tailored Resume: Professional, high-impact ATS-friendly resume data structure. Align candidate summary, highlight core competencies with matched keywords, polish work experience bullet points to mirror target role requirements without fabricating non-existent credentials, format education, certs, and projects.
   - Tailored Cover Letter: Write a persuasive, authentic, role-specific cover letter addressed to the hiring team. Emphasize why the candidate is a standout fit, highlight 2-3 specific matching accomplishments, and articulate genuine motivation for joining this specific company.

You MUST respond strictly with valid JSON conforming to this schema:
{
  "jobMetadata": {
    "title": "string",
    "company": "string",
    "location": "string",
    "jobType": "string",
    "salaryRange": "string or empty",
    "summary": "string"
  },
  "parsedResumeSummary": "string describing candidate background",
  "skillsGap": [
    {
      "skill": "string",
      "category": "matched" | "missing_required" | "missing_bonus" | "partial",
      "importance": "high" | "medium" | "low",
      "recommendation": "string",
      "contextInJob": "string",
      "contextInResume": "string"
    }
  ],
  "experienceAlignments": [
    {
      "jobRequirement": "string",
      "candidateMatchScore": number,
      "candidateExperience": "string",
      "gapAnalysis": "string",
      "actionableAdvice": "string",
      "tailoredBulletSuggestion": "string"
    }
  ],
  "aiSummaryNotes": "string",
  "tailoredResume": {
    "fullName": "string",
    "headline": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "portfolio": "string",
    "summary": "string",
    "coreCompetencies": ["string"],
    "matchedKeywords": ["string"],
    "experience": [
      {
        "role": "string",
        "company": "string",
        "period": "string",
        "location": "string",
        "accomplishments": ["string"]
      }
    ],
    "education": [
      {
        "degree": "string",
        "school": "string",
        "year": "string",
        "details": "string"
      }
    ],
    "certifications": ["string"],
    "projects": [
      {
        "name": "string",
        "description": "string",
        "techStack": ["string"],
        "link": "string"
      }
    ]
  },
  "tailoredCoverLetter": {
    "candidateName": "string",
    "candidateContact": "string",
    "date": "string",
    "hiringManager": "string",
    "companyName": "string",
    "companyAddress": "string",
    "jobTitle": "string",
    "salutation": "string",
    "openingParagraph": "string",
    "bodyParagraphs": ["string", "string"],
    "closingParagraph": "string",
    "signOff": "string",
    "fullLetterText": "string"
  }
}`;

  contentsParts.push({ text: 'Generate the complete analysis and tailoring JSON object now.' });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: contentsParts,
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: 'application/json',
      },
    });

    const rawJson = response.text || '{}';
    const parsedData = JSON.parse(rawJson);

    // Run modular resume scoring engine on the extracted data
    const scoringProfile = payload.scoringProfile || 'standard';
    const weights = SCORING_PRESETS[scoringProfile] || SCORING_PRESETS.standard;

    const scoringResult = defaultScoringEngine.calculateCompositeScore({
      skillsGap: parsedData.skillsGap || [],
      experienceAlignments: parsedData.experienceAlignments || [],
      tailoredResume: parsedData.tailoredResume,
      matchedKeywords: parsedData.tailoredResume?.matchedKeywords,
      weights,
      customSummary: parsedData.aiSummaryNotes,
    });

    return {
      jobMetadata: parsedData.jobMetadata || {
        title: payload.job.title || 'Software Professional',
        company: payload.job.company || 'Target Organization',
        location: 'Remote / Hybrid',
        jobType: 'Full-time',
        summary: 'Target position analyzed.',
      },
      parsedResumeSummary: parsedData.parsedResumeSummary || 'Starter resume parsed successfully.',
      skillsGap: parsedData.skillsGap || [],
      experienceAlignments: parsedData.experienceAlignments || [],
      scoringResult,
      tailoredResume: {
        ...(parsedData.tailoredResume || {
          fullName: payload.userProfile?.fullName || 'Candidate Name',
          headline: 'Professional',
          email: payload.userProfile?.email || 'candidate@example.com',
          phone: payload.userProfile?.phone || '(555) 000-0000',
          location: payload.userProfile?.location || 'United States',
          linkedin: '',
          summary: 'Experienced professional ready for new challenges.',
          coreCompetencies: [],
          matchedKeywords: [],
          experience: [],
          education: [],
        }),
        certifications:
          parsedData.tailoredResume?.certifications && parsedData.tailoredResume.certifications.length > 0
            ? parsedData.tailoredResume.certifications
            : activeCerts.map((c) => `${c.name} (${c.issuer}${c.issueDate ? `, ${c.issueDate}` : ''})`),
        certificationItems: activeCerts,
      },
      tailoredCoverLetter: parsedData.tailoredCoverLetter || {
        candidateName: payload.userProfile?.fullName || 'Candidate Name',
        candidateContact: 'Contact Info',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        hiringManager: 'Hiring Team',
        companyName: parsedData.jobMetadata?.company || 'The Hiring Organization',
        jobTitle: parsedData.jobMetadata?.title || 'Target Role',
        salutation: 'Dear Hiring Manager,',
        openingParagraph: 'I am excited to apply for this opportunity.',
        bodyParagraphs: ['My experience aligns closely with your team needs.'],
        closingParagraph: 'Thank you for your consideration.',
        signOff: 'Sincerely,',
        fullLetterText: 'Cover letter placeholder.',
      },
    };
  } catch (err) {
    console.warn('Gemini API call encountered an error. Falling back to heuristic ATS engine:', err);

    // Fallback gracefully so the user never encounters a 403 or break in workflow
    const resumeText =
      payload.resume.type === 'text'
        ? payload.resume.content
        : payload.userProfile?.defaultResumeText || 'Candidate starter resume';
    const jobText = payload.job.content;

    return performHeuristicTailoring({
      resumeText,
      jobText,
      userProfile: payload.userProfile,
      scoringProfile: payload.scoringProfile,
      jobTitle: payload.job.title,
      jobCompany: payload.job.company,
      selectedCertifications: payload.selectedCertifications,
    });
  }
}
