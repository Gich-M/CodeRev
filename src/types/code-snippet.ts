export interface Comment {
    id: string;
    content: string;
    line_number: number;
    user_id: string;
    created_at: string;
    username: string;
    avatar_url: string;
  }
  
export interface Review {
  id: string;
  comment: string;
  created_at: string;
  reviewer_id: string;
  status: 'pending' | 'approved' | 'changes_requested';
  reviewer?: {
    username: string;
    avatar_url: string;
  };
}

export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code_content: string;
  language: string;
  user_id: string;
  status: 'pending' | 'approved' | 'changes_requested';
  created_at: string;
  author_username: string;
  author_avatar_url: string;
  reviews?: Review[];
}