import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  ThumbsUp,
  Eye,
  Check,
  X,
  Plus,
  Search,
  ZoomIn,
  ZoomOut,
  Loader,
  Edit2,
  Save,
  Trash2,
  AlertCircle,
  Info,
  ChevronUp,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Link } from 'react-router-dom';

interface Comment {
  id: string;
  content: string;
  line_number: number;
  user_id: string;
  created_at: string;
  username: string;
  avatar_url: string;
}

interface Review {
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

interface CodeSnippet {
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

export function CodeSnippet() {
  const { id } = useParams();
  const { user } = useAuth();
  const [snippet, setSnippet] = useState<CodeSnippet | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [showComments, setShowComments] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSnippet, setEditingSnippet] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    let subscription = null;

    const fetchSnippet = async () => {
      try {
        const { data: snippet, error } = await supabase
          .from('code_snippets_with_details')
          .select(`
            *,
            reviews:reviews_with_details (
              id,
              comment,
              status,
              created_at,
              reviewer_id,
              reviewer_username,
              reviewer_avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        if (mounted) {
          setSnippet(snippet);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching snippet:', error);
        setError('Failed to load snippet');
        setLoading(false);
      }
    };

    if (id) {
      fetchSnippet();

      // Set up real-time subscription
      subscription = supabase
        .channel('code-snippet-changes')
        .on('postgres_changes', 
          { 
            event: '*',
            schema: 'public', 
            table: 'reviews',
            filter: `snippet_id=eq.${id}`
          }, 
          async () => {
            // On any changes, fetch the complete snippet again to ensure we have latest data
            const { data: updatedSnippet, error } = await supabase
              .from('code_snippets_with_details')
              .select(`
                *,
                reviews:reviews_with_details (
                  id,
                  comment,
                  status,
                  created_at,
                  reviewer_id,
                  reviewer_username,
                  reviewer_avatar_url
                )
              `)
              .eq('id', id)
              .single();

            if (!error && mounted && updatedSnippet) {
              setSnippet(updatedSnippet);
            }
          }
        )
        .subscribe();
    }

    return () => {
      mounted = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [id]);

  const handleComment = async () => {
    if (!user || !newComment.trim() || !selectedLine) return;
    
    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          snippet_id: id,
          user_id: user.id,
          content: newComment,
          line_number: selectedLine,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setNewComment('');
      setSelectedLine(null);
      
      // Refresh comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments_with_profiles')
        .select('*')
        .eq('snippet_id', id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      setComments(commentsData);

    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const updateStatus = async (status: 'approved' | 'changes_requested') => {
    if (!user) return;

    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('code_snippets')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setSnippet(snippet ? { ...snippet, status } : null);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEditSnippet = async () => {
    if (!user || user.id !== snippet.user_id) return;
    
    try {
      const { error } = await supabase
        .from('code_snippets')
        .update({ 
          code_content: editedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', snippet.id);

      if (error) throw error;
      setSnippet({ ...snippet, code_content: editedContent });
      setEditingSnippet(false);
    } catch (error) {
      console.error('Error updating snippet:', error);
      setError(error.message);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!user || !editedComment.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ 
          content: editedComment,
          updated_at: new Date().toISOString()
        })
        .match({ id: commentId, user_id: user.id });

      if (error) throw error;

      setComments(prev => 
        prev.map(c => 
          c.id === commentId ? { ...c, content: editedComment } : c
        )
      );
      setEditingCommentId(null);
      setEditedComment('');

    } catch (error) {
      console.error('Error updating comment:', error);
      setError('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .match({ id: commentId, user_id: user.id });

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));

    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    }
  };

  const handleDeleteSnippet = async () => {
    if (!user || user.id !== snippet.user_id) return;
    
    if (!window.confirm('Are you sure you want to delete this code snippet? This will also delete all associated comments and reviews.')) return;

    try {
      // Delete the snippet (cascade will handle related records)
      const { error } = await supabase
        .from('code_snippets')
        .delete()
        .match({ 
          id: snippet.id,
          user_id: user.id 
        });

      if (error) {
        console.error('Error deleting snippet:', error);
        throw error;
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting snippet:', error);
      setError(error.message);
    }
  };

  const handleReviewSubmit = async (status: 'approved' | 'changes_requested') => {
    if (!user || !reviewContent.trim()) {
      setError('Please provide review comments');
      return;
    }
    
    setSubmittingReview(true);
    setError(null);

    try {
      // Upsert the review (update if exists, insert if not)
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .upsert({
          snippet_id: id,
          reviewer_id: user.id,
          comment: reviewContent,
          status: status,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'snippet_id,reviewer_id'
        })
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey (
            username,
            avatar_url
          )
        `)
        .single();

      if (reviewError) throw reviewError;

      // Clear form and show success message
      setReviewContent('');
      setShowReviewForm(false);
      setMessage(`Review ${status === 'approved' ? 'approved' : 'changes requested'} successfully`);

      // Update local state
      setSnippet(prev => prev ? {
        ...prev,
        status: status,
        reviews: prev.reviews 
          ? prev.reviews.map(r => r.reviewer_id === user.id ? review : r)
          : [review]
      } : null);

    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getReviewStats = (reviews: Review[] = []) => {
    return {
      pending: reviews.filter(r => r.status === 'pending').length,
      approved: reviews.filter(r => r.status === 'approved').length,
      changes_requested: reviews.filter(r => r.status === 'changes_requested').length,
      total: reviews.length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-700">Snippet not found</h1>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    changes_requested: 'bg-red-100 text-red-800'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-white">{snippet?.title}</h1>
      </div>
      
      {/* Header Section */}
      <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-semibold text-white">{snippet?.title}</h1>
              <div className="mt-2 flex items-center text-gray-400 text-sm">
                <div className="flex items-center space-x-2">
                  <img 
                    src={snippet.author_avatar_url || '/default-avatar.png'}
                    alt={snippet.author_username}
                    className="w-8 h-8 rounded-full"
                  />
                  <Link 
                    to={`/profile/${snippet.user_id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    by {snippet.author_username}
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                snippet?.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                snippet?.status === 'changes_requested' ? 'bg-red-900/50 text-red-400' :
                'bg-yellow-900/50 text-yellow-400'
              }`}>
                {snippet?.status?.replace('_', ' ')}
              </span>
              {snippet.reviews && snippet.reviews.length > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  {getReviewStats(snippet.reviews).pending > 0 && (
                    <span className="px-2 py-1 rounded-full bg-yellow-900/50 text-yellow-400">
                      {getReviewStats(snippet.reviews).pending} pending
                    </span>
                  )}
                  {getReviewStats(snippet.reviews).approved > 0 && (
                    <span className="px-2 py-1 rounded-full bg-green-900/50 text-green-400">
                      {getReviewStats(snippet.reviews).approved} approved
                    </span>
                  )}
                  {getReviewStats(snippet.reviews).changes_requested > 0 && (
                    <span className="px-2 py-1 rounded-full bg-red-900/50 text-red-400">
                      {getReviewStats(snippet.reviews).changes_requested} changes needed
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Section - Takes up 2 columns */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl shadow-xl overflow-hidden">
        <div className="relative">
            {/* Controls */}
            <div className="absolute right-4 top-4 flex items-center space-x-2 z-10">
            <button
              onClick={() => setShowComments(!showComments)}
                className={`p-2 rounded-lg transition-colors ${
                  showComments 
                    ? 'bg-blue-600/30 text-blue-400 hover:bg-blue-600/40' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
              title={showComments ? "Hide comments" : "Show comments"}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFontSize(prev => Math.max(prev - 2, 10))}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400"
              title="Decrease font size"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFontSize(prev => Math.min(prev + 2, 20))}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400"
              title="Increase font size"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

            {/* Code Display */}
            <SyntaxHighlighter
              language={snippet?.language?.toLowerCase()}
              style={vs}
              customStyle={{ fontSize: `${fontSize}px`, padding: '2rem' }}
              showLineNumbers
              wrapLines
              lineProps={lineNumber => ({
                style: { cursor: 'pointer' },
                onClick: () => user && setSelectedLine(lineNumber)
              })}
            >
              {snippet?.code_content || ''}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Sidebar - Takes up 1 column */}
        <div className="space-y-6">
          {/* Review Section */}
          {user && user.id !== snippet?.user_id && (
            <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                  <span className="font-semibold text-white">Review Code</span>
                </div>
                {showReviewForm ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: showReviewForm ? 'auto' : 0,
                  opacity: showReviewForm ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Provide constructive feedback..."
                    rows={6}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleReviewSubmit('approved')}
                      disabled={submittingReview || !reviewContent.trim()}
                      className="w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200
                        bg-green-600/20 text-green-400 hover:bg-green-600/30 
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? (
                        <Loader className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        <span className="flex items-center justify-center">
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleReviewSubmit('changes_requested')}
                      disabled={submittingReview || !reviewContent.trim()}
                      className="w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200
                        bg-red-600/20 text-red-400 hover:bg-red-600/30 
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? (
                        <Loader className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        <span className="flex items-center justify-center">
                          <X className="w-4 h-4 mr-2" />
                          Request Changes
                        </span>
                      )}
                    </button>
                  </div>

                  {(error || message) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg flex items-start text-sm ${
                        error 
                          ? 'bg-red-900/50 border border-red-500/50' 
                          : 'bg-green-900/50 border border-green-500/50'
                      }`}
                    >
                      {error ? (
                        <AlertCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                      ) : (
                        <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      )}
                      <span className={error ? 'text-red-200' : 'text-green-200'}>
                        {error || message}
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* Comments Section */}
            {showComments && (
            <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-medium text-white flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-blue-400" />
                    Comments
                  </h3>
              </div>
              <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center">No comments yet</p>
                ) : (
                  comments.map(comment => (
                      <div key={comment.id} className="bg-gray-900 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center text-sm text-gray-400">
                            <span>Line {comment.line_number}</span>
                            <span className="mx-2">•</span>
                            <span>{comment.username}</span>
                          </div>
                          {user?.id === comment.user_id && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditedComment(comment.content);
                                }}
                                className="text-gray-400 hover:text-blue-400"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {editingCommentId === comment.id ? (
                          <div className="mt-2">
                            <textarea
                              value={editedComment}
                              onChange={(e) => setEditedComment(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                              rows={3}
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditedComment('');
                                }}
                                className="px-3 py-1 text-sm text-gray-400 hover:text-gray-300"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleEditComment(comment.id)}
                                className="px-3 py-1 text-sm bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-white text-sm">{comment.content}</p>
                        )}
                      </div>
                  ))
                )}
              </div>
              </div>
            )}
        </div>
          </div>

      {/* Add Comment Form - Floating */}
          <AnimatePresence>
            {selectedLine && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-lg bg-gray-900 rounded-lg shadow-xl border border-gray-700 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Add comment for line {selectedLine}
                  </span>
                  <button
                    onClick={() => setSelectedLine(null)}
                    className="text-gray-500 hover:text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-start space-x-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment..."
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <button
                    onClick={handleComment}
                    disabled={submittingComment || !newComment.trim()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingComment ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

      {/* Review Display Section */}
      {snippet.reviews && snippet.reviews.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Reviews</h3>
          <div className="space-y-4">
            {snippet.reviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={review.reviewer_avatar_url || '/default-avatar.png'}
                      alt={review.reviewer_username}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-white font-medium">
                      {review.reviewer_username}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    review.status === 'approved' 
                      ? 'bg-green-900/50 text-green-400' 
                      : 'bg-red-900/50 text-red-400'
                  }`}>
                    {review.status === 'approved' ? 'Approved' : 'Changes Requested'}
                  </span>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{review.comment}</p>
                <div className="mt-2 text-sm text-gray-500">
                  {format(new Date(review.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}