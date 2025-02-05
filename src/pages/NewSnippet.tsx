import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code2, 
  Link as LinkIcon, 
  X, 
  AlertCircle,
  Check,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const SUPPORTED_LANGUAGES = [
  'C',
  'C#',
  'C++',
  'Go',
  'Java',
  'Javascript',
  'Kotlin',
  'PHP',
  'Python',
  'Ruby',
  'Rust',
  'Swift',
  'Typescript'
];

interface SupabaseError {
  message: string;
  details: string | null;
  hint: string | null;
  code: string;
}

export function NewSnippet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: '',
    codeContent: '',
    externalLink: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.codeContent.trim()) {
        throw new Error('Code content is required');
      }

      const { data: snippet, error: snippetError } = await supabase
        .from('code_snippets')
        .insert([
          {
            user_id: user?.id,
            title: formData.title,
            description: formData.description,
            language: formData.language,
            code_content: formData.codeContent,
            external_link: formData.externalLink || null,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (snippetError) throw snippetError;

      // Create feed item for the new snippet
      const { error: feedError } = await supabase.rpc('create_feed_item', {
        p_type: 'new_submission',
        p_title: formData.title,
        p_description: formData.description,
        p_reference_type: 'code_snippet',
        p_reference_id: snippet.id,
        p_code_snippet_id: snippet.id,
        p_metadata: {
          language: formData.language,
          user_name: user?.email?.split('@')[0] || 'Anonymous'
        },
        p_visibility: ['public'],
        p_cohort_id: null
      });

      if (feedError) {
        console.error('Feed error:', feedError);
        throw feedError;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/snippet/${snippet.id}`);
      }, 1500);

    } catch (err) {
      console.error('Error creating snippet:', err);
      const error = err as SupabaseError;
      setError(error.message || 'An error occurred while creating the snippet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-xl shadow-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Code2 className="w-5 h-5 mr-2" />
                Submit Code for Review
              </h2>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                required
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Authentication Implementation"
              />
            </div>

            {/* Language Selection */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-300">
                Programming Language
              </label>
              <select
                id="language"
                required
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="">Select a language</option>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Code Content */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-300">
                Code
              </label>
              <textarea
                id="code"
                required
                rows={12}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.codeContent}
                onChange={(e) => setFormData({ ...formData, codeContent: e.target.value })}
                placeholder="Paste your code here..."
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what your code does and what kind of feedback you're looking for..."
              />
            </div>

            {/* External Link (Optional) */}
            <div>
              <label htmlFor="externalLink" className="block text-sm font-medium text-gray-300">
                External Link (Optional)
                <span className="ml-2 text-xs text-gray-400">
                  GitHub repository, CodeSandbox, etc.
                </span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="externalLink"
                  className="block w-full bg-gray-700 border border-gray-600 rounded-md pl-10 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.externalLink}
                  onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/50 border border-red-500/50 rounded-md p-3 flex items-start"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-red-200 text-sm">{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="ml-auto flex-shrink-0"
                >
                  <X className="w-5 h-5 text-red-500 hover:text-red-400" />
                </button>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-900/50 border border-green-500/50 rounded-md p-3 flex items-center"
              >
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-200 text-sm">
                  Code submitted successfully! Redirecting...
                </span>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || success}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Code2 className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Submitting...' : 'Submit Code'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}