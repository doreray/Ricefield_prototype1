import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { useUser } from '@/contexts/UserContext'; // To get the user data
import PostItem from './PostItem';
import ReplyForm from './ReplyForm';

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
  parentId?: string; // Optional field for parent post (if it's a reply)
}

interface ReplyPanelProps {
  selectedPost: Post; // The selected post that was clicked for replying
  setSelectedPost: (post: Post | null) => void; // Function to go back to normal posts
}

const ReplyPanel: React.FC<ReplyPanelProps> = ({ selectedPost, setSelectedPost }) => {
  const { user } = useUser();
  const [replies, setReplies] = useState<Post[]>([]);

  // Fetch replies for the selected post from the replies subcollection
  useEffect(() => {
    const repliesRef = collection(db, 'spaces', selectedPost.space, 'posts', selectedPost.id, 'replies');

    const unsubscribeReplies = onSnapshot(repliesRef, (snapshot) => {
      const repliesData: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        space: selectedPost.space, // Ensure space is included in the replies
      })) as Post[];

      setReplies(repliesData);
    });

    return () => {
      unsubscribeReplies(); // Clean up the subscription
    };
  }, [selectedPost]);

  const handleReplyClick = () => {
    // If you want to handle anything specific when replying to the post, you can add logic here.
    console.log('Replying to post:', selectedPost);
  };

  return (
    <div className="flex flex-col space-y-2 px-4 py-6 overflow-hidden">
      <div className='bg-white px-4 py-2 rounded-lg border border-slate-200 flex space-x-2 items-center'>
        <img className='hover:cursor-pointer h-5' 
          src='/assets/icons/go_back_icon.svg'
          onClick={() => setSelectedPost(null)} />
        <div className='font-bold text-lg hover:cursor-pointer'>{selectedPost.title}</div>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1 py-1 px-1">
        {/* Display the selected post */}
        <PostItem
          post={selectedPost}
          currentUser={user!}
          setFilteredSpace={() => {}}
          onReplyClick={handleReplyClick} // Pass onReplyClick to PostItem
        />

        {/* Reply Form */}
        <ReplyForm 
          parentPostId={selectedPost.id} 
          space={selectedPost.space} 
          postOwnerUsername={selectedPost.user?.username || 'unknown'} 
        />

        {/* Display the replies */}
        {replies.length > 0 && (
          <div className="space-y-2 mt-4">
            {replies.map((reply) => (
              <PostItem
                key={reply.id}
                post={reply}
                currentUser={user!}
                setFilteredSpace={() => {}}
                onReplyClick={handleReplyClick} // Pass onReplyClick to reply PostItem
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplyPanel;
