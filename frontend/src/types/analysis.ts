import type { SkillFrequency } from './skill';

export interface Analysis {
  id: number;
  career_role_id: number;
  target_location?: string;
  experience_level?: string;
  jobs_analyzed: number;
  sources?: string;
  analysis_date?: string;
}

export interface SkillGap {
  skill_id: number;
  skill_name: string;
  normalized_name?: string;
  category?: string;
  market_frequency: number;
  user_proficiency: number;
  user_proficiency_label?: string;
  gap_priority: 'high' | 'medium' | 'low';
  explanation: string;
}

export interface AnalysisDetail extends Analysis {
  skills: SkillFrequency[];
  gaps?: SkillGap[];
}
