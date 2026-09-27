export interface Job {
  id: number;
  career_role_id: number;
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
  posted_at?: string;
  created_at?: string;
}

export interface JobSearchCriteria {
  career_role_id: number;
  location?: string;
  experience_level?: string;
  limit?: number;
  source?: string;
}
