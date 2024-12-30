import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase/config';
import { doc, collection, getDoc, setDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import DeleteConfirmationPopup from './DeleteConfirmationPopup'; // Import the DeleteConfirmationPopup component

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
  image?: string;
}

interface PostItemProps {
  post: Post;
  currentUser: User;
  setFilteredSpace: (space: string) => void;
  onReplyClick: (replyId: string) => void; // Callback for reply click
}

const PostItem: React.FC<PostItemProps> = ({ post, currentUser, setFilteredSpace, onReplyClick }) => {
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);

  const [upvoteHovered, setUpvoteHovered] = useState(false);
  const [downvoteHovered, setDownvoteHovered] = useState(false);

  const [upvotesCount, setUpvotesCount] = useState<number>(0);
  const [downvotesCount, setDownvotesCount] = useState<number>(0);
  const [repliesCount, setRepliesCount] = useState<number>(0);

  const [isPopupVisible, setPopupVisible] = useState(false); // State to handle the visibility of the delete confirmation popup
  const [isDropdownVisible, setDropdownVisible] = useState(false); // State to toggle the dropdown menu

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

  // Check num of replies
  useEffect(() => {
    const fetchRepliesCount = async () => {
      try {
        const repliesQuery = query(
          collection(db, 'spaces', post.space, 'posts'),
          where('parentId', '==', post.id)
        );

        const repliesSnapshot = await getDocs(repliesQuery);
        setRepliesCount(repliesSnapshot.size);
      } catch (error) {
        console.error('Error fetching replies count:', error);
      }
    };

    fetchRepliesCount();
  }, [post.id, post.space]);

  useEffect(() => {
    if (!currentUser || !post.id) return;

    const checkUserVotes = async () => {
      try {
        const upvoteDocRef = doc(
          db,
          'spaces',
          post.space,
          'posts',
          post.id,
          'upvotes',
          currentUser.uid
        );
        const upvoteDoc = await getDoc(upvoteDocRef);

        const hasUpvote = upvoteDoc.exists() && upvoteDoc.data().userId && upvoteDoc.data().username;

        const downvoteDocRef = doc(
          db,
          'spaces',
          post.space,
          'posts',
          post.id,
          'downvotes',
          currentUser.uid
        );
        const downvoteDoc = await getDoc(downvoteDocRef);

        const hasDownvote = downvoteDoc.exists() && downvoteDoc.data().userId && downvoteDoc.data().username;

        setUpvoted(hasUpvote);
        setDownvoted(hasDownvote);
      } catch (error) {
        console.error('Error checking user votes:', error);
      }
    };

    checkUserVotes();
  }, [currentUser, post.id, post.space]);

  useEffect(() => {
    const fetchVotesCount = async () => {
      try {
        const upvotesSnapshot = await getDocs(
          collection(db, 'spaces', post.space, 'posts', post.id, 'upvotes')
        );
        const validUpvotes = upvotesSnapshot.docs.filter((doc) => {
          const data = doc.data();
          return data.userId && data.username;
        });

        const downvotesSnapshot = await getDocs(
          collection(db, 'spaces', post.space, 'posts', post.id, 'downvotes')
        );
        const validDownvotes = downvotesSnapshot.docs.filter((doc) => {
          const data = doc.data();
          return data.userId && data.username;
        });

        setUpvotesCount(validUpvotes.length);
        setDownvotesCount(validDownvotes.length);
      } catch (error) {
        console.error('Error fetching votes count:', error);
      }
    };

    fetchVotesCount();
  }, [post.id, post.space]);

  var voteDifference = upvotesCount - downvotesCount;

  const handleUpvoteClick = async () => {
    if (!currentUser) return;

    try {
      const upvoteDocRef = doc(
        collection(db, 'spaces', post.space, 'posts', post.id, 'upvotes'),
        currentUser.uid
      );

      if (upvoted) {
        await setDoc(upvoteDocRef, {}, { merge: false });
        setUpvoted(false);
        setUpvotesCount(upvotesCount - 1);
      } else {
        await setDoc(upvoteDocRef, {
          userId: currentUser.uid,
          timestamp: serverTimestamp(),
          username: currentUser.username,
        });
        setUpvoted(true);
        setUpvotesCount(upvotesCount + 1);

        if (downvoted) {
          const downvoteDocRef = doc(
            collection(db, 'spaces', post.space, 'posts', post.id, 'downvotes'),
            currentUser.uid
          );
          await setDoc(downvoteDocRef, {}, { merge: false });
          setDownvoted(false);
          setDownvotesCount(downvotesCount - 1);
        }
      }
    } catch (error) {
      console.error('Error handling upvote:', error);
    }
  };

  const handleDownvoteClick = async () => {
    if (!currentUser) return;

    try {
      const downvoteDocRef = doc(
        collection(db, 'spaces', post.space, 'posts', post.id, 'downvotes'),
        currentUser.uid
      );

      if (downvoted) {
        await setDoc(downvoteDocRef, {}, { merge: false });
        setDownvoted(false);
        setDownvotesCount(downvotesCount - 1);
      } else {
        await setDoc(downvoteDocRef, {
          userId: currentUser.uid,
          timestamp: serverTimestamp(),
          username: currentUser.username,
        });
        setDownvoted(true);
        setDownvotesCount(downvotesCount + 1);

        if (upvoted) {
          const upvoteDocRef = doc(
            collection(db, 'spaces', post.space, 'posts', post.id, 'upvotes'),
            currentUser.uid
          );
          await setDoc(upvoteDocRef, {}, { merge: false });
          setUpvoted(false);
          setUpvotesCount(upvotesCount - 1);
        }
      }
    } catch (error) {
      console.error('Error handling downvote:', error);
    }
  };

  const handleButtonClick = () => {
    setFilteredSpace(post.space);
  };

  const handleDeletePost = async () => {
    // Handle post deletion logic here
  };

  const handleReportPost = () => {
    // Handle post reporting logic here
  };

  return (
    <div key={post.id} className="bg-white p-4 rounded-lg border border-slate-200" ref={dropdownRef}>
      <div className="flex items-center space-x-2">
        <img src="/assets/icons/pfp on post.svg" alt="Profile" className="h-10 cursor-pointer" />
        <div className="flex items-center justify-between w-full">
          <div>
            <div className="flex items-center space-x-1 h-4">
              <div className="font-bold cursor-pointer">
                {post.user?.first_name || 'Anonymous'} {post.user?.last_name || ''}
              </div>
              <div className="text-primary-500">@{post.user?.username || 'unknown'}</div>
              <div className="text-sm text-gray-400">
                • {post.timestamp
                  ? formatDistanceToNow(new Date(post.timestamp.seconds * 1000))
                      .replace(' minutes', 'm')
                      .replace(' minute', 'm')
                      .replace(' hour', 'h')
                      .replace(' hours', 'h')
                      .replace(' days', 'd')
                      .replace(' day', 'd')
                      .replace(' months', 'mo')
                      .replace(' years', 'y')
                      .replace('about ', '')
                      .replace('less than a minute', '0m')
                      .replace('less than am', '0m')
                  : 'Freshly Cooked'}
              </div>
            </div>
            <div className="text-sm">{post.user?.school || 'unknown'}</div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleButtonClick}
              className="border border-primary-500 h-7 px-6 rounded-full text-primary-500 font-bold bg-white hover:bg-primary-500 hover:text-white"
            >
              {post.space.charAt(0).toUpperCase() + post.space.slice(1)}
            </Button>
            <div>
              <img
                onMouseEnter={() => setHoveredPostId(post.id)}
                onMouseLeave={() => setHoveredPostId(null)}
                src={hoveredPostId === post.id
                  ? '/assets/icons/three dot (hover).svg'
                  : '/assets/icons/three dot (default).svg'}
                alt="More"
                className="h-8 w-8 cursor-pointer"
                onClick={() => setDropdownVisible((prev) => !prev)} // Show the dropdown on click
              />
              {isDropdownVisible && (
                <div className="absolute bg-white shadow-md border border-gray-200 rounded-lg w-40">
                  {post.owner === currentUser.uid && (
                    <div
                      onClick={() => setPopupVisible(true)}
                      className="px-4 py-2 text-rose-600 font-bold cursor-pointer flex items-center space-x-2"
                    >
                      <img src='assets/icons/trash_icon.svg' className='h-6 ml-0.5'/>
                      <div>
                      Delete post
                      </div>
                    </div>
                  )}
                  <div
                    onClick={handleReportPost}
                    className="px-4 py-2 text-yellow-500 font-bold cursor-pointer flex items-center space-x-2"
                  >
                    <img src='assets/icons/report_icon.svg' className='h-7'/>
                      <div>
                      Report
                      </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="font-bold text-xl mt-2 break-words px-12">{post.title || ''}</div>
      <div className="break-words mt-2 px-12">{post.content}</div>
      {post.image && <img className="h-8 mt-2" src={post.image} alt="Post image" />}
      <div className="flex justify-between mt-2 px-12">
        <div className="flex space-x-4">
          <div className="bg-gray-200 flex space-x-2 rounded-full items-center py-2 px-3">
            <img
              className="hover:cursor-pointer h-5"
              alt="Upvote"
              src={upvoted ? "/assets/icons/upvote_chosen.svg" : (upvoteHovered ? "/assets/icons/upvote_hover.svg" : "/assets/icons/upvote_default.svg")}
              onMouseEnter={() => setUpvoteHovered(true)}
              onMouseLeave={() => setUpvoteHovered(false)}
              onClick={handleUpvoteClick}
            />
            <div className="font-dmsans font-bold">{voteDifference}</div>
            <img
              className="hover:cursor-pointer h-5"
              alt="Downvote"
              src={downvoted ? "/assets/icons/downvote_chosen.svg" : (downvoteHovered ? "/assets/icons/downvote_hover.svg" : "/assets/icons/downvote_default.svg")}
              onMouseEnter={() => setDownvoteHovered(true)}
              onMouseLeave={() => setDownvoteHovered(false)}
              onClick={handleDownvoteClick}
            />
          </div>
          <div
            className="bg-gray-200 rounded-full flex items-center py-2 px-3 space-x-2 font-bold hover:cursor-pointer"
            onClick={() => onReplyClick(post.id)}
          >
            <img className="h-5" src="/assets/icons/reply.svg" />
            <div className="font-dmsans">{repliesCount}</div>
          </div>
        </div>
      </div>

      {isPopupVisible && (
        <DeleteConfirmationPopup
          onCancel={() => setPopupVisible(false)}
          onDelete={handleDeletePost} // Pass delete handler to the popup
        />
      )}
    </div>
  );
};

export default PostItem;
