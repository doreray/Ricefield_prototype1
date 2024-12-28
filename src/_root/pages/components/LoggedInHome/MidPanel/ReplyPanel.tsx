import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useUser } from '@/contexts/UserContext'; // To get the user data
import PostItem from './PostItem';

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

  // Fetch replies for the selected post
  useEffect(() => {
    const repliesRef = query(
      collection(db, 'spaces', selectedPost.space, 'posts'),
      where('parentId', '==', selectedPost.id) // Fetch replies where parentId matches the selected post
    );

    const unsubscribeReplies = onSnapshot(repliesRef, (snapshot) => {
      const repliesData: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        space: selectedPost.space, // Ensure space is included in the replies
      })) as Post[];

      setReplies(repliesData);
    });

    return () => {
      unsubscribeReplies();
    };
  }, [selectedPost]);

  const handleReplyClick = () => {
    // If you want to handle anything specific when replying to the post, you can add logic here.
    console.log('Replying to post:', selectedPost);
  };

  return (
    <div className="flex flex-col space-y-4 px-4 py-6 overflow-hidden">
      <button className="text-blue-500" onClick={() => setSelectedPost(null)}>
        Back to Posts
      </button>

      <div className="space-y-4 overflow-y-auto flex-1">
          {/* Display the selected post */}
          <PostItem
            post={selectedPost}
            currentUser={user!}
            setFilteredSpace={() => {}}
            onReplyClick={handleReplyClick} // Pass onReplyClick to PostItem
          />

        {/* Display the replies */}
        {replies.length > 0 && (
          <div className="space-y-4 mt-4">
            <h3 className="font-bold text-lg">Replies:</h3>
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
