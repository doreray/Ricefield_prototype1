// Post.tsx
import React from 'react';

interface PostProps {
  author: string;
  content: string;
  timestamp: string;
}

const Post: React.FC<PostProps> = ({ author, content, timestamp }) => {
  return (
    <div className="post">
      <div className="post-header">
        <span className="author">{author}</span>
        <span className="timestamp">{timestamp}</span>
      </div>
      <div className="post-content">{content}</div>
    </div>
  );
};

export default Post;
