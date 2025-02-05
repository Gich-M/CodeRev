import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, MessageSquare, Clock, Filter, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  language: string;
  created_at: string;
  user: {
    username: string;
  };
}

export function ReviewCode() {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('all');

  useEffect(() => {
    if (user) {
      fetchSnippetsForReview();
    }

    // Add real-time subscription
    const subscription = supabase
      .channel('snippets')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'code_snippets'
        }, 
        () => {
          fetchSnippetsForReview();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, language]);

  const fetchSnippetsForReview = async () => {
    try {
      let query = supabase
        .from('code_snippets')
        .select(`
          *,
          user:profiles(username),
          reviews (
            id,
            status,
            reviewer_id
          )
        `)
        .eq('status', 'pending')
        .neq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (language !== 'all') {
        query = query.eq('language', language);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSnippets(data || []);
    } catch (error) {
      console.error('Error fetching snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSnippets = snippets.filter(snippet =>
    snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Review Code</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Languages</option>
            <option value="JavaScript">JavaScript</option>
            <option value="TypeScript">TypeScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
            <option value="C#">C#</option>
            <option value="PHP">PHP</option>
            <option value="Ruby">Ruby</option>
            <option value="Swift">Swift</option>
            <option value="Go">Go</option>
            <option value="Rust">Rust</option>
            <option value="Kotlin">Kotlin</option>
            <option value="SQL">SQL</option>
            <option value="HTML">HTML</option>
            <option value="CSS">CSS</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredSnippets.map((snippet, index) => (
            <motion.div
              key={snippet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    to={`/snippet/${snippet.id}`}
                    className="text-xl font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    {snippet.title}
                  </Link>
                  <p className="text-gray-600 mt-2">{snippet.description}</p>
                </div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {snippet.language}
                </span>
              </div>
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4" />
                  <span>By {snippet.user.username}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(snippet.created_at).toLocaleDateString()}</span>
                </div>
                <Link
                  to={`/snippet/${snippet.id}`}
                  className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Review Code
                </Link>
              </div>
            </motion.div>
          ))}

          {filteredSnippets.length === 0 && (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <Code2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No snippets to review</h3>
              <p className="mt-2 text-gray-500">
                All code snippets have been reviewed. Check back later!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}