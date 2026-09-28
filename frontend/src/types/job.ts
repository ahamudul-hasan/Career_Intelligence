export interface Job {
  id: number;
  career_role_id: number;
  career_role_name?: string;
  category?: string;
  title: string;
  company?: string;
  location?: string;
  country?: string;
  experience_level?: string;
  source?: string;
  external_id?: string;
  job_url?: string;
  raw_description?: string;
  cleaned_description?: string;
  posted_date?: string;
  created_at?: string;
  skills?: JobSkillItem[];
}

export interface JobSkillItem {
  id: number;
  name: string;
  normalized_name: string;
  category?: string;
  importance: 'required' | 'preferred' | 'nice_to_have';
  confidence: number;
}

export interface JobListResponse {
  jobs: Job[];
  total: number;
}

export interface JobImportPayload {
  career_role_id: number;
  title: string;
  company?: string;
  location?: string;
  experience_level?: string;
  description: string;
}

export interface JobSearchCriteria {
  career_role_id: number;
  location?: string;
  experience_level?: string;
  limit?: number;
  source?: string;
}

export interface JobSearchResponse {
  message: string;
  career_role_id: number;
  career_role_name: string;
  source: string;
  jobs_found: number;
  jobs_ingested: number;
  jobs_duplicate: number;
  jobs: Job[];
}

export interface JobSkillMatch {
  skill_id: number;
  skill_name: string;
  category: string;
  importance: 'required' | 'preferred';
  confidence: number;
  user_proficiency: number;
  user_proficiency_label: string;
  status: 'matched' | 'partially_matched' | 'missing';
  status_symbol: '✓' | '~' | '✗';
  status_reason: string;
}

export interface JobMatchSummary {
  total_skills: number;
  matched_count: number;
  partially_matched_count: number;
  missing_count: number;
  required_total: number;
  required_matched: number;
  required_partial: number;
  required_missing: number;
  preferred_total: number;
  preferred_matched: number;
  preferred_missing: number;
  required_coverage_pct: number;
  overall_coverage_pct: number;
}

export interface JobMatchResult {
  job_id: number;
  job_title: string;
  company?: string;
  career_role_id?: number;
  career_role_name?: string;
  user_id: number;
  summary: JobMatchSummary;
  matches: JobSkillMatch[];
  disclaimer: string;
}
