import React, { useState, useEffect, useRef } from 'react';
import DeleteConfirmationPopup from './DeleteConfirmationPopup';

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
  timestamp: { seconds: number } | null;
  space: string;
  title: string;
  user: User;
  image?: string;
}

interface PostActionsProps {
  post: Post;
  currentUser: User;
  setPopupVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isPopupVisible: boolean;
  onReplyClick: (replyId: string) => void;
}

const PostActions: React.FC<PostActionsProps> = ({
  post,
  currentUser,
  setPopupVisible,
  isPopupVisible,
  onReplyClick,
}) => {
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false); // Track toast visibility
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleDeletePost = async () => {
    // Handle post deletion logic here
  };

  const handleReportPost = () => {
    // Handle post reporting logic here
  };

  const handleCopyPostLink = () => {
    const postUrl = `${window.location.origin}/${post.space}/${post.id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      setToastVisible(true); // Show the toast
      setTimeout(() => setToastVisible(false), 3000); // Hide after 3 seconds
    });
  };

  return (
    <div className="flex items-center space-x-2" ref={dropdownRef}>
      <div>
        <img
          onMouseEnter={() => setHoveredPostId(post.id)}
          onMouseLeave={() => setHoveredPostId(null)}
          src={
            hoveredPostId === post.id
              ? '/assets/icons/three dot (hover).svg'
              : '/assets/icons/three dot (default).svg'
          }
          alt="More"
          className="h-8 w-8 cursor-pointer"
          onClick={() => setDropdownVisible((prev) => !prev)} // Show the dropdown on click
        />
        {isDropdownVisible && (
          <div className="absolute bg-white shadow-md border border-gray-200 rounded-lg w-40">
            <div
              onClick={handleCopyPostLink}
              className="px-4 py-2 font-bold cursor-pointer flex items-center space-x-2"
            >
              <img src="/assets/icons/copy_link_icon.svg" className="h-6" />
              <div>Copy link</div>
            </div>
            {post.owner === currentUser.uid && (
              <div
                onClick={() => setPopupVisible(true)}
                className="px-4 py-2 text-rose-600 font-bold cursor-pointer flex items-center space-x-2"
              >
                <img src="/assets/icons/trash_icon.svg" className="h-6 ml-0.5" />
                <div>Delete post</div>
              </div>
            )}
            {post.owner !== currentUser.uid && (
              <div
                onClick={handleReportPost}
                className="px-4 py-2 text-yellow-500 font-bold cursor-pointer flex items-center space-x-2"
              >
                <img src="/assets/icons/report_icon.svg" className="h-7" />
                <div>Report</div>
              </div>
            )}
          </div>
        )}
      </div>
      {isPopupVisible && (
        <DeleteConfirmationPopup
          onCancel={() => setPopupVisible(false)}
          onDelete={handleDeletePost} // Pass delete handler to the popup
        />
      )}
      {/* Toast Notification */}
      {toastVisible && (
        <div className="fixed bottom-3 right-3 bg-white border border-primary-500 text-black py-2 px-4 rounded-lg shadow-md">
          Post URL copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default PostActions;
