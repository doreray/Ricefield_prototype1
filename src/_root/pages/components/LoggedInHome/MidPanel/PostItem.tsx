import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import PostVotes from './PostVotes';
import PostMeta from './PostMeta';
import PostActions from './PostActions';
import DeleteConfirmationPopup from './DeleteConfirmationPopup';

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
  timestamp: { seconds: number };
  space: string;
  title: string;
  user: User;
  image?: string;
}

interface PostItemProps {
  post: Post;
  currentUser: User;
  setFilteredSpace: (space: string) => void;
  onReplyClick: (replyId: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  currentUser,
  setFilteredSpace,
  onReplyClick,
}) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [repliesCount, setRepliesCount] = useState<number>(0);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchRepliesCount = async () => {
      try {
        const repliesQuery = query(
          collection(db, 'spaces', post.space, 'posts'),
          where('parentId', '==', post.id)
        );
        const repliesSnapshot = await getDocs(repliesQuery);
        setRepliesCount(repliesSnapshot.size);
      } catch (error) {
        console.error('Error fetching replies count:', error);
      }
    };

    fetchRepliesCount();
  }, [post.id, post.space]);

  const handleReplyClick = () => {
    // Navigate to the post URL when replying
    navigate(`/${post.space}/${post.id}`);
    window.location.reload()
  };

  if (isDeleted) {
    return (
      <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col items-center space-y-4">
        <p className="text-gray-500 font-bold">Your post has been deleted.</p>
      </div>
    );
  }

  return (
    <div key={post.id} className="bg-white p-4 rounded-lg border border-slate-200">
      <PostMeta
        post={post}
        currentUser={currentUser}
        setFilteredSpace={setFilteredSpace}
        onReplyClick={onReplyClick}
        setPostDeleted={setIsDeleted} // Pass the callback to PostMeta
      />
      <div className="font-bold text-xl mt-2 break-words px-12">{post.title || ''}</div>
      <div className="break-words mt-2 px-12">{post.content}</div>
      {post.image && <img className="h-8 mt-2" src={post.image} alt="Post image" />}
      <div className="flex mt-2 px-12 space-x-2">
        <PostVotes post={post} currentUser={currentUser} />
        <div
          className="bg-gray-200 rounded-full flex items-center py-2 px-3 space-x-2 font-bold hover:cursor-pointer"
          onClick={handleReplyClick} // Use handleReplyClick to navigate to post URL
        >
          <img className="h-5" src="/assets/icons/reply.svg" />
          <div className="font-dmsans">{repliesCount}</div>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
