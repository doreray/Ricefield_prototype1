import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import PostActions from './PostActions';
import { useNavigate } from 'react-router-dom';

interface User {
  first_name: string;
  last_name: string;
  username: string;
  uid: string;
  school: string;
  schoolId: string;
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
  setPostDeleted: (deleted: boolean) => void; // Add this prop
}

const PostMeta: React.FC<PostMetaProps> = ({
  post,
  currentUser,
  setFilteredSpace,
  setPostDeleted, // Receive the prop
}) => {
  const [isPopupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate();

  // Safe check if post.timestamp exists
  const timestamp = post.timestamp
    ? formatDistanceToNow(new Date(post.timestamp.seconds * 1000))
        .replace('less than a minute', '0m')
        .replace(' minutes', 'm')
        .replace(' minute', 'm')
        .replace(' hours', 'h')
        .replace(' hour', 'h')
        .replace(' days', 'd')
        .replace(' day', 'd')
        .replace(' months', 'mo')
        .replace(' years', 'y')
        .replace('about ', '')
    : 'Freshly Cooked';

  return (
    <div className="flex items-center space-x-2">
      <img src="/assets/icons/pfp on post.svg"
      alt="Profile"
      className="h-10 cursor-pointer"
      onClick={() => navigate(`/${post.user?.username}`)}
      />
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-1 h-4 truncate">
            <span
              className="font-bold cursor-pointer truncate"
              style={{
                maxWidth: '40%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
              title={`${post.user?.first_name || 'Anonymous'} ${post.user?.last_name || ''}`}
              onClick={() => navigate(`/${post.user?.username}`)}
            >
              {post.user?.first_name || 'Anonymous'} {post.user?.last_name || ''}
            </span>
            <span
              className="text-primary-500 truncate"
              style={{
                maxWidth: '25%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
              title={`@${post.user?.username || 'unknown'}`}
            >
              @{post.user?.username || 'unknown'}
            </span>
            <span
              className="text-sm text-gray-400 truncate"
              style={{
                maxWidth: '30%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
              title={timestamp}
            >
              • {timestamp}
            </span>
          </div>
          <div
            className="text-sm truncate"
            style={{
              maxWidth: '100%',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
            title={post.user?.school || 'unknown'}
          >
            {post.user?.school || 'unknown'}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setFilteredSpace(post.space)}
            className="hidden xs:flex border border-primary-500 h-7 px-6 rounded-full text-primary-500 font-bold bg-white hover:bg-primary-500 hover:text-white"
          >
            {post.space.charAt(0).toUpperCase() + post.space.slice(1)}
          </Button>
          <PostActions
            post={post}
            currentUser={currentUser}
            isPopupVisible={isPopupVisible}
            setPopupVisible={setPopupVisible}
            setPostDeleted={setPostDeleted} // Pass the callback to PostActions
          />
        </div>
      </div>
    </div>
  );
};

export default PostMeta;
