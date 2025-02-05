export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  points_value: number;
  category: 'review' | 'submission' | 'community' | 'streak';
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement: Achievement;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  preferred_languages: string[];
  expertise_level?: ExpertiseLevel;
  reputation_points: number;
  total_reviews_given: number;
  total_submissions: number;
  weekly_review_streak: number;
  monthly_review_streak: number;
  created_at: string;
  updated_at: string;
  canEditEmail?: boolean;
  provider?: string;
  user_achievements?: UserAchievement[];
}

export type ExpertiseLevel = 'beginner' | 'intermediate' | 'advanced';