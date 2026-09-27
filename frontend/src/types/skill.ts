export interface Skill {
  id: number;
  name: string;
  normalized_name: string;
  category?: string;
  created_at?: string;
}

export interface SkillFrequency {
  skill_id: number;
  skill_name: string;
  normalized_name: string;
  category?: string;
  skill_count: number;
  percentage: number;
  required_count: number;
  preferred_count: number;
}
