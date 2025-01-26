import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useReviewStats() {
  const { user } = useAuth();

  const updateReviewStats = useCallback(async (snippetId: string) => {
    if (!user?.id) return;

    try {
      // Update total reviews count
      const { error: profileError } = await supabase.rpc('increment_review_count', {
        user_id: user.id
      });

      if (profileError) throw profileError;

      // Update snippet status
      const { error: snippetError } = await supabase
        .from('code_snippets')
        .update({ status: 'reviewed' })
        .eq('id', snippetId);

      if (snippetError) throw snippetError;

      // Create feed item for the review
      const { error: feedError } = await supabase
        .from('feed_items')
        .insert([
          {
            type: 'review_completed',
            user_id: user.id,
            reference_type: 'code_snippet',
            reference_id: snippetId,
            title: 'Completed a code review',
            description: 'Provided feedback on a code snippet'
          }
        ]);

      if (feedError) throw feedError;

    } catch (error) {
      console.error('Error updating review stats:', error);
      throw error;
    }
  }, [user?.id]);

  return { updateReviewStats };
} 