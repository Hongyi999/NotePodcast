import { useState } from 'react';
import { Comment } from '../types';
import { formatTime } from '../utils/timeFormatter';
import './CommentsModule.css';

interface CommentsModuleProps {
  comments: Comment[];
  onTimePointClick: (time: number) => void;
}

export function CommentsModule({ comments, onTimePointClick }: CommentsModuleProps) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const handleCommentClick = (comment: Comment) => {
    onTimePointClick(comment.timePoint);
    setHighlightedId(comment.id);
    setTimeout(() => setHighlightedId(null), 2000);
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
              <span className="comment-time">[{formatTime(comment.timePoint)}]</span>
              <span className="comment-text">{comment.content}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

