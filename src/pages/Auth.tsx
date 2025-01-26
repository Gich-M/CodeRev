import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { AuthInput } from '../components/AuthInput';
import { AUTH_MODES, AUTH_MESSAGES, type AuthMode } from '../constants/auth';

interface AuthState {
  email: string;
  password: string;
  name: string;
}

export function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [authMode, setAuthMode] = useState<AuthMode>(
    searchParams.get('signup') === 'true' ? AUTH_MODES.SIGN_UP : AUTH_MODES.SIGN_IN
  );
  
  const [formState, setFormState] = useState<AuthState>({
    email: '',
    password: '',
    name: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    setAuthMode(searchParams.get('signup') === 'true' ? AUTH_MODES.SIGN_UP : AUTH_MODES.SIGN_IN);
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (authMode === AUTH_MODES.SIGN_IN) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });
        if (error) throw error;
        handleAuthSuccess();
      } else if (authMode === AUTH_MODES.SIGN_UP) {
        const { error } = await supabase.auth.signUp({
          email: formState.email,
          password: formState.password,
          options: {
            data: {
              name: formState.name,
            },
          },
        });
        if (error) throw error;
        setMessage(AUTH_MESSAGES.CHECK_EMAIL);
        handleAuthSuccess();
      } else if (authMode === AUTH_MODES.FORGOT_PASSWORD) {
        const { error } = await supabase.auth.resetPasswordForEmail(formState.email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        setMessage(AUTH_MESSAGES.PASSWORD_RESET);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    const newMode = authMode === AUTH_MODES.SIGN_IN ? AUTH_MODES.SIGN_UP : AUTH_MODES.SIGN_IN;
    setAuthMode(newMode);
    // Update URL without full page reload
    const newUrl = newMode === AUTH_MODES.SIGN_UP ? '/auth?signup=true' : '/auth';
    window.history.replaceState({}, '', newUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl"
      >
        {authMode === AUTH_MODES.FORGOT_PASSWORD ? (
          <>
            <button
              onClick={() => setAuthMode(AUTH_MODES.SIGN_IN)}
              className="flex items-center text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </button>
            <h2 className="text-center text-3xl font-extrabold text-white">
              Reset Password
            </h2>
          </>
        ) : (
          <h2 className="text-center text-3xl font-extrabold text-white">
            {authMode === AUTH_MODES.SIGN_UP ? 'Create Account' : 'Sign In'}
          </h2>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {authMode === AUTH_MODES.SIGN_UP && (
            <AuthInput
              id="name"
              type="text"
              value={formState.name}
              onChange={handleInputChange}
              label="Name"
              icon={User}
            />
          )}

          <AuthInput
            id="email"
            type="email"
            value={formState.email}
            onChange={handleInputChange}
            label="Email"
            icon={Mail}
          />

          {authMode !== AUTH_MODES.FORGOT_PASSWORD && (
            <AuthInput
              id="password"
              type="password"
              value={formState.password}
              onChange={handleInputChange}
              label="Password"
              icon={Lock}
            />
          )}

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          {message && (
            <div className="text-green-500 text-sm">{message}</div>
          )}

          {authMode !== AUTH_MODES.FORGOT_PASSWORD && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-500 hover:text-blue-400"
              >
                {authMode === AUTH_MODES.SIGN_UP ? 'Already have an account?' : "Don't have an account?"}
              </button>
              {authMode === AUTH_MODES.SIGN_IN && (
                <button
                  type="button"
                  onClick={() => setAuthMode(AUTH_MODES.FORGOT_PASSWORD)}
                  className="text-blue-500 hover:text-blue-400"
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : authMode === AUTH_MODES.SIGN_UP ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}