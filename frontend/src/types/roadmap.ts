export interface RoadmapProjectItem {
  id: number;
  roadmap_id: number;
  project_id: number;
  phase_id?: number | null;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills_demonstrated?: string[];
}

export interface Project {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills_demonstrated: string[];
  created_at?: string;
}

export interface RoadmapItem {
  id: number;
  phase_id: number;
  skill_id?: number | null;
  skill_name?: string | null;
  skill_category?: string | null;
  title: string;
  description?: string | null;
  importance_reason?: string | null;
  estimated_hours: number;
}

export interface RoadmapPhase {
  id: number;
  roadmap_id: number;
  phase_number: number;
  title: string;
  estimated_duration?: string | null;
  items: RoadmapItem[];
  projects?: RoadmapProjectItem[];
}

export interface Roadmap {
  id: number;
  user_id: number;
  career_role_id: number;
  career_role_name?: string | null;
  analysis_id?: number | null;
  title: string;
  summary?: string | null;
  created_at?: string;
  phases: RoadmapPhase[];
  projects?: RoadmapProjectItem[];
}
