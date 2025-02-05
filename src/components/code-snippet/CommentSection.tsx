import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Comment } from '../../types/code-snippet';
import { Edit2, Eye, Trash2 } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface CommentSectionProps {
  snippetId: string;
  selectedLine: number | null;
  position: { x: number; y: number };
  onClose: () => void;
}

export function CommentSection({ snippetId, selectedLine, position, onClose }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [formPosition, setFormPosition] = useState(position);
  const [showComments, setShowComments] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [snippetId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('code_snippet_id', snippetId);
    
    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }
    setComments(data || []);
  };

  const handleSubmit = async () => {
    if (!user || !content.trim() || !selectedLine) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          code_snippet_id: snippetId,
          content,
          line_number: selectedLine,
          user_id: user.id
        });

      if (error) throw error;
      
      setContent('');
      await fetchComments();
      onClose();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    const handleMouseMove = (e: MouseEvent) => {
      setFormPosition({
        x: e.clientX - offsetX,
        y: e.clientY - offsetY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Comments ({comments.length})
        </h3>
        <button
          onClick={() => setShowComments(!showComments)}
          className={`p-2 rounded-lg transition-colors ${
            showComments 
              ? 'bg-blue-600/30 text-blue-400 hover:bg-blue-600/40' 
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
          }`}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {selectedLine && (
        <div
          style={{
            position: 'fixed',
            left: formPosition.x,
            top: formPosition.y,
            zIndex: 1000
          }}
          className="w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700"
        >
          <div
            onMouseDown={handleMouseDown}
            className="p-2 bg-gray-700 rounded-t-lg cursor-move flex justify-between items-center"
          >
            <span className="text-sm text-gray-300">Line {selectedLine}</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              rows={3}
              placeholder="Add your comment..."
            />
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={onClose}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`space-y-4 ${showComments ? '' : 'hidden'}`}>
        {comments.map(comment => (
          <div key={comment.id} className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <span className="text-sm text-gray-400">Line {comment.line_number}</span>
          {user?.id === comment.user_id && (
            <div className="flex gap-2">
          <button
            onClick={async () => {
              await supabase.from('comments').delete().eq('id', comment.id);
              fetchComments();
            }}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </button>
            <button
            onClick={async () => {
              const newContent = window.prompt('Edit comment:', comment.content);
              if (newContent && newContent !== comment.content) {
              const { error } = await supabase
                .from('comments')
                .update({ content: newContent })
                .eq('id', comment.id);
              
              if (error) {
                console.error('Error updating comment:', error);
              } else {
                fetchComments();
              }
              }
            }}
            className="text-blue-400 hover:text-blue-300"
            >
            <Edit2 className="w-4 h-4" />
            </button>
            </div>
          )}
        </div>
        <p className="mt-2 text-white">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}