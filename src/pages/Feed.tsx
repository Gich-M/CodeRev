import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { FeedItem } from '../components/FeedItem';
import { Loader } from '../components/Loader';
import type { FeedItem as FeedItemType } from '../types/feed';
import { ArrowLeft, ChevronLeft, ChevronRight, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeedProps {
  initialSortBy?: 'newest' | 'oldest' | 'most_reviews' | 'needs_review';
  initialFilterBy?: 'all' | 'pending' | 'completed' | 'my_submissions' | 'changes_requested';
  hideFilters?: boolean;
  showBackButton?: boolean;
  backTo?: string;
}

export function Feed({ 
  initialSortBy = 'newest',
  initialFilterBy = 'all',
  hideFilters = false,
  showBackButton = false,
  backTo = '/feed'
}: FeedProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<FeedItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [filterBy, setFilterBy] = useState(initialFilterBy);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const observerTarget = useRef(null);
  const navigate = useNavigate();
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  
  const SUPPORTED_LANGUAGES = [
    'javascript',
    'typescript',
    'python',
    'java',
    'cpp',
    'csharp',
    'go',
    'rust',
    'php',
    'ruby',
    'swift',
    'kotlin'
  ].sort();

  const fetchFeedData = async () => {
    try {
      console.log('Fetching feed...');
      let query = supabase
        .from('feed_items')
        .select(`
          *,
          user:profiles!feed_items_user_id_fkey(*),
          code_snippet:code_snippets!feed_items_code_snippet_id_fkey(
            id,
            title,
            description,
            language,
            status,
            review_count,
            comment_count,
            external_link
          )
        `, { count: 'exact' });

      // First ensure we only get items with code snippets for status-based filters
      if (filterBy !== 'all' || languageFilter !== 'all') {
        query = query.not('code_snippet', 'is', null);
      }

      // Apply language filter
      if (languageFilter !== 'all') {
        query = query.eq('code_snippet.language', languageFilter);
      }

      // Apply filters
      switch (filterBy) {
        case 'pending':
          query = query.eq('code_snippet.status', 'pending');
          break;
        case 'completed':
          query = query.eq('code_snippet.status', 'approved');
          break;
        case 'changes_requested':
          query = query.eq('code_snippet.status', 'changes_requested');
          break;
        case 'my_submissions':
          if (user) {
            query = query.eq('code_snippet.user_id', user.id);
          }
          break;
        // 'all' case doesn't need additional filtering
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'most_reviews':
          query = query.order('code_snippet(review_count)', { ascending: false, nullsLast: true });
          break;
        case 'needs_review':
          query = query
            .eq('code_snippet.status', 'pending')
            .order('created_at', { ascending: false });
          break;
      }

      // Add pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      // Normalize status values in the response
      const normalizedData = data?.map(item => ({
        ...item,
        code_snippet: item.code_snippet ? {
          ...item.code_snippet,
          status: item.code_snippet.status === 'completed' ? 'approved' : item.code_snippet.status
        } : null
      }));

      setItems(normalizedData || []);
      setTotalItems(count || 0);
      setError(null);
    } catch (error) {
      console.error('Error fetching feed:', error);
      setError('Failed to load feed items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedData();

    // Set up real-time subscription
    const subscription = supabase
      .channel('feed-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'code_snippets'
        },
        () => {
          fetchFeedData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sortBy, filterBy, languageFilter, user, currentPage, pageSize]);

  const handleDeleteItem = async (itemId: string, referenceId?: string) => {
    try {
      const { error } = await supabase
        .from('feed_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button
              onClick={() => navigate(backTo)}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          )}
          {!hideFilters && <h1 className="text-2xl font-bold text-white">Code Review Feed</h1>}
        </div>
        
        {!hideFilters && (
          <div className="flex flex-wrap gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-sm text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_reviews">Most Reviews</option>
              <option value="needs_review">Needs Review</option>
            </select>

            <select
              value={filterBy}
              onChange={(e) => {
                setFilterBy(e.target.value as typeof filterBy);
                setCurrentPage(1);
              }}
              className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-sm text-white"
            >
              <option value="all">All Submissions</option>
              <option value="pending">Pending Review</option>
              <option value="completed">Approved</option>
              <option value="changes_requested">Changes Requested</option>
              {user && <option value="my_submissions">My Submissions</option>}
            </select>

            <div className="relative">
              <select
                value={languageFilter}
                onChange={(e) => {
                  setLanguageFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-gray-800 border border-gray-700 rounded-md pl-9 pr-3 py-1 text-sm text-white appearance-none"
              >
                <option value="all">All Languages</option>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
              <Code2 className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-sm text-white"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {items.map((item) => (
              <FeedItem 
                key={item.id} 
                item={item}
                onDelete={handleDeleteItem}
                currentUserId={user?.id}
              />
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No items to display
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-gray-400">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 