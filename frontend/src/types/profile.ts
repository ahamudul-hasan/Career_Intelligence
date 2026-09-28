export interface UserSkillItem {
  id: number;
  user_id: number;
  skill_id: number;
  skill_name: string;
  normalized_name?: string;
  category?: string;
  proficiency: number; // 0: None, 1: Beginner, 2: Intermediate, 3: Advanced, 4: Expert
  updated_at?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  skills: UserSkillItem[];
}

export const PROFICIENCY_LABELS: Record<number, { label: string; short: string; color: string; desc: string }> = {
  0: { label: 'None / Exploring', short: 'None', color: '#64748b', desc: 'No practical experience yet' },
  1: { label: 'Beginner', short: 'Beg', color: '#38bdf8', desc: 'Basic syntax, fundamentals' },
  2: { label: 'Intermediate', short: 'Int', color: '#34d399', desc: 'Can build features & debug' },
  3: { label: 'Advanced', short: 'Adv', color: '#a78bfa', desc: 'Production-ready, system patterns' },
  4: { label: 'Expert', short: 'Exp', color: '#f59e0b', desc: 'Deep mastery, architecture, mentorship' },
};
