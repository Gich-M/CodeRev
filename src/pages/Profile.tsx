import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Github, Linkedin, Globe, Code2, 
  Star, Trophy, Calendar, Edit2, Save, X, Upload, ThumbsUp, Zap, Target, Award
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/profile';

const EXPERTISE_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const PROGRAMMING_LANGUAGES = [
  'C', 'C#', 'C++', 'Go', 'Java', 'JavaScript', 
  'PHP', 'Python', 'Ruby', 'Rust', 'Swift', 'TypeScript'
];

export function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Get achievements data...
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`...`);

      // Only get auth data if viewing own profile
      let authUser = null;
      if (id === user?.id) {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        authUser = currentUser;
      }

      // Combine all data
      const enrichedProfile = {
        ...profileData,
        email: profileData.email || '', // Use email from profile data
        canEditEmail: id === user?.id && !authUser?.app_metadata?.provider,
        provider: authUser?.app_metadata?.provider,
        user_achievements: achievementsData || []
      };

      setProfile(enrichedProfile);
      setFormData(enrichedProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => {
      const currentLanguages = prev.preferred_languages || [];
      const updated = currentLanguages.includes(language)
        ? currentLanguages.filter(l => l !== language)
        : [...currentLanguages, language];
      return { ...prev, preferred_languages: updated };
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || !event.target.files[0]) return;
      if (!user?.id) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      setUploadingImage(true);

      console.log('Uploading file:', fileName); // Debug log

      // Upload new avatar
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.log('Upload error:', uploadError); // Debug log
        throw uploadError;
      }

      console.log('Upload successful:', uploadData); // Debug log

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl); // Debug log

      // Update profile
      const { data: profileData, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.log('Profile update error:', updateError); // Debug log
        throw updateError;
      }

      console.log('Profile updated:', profileData); // Debug log

      // Update local state with the returned data
      setProfile(profileData);
      setFormData(profileData);

    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData(prev => ({ ...prev, email: newEmail }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // If email was changed and is editable, update it in auth
      if (formData.email !== profile?.email && profile?.canEditEmail) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });

        if (emailError) throw emailError;
      }

      // Update other profile fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          github_url: formData.github_url,
          linkedin_url: formData.linkedin_url,
          website_url: formData.website_url,
          preferred_languages: formData.preferred_languages,
          expertise_level: formData.expertise_level,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Refetch profile to get updated data
      await fetchProfile();
      setIsEditing(false);

    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return <Trophy className="w-6 h-6" />;
      case 'star': return <Star className="w-6 h-6" />;
      case 'code': return <Code2 className="w-6 h-6" />;
      case 'thumbs-up': return <ThumbsUp className="w-6 h-6" />;
      case 'zap': return <Zap className="w-6 h-6" />;
      case 'target': return <Target className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const getAchievementColor = (name: string) => {
    const colors = {
      'First Review': 'blue',
      'Code Master': 'purple',
      'Helpful Reviewer': 'green',
      'Rising Star': 'yellow',
      'Streak Master': 'orange',
      'Community Leader': 'pink'
    };
    return colors[name] || 'blue';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-xl relative"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors"
          aria-label="Close profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="p-8 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                {isOwnProfile && isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <Upload className="w-6 h-6 text-white" />
                  </label>
                )}
              </div>
          <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name || ''}
                      onChange={handleInputChange}
                      className="bg-gray-800 text-white px-3 py-1 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Full Name"
                    />
                    <input
                      type="text"
                      name="username"
                      value={formData.username || ''}
                      onChange={handleInputChange}
                      className="block bg-gray-800 text-gray-400 px-3 py-1 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Username"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-white">{profile?.full_name}</h1>
                    <p className="text-gray-400">@{profile?.username}</p>
                  </>
                )}
              </div>
            </div>
            {isOwnProfile && (
              <div className="mr-14">
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(profile || {});
                      }}
                      className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bio Section */}
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
              rows={3}
            />
          ) : (
            <p className="text-gray-300">{profile?.bio || 'No bio provided'}</p>
          )}
        </div>
        
        {/* Profile Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Details</h2>

            {/* Social Links */}
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleEmailChange}
                      disabled={!profile?.canEditEmail}
                      className={`mt-1 block w-full rounded-md bg-gray-700 border border-gray-600 
                        text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 
                        ${!profile?.canEditEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Github className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="github_url"
                      value={formData.github_url || ''}
                      onChange={handleInputChange}
                      className="flex-1 bg-gray-800 text-white px-3 py-1 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="GitHub URL"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Linkedin className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="linkedin_url"
                      value={formData.linkedin_url || ''}
                      onChange={handleInputChange}
                      className="flex-1 bg-gray-800 text-white px-3 py-1 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="website_url"
                      value={formData.website_url || ''}
                      onChange={handleInputChange}
                      className="flex-1 bg-gray-800 text-white px-3 py-1 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Personal Website"
                    />
                  </div>
                </>
              ) : (
                <>
                  {profile?.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300">{profile.email}</span>
                    </div>
                  )}
                  {profile?.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-300 hover:text-blue-400"
                    >
                      <Github className="w-5 h-5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profile?.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-300 hover:text-blue-400"
                    >
                      <Linkedin className="w-5 h-5" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {profile?.website_url && (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-300 hover:text-blue-400"
                    >
                      <Globe className="w-5 h-5" />
                      <span>Website</span>
                    </a>
                  )}
                </>
              )}
            </div>

            {/* Expertise Level */}
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Expertise Level</h3>
              {isEditing ? (
                <select
                  name="expertise_level"
                  value={formData.expertise_level || 'beginner'}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {EXPERTISE_LEVELS.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-gray-300 capitalize">
                  {profile?.expertise_level || 'Not specified'}
                </div>
              )}
            </div>

            {/* Preferred Languages */}
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Preferred Languages</h3>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {PROGRAMMING_LANGUAGES.map(language => (
                    <button
                      key={language}
                      onClick={() => handleLanguageToggle(language)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        formData.preferred_languages?.includes(language)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile?.preferred_languages?.map(language => (
                    <span
                      key={language}
                      className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Achievements */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Statistics</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Code2 className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Submissions</span>
                </div>
                <span className="text-2xl font-bold text-white">
                  {profile?.total_submissions || 0}
                </span>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Reviews Given</span>
                </div>
                <span className="text-2xl font-bold text-white">
                  {profile?.total_reviews_given || 0}
                </span>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Reputation</span>
                </div>
                <span className="text-2xl font-bold text-white">
                  {profile?.reputation_points || 0}
                </span>
          </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Review Streak</span>
          </div>
                <span className="text-2xl font-bold text-white">
                  {profile?.weekly_review_streak || 0}
                </span>
        </div>
      </div>

            {/* Achievements */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Achievements
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.user_achievements?.length > 0 ? (
                  profile.user_achievements.map((ua: any) => (
                    <motion.div
                      key={ua.achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 flex items-start space-x-4"
                    >
                      <div className={`p-3 rounded-lg bg-${getAchievementColor(ua.achievement.name)}-500/10`}>
                        {getAchievementIcon(ua.achievement.icon_name)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white">
                          {ua.achievement.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {ua.achievement.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-yellow-500">
                            +{ua.achievement.points_value} points
                          </span>
                          <span className="text-xs text-gray-500">
                            • Earned {new Date(ua.earned_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No achievements yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Start reviewing code and submitting snippets to earn achievements!
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}