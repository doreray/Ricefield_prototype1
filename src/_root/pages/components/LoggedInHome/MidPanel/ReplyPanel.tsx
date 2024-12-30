import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
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
  originId?: string;
  reactions?: number; // Number of reactions (both positive and negative)
}

interface ReplyPanelProps {
  selectedPost: Post; // The selected post that was clicked for replying
  setSelectedPost: (post: Post | null) => void; // Function to go back to normal posts
}

const ReplyPanel: React.FC<ReplyPanelProps> = ({ selectedPost, setSelectedPost }) => {
  const { user } = useUser();
  const [replies, setReplies] = useState<Post[]>([]);
  const [originalPostTitle, setOriginalPostTitle] = useState<string | null>(null);

  useEffect(() => {
    // Fetch replies
    const repliesRef = collection(db, 'spaces', selectedPost.space, 'posts');

    const unsubscribeReplies = onSnapshot(repliesRef, (snapshot) => {
      const repliesData: Post[] = snapshot.docs
        .map((doc) => {
          const postData = doc.data();
          return {
            id: doc.id,
            space: selectedPost.space,
            owner: postData.owner,
            content: postData.content,
            timestamp: postData.timestamp,
            title: postData.title,
            user: postData.user,
            parentId: postData.parentId,
            originId: postData.originId,
            reactions: postData.reactions,
          } as Post;
        })
        .filter((post) => post.parentId === selectedPost.id);

      const sortedReplies = repliesData.sort((a, b) => (b.reactions || 0) - (a.reactions || 0));
      setReplies(sortedReplies);
    });

    console.log(selectedPost.originId)
    // Fetch the original post's title if originId exists
    if (selectedPost.originId) {
      const fetchOriginalPostTitle = async () => {
        const originPostRef = doc(db, 'spaces', selectedPost.space, 'posts', selectedPost.originId!);
        const originPostSnapshot = await getDoc(originPostRef);

        if (originPostSnapshot.exists()) {
          const originPostData = originPostSnapshot.data();
          setOriginalPostTitle(originPostData.title || ''); // Update with the original title
        }
      };

      fetchOriginalPostTitle();
    } else {
      setOriginalPostTitle(selectedPost.title); // Set the current post's title if no originId
    }

    return () => {
      unsubscribeReplies();
    };
  }, [selectedPost]);

  const handleGoBack = async () => {
    if (selectedPost.parentId) {
      const parentPostRef = doc(db, 'spaces', selectedPost.space, 'posts', selectedPost.parentId);
      const docSnapshot = await getDoc(parentPostRef);

      if (docSnapshot.exists()) {
        const parentPostData = docSnapshot.data();
        setSelectedPost({
          id: docSnapshot.id,
          space: selectedPost.space,
          owner: parentPostData?.owner || '',
          content: parentPostData?.content || '',
          timestamp: parentPostData?.timestamp || { seconds: 0 },
          title: parentPostData?.title || '',
          user: parentPostData?.user || { first_name: '', last_name: '', username: '', uid: '', school: '' },
          parentId: parentPostData?.parentId,
          originId: parentPostData?.originId,
        });
      }
    } else {
      setSelectedPost(null);
    }
  };

  const handleReplyClick = (replyId: string) => {
    const selectedReply = replies.find((reply) => reply.id === replyId);
    if (selectedReply) {
      setSelectedPost(selectedReply); // Update selectedPost to the clicked reply
    }
  };

  return (
    <div className="flex flex-col space-y-2 px-4 py-6 overflow-hidden">
      <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 flex items-center justify-between">
        <div className="flex space-x-2 items-center justify-center">
          <img
            className="hover:cursor-pointer h-5"
            src="/assets/icons/go_back_icon.svg"
            onClick={handleGoBack}
          />
          <div className="font-bold text-lg hover:cursor-pointer pl-2">
            {originalPostTitle}
          </div>
        </div>
        <div className="border border-black rounded-full w-44 h-8 flex justify-center items-center font-bold">
          View original post
        </div>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1 py-1 px-1">
        <PostItem
          post={selectedPost}
          currentUser={user!}
          setFilteredSpace={() => {}}
          onReplyClick={handleReplyClick}
        />

        {/* Pass originId to ReplyForm */}
        <ReplyForm
          parentPostId={selectedPost.id}
          space={selectedPost.space}
          postOwnerUsername={selectedPost.user?.username || 'unknown'}
          originId={selectedPost.originId || selectedPost.id} // Ensure originId is passed correctly
        />

        {replies.length > 0 && (
          <div className="space-y-2 mt-4">
            {replies.map((reply) => (
              <div key={reply.id}>
                <PostItem
                  post={reply}
                  currentUser={user!}
                  setFilteredSpace={() => {}}
                  onReplyClick={() => handleReplyClick(reply.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplyPanel;
