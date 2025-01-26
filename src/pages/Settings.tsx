import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Bell, 
  Code2, 
  User, 
  Shield, 
  X, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [settings, setSettings] = useState({
    // Notification Preferences
    reviewNotifications: true,
    mentionNotifications: true,
    achievementNotifications: true,
    emailDigest: true,

    // Code Review Preferences
    defaultLanguage: 'javascript',
    codeTheme: 'vs-dark',
    tabSize: '2',
    fontSize: '14',
    autoSave: true,
    showLineNumbers: true,

    // Privacy Settings
    showEmail: false,
    showStats: true,
    allowMentions: true
  });

  const handleChange = (name: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          id: existingSettings?.id,
          user_id: user.id,
          settings: settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg';
      successMessage.textContent = 'Settings saved successfully!';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg';
      errorMessage.textContent = 'Failed to save settings. Please try again.';
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !confirmChecked || deleteConfirmText !== user.email) {
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg';
      errorMessage.textContent = 'Please confirm deletion by checking the box and typing your email.';
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 3000);
      return;
    }

    setLoading(true);

    try {
      console.log('Starting account deletion for user:', user.id);

      // First sign out to invalidate the session
      await signOut();

      // Then delete the user data
      const { error: deleteError } = await supabase
        .rpc('delete_user_data', {
          target_user_id: user.id
        });

      if (deleteError) {
        console.error('Delete function error:', deleteError);
        throw deleteError;
      }

      console.log('User data deleted successfully');
      
      // Navigate home
      navigate('/', { replace: true });

    } catch (error) {
      console.error('Full error object:', error);
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
      errorMessage.textContent = `Failed to delete account: ${error.message || 'Unknown error'}`;
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 5000);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-xl relative"
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 right-6 p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Notification Settings */}
            <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Bell className="w-5 h-5 mr-2" />
                Notification Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <label className="text-gray-300">Review Notifications</label>
                  <input
                    type="checkbox"
                    checked={settings.reviewNotifications}
                    onChange={(e) => handleChange('reviewNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Mention Notifications</label>
                  <input
                    type="checkbox"
                    checked={settings.mentionNotifications}
                    onChange={(e) => handleChange('mentionNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Achievement Notifications</label>
                <input
                  type="checkbox"
                    checked={settings.achievementNotifications}
                    onChange={(e) => handleChange('achievementNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                  <label className="text-gray-300">Weekly Email Digest</label>
                <input
                  type="checkbox"
                    checked={settings.emailDigest}
                    onChange={(e) => handleChange('emailDigest', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                />
              </div>
            </div>
          </section>

            {/* Code Review Settings */}
            <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                <Code2 className="w-5 h-5 mr-2" />
                Code Review Preferences
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Default Language</label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => handleChange('defaultLanguage', e.target.value)}
                      className="w-full bg-gray-700 border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Editor Theme</label>
                  <select
                    value={settings.codeTheme}
                    onChange={(e) => handleChange('codeTheme', e.target.value)}
                      className="w-full bg-gray-700 border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                  >
                      <option value="vs-dark">Dark</option>
                    <option value="vs-light">Light</option>
                      <option value="github-dark">GitHub Dark</option>
                    <option value="monokai">Monokai</option>
                  </select>
                </div>
                </div>
              </div>
            </section>

            {/* Privacy Settings */}
            <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                <Shield className="w-5 h-5 mr-2" />
                Privacy Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Show Email on Profile</label>
                  <input
                    type="checkbox"
                    checked={settings.showEmail}
                    onChange={(e) => handleChange('showEmail', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Show Statistics on Profile</label>
                  <input
                    type="checkbox"
                    checked={settings.showStats}
                    onChange={(e) => handleChange('showStats', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Allow @mentions</label>
                  <input
                    type="checkbox"
                    checked={settings.allowMentions}
                    onChange={(e) => handleChange('allowMentions', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                  />
              </div>
            </div>
          </section>

            {/* Account Deletion */}
            <section className="bg-red-500/10 rounded-xl p-6 border border-red-500/20">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-red-400">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Danger Zone
            </h2>
              <p className="text-gray-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center px-4 py-2 bg-red-600/20 text-red-400 rounded-md hover:bg-red-600/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                      id="confirmDelete"
                      checked={confirmChecked}
                      onChange={(e) => setConfirmChecked(e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded"
                    />
                    <label htmlFor="confirmDelete" className="text-gray-300">
                      I understand that this action cannot be undone
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Type your email ({user?.email}) to confirm:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                      placeholder="your@email.com"
              />
            </div>

                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={loading || !confirmChecked || deleteConfirmText !== user?.email}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {loading ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setConfirmChecked(false);
                        setDeleteConfirmText('');
                      }}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
        </div>
      </motion.div>
    </div>
  );
}