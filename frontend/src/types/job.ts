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
