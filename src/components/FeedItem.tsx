import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, MessageSquare, LinkIcon, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { FeedItem as FeedItemType } from '../types/feed';

interface FeedItemProps {
  item: FeedItemType;
  onDelete?: (itemId: string, referenceId?: string) => void;
  currentUserId?: string;
}

export function FeedItem({ item, onDelete, currentUserId }: FeedItemProps) {
  // Early return if no code snippet and no title
  if (!item.code_snippet && !item.title) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
            <Code2 className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              {item.code_snippet ? (
                <Link
                  to={`/snippet/${item.code_snippet.id}`}
                  className="text-lg font-medium text-white hover:text-blue-400 transition-colors"
                >
                  {item.code_snippet.title}
                </Link>
              ) : (
                <h3 className="text-lg font-medium text-white">{item.title}</h3>
              )}
            </div>
            {item.code_snippet && (
              <div className="ml-4">
                <StatusBadge status={item.code_snippet.status} />
              </div>
            )}
          </div>
          <p className="text-gray-400 mt-1">
            {item.code_snippet?.description || item.description}
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
            {item.user && (
              <span>by <Link 
                to={`/profile/${item.user_id}`}
                className="text-blue-400 hover:text-blue-300 hover:underline"
              >
                {item.user.username}
              </Link></span>
            )}
            {item.code_snippet && (
              <>
                <span className="px-2 py-0.5 rounded-full bg-gray-700">
                  {item.code_snippet.language}
                </span>
                {item.code_snippet.review_count > 0 && (
                  <span className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {item.code_snippet.review_count}
                  </span>
                )}
                {item.code_snippet.external_link && (
                  <a
                    href={item.code_snippet.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-400 hover:text-blue-300"
                  >
                    <LinkIcon className="w-4 h-4 mr-1" />
                    External Link
                  </a>
                )}
              </>
            )}
          </div>
          {item.user_id === currentUserId && onDelete && (
            <button
              onClick={() => onDelete(item.id, item.code_snippet?.id)}
              className="text-red-500 hover:text-red-400 mt-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {item.code_snippet && (
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-400">
          <Link 
            to={`/snippet/${item.code_snippet.id}`}
            className="flex items-center hover:text-blue-400 transition-colors"
          >
            <div className="relative">
              <MessageSquare className="w-4 h-4 mr-1.5" />
              {item.code_snippet.comment_count > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {item.code_snippet.comment_count}
                </span>
              )}
            </div>
            Comments {item.code_snippet.comment_count > 0 && `(${item.code_snippet.comment_count})`}
          </Link>
        </div>
      )}
    </motion.div>
  );
} 