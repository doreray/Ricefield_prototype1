import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { setDoc, serverTimestamp, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const ReplyForm: React.FC<{ parentPostId: string; space: string; postOwnerUsername: string; originId: string }> = ({ 
  parentPostId, 
  space, 
  postOwnerUsername,
  originId, // Now accepting originId
}) => {
const { user } = useUser();
const [replyContent, setReplyContent] = useState('');
const [loading, setLoading] = useState(false);
const [isContentError, setIsContentError] = useState(false);

const maxLength = 300; // Maximum character limit
const textareaRef = useRef<HTMLTextAreaElement>(null);

const handleReplySubmit = async () => {
  if (!replyContent.trim()) {
    setIsContentError(true);
    return;
  }

  setLoading(true);
  setIsContentError(false);

  try {
    const newPostRef = doc(collection(db, 'spaces', space, 'posts'));

    await setDoc(newPostRef, {
      owner: user?.uid,
      content: replyContent,
      timestamp: serverTimestamp(),
      user: {
        first_name: user?.first_name || 'Anonymous',
        last_name: user?.last_name || '',
        username: user?.username || 'unknown',
        school: user?.school || 'unknown',
      },
      parentId: parentPostId, // This is the current post or reply we are responding to
      originId: originId, // This is the original post ID
      title: '', // Reply has no title
      space,
    });

    // Optionally, you can also create a reply in the "replies" subcollection if needed:
    const replyRef = doc(collection(db, 'spaces', space, 'posts', parentPostId, 'replies'));
    await setDoc(replyRef, {
      owner: user?.uid,
      content: replyContent,
      timestamp: serverTimestamp(),
      user: {
        first_name: user?.first_name || 'Anonymous',
        last_name: user?.last_name || '',
        username: user?.username || 'unknown',
        school: user?.school || 'unknown',
      },
    });

    setReplyContent(''); // Clear the reply input after submission
  } catch (error) {
    console.error('Error creating reply: ', error);
  } finally {
    setLoading(false);
  }
};

const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  if (e.target.value.length <= maxLength) {
    setReplyContent(e.target.value);
  }
};

const adjustTextareaHeight = () => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }
};

useEffect(() => {
  adjustTextareaHeight();
}, [replyContent]);

return (
  <div className="bg-white px-4 pt-4 pb-3 rounded-lg border border-primary-500 focus-within:ring-2 focus-within:ring-primary-500">
    <div className="flex items-center space-x-4">
      <img src="/assets/icons/pfp on post.svg" alt="Profile" className="h-10" />
      <div>
        <span className="font-bold">Replying </span>
        <span>to</span>
        <span className="text-primary-500"> @{postOwnerUsername}</span>
      </div>
    </div>

    <textarea
      ref={textareaRef}
      className={`w-full pb-2 mt-2 focus:outline-none border-b ${isContentError ? 'placeholder-red border-b-red' : ''} ${replyContent.length === maxLength ? 'border-b-red-500' : ''}`}
      placeholder="Write your reply..."
      value={replyContent}
      onChange={handleContentChange}
      rows={1}
      style={{
        resize: 'none',
        minHeight: '40px',
        maxHeight: '300px',
        overflow: 'hidden',
      }}
    />

    <div className="flex justify-between items-center h-8 pt-1">
      <img src="/assets/icons/media-icon.svg" className="h-6 cursor-pointer" alt="Add Media" />
      <div className="flex items-center">
        <div className={`px-3 text-sm font-dmsans ${replyContent.length === maxLength ? 'text-red' : 'text-gray-500'}`}>
          {replyContent.length}/{maxLength}
        </div>
        <button
          onClick={handleReplySubmit}
          className={`shad-button_primary rounded-full h-9 w-20 flex items-center justify-center font-bold ${loading ? 'opacity-50' : ''}`}
          disabled={loading}
        >
          {loading ? 'Replying...' : 'Reply'}
        </button>
      </div>
    </div>
  </div>
);
};

  export default ReplyForm;
  
  
