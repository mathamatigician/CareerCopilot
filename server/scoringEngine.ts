import {
  SkillsGapItem,
  ExperienceAlignment,
  ScoringWeightsConfig,
  ScoringBreakdown,
  TailoredResumeData,
} from '../src/types';

export type ScoringProfileName = 'standard' | 'technical' | 'executive' | 'creative_marketing' | 'entry_level';

export const SCORING_PRESETS: Record<ScoringProfileName, ScoringWeightsConfig> = {
  standard: {
    skillsWeight: 0.35,
    experienceWeight: 0.30,
    keywordsAtsWeight: 0.15,
    educationCertWeight: 0.10,
    impactMetricsWeight: 0.10,
  },
  technical: {
    skillsWeight: 0.45,
    experienceWeight: 0.25,
    keywordsAtsWeight: 0.15,
    educationCertWeight: 0.05,
    impactMetricsWeight: 0.10,
  },
  executive: {
    skillsWeight: 0.20,
    experienceWeight: 0.45,
    keywordsAtsWeight: 0.15,
    educationCertWeight: 0.10,
    impactMetricsWeight: 0.10,
  },
  creative_marketing: {
    skillsWeight: 0.30,
    experienceWeight: 0.30,
    keywordsAtsWeight: 0.15,
    educationCertWeight: 0.05,
    impactMetricsWeight: 0.20,
  },
  entry_level: {
    skillsWeight: 0.35,
    experienceWeight: 0.15,
    keywordsAtsWeight: 0.20,
    educationCertWeight: 0.20,
    impactMetricsWeight: 0.10,
  },
};

// Modular Sub-Evaluators

export interface SubScoreResult {
  score: number; // 0 - 100
  notes: string[];
  passedChecklist: { check: string; passed: boolean }[];
}

export class SkillsMatchEvaluator {
  evaluate(skillsGap: SkillsGapItem[]): SubScoreResult {
    if (!skillsGap || skillsGap.length === 0) {
      return { score: 70, notes: ['Default baseline skills score'], passedChecklist: [] };
    }

    let totalPoints = 0;
    let earnedPoints = 0;
    const notes: string[] = [];
    const passedChecklist: { check: string; passed: boolean }[] = [];

    skillsGap.forEach((item) => {
      const weight = item.importance === 'high' ? 3 : item.importance === 'medium' ? 2 : 1;
      totalPoints += weight;

      if (item.category === 'matched') {
        earnedPoints += weight;
        passedChecklist.push({ check: `Direct skill match: ${item.skill}`, passed: true });
      } else if (item.category === 'partial') {
        earnedPoints += weight * 0.6;
        passedChecklist.push({ check: `Partial match: ${item.skill}`, passed: true });
      } else {
        passedChecklist.push({ check: `Missing skill: ${item.skill}`, passed: false });
        if (item.importance === 'high') {
          notes.push(`Missing high-priority skill requirement: ${item.skill}`);
        }
      }
    });

    const score = Math.round(Math.min(100, Math.max(20, (earnedPoints / Math.max(1, totalPoints)) * 100)));
    return { score, notes, passedChecklist };
  }
}

export class ExperienceAlignmentEvaluator {
  evaluate(alignments: ExperienceAlignment[]): SubScoreResult {
    if (!alignments || alignments.length === 0) {
      return { score: 75, notes: ['Baseline experience alignment'], passedChecklist: [] };
    }

    let sum = 0;
    const notes: string[] = [];
    const passedChecklist: { check: string; passed: boolean }[] = [];

    alignments.forEach((item) => {
      sum += item.candidateMatchScore;
      const isStrong = item.candidateMatchScore >= 80;
      passedChecklist.push({
        check: `${item.jobRequirement.substring(0, 50)}... (${item.candidateMatchScore}%)`,
        passed: isStrong,
      });
      if (item.candidateMatchScore < 60) {
        notes.push(`Experience gap in: ${item.jobRequirement}`);
      }
    });

    const score = Math.round(Math.min(100, Math.max(25, sum / alignments.length)));
    return { score, notes, passedChecklist };
  }
}

export class AtsKeywordEvaluator {
  evaluate(matchedKeywords: string[], requiredKeywordsCount = 10): SubScoreResult {
    const count = matchedKeywords?.length || 0;
    const ratio = Math.min(1.0, count / Math.max(5, requiredKeywordsCount));
    const score = Math.round(Math.min(100, Math.max(30, ratio * 100)));

    const passedChecklist = [
      { check: 'Standard ATS Section Headings', passed: true },
      { check: 'Clean Text Hierarchy (No graphics-only text)', passed: true },
      { check: 'Key Technical Keyword Density >= 75%', passed: score >= 75 },
      { check: 'Job-Specific Acronym & Term Mapping', passed: count >= 6 },
    ];

    return {
      score,
      notes: count < 5 ? ['Add more verbatim keywords from the job listing into experience bullet points'] : ['Strong ATS keyword coverage'],
      passedChecklist,
    };
  }
}

export class ImpactMetricsEvaluator {
  evaluate(resume?: TailoredResumeData): SubScoreResult {
    if (!resume || !resume.experience || resume.experience.length === 0) {
      return { score: 75, notes: [], passedChecklist: [] };
    }

    let totalBullets = 0;
    let metricBullets = 0;
    const actionVerbRegex = /^(architected|spearheaded|engineered|led|designed|implemented|accelerated|increased|reduced|boosted|optimized|deployed|scaled|transformed|delivered)/i;
    const numberRegex = /(\d+[%$kKmMbB]?|\$\d+|\d+\+?)/;

    let strongVerbCount = 0;

    resume.experience.forEach((exp) => {
      exp.accomplishments.forEach((b) => {
        totalBullets++;
        if (numberRegex.test(b)) metricBullets++;
        if (actionVerbRegex.test(b.trim())) strongVerbCount++;
      });
    });

    const metricRatio = totalBullets > 0 ? metricBullets / totalBullets : 0.5;
    const verbRatio = totalBullets > 0 ? strongVerbCount / totalBullets : 0.5;

    const score = Math.round(Math.min(100, Math.max(30, (metricRatio * 0.6 + verbRatio * 0.4) * 100)));

    return {
      score,
      notes: metricRatio < 0.5 ? ['Enhance bullet points with quantifiable results (e.g., % growth, latency cut, users served).'] : ['Excellent metric-backed impact statements.'],
      passedChecklist: [
        { check: 'Action Verbs at Start of Bullets', passed: verbRatio >= 0.7 },
        { check: 'Quantifiable Metrics (Google X-Y-Z formula)', passed: metricRatio >= 0.6 },
        { check: 'Clear Business Value & Scale Articulation', passed: score >= 70 },
      ],
    };
  }
}

export class EducationCertEvaluator {
  evaluate(resume?: TailoredResumeData): SubScoreResult {
    const hasEducation = (resume?.education?.length || 0) > 0;
    const hasCerts = (resume?.certifications?.length || 0) > 0;

    let score = 70;
    if (hasEducation) score += 20;
    if (hasCerts) score += 10;
    score = Math.min(100, score);

    return {
      score,
      notes: hasCerts ? ['Certifications provide strong third-party validation'] : ['Consider adding industry certifications for extra edge'],
      passedChecklist: [
        { check: 'Verified Degree / Education Credentials', passed: hasEducation },
        { check: 'Relevant Technical Certifications / Licenses', passed: hasCerts },
      ],
    };
  }
}

// Modular Composite Scoring Engine
export class ResumeScoringEngine {
  private skillsEvaluator = new SkillsMatchEvaluator();
  private expEvaluator = new ExperienceAlignmentEvaluator();
  private atsEvaluator = new AtsKeywordEvaluator();
  private impactEvaluator = new ImpactMetricsEvaluator();
  private eduEvaluator = new EducationCertEvaluator();

  /**
   * Computes full modular breakdown scores using configurable weights
   */
  calculateCompositeScore(params: {
    skillsGap: SkillsGapItem[];
    experienceAlignments: ExperienceAlignment[];
    tailoredResume?: TailoredResumeData;
    matchedKeywords?: string[];
    weights?: Partial<ScoringWeightsConfig>;
    customSummary?: string;
  }): ScoringBreakdown {
    const weights: ScoringWeightsConfig = {
      ...SCORING_PRESETS.standard,
      ...(params.weights || {}),
    };

    // Normalize weights to sum to 1.0
    const weightSum =
      weights.skillsWeight +
      weights.experienceWeight +
      weights.keywordsAtsWeight +
      weights.educationCertWeight +
      weights.impactMetricsWeight;

    const normSkills = weights.skillsWeight / weightSum;
    const normExp = weights.experienceWeight / weightSum;
    const normAts = weights.keywordsAtsWeight / weightSum;
    const normEdu = weights.educationCertWeight / weightSum;
    const normImpact = weights.impactMetricsWeight / weightSum;

    // Evaluate Sub-scores
    const skillsRes = this.skillsEvaluator.evaluate(params.skillsGap);
    const expRes = this.expEvaluator.evaluate(params.experienceAlignments);
    const atsRes = this.atsEvaluator.evaluate(
      params.matchedKeywords || params.tailoredResume?.matchedKeywords || [],
      params.skillsGap?.length || 10
    );
    const impactRes = this.impactEvaluator.evaluate(params.tailoredResume);
    const eduRes = this.eduEvaluator.evaluate(params.tailoredResume);

    const overallScore = Math.round(
      skillsRes.score * normSkills +
      expRes.score * normExp +
      atsRes.score * normAts +
      eduRes.score * normEdu +
      impactRes.score * normImpact
    );

    const atsHealthScore = Math.round(
      atsRes.score * 0.4 + skillsRes.score * 0.35 + impactRes.score * 0.25
    );

    // Extract strengths & gaps
    const strengths: string[] = [];
    const criticalGaps: string[] = [];
    const interviewTalkingPoints: string[] = [];
    const recommendedActionPlan: string[] = [];

    if (skillsRes.score >= 80) strengths.push('Strong core technical and functional skills alignment.');
    if (expRes.score >= 80) strengths.push('Extensive direct experience matching the seniority requirements.');
    if (impactRes.score >= 80) strengths.push('Compelling quantified accomplishments and strong action verbs.');

    params.skillsGap.forEach((sg) => {
      if (sg.category === 'missing_required' && sg.importance === 'high') {
        criticalGaps.push(`Missing must-have qualification: ${sg.skill}`);
        interviewTalkingPoints.push(
          `When asked about ${sg.skill}, reference related foundational experience and demonstrate your rapid upskilling capability.`
        );
        recommendedActionPlan.push(`Bridge the ${sg.skill} gap by mentioning adjacent frameworks or relevant independent projects.`);
      }
    });

    if (criticalGaps.length === 0) {
      strengths.push('Zero critical qualification gaps identified.');
    }

    if (recommendedActionPlan.length === 0) {
      recommendedActionPlan.push('Highlight leadership and quantifiable metric wins during behavioral rounds.');
      recommendedActionPlan.push('Align your cover letter story with the company mission and recent product releases.');
    }

    return {
      overallScore: Math.min(100, Math.max(10, overallScore)),
      atsHealthScore: Math.min(100, Math.max(10, atsHealthScore)),
      skillsScore: skillsRes.score,
      experienceScore: expRes.score,
      keywordsScore: atsRes.score,
      impactScore: impactRes.score,
      educationScore: eduRes.score,
      summary:
        params.customSummary ||
        `Match Score: ${overallScore}%. Resume is well-tailored with strong ATS keyword mapping (${atsRes.score}%) and ${strengths[0] || 'balanced experience'}.`,
      strengths,
      criticalGaps,
      interviewTalkingPoints,
      recommendedActionPlan,
    };
  }
}

export const defaultScoringEngine = new ResumeScoringEngine();
