// src/components/PostItem.tsx
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface User {
    firstName: string;
    lastName: string;
    username: string;
    uid: string;
    school: string;
  }
  
interface Post {
  id: string;
  owner: string;
  content: string;
  timestamp: { seconds: number };
  space: string;
  title: string;
  user: User;
}

interface PostItemProps {
  post: Post;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);

  return (
    <div key={post.id} className="bg-white p-4 rounded-lg border border-slate-200">
      <div className="flex items-center space-x-2">
        <img src="/assets/icons/pfp on post.svg" alt="Profile" className="h-10 cursor-pointer" />
        <div className="flex items-center justify-between w-full">
          <div>
            <div className="flex items-center space-x-1">
              <div className="font-bold cursor-pointer">
                {post.user?.firstName || 'Anonymous'} {post.user?.lastName || ''}
              </div>
              <div className="text-sm text-primary-500">@{post.user?.username || 'unknown'}</div>
              <div className="text-sm text-gray-400">
                • {post.timestamp ? formatDistanceToNow(new Date(post.timestamp.seconds * 1000)) : 'Unknown time'}
              </div>
            </div>
            <div className="text-sm">{post.user?.school || 'unknown'}</div>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="border border-primary-500 h-7 px-6 rounded-full text-primary-500 font-bold bg-white hover:bg-primary-500 hover:text-white">
              {post.space.charAt(0).toUpperCase() + post.space.slice(1)}
            </Button>
            <img
              onMouseEnter={() => setHoveredPostId(post.id)}
              onMouseLeave={() => setHoveredPostId(null)}
              src={hoveredPostId === post.id ? '/assets/icons/three dot (hover).svg' : '/assets/icons/three dot (default).svg'}
              alt="More"
              className="h-8 w-8 cursor-pointer"
            />
          </div>
        </div>
      </div>
      <div className="font-bold text-xl mt-2 break-words px-12">{post.title || ''}</div>
      <div className="break-words mt-2 px-12">{post.content}</div>
      <div className="mt-2 text-xs text-gray-500">
        {post.timestamp ? new Date(post.timestamp.seconds * 1000).toLocaleString() : 'Unknown Time'}
      </div>
    </div>
  );
};

export default PostItem;
