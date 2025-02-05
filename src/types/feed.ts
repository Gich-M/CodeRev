import { LucideIcon } from 'lucide-react';

export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  language: string;
  status: string;
  review_count: number;
  comment_count: number;
  external_link?: string;
}

export interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface FeedItem {
  id: string;
  user_id: string;
  type: string;
  created_at: string;
  code_snippet?: CodeSnippet;
  profiles?: {
    username: string;
    display_name?: string;
  };
}

export interface FeedProps {
  initialSortBy?: 'newest' | 'oldest' | 'most_reviews' | 'needs_review';
  initialFilterBy?: 'all' | 'pending' | 'completed' | 'changes_requested' | 'my_submissions';
  hideFilters?: boolean;
  showBackButton?: boolean;
  backTo?: string;
} 