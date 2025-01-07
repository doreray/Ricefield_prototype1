import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useUser } from '@/contexts/UserContext';
import { useParams, useNavigate } from 'react-router-dom';
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
  parentId?: string;
  originId?: string;
  reactions?: number;
}

const ReplyPanel: React.FC = () => {
  const { user } = useUser();
  const { space, postId } = useParams<{ space: string; postId: string }>();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const [originalPostTitle, setOriginalPostTitle] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!space || !postId) return; // Ensure space and postId are defined

    // Fetch the selected post
    const fetchSelectedPost = async () => {
      if (!space || !postId) return; // Double-check for undefined values
      const postRef = doc(db, 'spaces', space, 'posts', postId);
      const postSnapshot = await getDoc(postRef);

      if (postSnapshot.exists()) {
        const postData = postSnapshot.data();
        setSelectedPost({
          id: postSnapshot.id,
          space: space,
          owner: postData.owner,
          content: postData.content,
          timestamp: postData.timestamp,
          title: postData.title,
          user: postData.user,
          parentId: postData.parentId,
          originId: postData.originId,
          reactions: postData.reactions,
        } as Post);
      }
    };

    // Fetch replies
    const repliesRef = collection(db, 'spaces', space, 'posts');
    const unsubscribeReplies = onSnapshot(repliesRef, (snapshot) => {
      const repliesData: Post[] = snapshot.docs
        .map((doc) => {
          const postData = doc.data();
          return {
            id: doc.id,
            space: space,
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
        .filter((post) => post.parentId === postId);

      const sortedReplies = repliesData.sort((a, b) => (b.reactions || 0) - (a.reactions || 0));
      setReplies(sortedReplies);
    });

    if (selectedPost) {
      if (selectedPost.originId) {
        const fetchOriginalPostTitle = async () => {
          if (!space || !selectedPost.originId) return; // Ensure space and originId are defined
          const originPostRef = doc(db, 'spaces', space, 'posts', selectedPost.originId!);
          const originPostSnapshot = await getDoc(originPostRef);

          if (originPostSnapshot.exists()) {
            const originPostData = originPostSnapshot.data();
            setOriginalPostTitle(originPostData.title || '');
          }
        };

        fetchOriginalPostTitle();
      } else {
        setOriginalPostTitle(selectedPost.title);
      }
    }

    fetchSelectedPost();

    return () => unsubscribeReplies();
  }, [space, postId, selectedPost]);

  const handleGoBack = async () => {
    if (selectedPost?.parentId) {
      if (!space || !selectedPost.parentId) return; // Ensure space and parentId are defined
      navigate(`/${selectedPost.space}/${selectedPost.parentId}`);
    } else {
      navigate('/');
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
        {selectedPost && (
          <PostItem
            post={selectedPost}
            currentUser={user!}
            setFilteredSpace={() => {}}
            onReplyClick={handleReplyClick}
          />
        )}

        {/* Pass originId to ReplyForm */}
        {selectedPost && (
          <ReplyForm
            parentPostId={selectedPost.id}
            space={selectedPost.space}
            postOwnerUsername={selectedPost.user?.username || 'unknown'}
            originId={selectedPost.originId || selectedPost.id} // Ensure originId is passed correctly
          />
        )}

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
