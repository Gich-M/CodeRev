import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  MessageSquare, 
  Clock, 
  Star,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface Stats {
  totalSnippets: number;
  totalReviews: number;
  pendingReviews: number;
  reputationPoints: number;
  reviewStreak: number;
  completionRate: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalSnippets: 0,
    totalReviews: 0,
    pendingReviews: 0,
    reputationPoints: 0,
    reviewStreak: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [snippetsData, reviewsData, pendingData, profileData] = await Promise.all([
        supabase
          .from('code_snippets')
          .select('id, status')
          .eq('user_id', user?.id),

        supabase
          .from('reviews')
          .select('id')
          .eq('reviewer_id', user?.id),

        supabase
          .from('code_snippets')
          .select('id', { count: 'exact' })
          .eq('status', 'pending'),

        supabase
          .from('profiles')
          .select('reputation_points, weekly_review_streak')
          .eq('id', user?.id)
          .single()
      ]);

      const completedSnippets = snippetsData.data?.filter(s => s.status === 'completed').length || 0;
      const totalSnippets = snippetsData.data?.length || 0;

      setStats({
        totalSnippets: totalSnippets,
        totalReviews: reviewsData.data?.length || 0,
        pendingReviews: pendingData.count || 0,
        reputationPoints: profileData.data?.reputation_points || 0,
        reviewStreak: profileData.data?.weekly_review_streak || 0,
        completionRate: totalSnippets ? (completedSnippets / totalSnippets) * 100 : 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Code Submissions</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalSnippets}</h3>
            </div>
            <Code2 className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Reviews Given</p>
              <h3 className="text-2xl font-bold text-white">{stats.totalReviews}</h3>
            </div>
            <MessageSquare className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Pending Reviews</p>
              <h3 className="text-2xl font-bold text-white">{stats.pendingReviews}</h3>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Achievements and Completion Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Achievements</h3>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-gray-300">Reputation Points</span>
            </div>
            <span className="text-xl font-bold text-white">{stats.reputationPoints}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-gray-300">Review Streak</span>
            </div>
            <span className="text-xl font-bold text-white">{stats.reviewStreak} days</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Completion Rate</h3>
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  className="text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  strokeDasharray={`${stats.completionRate * 3.51}, 351`}
                  className="text-blue-400"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {Math.round(stats.completionRate)}%
                </span>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-center">
            of your submissions have been completed
          </p>
        </motion.div>
      </div>
    </div>
  );
}