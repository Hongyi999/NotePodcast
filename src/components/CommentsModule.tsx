import { useState, useRef, useEffect } from 'react';
import { Comment } from '../types';
import { formatTime } from '../utils/timeFormatter';
import './CommentsModule.css';

interface CommentsModuleProps {
  comments: Comment[];
  onTimePointClick: (time: number) => void;
}

export function CommentsModule({ comments, onTimePointClick }: CommentsModuleProps) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCommentClick = (comment: Comment) => {
    onTimePointClick(comment.timePoint);
    setHighlightedId(comment.id);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setHighlightedId(null);
      timeoutRef.current = null;
    }, 2000);
  };

  return (
    <div className="comments-module">
      <h2 className="module-title">Audience Comments</h2>

      <div className="comments-list hidden-scrollbar">
        {comments.length === 0 ? (
          <div className="empty-state">No audience comments yet</div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`comment-card ${highlightedId === comment.id ? 'highlighted' : ''}`}
              onClick={() => handleCommentClick(comment)}
            >
              <div className="comment-header">
                <div className="user-info">
                  {comment.avatar ? (
                    <img src={comment.avatar} alt={comment.author} className="user-avatar" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {comment.author?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="user-meta">
                    <span className="user-name">{comment.author || '听众'}</span>
                    <span className="comment-date">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
                {comment.likeCount !== undefined && comment.likeCount > 0 && (
                  <div className="comment-likes">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                    <span>{comment.likeCount}</span>
                  </div>
                )}
              </div>
              
              <div className="comment-content">
                <span className="comment-time">[{formatTime(comment.timePoint)}]</span>
                <p className="comment-text">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
