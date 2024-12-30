import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { setDoc, serverTimestamp, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';

const PostForm: React.FC = () => {
  const { user } = useUser();
  const [newPost, setNewPost] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSpaceError, setIsSpaceError] = useState(false);
  const [isTitleError, setIsTitleError] = useState(false);
  const [isContentError, setIsContentError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const newPostRef = useRef<HTMLTextAreaElement>(null);

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

  // Adjust the height of the textarea based on content
  const adjustTextareaHeight = (textareaRef: React.RefObject<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      // Reset the height to 'auto' so the textarea shrinks if content is deleted
      textareaRef.current.style.height = 'auto';
      // Set the height to scrollHeight (needed height to display content)
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Call adjustTextareaHeight whenever content changes
  useEffect(() => {
    adjustTextareaHeight(titleRef);
    adjustTextareaHeight(newPostRef);
  }, [title, newPost]);

  const handlePostSubmit = async () => {
    if (!selectedSpace) {
      setIsSpaceError(true);
      return;
    }

    if (!title.trim()) {
      setIsTitleError(true);
      return;
    }

    if (!newPost.trim()) {
      setIsContentError(true);
      return;
    }

    setLoading(true);
    setIsSpaceError(false);

    try {
      const postRef = doc(collection(db, 'spaces', selectedSpace, 'posts'));
      await setDoc(postRef, {
        owner: user?.uid,
        content: newPost,
        timestamp: serverTimestamp(),
        space: selectedSpace,
        title,
        user: {
          first_name: user?.first_name || 'Anonymous',
          last_name: user?.last_name || '',
          username: user?.username || 'unknown',
          school: user?.school || 'unknown',
        },
        bookmark: false,
      });

      setNewPost('');
      setTitle('');
    } catch (error) {
      console.error('Error creating post: ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white px-4 pt-4 pb-5 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-primary-500
      ${
        isDropdownOpen ? 'ring-2 ring-primary-500' : ''
      }`}>
      <div className="flex items-center space-x-4">
        <img src="/assets/icons/pfp on post.svg" alt="Profile" className="h-10" />
        <div className="flex-1 relative flex items-center" ref={dropdownRef}>
          <span className="font-bold pr-1">You</span>
          <span className="pr-2">in</span>
          <div
            className={`font-medium text-sm cursor-pointer flex items-center justify-between bg-white p-1 pl-7 rounded-full relative w-40 ${
              isSpaceError ? 'border border-red ring-1 ring-red' : 'border border-primary-500'
            } ${isDropdownOpen ? 'ring-1 ring-primary-500' : ''}`}
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

       {/* Title Textarea with 100-character limit */}
       <div className="relative">
        <div className={`w-full px-4 py-1 rounded-full mt-2 font-extrabold text-lg focus:outline-none flex items-center ${
            isTitleError ? 'ring-2 ring-red' : 'border border-primary-500 focus:ring-1 focus:ring-primary-500'
          }`}>
        <textarea
          ref={titleRef}
          className='border-none w-11/12'
          placeholder="Add a title"
          value={title}
          onChange={(e) => {
            if (e.target.value.length <= 60) {
              setTitle(e.target.value);
            }
          }}
          rows={1}
          style={{
            resize: 'none', // Disallow vertical resizing
            minHeight: '20px', // Minimum height
            maxHeight: '50px', // Maximum height
            overflow: 'hidden', // Disable scrolling
            outline: 'none',
          }}
        />
        <div className={`ml-2 text-sm font-normal font-dmsans ${title.length === 60 ? 'text-red' : 'text-gray-500'}`}>
          {title.length}/60
        </div>
        </div>
      </div>

      <textarea
        ref={newPostRef}
        className={`w-full pb-2 mt-2 focus:outline-none border-b ${isContentError ? 'placeholder-red border-b-red' : ''}`}
        placeholder="Yoo, what's cooking rn??"
        value={newPost}
        onChange={(e) => {
          if (e.target.value.length <= 300) {
            setNewPost(e.target.value);
          }
        }}
        rows={1}
        style={{
          resize: 'none', // Disallow vertical resizing
          minHeight: '40px', // Minimum height
          maxHeight: '300px', // Maximum height
          overflow: 'hidden', // Disable scrolling
        }}
      />

      <div className="flex justify-between items-center h-8 mt-2 pt-1">
        <img src="/assets/icons/media-icon.svg" className="h-6 cursor-pointer" />
        <div className="flex items-center">
          <div className={`px-3 text-sm font-normal font-dmsans ${newPost.length === 300 ? 'text-red' : 'text-gray-500'}`}>
            {newPost.length}/300
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
  );
};

export default PostForm;
