import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, MessageSquare, ThumbsUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Feed } from './Feed';

interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  language: string;
  status: 'pending' | 'approved' | 'changes_requested';
  created_at: string;
  _count?: {
    comments: number;
    upvotes: number;
  };
}

export function MySubmissions() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Feed 
        initialFilterBy="my_submissions"
        hideFilters={true}
        showBackButton={true}
        backTo="/feed"
      />
    </div>
  );
}