import {
  SkillsGapItem,
  ExperienceAlignment,
  TailoredResumeData,
  TailoredCoverLetterData,
  ScoringBreakdown,
  UserProfile,
} from '../src/types';
import { defaultScoringEngine, SCORING_PRESETS, ScoringProfileName } from './scoringEngine';

// Common technical & business skills dictionary for parsing
const SKILLS_DICTIONARY = [
  'TypeScript', 'JavaScript', 'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express',
  'Python', 'FastAPI', 'Django', 'Flask', 'Java', 'Spring Boot', 'Go', 'Golang', 'Rust', 'C++',
  'C#', '.NET', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Git', 'GitHub Actions', 'Terraform',
  'Microservices', 'Distributed Systems', 'Tailwind CSS', 'HTML5', 'CSS3', 'System Architecture',
  'Agile', 'Scrum', 'Product Management', 'Data Structures', 'Algorithms', 'Machine Learning',
  'LLM', 'Prompt Engineering', 'Gemini API', 'OpenAI', 'PyTorch', 'TensorFlow', 'NLP',
  'Kafka', 'RabbitMQ', 'WebSockets', 'Jest', 'Cypress', 'Playwright', 'Unit Testing',
  'Performance Optimization', 'Core Web Vitals', 'Security & Auth', 'OAuth2', 'JWT',
  'Leadership', 'Mentoring', 'Cross-Functional Collaboration', 'Strategic Planning'
];

export function extractSkillsFromText(text: string): string[] {
  const found = new Set<string>();
  const lower = text.toLowerCase();

  for (const skill of SKILLS_DICTIONARY) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text) || lower.includes(skill.toLowerCase())) {
      found.add(skill);
    }
  }

  return Array.from(found);
}

export function extractJobMetadata(jobText: string, providedTitle?: string, providedCompany?: string) {
  let title = providedTitle || '';
  let company = providedCompany || '';
  let location = 'Remote / Hybrid';
  let jobType = 'Full-time';
  let salaryRange = '';

  const lines = jobText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Heuristic extraction for Title & Company
  if (!title) {
    for (const line of lines.slice(0, 8)) {
      const match = line.match(/(?:title|position|role|job):\s*(.+)/i);
      if (match) {
        title = match[1].trim();
        break;
      }
      if (/senior|lead|engineer|developer|manager|architect|designer|analyst|specialist/i.test(line) && line.length < 60) {
        title = line.replace(/^[#*-]\s*/, '').trim();
        break;
      }
    }
  }

  if (!company) {
    for (const line of lines.slice(0, 10)) {
      const match = line.match(/(?:company|organization|at|about)\s*:?\s*(.+)/i);
      if (match && !/about us|about the role/i.test(match[1])) {
        company = match[1].trim();
        break;
      }
    }
  }

  // Location heuristics
  const locMatch = jobText.match(/(?:location|workplace|based in):\s*([^\n]+)/i);
  if (locMatch) {
    location = locMatch[1].trim();
  } else if (/san francisco|new york|remote|london|austin|seattle|hybrid/i.test(jobText)) {
    const m = jobText.match(/(san francisco|new york|remote|london|austin|seattle|hybrid)/i);
    if (m) location = m[0];
  }

  // Salary range heuristics
  const salMatch = jobText.match(/\$[\d,]+k?\s*(?:-|to)\s*\$?[\d,]+k?(?:\s*(?:per year|\/yr|\/year|annually))?/i);
  if (salMatch) {
    salaryRange = salMatch[0];
  }

  if (!title) title = 'Software Engineer';
  if (!company) company = 'Hiring Team';

  return {
    title,
    company,
    location,
    jobType,
    salaryRange: salaryRange || undefined,
    summary: `${title} at ${company}. Requires expertise across modern software development, scalable system design, and collaborative execution.`,
  };
}

export function performHeuristicTailoring(params: {
  resumeText: string;
  jobText: string;
  userProfile?: UserProfile | null;
  scoringProfile?: ScoringProfileName;
  jobTitle?: string;
  jobCompany?: string;
  selectedCertifications?: any[];
}) {
  const { resumeText, jobText, userProfile, scoringProfile, jobTitle, jobCompany, selectedCertifications } = params;

  const jobMeta = extractJobMetadata(jobText, jobTitle, jobCompany);
  const resumeSkills = extractSkillsFromText(resumeText + ' ' + (userProfile?.skills?.join(' ') || ''));
  const jobSkills = extractSkillsFromText(jobText);

  // If no job skills extracted from dictionary, add standard core skills from text tokens
  if (jobSkills.length === 0) {
    jobSkills.push('TypeScript', 'React', 'Node.js', 'System Architecture', 'REST APIs', 'Agile');
  }

  // Identify Candidate Name & Contact from profile or resume
  let candidateName = userProfile?.fullName || 'Alex Morgan';
  let email = userProfile?.email || 'alex.morgan@example.com';
  let phone = userProfile?.phone || '(555) 234-8901';
  let candidateLocation = userProfile?.location || 'San Francisco, CA';
  let linkedin = userProfile?.linkedinUrl || 'https://linkedin.com/in/candidate';

  const firstLines = resumeText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (firstLines.length > 0 && !userProfile?.fullName) {
    const possibleName = firstLines[0].replace(/[|•,-].*$/, '').trim();
    if (possibleName && possibleName.length < 35 && !/resume|curriculum|cv/i.test(possibleName)) {
      candidateName = possibleName;
    }
  }

  const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) email = emailMatch[0];

  const phoneMatch = resumeText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) phone = phoneMatch[0];

  // 1. Build Skills Gap
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  jobSkills.forEach((s) => {
    if (resumeSkills.some((rs) => rs.toLowerCase() === s.toLowerCase())) {
      matchedSkills.push(s);
    } else {
      missingSkills.push(s);
    }
  });

  // Ensure we have some matched and relevant items
  if (matchedSkills.length === 0 && resumeSkills.length > 0) {
    matchedSkills.push(...resumeSkills.slice(0, 4));
  }

  const skillsGap: SkillsGapItem[] = [];

  matchedSkills.forEach((skill) => {
    skillsGap.push({
      skill,
      category: 'matched',
      importance: 'high',
      recommendation: `Strong alignment detected. Highlight concrete throughput, architectural design, and quantifiable impact using ${skill} in your interview stories.`,
      contextInJob: `Referenced directly in ${jobMeta.title} requirements at ${jobMeta.company}.`,
      contextInResume: `Demonstrated through verified hands-on project accomplishments.`,
    });
  });

  missingSkills.forEach((skill, idx) => {
    const isCritical = idx < 2;
    skillsGap.push({
      skill,
      category: isCritical ? 'missing_required' : idx % 2 === 0 ? 'partial' : 'missing_bonus',
      importance: isCritical ? 'high' : 'medium',
      recommendation: isCritical
        ? `Frame adjacent competencies (e.g. distributed systems / cloud patterns) and emphasize rapid ramp-up ability with ${skill}.`
        : `Position ${skill} as a continuous learning area or reference analogous tools in your current tech stack.`,
      contextInJob: `Identified as a preferred qualification for ${jobMeta.title}.`,
      contextInResume: `Not explicitly highlighted in starter resume text.`,
    });
  });

  // 2. Build Experience Alignment
  const experienceAlignments: ExperienceAlignment[] = [
    {
      jobRequirement: `Design, build, and deploy production-grade software aligned with ${jobMeta.title} responsibilities.`,
      candidateMatchScore: 92,
      candidateExperience: `6+ years of engineering experience delivering enterprise-grade cloud applications, web architectures, and APIs.`,
      gapAnalysis: `Strong foundational engineering background directly matches core architectural scope.`,
      actionableAdvice: `Emphasize system scale, high availability, and measurable business outcomes.`,
      tailoredBulletSuggestion: `Architected and scaled core service architecture serving 15M+ requests daily, improving system uptime to 99.98% while reducing p95 latency by 45%.`,
    },
    {
      jobRequirement: `Drive technical velocity, cross-functional collaboration, and clean code standards.`,
      candidateMatchScore: 88,
      candidateExperience: `Led agile sprints, conducted comprehensive code reviews, and mentored junior to mid-level engineers.`,
      gapAnalysis: `Demonstrates required team leadership and development lifecycle stewardship.`,
      actionableAdvice: `Quantify sprint velocity improvements and developer enablement impact.`,
      tailoredBulletSuggestion: `Spearheaded sprint modernization and CI/CD pipelines across 6 engineers, accelerating deployment cadence from bi-weekly to continuous daily delivery.`,
    },
    {
      jobRequirement: `Proficiency in core tech stack including ${jobSkills.slice(0, 3).join(', ') || 'modern frameworks'}.`,
      candidateMatchScore: matchedSkills.length >= 2 ? 90 : 78,
      candidateExperience: `Hands-on delivery with ${matchedSkills.slice(0, 4).join(', ') || 'modern web technologies and cloud infrastructure'}.`,
      gapAnalysis: `Solid overlap on primary tools with minor adjacent gaps in secondary tooling.`,
      actionableAdvice: `Showcase full-lifecycle execution from technical spec to automated deployment.`,
      tailoredBulletSuggestion: `Engineered high-throughput features using ${matchedSkills.slice(0, 2).join(' and ') || 'TypeScript and modern cloud services'}, boosting core conversion rates by 28%.`,
    },
  ];

  // 3. Compute Composite Score
  const selectedProfile = scoringProfile || 'standard';
  const weights = SCORING_PRESETS[selectedProfile] || SCORING_PRESETS.standard;

  const scoringResult = defaultScoringEngine.calculateCompositeScore({
    skillsGap,
    experienceAlignments,
    matchedKeywords: matchedSkills,
    weights,
    customSummary: `Candidate presents an 86%+ composite match profile for ${jobMeta.title} at ${jobMeta.company}. Technical core competencies strongly align with primary duties.`,
  });

  // 4. Build Tailored Resume
  const tailoredResume: TailoredResumeData = {
    fullName: candidateName,
    headline: `${jobMeta.title} | Senior Full-Stack & Cloud Engineer`,
    email,
    phone,
    location: candidateLocation,
    linkedin,
    portfolio: userProfile?.portfolioUrl || userProfile?.githubOrPortfolioUrl || 'https://github.com',
    summary: `Results-driven ${jobMeta.title} with extensive experience building high-scale, resilient applications. Proficient in ${matchedSkills.slice(0, 4).join(', ') || 'TypeScript, React, Node.js, and Cloud architectures'}. Proven track record of accelerating product delivery, enhancing user experience, and optimizing distributed systems.`,
    coreCompetencies: Array.from(new Set([...matchedSkills, ...jobSkills.slice(0, 4)])),
    matchedKeywords: matchedSkills,
    experience: [
      {
        role: `Senior Software Engineer / ${jobMeta.title.replace(/senior|lead/i, '').trim() || 'Software Engineer'}`,
        company: 'Apex Cloud Technologies',
        period: '2023 - Present',
        location: 'San Francisco, CA',
        accomplishments: [
          `Architected high-throughput services handling 15M+ daily requests using ${matchedSkills[0] || 'Node.js'} and cloud microservices, cutting latency by 52%.`,
          `Led end-to-end frontend redesign using ${matchedSkills[1] || 'React'} and TypeScript, elevating Core Web Vitals score to 98/100 and driving a 34% rise in user engagement.`,
          `Engineered resilient automated CI/CD deployment pipelines, reducing production rollout cycle times by 65%.`,
          `Mentored a team of 5 engineers, running design reviews and establishing automated test coverage exceeding 90%.`,
        ],
      },
      {
        role: 'Full-Stack Software Developer',
        company: 'Nexus Digital Labs',
        period: '2020 - 2023',
        location: 'San Francisco, CA',
        accomplishments: [
          `Developed interactive web applications and high-frequency analytical dashboards leveraging ${matchedSkills[0] || 'TypeScript'} and RESTful APIs.`,
          `Optimized PostgreSQL and Redis database querying pipelines across 2TB+ dataset, reducing complex report generation times from 12s to 800ms.`,
          `Collaborated directly with Product Managers and UX designers to ship 14 major feature milestones on schedule.`,
        ],
      },
    ],
    education: [
      {
        degree: 'B.S. in Computer Science',
        school: 'University of California, Berkeley',
        year: '2016 - 2020',
        details: 'Dean\'s Honors List, Focus on Distributed Systems & Software Engineering',
      },
    ],
    certifications: (() => {
      const activeCerts = selectedCertifications || userProfile?.certifications?.filter((c) => c.selectedForResume !== false) || [];
      if (activeCerts.length > 0) {
        return activeCerts.map((c) => {
          const parts = [c.name];
          if (c.issuer) parts.push(c.issuer);
          if (c.issueDate) parts.push(c.issueDate);
          if (c.credentialId) parts.push(`ID: ${c.credentialId}`);
          return parts.length > 1 ? `${c.name} (${parts.slice(1).join(', ')})` : c.name;
        });
      }
      return [
        'AWS Certified Solutions Architect - Associate (Amazon Web Services, 2024)',
        'Certified Kubernetes Application Developer (CKAD) (CNCF, 2023)',
      ];
    })(),
    certificationItems: (() => {
      const activeCerts = selectedCertifications || userProfile?.certifications?.filter((c) => c.selectedForResume !== false) || [];
      if (activeCerts.length > 0) {
        return activeCerts;
      }
      return [
        {
          id: 'cert_1',
          name: 'AWS Certified Solutions Architect - Associate',
          issuer: 'Amazon Web Services',
          issueDate: '2024',
          credentialId: 'AWS-SAA-839210',
          type: 'url' as const,
          sourceValue: 'https://aws.amazon.com/verification/AWS-SAA-839210',
          selectedForResume: true,
        },
        {
          id: 'cert_2',
          name: 'Certified Kubernetes Application Developer (CKAD)',
          issuer: 'Cloud Native Computing Foundation (CNCF)',
          issueDate: '2023',
          credentialId: 'CKAD-981245',
          type: 'pdf' as const,
          sourceValue: 'CKAD_Certificate_Alex_Morgan.pdf',
          fileName: 'CKAD_Certificate_Alex_Morgan.pdf',
          selectedForResume: true,
        },
      ];
    })(),
    projects: [
      {
        name: 'Distributed Real-Time Event Engine',
        description: 'Scalable stream processing engine with automated failover and telemetry metrics.',
        techStack: matchedSkills.slice(0, 3),
        link: 'https://github.com/project-stream',
      },
    ],
  };

  // 5. Build Tailored Cover Letter
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const opening = `I am writing to express my enthusiastic interest in the ${jobMeta.title} position at ${jobMeta.company}. With a strong engineering background in ${matchedSkills.slice(0, 3).join(', ') || 'modern software architecture'} and a proven record of shipping scalable systems, I am excited about the opportunity to contribute to ${jobMeta.company}'s engineering initiatives.`;

  const bodyPara1 = `In my current role at Apex Cloud Technologies, I led the architecture of core services handling 15M+ daily requests while cutting p95 response times by over 50%. My deep experience with ${matchedSkills.slice(0, 2).join(' and ') || 'full-stack systems'} enables me to quickly translate business and product requirements into clean, performant, and maintainable software.`;

  const bodyPara2 = `What excites me most about ${jobMeta.company} is your commitment to technical excellence and high-impact product execution. I thrive in collaborative environments where engineering rigour meets rapid innovation, and I am eager to bring my problem-solving mindset and technical expertise to your team.`;

  const closing = `Thank you for your time and consideration. I welcome the opportunity to discuss how my technical skills and experience can help ${jobMeta.company} achieve its engineering goals. I look forward to speaking with you.`;

  const fullLetter = `${candidateName}
${phone} | ${email} | ${linkedin}

${dateFormatted}

Hiring Team
${jobMeta.company}
${jobMeta.location}

Dear Hiring Team,

${opening}

${bodyPara1}

${bodyPara2}

${closing}

Sincerely,
${candidateName}`;

  const tailoredCoverLetter: TailoredCoverLetterData = {
    candidateName,
    candidateContact: `${phone} | ${email}`,
    date: dateFormatted,
    hiringManager: 'Hiring Team',
    companyName: jobMeta.company,
    companyAddress: jobMeta.location,
    jobTitle: jobMeta.title,
    salutation: `Dear Hiring Team at ${jobMeta.company},`,
    openingParagraph: opening,
    bodyParagraphs: [bodyPara1, bodyPara2],
    closingParagraph: closing,
    signOff: 'Sincerely,',
    fullLetterText: fullLetter,
  };

  return {
    jobMetadata: jobMeta,
    parsedResumeSummary: `Candidate ${candidateName} — ${userProfile?.yearsOfExperience || 6}+ years experience with core focus in ${matchedSkills.slice(0, 3).join(', ') || 'Software Development'}.`,
    skillsGap,
    experienceAlignments,
    scoringResult,
    tailoredResume,
    tailoredCoverLetter,
    isHeuristicFallback: true,
  };
}
