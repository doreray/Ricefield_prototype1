import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { useUser } from '@/contexts/UserContext'; // To get the user data
import PostForm from './PostForm';
import PostItem from './PostItem';
import ReplyPanel from './ReplyPanel';

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
}

interface MidPanelProps {
  filteredSpace: string;
  setFilteredSpace: (space: string) => void;
}

const MidPanel: React.FC<MidPanelProps> = ({ filteredSpace, setFilteredSpace }) => {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // Track the selected post

  useEffect(() => {
    const fetchPosts = () => {
      const spaces = ['confession', 'memes', 'news', 'questions', 'rant'];
      const unsubscribeCallbacks: (() => void)[] = [];

      spaces.forEach((space) => {
        const postsRef = collection(db, 'spaces', space, 'posts');

        const unsubscribe = onSnapshot(postsRef, (snapshot) => {
          const postsData: Post[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            space,
          })) as Post[];

          setPosts((prevPosts) => {
            const newPosts = postsData.filter(
              (post) => !prevPosts.some((existingPost) => existingPost.id === post.id)
            );
            return [...prevPosts, ...newPosts];
          });
        });

        unsubscribeCallbacks.push(unsubscribe);
      });

      return () => {
        unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
      };
    };

    fetchPosts();
  }, []);

  const filteredPosts = filteredSpace
    ? posts.filter((post) => post.space === filteredSpace)
    : posts;

  const sortedPosts = filteredPosts.sort((a, b) => {
    const timestampA = a.timestamp?.seconds || 0;
    const timestampB = b.timestamp?.seconds || 0;

    if (timestampA === 0 && timestampB === 0) {
      return 0;
    }

    if (timestampA === 0) {
      return -1;
    }
    if (timestampB === 0) {
      return 1;
    }

    return timestampB - timestampA;
  });

  // Function to handle selecting a post for reply
  const handleReplyClick = (post: Post) => {
    setSelectedPost(post);
  };

  // Group posts by parentId to display replies under original posts
  const groupedPosts = sortedPosts.reduce((acc, post) => {
    if (post.parentId) {
      // If post is a reply, add it to its parent's replies array
      const parent = acc.find((item) => item.id === post.parentId);
      if (parent) {
        parent.replies = parent.replies ? [...parent.replies, post] : [post];
      }
    } else {
      // If post is an original post, add it to the grouped array
      acc.push({ ...post, replies: [] });
    }
    return acc;
  }, [] as (Post & { replies: Post[] })[]);

  return (
    <div className="flex flex-col space-y-2 px-4 py-6 overflow-hidden">
      {selectedPost ? (
        <ReplyPanel />
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 py-1 px-1">
          <PostForm />
          {groupedPosts.length === 0 && (
            <div className="text-center text-gray-500">
              No posts available. Be the first to post!
            </div>
          )}
          {groupedPosts.map((post) => (
            <div key={post.id}>
              <PostItem
                post={post}
                currentUser={user!}
                setFilteredSpace={setFilteredSpace}
                onReplyClick={() => handleReplyClick(post)} // Handle reply click
              />
              {post.replies.length > 0 && (
                <div className="ml-4 space-y-2">
                  {post.replies.map((reply) => (
                    <PostItem
                      key={reply.id}
                      post={reply}
                      currentUser={user!}
                      setFilteredSpace={setFilteredSpace}
                      onReplyClick={() => handleReplyClick(reply)} // Handle reply click
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MidPanel;
