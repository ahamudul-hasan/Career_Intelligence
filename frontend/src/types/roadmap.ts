export interface Project {
  id: number;
  title: string;
  description: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  created_at?: string;
}

export interface RoadmapItem {
  id: number;
  skill_id?: number;
  title: string;
  description?: string;
  order_index: number;
  estimated_hours?: number;
  status: string;
  projects?: Project[];
}

export interface RoadmapPhase {
  id: number;
  title: string;
  description?: string;
  phase_order: number;
  items: RoadmapItem[];
}

export interface Roadmap {
  id: number;
  user_id: number;
  career_role_id: number;
  title: string;
  summary?: string;
  created_at?: string;
  phases: RoadmapPhase[];
}
