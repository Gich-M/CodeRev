import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Comment } from '../../types';

interface CodeViewerProps {
  content: string;
  language: string;
  comments?: Comment[];
  onLineClick: (lineNumber: number) => void;
}

export function CodeViewer({
  content,
  language,
  comments = [],
  onLineClick
}: CodeViewerProps) {
  const [fontSize, setFontSize] = useState(14);

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 flex items-center space-x-2 z-10">
        <button
          onClick={() => setFontSize(prev => Math.max(prev - 2, 10))}
          className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400"
          title="Decrease font size"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setFontSize(prev => Math.min(prev + 2, 20))}
          className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400"
          title="Increase font size"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      <SyntaxHighlighter
        language={language?.toLowerCase()}
        style={vs}
        customStyle={{ fontSize: `${fontSize}px`, padding: '2rem' }}
        showLineNumbers
        wrapLines
        lineProps={lineNumber => ({
          style: { 
            cursor: 'pointer',
            backgroundColor: comments.some(c => c.line_number === lineNumber)
              ? 'rgba(59, 130, 246, 0.1)'
              : undefined
          },
          onClick: () => onLineClick(lineNumber)
        })}
      >
        {content || ''}
      </SyntaxHighlighter>
    </div>
  );
}