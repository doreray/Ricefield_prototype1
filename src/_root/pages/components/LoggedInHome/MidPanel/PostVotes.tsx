import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';

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

interface PostVotesProps {
  post: Post;
  currentUser: User;
}

const PostVotes: React.FC<PostVotesProps> = ({ post, currentUser }) => {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [upvotesCount, setUpvotesCount] = useState<number>(0);
  const [downvotesCount, setDownvotesCount] = useState<number>(0);

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


  return (
    <div className="bg-gray-200 flex space-x-2 rounded-full items-center py-2 px-3">
      <img
        className="hover:cursor-pointer h-5"
        alt="Upvote"
        src={upvoted ? "/assets/icons/upvote_chosen.svg" : "/assets/icons/upvote_default.svg"}
        onClick={handleUpvoteClick}
      />
      <div className="font-dmsans font-bold">{voteDifference}</div>
      <img
        className="hover:cursor-pointer h-5"
        alt="Downvote"
        src={downvoted ? "/assets/icons/downvote_chosen.svg" : "/assets/icons/downvote_default.svg"}
        onClick={handleDownvoteClick}
      />
    </div>
  );
};

export default PostVotes;
