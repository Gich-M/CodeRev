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
  title: string;
  description: string;
  created_at: string;
  user_id: string;
  user: User;
  code_snippet?: CodeSnippet;
}

export interface FeedProps {
  initialSortBy?: 'newest' | 'oldest' | 'most_reviews' | 'needs_review';
  initialFilterBy?: 'all' | 'pending' | 'completed' | 'changes_requested' | 'my_submissions';
  hideFilters?: boolean;
  showBackButton?: boolean;
  backTo?: string;
} 