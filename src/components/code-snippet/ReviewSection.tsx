import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { CodeSnippet } from '../../types';
import { AlertCircle } from 'lucide-react';

interface ReviewSectionProps {
  snippet: CodeSnippet;
}

export function ReviewSection({ snippet }: ReviewSectionProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't render if user is the author
  if (user?.id === snippet.user_id) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <div className="flex items-center text-gray-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>You cannot review your own code</span>
        </div>
      </div>
    );
  }

  const handleSubmit = async (status: 'approved' | 'changes_requested') => {
    if (!user || !content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('reviews')
        .insert({
          code_snippet_id: snippet.id,
          reviewer_id: user.id,
          content,
          status
        });

      if (submitError) throw submitError;
      
      setContent('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">Review</h3>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Provide constructive feedback..."
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        rows={4}
        disabled={submitting}
      />

      {error && (
        <div className="mt-2 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex space-x-3 mt-4">
        <button
          onClick={() => handleSubmit('approved')}
          disabled={submitting || !content.trim()}
          className="flex-1 px-4 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => handleSubmit('changes_requested')}
          disabled={submitting || !content.trim()}
          className="flex-1 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 disabled:opacity-50"
        >
          Request Changes
        </button>
      </div>
    </div>
  );
}