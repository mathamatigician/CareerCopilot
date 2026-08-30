import fs from 'fs';
import path from 'path';
import { User, UserProfile, JobApplicationRecord, ActivityLog, DashboardStats, ApplicationStatus } from '../src/types';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  profiles: Record<string, UserProfile>;
  applications: JobApplicationRecord[];
  activityLogs: ActivityLog[];
}

const DATA_FILE = path.join(process.cwd(), '.data_store.json');

// Initialize initial seed data
const initialDb: DatabaseSchema = {
  users: [
    {
      id: 'usr_demo_1',
      username: 'jobseeker_alex',
      email: 'alex.morgan@example.com',
      name: 'Alex Morgan',
      passwordHash: 'password123',
      createdAt: '2026-08-20T10:00:00.000Z',
    },
  ],
  profiles: {
    usr_demo_1: {
      id: 'prof_demo_1',
      userId: 'usr_demo_1',
      fullName: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      phone: '+1 (555) 234-8901',
      location: 'San Francisco, CA (Open to Remote)',
      headline: 'Senior Full-Stack Engineer & Cloud Solutions Architect',
      bio: 'Results-driven software engineer with 6+ years of experience building high-scale distributed systems, web applications, and AI integrations.',
      currentRole: 'Senior Software Engineer',
      yearsOfExperience: 6,
      targetRoles: ['Senior Full-Stack Engineer', 'Lead Frontend Engineer', 'Staff Software Engineer', 'Tech Lead'],
      skills: ['TypeScript', 'React', 'Node.js', 'Express', 'Python', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'TailwindCSS', 'GraphQL', 'CI/CD'],
      certifications: [
        {
          id: 'cert_1',
          name: 'AWS Certified Solutions Architect - Associate',
          issuer: 'Amazon Web Services',
          issueDate: '2024',
          credentialId: 'AWS-SAA-839210',
          type: 'url',
          sourceValue: 'https://aws.amazon.com/verification/AWS-SAA-839210',
          selectedForResume: true,
        },
        {
          id: 'cert_2',
          name: 'Certified Kubernetes Application Developer (CKAD)',
          issuer: 'Cloud Native Computing Foundation (CNCF)',
          issueDate: '2023',
          credentialId: 'CKAD-981245',
          type: 'pdf',
          sourceValue: 'CKAD_Certificate_Alex_Morgan.pdf',
          fileName: 'CKAD_Certificate_Alex_Morgan.pdf',
          fileSize: '1.2 MB',
          selectedForResume: true,
        },
        {
          id: 'cert_3',
          name: 'Google Cloud Professional Cloud Architect',
          issuer: 'Google Cloud',
          issueDate: '2023',
          credentialId: 'GCP-PCA-442190',
          type: 'image',
          sourceValue: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
          fileName: 'Google_Cloud_Architect_Badge.png',
          fileSize: '480 KB',
          selectedForResume: false,
        },
      ],
      linkedinUrl: 'https://linkedin.com/in/alex-morgan-dev',
      githubOrPortfolioUrl: 'https://github.com/alexmorgan-code',
      preferredJobTypes: ['Full-Time', 'Remote', 'Hybrid'],
      defaultResumeText: `Alex Morgan
San Francisco, CA | (555) 234-8901 | alex.morgan@example.com | linkedin.com/in/alex-morgan-dev | github.com/alexmorgan-code

SUMMARY
Senior Full-Stack Software Engineer with 6+ years of experience specializing in scalable TypeScript, React, Python, and cloud infrastructure. Proven track record of boosting user engagement by 40% and cutting latency by 65%.

EXPERIENCE
Senior Software Engineer | Apex Cloud Technologies (2023 - Present)
- Architected and deployed microservices architecture handling 15M+ daily requests using Node.js, Express, and Redis.
- Led frontend redesign in React and TypeScript, improving Core Web Vitals and lowering page load time by 48%.
- Mentored a squad of 5 junior and mid-level engineers, running code reviews and agile sprints.

Full-Stack Developer | Nexus Labs (2020 - 2023)
- Built interactive analytics dashboards with React, TailwindCSS, and Python FastAPI backend.
- Designed MongoDB schemas and optimized aggregation pipelines for 2TB+ dataset.
- Implemented CI/CD pipelines on GitHub Actions reducing deployment cycles by 35%.

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2016 - 2020)

SKILLS
Languages: TypeScript, JavaScript, Python, SQL, HTML5/CSS3
Frameworks: React, Next.js, Node.js, Express, FastAPI, TailwindCSS
Databases & Cloud: PostgreSQL, MongoDB, Redis, AWS (S3, ECS, Lambda), Docker`,
      updatedAt: '2026-08-25T14:30:00.000Z',
    },
  },
  applications: [
    {
      id: 'app_sample_1',
      userId: 'usr_demo_1',
      jobTitle: 'Senior Full-Stack Engineer (AI Applications)',
      companyName: 'Starlight Dynamics',
      jobLocation: 'San Francisco, CA (Remote)',
      jobUrl: 'https://careers.starlight.example/job/senior-fs-ai',
      jobType: 'Full-time',
      salaryRange: '$165,000 - $195,000',
      rawJobDescription: `About the Role:
Starlight Dynamics is seeking a Senior Full-Stack Engineer to build next-generation AI-powered products. You will build user-facing experiences with React, TypeScript, and high-performance backends with Node.js/Python.

Requirements:
- 5+ years of software engineering experience.
- Strong proficiency in modern React, TypeScript, and state management.
- Backend proficiency with Node.js or Python (FastAPI/Express).
- Experience working with LLMs/AI APIs (Gemini/OpenAI) and streaming data.
- Familiarity with cloud databases (MongoDB/PostgreSQL) and containerization (Docker).
- Excellent communication and collaboration skills.`,
      rawResumeInputSummary: 'Alex Morgan Starter Resume (6 yrs exp, TS/React/Node)',
      resumeInputType: 'text',
      jobInputType: 'text',
      status: 'interviewing',
      notes: 'Initial technical screen completed on Aug 27. Hiring manager interview scheduled for next Tuesday.',
      createdAt: '2026-08-26T09:15:00.000Z',
      updatedAt: '2026-08-28T16:00:00.000Z',
      scoringResult: {
        overallScore: 92,
        atsHealthScore: 95,
        skillsScore: 94,
        experienceScore: 90,
        keywordsScore: 92,
        impactScore: 88,
        educationScore: 95,
        summary: 'Exceptional match! Candidate exceeds the 5-year experience requirement with strong TypeScript/React/Node foundation and relevant cloud architecture background.',
        strengths: [
          'Exceeds minimum experience threshold (6 yrs vs 5 req)',
          'Strong full-stack synergy across React, TypeScript, Node.js, and Python',
          'Demonstrated microservices & database performance tuning track record',
        ],
        criticalGaps: [
          'Direct LLM API / Prompt engineering experience not heavily emphasized in original bullets',
        ],
        interviewTalkingPoints: [
          'Highlight how your API latency reduction experience translates to streaming LLM responses with minimal UI jitter.',
          'Emphasize your full-stack capability bridging React client state with Python/FastAPI microservices.',
        ],
        recommendedActionPlan: [
          'Position AI / LLM orchestration projects front and center in the resume summary.',
          'Highlight metrics around latency reduction and high-concurrency architectures.',
        ],
      },
      skillsGap: [
        {
          skill: 'TypeScript / JavaScript',
          category: 'matched',
          importance: 'high',
          recommendation: 'Emphasize advanced patterns and type-safe backend integrations.',
          contextInJob: 'Core requirement for modern web applications.',
          contextInResume: 'Extensively used across Apex Cloud & Nexus Labs.',
        },
        {
          skill: 'React & Frontend Architecture',
          category: 'matched',
          importance: 'high',
          recommendation: 'Highlight Core Web Vitals optimization and state streaming.',
          contextInJob: 'Build user-facing experiences with React.',
          contextInResume: 'Led frontend redesign lowering page load time by 48%.',
        },
        {
          skill: 'LLM & AI API Integrations',
          category: 'partial',
          importance: 'high',
          recommendation: 'Explicitly tailor summary to spotlight AI API endpoints, streaming responses, and prompt engineering.',
          contextInJob: 'Experience working with LLMs/AI APIs (Gemini/OpenAI) and streaming data.',
          contextInResume: 'Mentioned general AI integrations in bio; added targeted project bullet.',
        },
        {
          skill: 'Docker & Containerization',
          category: 'matched',
          importance: 'medium',
          recommendation: 'Keep containerization and cloud CI/CD points visible in the tech stack.',
          contextInJob: 'Familiarity with containerization (Docker).',
          contextInResume: 'Listed in skills and deployed on AWS ECS.',
        },
      ],
      experienceAlignments: [
        {
          jobRequirement: '5+ years software engineering with high-performance backends',
          candidateMatchScore: 95,
          candidateExperience: '6 years across Apex Cloud & Nexus Labs handling 15M+ daily requests',
          gapAnalysis: 'Candidate is fully qualified with strong metric-backed achievements.',
          actionableAdvice: 'Lead with scale numbers in the summary section.',
          tailoredBulletSuggestion: 'Architected and deployed distributed services handling 15M+ daily requests using Node.js, Express, and Redis with 99.99% uptime.',
        },
        {
          jobRequirement: 'Experience working with LLMs/AI APIs and streaming data',
          candidateMatchScore: 82,
          candidateExperience: 'Built analytics dashboards with streaming features and AI prototypes',
          gapAnalysis: 'Need clearer highlight on real-time streaming architectures.',
          actionableAdvice: 'Frame analytics streaming in terms of async SSE / WebSocket conduits.',
          tailoredBulletSuggestion: 'Engineered real-time streaming data pipelines and AI model inference interfaces using Node.js and WebSocket conduits, reducing token delivery latency by 45%.',
        },
      ],
      tailoredResume: {
        fullName: 'Alex Morgan',
        headline: 'Senior Full-Stack Engineer | AI Applications & Distributed Systems',
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 234-8901',
        location: 'San Francisco, CA (Open to Remote)',
        linkedin: 'linkedin.com/in/alex-morgan-dev',
        portfolio: 'github.com/alexmorgan-code',
        summary: 'Accomplished Senior Full-Stack Engineer with 6+ years of expertise architecting high-scale web platforms, AI-assisted interfaces, and resilient cloud backends. Specialized in React, TypeScript, Node.js, Python (FastAPI), and streaming data pipelines with a focus on end-to-end performance and developer velocity.',
        coreCompetencies: [
          'TypeScript & React Architecture',
          'Node.js & Python FastAPI Services',
          'LLM & AI API Integrations',
          'Distributed Systems & Redis',
          'PostgreSQL & MongoDB Optimization',
          'Docker & AWS Cloud Infrastructure',
          'Real-time Streaming & WebSockets',
          'CI/CD & Agile Leadership',
        ],
        matchedKeywords: ['React', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'LLM', 'AI APIs', 'Streaming Data', 'Docker', 'MongoDB', 'PostgreSQL', 'Microservices'],
        experience: [
          {
            role: 'Senior Full-Stack Engineer',
            company: 'Apex Cloud Technologies',
            period: '2023 - Present',
            location: 'San Francisco, CA',
            accomplishments: [
              'Architected and deployed high-performance microservices handling 15M+ daily requests with Node.js, Express, and Redis, lowering p99 latency by 65%.',
              'Spearheaded modern React 19 and TypeScript frontend architecture, optimizing Core Web Vitals and slashing client initial load time by 48%.',
              'Integrated generative AI workflows and streaming API conduits, accelerating customer data analysis throughput by 3.5x.',
              'Mentored 5 engineers across sprint cycles, establishing rigorous type safety conventions and automated CI/CD deployment pipelines.',
            ],
          },
          {
            role: 'Full-Stack Developer',
            company: 'Nexus Labs',
            period: '2020 - 2023',
            location: 'San Francisco, CA',
            accomplishments: [
              'Engineered interactive analytics dashboards utilizing React, TailwindCSS, and Python FastAPI backend services.',
              'Designed and indexed MongoDB & PostgreSQL database schemas supporting 2TB+ multi-tenant datasets with sub-50ms query times.',
              'Created automated testing suites and Dockerized build pipelines on GitHub Actions, cutting release deployment cycles by 35%.',
            ],
          },
        ],
        education: [
          {
            degree: 'Bachelor of Science in Computer Science',
            school: 'University of California, Berkeley',
            year: '2016 - 2020',
            details: 'Dean’s Honors List | Focus on Distributed Systems & Human-Computer Interaction',
          },
        ],
        certifications: [
          'AWS Certified Solutions Architect – Associate',
          'Certified Kubernetes Application Developer (CKAD)',
        ],
        projects: [
          {
            name: 'AI Agent Context Streamer',
            description: 'Open-source TypeScript library for resilient SSE/WebSocket streaming of LLM token payloads with client-side optimistic reconciliation.',
            techStack: ['TypeScript', 'Node.js', 'React', 'FastAPI'],
            link: 'github.com/alexmorgan-code/stream-agent',
          },
        ],
      },
      tailoredCoverLetter: {
        candidateName: 'Alex Morgan',
        candidateContact: 'San Francisco, CA | (555) 234-8901 | alex.morgan@example.com | linkedin.com/in/alex-morgan-dev',
        date: 'August 26, 2026',
        hiringManager: 'Hiring Team at Starlight Dynamics',
        companyName: 'Starlight Dynamics',
        companyAddress: 'San Francisco, CA',
        jobTitle: 'Senior Full-Stack Engineer (AI Applications)',
        salutation: 'Dear Hiring Team at Starlight Dynamics,',
        openingParagraph: 'I am writing to express my strong enthusiasm for the Senior Full-Stack Engineer (AI Applications) role at Starlight Dynamics. With over 6 years of experience building resilient distributed backends in Node.js and Python alongside modern, high-velocity frontend interfaces in React and TypeScript, I have long admired Starlight\'s forward-thinking approach to intuitive AI-powered platforms.',
        bodyParagraphs: [
          'Throughout my career at Apex Cloud Technologies and Nexus Labs, I have specialized in closing the gap between complex backend architectures and delightful user experiences. At Apex Cloud, I architected microservices processing over 15 million daily events while spearheading a complete frontend overhaul that reduced page load times by 48%. Recently, I integrated generative AI streaming endpoints into our product workflows, establishing low-latency conduits that empowered users with instant insights.',
          'Your requirement for robust engineering across TypeScript, Python, and containerized cloud environments directly mirrors my daily stack. I bring deep experience optimizing PostgreSQL and MongoDB databases, designing containerized workflows in Docker, and crafting fluid frontend experiences with modern React state mechanics.',
        ],
        closingParagraph: 'I would welcome the opportunity to discuss how my full-stack background, enthusiasm for AI-native workflows, and commitment to engineering excellence can help Starlight Dynamics scale its next generation of intelligent products. Thank you for your time and consideration.',
        signOff: 'Sincerely,',
        fullLetterText: `Alex Morgan
San Francisco, CA | (555) 234-8901 | alex.morgan@example.com | linkedin.com/in/alex-morgan-dev

August 26, 2026

Hiring Team at Starlight Dynamics
Starlight Dynamics
San Francisco, CA

Dear Hiring Team at Starlight Dynamics,

I am writing to express my strong enthusiasm for the Senior Full-Stack Engineer (AI Applications) role at Starlight Dynamics. With over 6 years of experience building resilient distributed backends in Node.js and Python alongside modern, high-velocity frontend interfaces in React and TypeScript, I have long admired Starlight's forward-thinking approach to intuitive AI-powered platforms.

Throughout my career at Apex Cloud Technologies and Nexus Labs, I have specialized in closing the gap between complex backend architectures and delightful user experiences. At Apex Cloud, I architected microservices processing over 15 million daily events while spearheading a complete frontend overhaul that reduced page load times by 48%. Recently, I integrated generative AI streaming endpoints into our product workflows, establishing low-latency conduits that empowered users with instant insights.

Your requirement for robust engineering across TypeScript, Python, and containerized cloud environments directly mirrors my daily stack. I bring deep experience optimizing PostgreSQL and MongoDB databases, designing containerized workflows in Docker, and crafting fluid frontend experiences with modern React state mechanics.

I would welcome the opportunity to discuss how my full-stack background, enthusiasm for AI-native workflows, and commitment to engineering excellence can help Starlight Dynamics scale its next generation of intelligent products. Thank you for your time and consideration.

Sincerely,

Alex Morgan`,
      },
    },
  ],
  activityLogs: [
    {
      id: 'log_1',
      userId: 'usr_demo_1',
      action: 'Account Created',
      details: 'Signed up and initialized career profile for Alex Morgan.',
      timestamp: '2026-08-20T10:00:00.000Z',
    },
    {
      id: 'log_2',
      userId: 'usr_demo_1',
      action: 'Profile Updated',
      details: 'Added target roles and updated master skill tags.',
      timestamp: '2026-08-25T14:30:00.000Z',
    },
    {
      id: 'log_3',
      userId: 'usr_demo_1',
      action: 'Tailored Application Created',
      details: 'Scanned job posting for Starlight Dynamics (Score: 92%). Generated tailored resume and cover letter.',
      timestamp: '2026-08-26T09:15:00.000Z',
      applicationId: 'app_sample_1',
    },
    {
      id: 'log_4',
      userId: 'usr_demo_1',
      action: 'Status Updated',
      details: 'Moved Starlight Dynamics application to "Interviewing".',
      timestamp: '2026-08-28T16:00:00.000Z',
      applicationId: 'app_sample_1',
    },
  ],
};

let dbCache: DatabaseSchema | null = null;

function loadDb(): DatabaseSchema {
  if (dbCache) return dbCache;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      dbCache = JSON.parse(raw);
      return dbCache!;
    }
  } catch (err) {
    console.error('Error loading DB file, fallback to initialDb', err);
  }
  dbCache = JSON.parse(JSON.stringify(initialDb));
  saveDb();
  return dbCache!;
}

function saveDb(): void {
  if (!dbCache) return;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

// User Methods
export function findUserByUsername(username: string) {
  const db = loadDb();
  return db.users.find((u) => u.username.toLowerCase() === username.toLowerCase().trim());
}

export function findUserByEmail(email: string) {
  const db = loadDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
}

export function findUserById(id: string) {
  const db = loadDb();
  return db.users.find((u) => u.id === id);
}

export function createUser(username: string, email: string, passwordHash: string, name?: string) {
  const db = loadDb();
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newUser = {
    id,
    username: username.trim(),
    email: email.trim(),
    name: name || username.trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);

  // Initialize empty profile
  db.profiles[id] = {
    id: `prof_${id}`,
    userId: id,
    fullName: newUser.name,
    email: newUser.email,
    phone: '',
    location: '',
    headline: 'Job Seeker',
    bio: '',
    currentRole: '',
    yearsOfExperience: 0,
    targetRoles: [],
    skills: [],
    linkedinUrl: '',
    githubOrPortfolioUrl: '',
    preferredJobTypes: ['Full-Time'],
    updatedAt: new Date().toISOString(),
  };

  logActivity(id, 'Account Created', `Created account with username ${username}`);
  saveDb();
  return newUser;
}

// Profile Methods
export function getUserProfile(userId: string): UserProfile {
  const db = loadDb();
  if (!db.profiles[userId]) {
    const user = findUserById(userId);
    db.profiles[userId] = {
      id: `prof_${userId}`,
      userId,
      fullName: user?.name || 'Job Seeker',
      email: user?.email || '',
      phone: '',
      location: '',
      headline: '',
      bio: '',
      currentRole: '',
      yearsOfExperience: 0,
      targetRoles: [],
      skills: [],
      linkedinUrl: '',
      githubOrPortfolioUrl: '',
      preferredJobTypes: ['Full-Time'],
      updatedAt: new Date().toISOString(),
    };
    saveDb();
  }
  return db.profiles[userId];
}

export function updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
  const db = loadDb();
  const current = getUserProfile(userId);
  const updated = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  db.profiles[userId] = updated;
  logActivity(userId, 'Profile Updated', 'Saved changes to personal profile & target roles.');
  saveDb();
  return updated;
}

// Application Records
export function getApplications(userId: string): JobApplicationRecord[] {
  const db = loadDb();
  return db.applications
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getApplicationById(id: string, userId: string): JobApplicationRecord | undefined {
  const db = loadDb();
  return db.applications.find((a) => a.id === id && a.userId === userId);
}

export function saveApplication(app: Omit<JobApplicationRecord, 'id' | 'createdAt' | 'updatedAt'>): JobApplicationRecord {
  const db = loadDb();
  const id = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const record: JobApplicationRecord = {
    ...app,
    id,
    createdAt: now,
    updatedAt: now,
  };
  db.applications.unshift(record);
  logActivity(
    app.userId,
    'Tailored Application Created',
    `Tailored resume & cover letter for ${app.jobTitle} at ${app.companyName} (Score: ${app.scoringResult.overallScore}%).`,
    id
  );
  saveDb();
  return record;
}

export function updateApplication(id: string, userId: string, updates: Partial<JobApplicationRecord>): JobApplicationRecord | null {
  const db = loadDb();
  const index = db.applications.findIndex((a) => a.id === id && a.userId === userId);
  if (index === -1) return null;

  const current = db.applications[index];
  const updated: JobApplicationRecord = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (updates.status && updates.status !== current.status) {
    logActivity(
      userId,
      'Application Status Changed',
      `Updated status for ${current.jobTitle} at ${current.companyName} to "${updates.status.toUpperCase()}".`,
      id
    );
  }

  db.applications[index] = updated;
  saveDb();
  return updated;
}

export function deleteApplication(id: string, userId: string): boolean {
  const db = loadDb();
  const index = db.applications.findIndex((a) => a.id === id && a.userId === userId);
  if (index === -1) return false;
  const deleted = db.applications.splice(index, 1)[0];
  logActivity(userId, 'Application Deleted', `Removed application record for ${deleted.jobTitle} at ${deleted.companyName}.`);
  saveDb();
  return true;
}

// Activity Logs
export function logActivity(userId: string, action: string, details: string, applicationId?: string, metadata?: Record<string, any>): ActivityLog {
  const db = loadDb();
  const log: ActivityLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
    applicationId,
    metadata,
  };
  db.activityLogs.unshift(log);
  if (db.activityLogs.length > 500) {
    db.activityLogs = db.activityLogs.slice(0, 500);
  }
  saveDb();
  return log;
}

export function getActivityLogs(userId: string, limit = 50): ActivityLog[] {
  const db = loadDb();
  return db.activityLogs
    .filter((l) => l.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// Dashboard Statistics
export function getDashboardStats(userId: string): DashboardStats {
  const apps = getApplications(userId);
  const logs = getActivityLogs(userId, 15);

  const statusCounts: Record<ApplicationStatus, number> = {
    tailored: 0,
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
    archived: 0,
  };

  let totalScore = 0;
  const skillCountMap: Record<string, number> = {};

  apps.forEach((app) => {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status]++;
    }
    totalScore += app.scoringResult.overallScore || 0;
    app.skillsGap?.forEach((sg) => {
      if (sg.category === 'matched') {
        skillCountMap[sg.skill] = (skillCountMap[sg.skill] || 0) + 1;
      }
    });
  });

  const averageMatchScore = apps.length > 0 ? Math.round(totalScore / apps.length) : 0;
  const topSkillsIdentified = Object.entries(skillCountMap)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    totalApplications: apps.length,
    averageMatchScore,
    statusCounts,
    topSkillsIdentified,
    recentApplications: apps.slice(0, 5),
    activityLogs: logs,
  };
}
