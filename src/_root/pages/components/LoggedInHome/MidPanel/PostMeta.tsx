import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import PostActions from './PostActions';

interface User {
  first_name: string;
  last_name: string;
  username: string;
  uid: string;
  school: string;
}

interface Post {
  id: string;
  owner: string;
  content: string;
  timestamp: { seconds: number } | null; // Allow null for cases without timestamp
  space: string;
  title: string;
  user: User;
  image?: string;
}

interface PostMetaProps {
  post: Post;
  currentUser: User;
  setFilteredSpace: (space: string) => void;
  onReplyClick: (replyId: string) => void;
}

const PostMeta: React.FC<PostMetaProps> = ({ post, currentUser, setFilteredSpace, onReplyClick }) => {
  const [isPopupVisible, setPopupVisible] = useState(false);

  // Safe check if post.timestamp exists
  const timestamp = post.timestamp ? formatDistanceToNow(new Date(post.timestamp.seconds * 1000)) : 'Unknown time';

  return (
    <div className="flex items-center space-x-2">
      <img src="/assets/icons/pfp on post.svg" alt="Profile" className="h-10 cursor-pointer" />
      <div className="flex items-center justify-between w-full">
        <div>
          <div className="flex items-center space-x-1 h-4">
            <div className="font-bold cursor-pointer">
              {post.user?.first_name || 'Anonymous'} {post.user?.last_name || ''}
            </div>
            <div className="text-primary-500">@{post.user?.username || 'unknown'}</div>
            <div className="text-sm text-gray-400">
            • {post.timestamp
                  ? formatDistanceToNow(new Date(post.timestamp.seconds * 1000))
                      .replace(' minutes', 'm')
                      .replace(' minute', 'm')
                      .replace(' hour', 'h')
                      .replace(' hours', 'h')
                      .replace(' days', 'd')
                      .replace(' day', 'd')
                      .replace(' months', 'mo')
                      .replace(' years', 'y')
                      .replace('about ', '')
                      .replace('less than a minute', '0m')
                      .replace('less than am', '0m')
                  : 'Freshly Cooked'}
            </div>
          </div>
          <div className="text-sm">{post.user?.school || 'unknown'}</div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setFilteredSpace(post.space)}
            className="border border-primary-500 h-7 px-6 rounded-full text-primary-500 font-bold bg-white hover:bg-primary-500 hover:text-white"
          >
            {post.space.charAt(0).toUpperCase() + post.space.slice(1)}
          </Button>
          <PostActions
            post={post}
            currentUser={currentUser}
            isPopupVisible={isPopupVisible}
            setPopupVisible={setPopupVisible}
            onReplyClick={onReplyClick}
          />
        </div>
      </div>
    </div>
  );
};

export default PostMeta;
