import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useUser } from '@/contexts/UserContext';
import { useParams, useNavigate } from 'react-router-dom';
import PostItem from './PostPanel/PostItem';
import ReplyForm from './ReplyPanel/ReplyForm';

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
  const [postUnavailable, setPostUnavailable] = useState(false); // State for post availability
  const [originalPostUnavailable, setOriginalPostUnavailable] = useState(false); // State for original post availability
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
      } else {
        setPostUnavailable(true); // Set postUnavailable to true if post doesn't exist
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
            setOriginalPostTitle(originPostData.title || 'Post No Longer Exists');
            setOriginalPostUnavailable(false); // Original post is available
          } else {
            setOriginalPostTitle(null); // Original post doesn't exist
            setOriginalPostUnavailable(true); // Original post is unavailable
          }
        };

        fetchOriginalPostTitle();
      } else {
        setOriginalPostTitle(selectedPost.title);
        setOriginalPostUnavailable(false); // No originId, the post is available
      }
    }

    fetchSelectedPost();

    return () => unsubscribeReplies();
  }, [space, postId, selectedPost]);

  const handleGoBack = async () => {
    if (selectedPost?.parentId) {
      if (!space || !selectedPost.parentId) { return; }
      navigate(`/${selectedPost.space}/${selectedPost.parentId}`);
      window.location.reload();
    } else {
      navigate('/');
      window.location.reload();
    }
  };

  const handleReplyClick = (replyId: string) => {
    const selectedReply = replies.find((reply) => reply.id === replyId);
    if (selectedReply) {
      // Navigate to the reply's own page, not the original post's page
      navigate(`/${selectedReply.space}/${selectedReply.id}`);
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
        {postUnavailable ? 'Post Deleted' : originalPostUnavailable ? 'Original Post Unavailable' : originalPostTitle || 'Loading...'}
      </div>
    </div>
    <div
      className="border border-black rounded-full w-44 h-8 flex justify-center items-center font-bold cursor-pointer"
      onClick={() => {
        if (!originalPostUnavailable && selectedPost?.originId) {
          navigate(`/${selectedPost.space}/${selectedPost.originId}`);
          window.location.reload();
        }
      }}
    >
      {postUnavailable ? 'Post Deleted' : originalPostUnavailable ? 'Unavailable' : 'View original post'}
    </div>
  </div>

  {/* Display post deleted message */}
  {postUnavailable && (
    <div className='bg-white flex items-center justify-center border border-slate-200 rounded-xl h-20'>
      <div className="text-center">This post has been deleted. Replies are no longer possible.</div>
    </div>
  )}

  <div className="space-y-2 overflow-y-auto flex-1 py-1 px-1">
    {/* Only render the main post if it's available */}
    {!postUnavailable && selectedPost && (
      <PostItem
        post={selectedPost}
        currentUser={user!}
        setFilteredSpace={() => {}}
      />
    )}

    {/* Always show the reply form */}
    {!postUnavailable && selectedPost && (
      <ReplyForm
        parentPostId={selectedPost.id}
        space={selectedPost.space}
        postOwnerUsername={selectedPost.user?.username || 'unknown'}
        originId={selectedPost.originId || selectedPost.id} // Ensure originId is passed correctly
      />
    )}

    {/* Show message if no replies */}
    {replies.length === 0 && !postUnavailable && (
      <div className='flex justify-center items-center space-x-4'>
        <img className='h-48' src='/assets/icons/tractor_icon.svg' />
        <div className='flex-col'>
          <div className="font-bold text-2xl">
            Replies not cooked yet!
          </div>
          <div className="">
            It's your chance to be the first to reply to this Space :)
          </div>
        </div>
      </div>
    )}

    {/* Display replies even if the post is unavailable */}
    {replies.length > 0 && (
      <div className="space-y-2">
        {replies.map((reply) => (
          <div key={reply.id}>
            <PostItem
              post={reply}
              currentUser={user!}
              setFilteredSpace={() => {}}
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
