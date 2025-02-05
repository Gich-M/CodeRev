import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { CodeViewer } from '../components/code-snippet/CodeViewer';
import { CommentSection } from '../components/code-snippet/CommentSection';
import { ReviewSection } from '../components/code-snippet/ReviewSection';
import { StatusBadge } from '../components/shared/StatusBadge';
import { CodeSnippet as ICodeSnippet } from '../types/code-snippet/CodeSnippet';
import { ArrowLeft } from 'lucide-react';

export function CodeSnippet() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState<ICodeSnippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });
  const [reviewContent, setReviewContent] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetchSnippet();

    // Real-time subscription for status updates
    const channel = supabase.channel('status-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'code_snippets',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Status update:', payload.new.status);
          setSnippet(prev => ({
            ...prev,
            status: payload.new.status
          }));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [id]);

  const fetchSnippet = async () => {
    try {
      const { data, error } = await supabase
        .from('code_snippets')
        .select(`
          *,
          reviews (
            *,
            reviewer:profiles (
              id,
              username,
              avatar_url
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching snippet:', error);
        return;
      }

      if (data) {
        setSnippet(data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load snippet');
      setLoading(false);
    }
  };

  const handleLineClick = (lineNumber: number, position: { x: number; y: number }) => {
    setSelectedLine(lineNumber);
    setCommentPosition(position);
  };

  const handleReviewSubmit = async (status: 'approved' | 'changes_requested') => {
    if (!user || !reviewContent.trim()) return;
    
    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .upsert({
          code_snippet_id: id,
          reviewer_id: user.id,
          status,
          comment: reviewContent,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'code_snippet_id,reviewer_id'
        });

      if (error) throw error;
      
      setReviewContent('');
      setShowReviewForm(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!snippet) {
    return <div>Snippet not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">{snippet.title}</h1>
        </div>
        {snippet && (
          <StatusBadge 
            status={snippet.status} 
            className="ml-2" 
            key={snippet.status} 
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CodeViewer
            content={snippet.code_content}
            language={snippet.language}
            onLineClick={handleLineClick}
          />
        </div>
        <div>
          <ReviewSection snippet={snippet} />
          <CommentSection 
            snippetId={snippet.id}
            selectedLine={selectedLine}
            position={commentPosition}
            onClose={() => setSelectedLine(null)}
          />
        </div>
      </div>
    </div>
  );
}