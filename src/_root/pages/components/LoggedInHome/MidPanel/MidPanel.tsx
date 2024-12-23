// src/components/MidPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, setDoc, serverTimestamp, onSnapshot, doc } from 'firebase/firestore';
import { useUser } from '@/contexts/UserContext'; // To get the user data
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import PostForm from './PostForm';
import PostItem from './PostItem';

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

interface MidPanelProps {
  filteredSpace: string;
}

const MidPanel: React.FC<MidPanelProps> = ({ filteredSpace }) => {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);

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

    return timestampB - timestampA;
  });

  return (
    <div className="flex flex-col space-y-4 px-4 py-6 overflow-hidden">
      <PostForm />
      <div className="space-y-4 overflow-y-auto flex-1">
        {sortedPosts.length === 0 && (
          <div className="text-center text-gray-500">
            No posts available. Be the first to post!
          </div>
        )}
        {sortedPosts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default MidPanel;
