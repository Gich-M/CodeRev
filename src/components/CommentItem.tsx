// src/components/CommentItem.tsx
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface CommentItemProps {
  comment: Comment;
  isEditing: boolean;
  editedComment: string;
  onEditClick: (id: string, content: string) => void;
  onDeleteClick: (id: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onCommentChange: (content: string) => void;
  isOwner: boolean;
}

export function CommentItem({
  comment,
  isEditing,
  editedComment,
  onEditClick,
  onDeleteClick,
  onSaveEdit,
  onCancelEdit,
  onCommentChange,
  isOwner
}: CommentItemProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <div className="flex justify-between mb-2">
        <div className="flex items-center space-x-2">
          <img
            src={comment.avatar_url || '/default-avatar.png'}
            alt={comment.username}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-white text-sm">{comment.username}</span>
          {comment.line_number && (
            <span className="text-gray-400 text-sm">Line {comment.line_number}</span>
          )}
        </div>
        {isOwner && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEditClick(comment.id, comment.content)}
              className="text-gray-400 hover:text-blue-400"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteClick(comment.id)}
              className="text-gray-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editedComment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={onCancelEdit}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => onSaveEdit(comment.id)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-300">{comment.content}</p>
      )}
    </div>
  );
}