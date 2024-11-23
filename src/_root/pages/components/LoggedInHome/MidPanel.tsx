import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, setDoc, serverTimestamp, onSnapshot, doc } from 'firebase/firestore';
import { useUser } from '@/contexts/UserContext'; // To get the user data

interface User {
  firstName: string;
  lastName: string;
  username: string;
  uid: string;
}

interface Post {
  id: string;
  owner: string;
  content: string;
  timestamp: { seconds: number };
  space: string;
  user: User;
}

const MidPanel: React.FC = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<string>(''); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handlePostSubmit = async () => {
    if (!newPost.trim() || !selectedSpace) return;

    setLoading(true);

    try {
      const postRef = doc(collection(db, 'spaces', selectedSpace, 'posts'));
      await setDoc(postRef, {
        owner: user?.uid,
        content: newPost,
        timestamp: serverTimestamp(),
        space: selectedSpace,
        user: {
          firstName: user?.first_name || 'Anonymous',
          lastName: user?.last_name || '',
          username: user?.username || 'unknown',
        },
      });

      setNewPost('');
    } catch (error) {
      console.error('Error creating post: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewPost(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const wordCount = newPost.length;
  const maxLength = 200;

  return (
    <div className="flex flex-col space-y-4 px-4 py-6 overflow-hidden">
      <div className="bg-white p-4 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-primary-500">
        <div className="flex items-center space-x-4">
          <img
            src="/assets/icons/pfp on post.svg"
            alt="Profile"
            className="h-8 w-8 rounded-full"
          />
          <div className="flex-1 relative flex items-center" ref={dropdownRef}>
            <span className="font-bold pr-1">You</span>
            <span className="pr-2">in</span>
            <div
              className="font-medium text-sm cursor-pointer flex items-center justify-between bg-white p-1 pl-7 rounded-full border border-primary-500 relative w-40"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              {selectedSpace || 'Select a Space'}
              <img
                src="/assets/icons/arrow down-icon.svg"
                alt="Dropdown Toggle"
                className={`h-4 w-4 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </div>
            {isDropdownOpen && (
              <ul
                className="absolute top-full left-12 mt-2 bg-white rounded-lg z-10 shadow-lg w-40 border overflow-hidden"
                style={{
                  maxHeight: isDropdownOpen ? '300px' : '0',
                  opacity: isDropdownOpen ? '1' : '0',
                  transition: 'max-height 0.3s ease, opacity 0.3s ease',
                }}
              >
                {['confession', 'memes', 'news', 'questions', 'rant'].map((space, index) => (
                  <li
                    key={space}
                    onClick={() => {
                      setSelectedSpace(space);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                    style={{
                      visibility: isDropdownOpen ? 'visible' : 'hidden',
                      animation: isDropdownOpen
                        ? `fadeIn 0.3s ease ${index * 0.2}s forwards`
                        : 'none',
                    }}
                  >
                    <img
                      src={`/assets/icons/space-${space.charAt(0).toUpperCase() + space.slice(1)}-icon.svg`}
                      alt={space}
                      className="h-6 w-6"
                    />
                    <div className="font-medium text-sm">{space.charAt(0).toUpperCase() + space.slice(1)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <textarea
          className="w-full p-2 rounded-md mt-4 focus:outline-none"
          placeholder="What's cooking?"
          value={newPost}
          onChange={handleTextareaChange}
          rows={1}
          style={{ resize: 'none', overflow: 'hidden' }}
        />

        <div className="flex justify-between items-center mt-2">
          <div></div>
          <div className="flex items-center">
            <div className="px-2 text-s text-gray-500">
              {wordCount}/{maxLength}
            </div>
            <button
              onClick={handlePostSubmit}
              className={`shad-button_primary rounded-full h-8 w-20 flex items-center justify-center m-2 ${loading ? 'opacity-50' : ''}`}
              disabled={loading || !selectedSpace}
            >
              {loading ? 'Cooking...' : 'Cook'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto flex-1">
        {posts.length === 0 && (
          <div className="text-center text-gray-500">
            No posts available. Be the first to post!
          </div>
        )}
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2">
              <img
                src="/assets/icons/pfp on post.svg"
                alt="Profile"
                className="h-8 w-8 rounded-full"
              />
              <div>
                <div className="font-semibold">
                  {post.user?.firstName || 'Anonymous'} {post.user?.lastName || ''}
                </div>
                <div className="text-sm text-primary-500">
                  @{post.user?.username || 'unknown'}
                </div>
              </div>
            </div>
            <div className="mt-2">{post.content}</div>
            <div className="mt-2 text-xs text-gray-500">
              {post.space} •{' '}
              {post.timestamp
                ? new Date(post.timestamp.seconds * 1000).toLocaleString()
                : 'Unknown Time'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MidPanel;
