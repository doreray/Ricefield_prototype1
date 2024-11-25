import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, setDoc, serverTimestamp, onSnapshot, doc } from 'firebase/firestore';
import { useUser } from '@/contexts/UserContext'; // To get the user data
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button';
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
  filteredSpace: string; // Receive the filtered space as a prop
}

const MidPanel: React.FC<MidPanelProps> = ({ filteredSpace }) => {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null); // Track hovered post ID
  const [selectedSpace, setSelectedSpace] = useState<string>(''); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSpaceError, setIsSpaceError] = useState(false); // New state for space error
  const [isTitleError, setIsTitleError] = useState(false);
  const [isContentError, setIsContentError] = useState(false);
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
    if (!selectedSpace) {
      setIsSpaceError(!selectedSpace); // Show error if no space selected
      return;
    }

    if (!title.trim()){
      setIsTitleError(!isTitleError);
      return;
    }

    if(!newPost.trim()){
      setIsContentError(!isContentError);
      return;
    }
  
    setLoading(true);
    setIsSpaceError(false); // Reset error on valid submit
  
    try {
      const postRef = doc(collection(db, 'spaces', selectedSpace, 'posts'));
      await setDoc(postRef, {
        owner: user?.uid,
        content: newPost,
        timestamp: serverTimestamp(),
        space: selectedSpace,
        title: title,
        user: {
          firstName: user?.first_name || 'Anonymous',
          lastName: user?.last_name || '',
          username: user?.username || 'unknown',
          school: user?.school || 'unknown',
        },
      });
  
      setNewPost(''); // Reset the post input after submitting
      setTitle(''); // Reset title input
    } catch (error) {
      console.error('Error creating post: ', error);
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  const wordCount = newPost.length;
  const maxLength = 300;

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
  
    // Restrict input to maxLength
    if (input.length <= maxLength) {
      setNewPost(input);
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  // Filter posts by selected space or filteredSpace
  const filteredPosts = filteredSpace
  ? posts.filter((post) => post.space === filteredSpace)
  : posts;

  const sortedPosts = filteredPosts.sort((a, b) => {
    // Safely check if timestamp exists
    const timestampA = a.timestamp?.seconds || 0;
    const timestampB = b.timestamp?.seconds || 0;
  
    return timestampB - timestampA;
  });
  


  return (
    <div className="flex flex-col space-y-4 px-4 py-6 overflow-hidden">
      <div className={`bg-white px-4 pt-4 pb-3 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-primary-500
        ${
          isDropdownOpen ? 'ring-2 ring-primary-500' : ''
        }`}>
        <div className="flex items-center space-x-4">
          <img
            src="/assets/icons/pfp on post.svg"
            alt="Profile"
            className="h-10"
          />
          <div className="flex-1 relative flex items-center" ref={dropdownRef}>
            <span className="font-bold pr-1">You</span>
            <span className="pr-2">in</span>
            <div
              className={`font-medium text-sm cursor-pointer flex items-center justify-between bg-white p-1 pl-7 rounded-full relative w-40 ${
                isSpaceError ? 'ring-2 ring-red' : 'border border-primary-500' }`}
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
                className="absolute top-full left-12 ml-1 bg-white rounded-lg z-10 w-40 border overflow-hidden"
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
                      setIsSpaceError(false); // Clear error on space selection
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
         {/* Title input */}
         <textarea
          className={`w-full px-4 py-1 rounded-full mt-2 font-extrabold text-lg focus:outline-none ${
            isTitleError ? 'ring-2 ring-red' : 'border border-primary-500 focus:ring-1 focus:ring-primary-500'
            }`}
          placeholder="Add a title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={1}
          style={{ resize: 'none', overflow: 'hidden' }}
        />
        <textarea
          className={`w-full pb-2 mt-2 focus:outline-none border-b ${
            isContentError ? 'placeholder-red border-b-red': ''
            }`}
          placeholder="Yoo, what's cooking rn??"
          value={newPost}
          onChange={handleTextareaChange}
          rows={1}
          style={{ resize: 'none', overflow: 'hidden' }}
        />
  
        <div className="flex justify-between items-center h-8 pt-1">
          <img 
          src='/assets/icons/media-icon.svg'
          className='h-6 cursor-pointer'
          />
          <div className="flex items-center">
            <div
              className={`px-3 text-sm font-dmsans ${
                wordCount === maxLength ? 'text-red' : 'text-gray-500'
              }`}
            >
              {wordCount}/{maxLength}
            </div>
            <button
              onClick={handlePostSubmit}
              className={`shad-button_primary rounded-full h-9 w-20 flex items-center justify-center font-bold ${
                loading ? 'opacity-50' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Cooking...' : 'Cook'}
            </button>
          </div>
        </div>
      </div>
  
      <div className="space-y-4 overflow-y-auto flex-1">
        {sortedPosts.length === 0 && (
          <div className="text-center text-gray-500">
            No posts available. Be the first to post!
          </div>
        )}
        {sortedPosts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2">
              <img
                src="/assets/icons/pfp on post.svg"
                alt="Profile"
                className="h-10 cursor-pointer"
              />
              <div className='flex items-center justify-between w-full'>
                <div>
                  <div className='flex items-center space-x-1 '>
                    <div className="font-bold cursor-pointer">
                      {post.user?.firstName || 'Anonymous'} {post.user?.lastName || ''}
                    </div>
                    <div className="text-sm text-primary-500">
                      @{post.user?.username || 'unknown'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {/* Format and display time since the post was made */}
                      • {post.timestamp ? formatDistanceToNow(new Date(post.timestamp.seconds * 1000))
                        .replace(' minutes', 'm')
                        .replace(' hours', 'h')
                        .replace(' days', 'd')
                        .replace(' day', 'd')
                        .replace(' months', 'mo')
                        .replace(' years', 'y')
                        .replace('about ', '') // Remove "about" from the string
                        : 'Unknown time'}
                    </div>
                  </div>
                  <div className='text-sm'>{post.user?.school || 'unknown'}</div>
                </div>
                <div className='flex items-center space-x-2'>
                <Button className='border border-primary-500 h-7 px-6 rounded-full text-primary-500 font-bold bg-white hover:bg-primary-500 hover:text-white'>
                  {post.space.charAt(0).toUpperCase() + post.space.slice(1)}
                </Button>
                <img
                  onMouseEnter={() => setHoveredPostId(post.id)} // Set hovered post ID
                  onMouseLeave={() => setHoveredPostId(null)} // Reset hovered post ID
                  src={
                    hoveredPostId === post.id // Only change icon for hovered post
                      ? '/assets/icons/three dot (hover).svg'
                      : '/assets/icons/three dot (default).svg'
                  }
                  alt="More"
                  className="h-8 w-8 cursor-pointer"
                />
                </div>
              </div>
            </div>
            <div className="font-bold text-xl mt-2 break-words px-12">{post.title || ''}</div>
            <div className="break-words mt-2 px-12">
              {post.content.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">
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
