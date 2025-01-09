import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { PollList } from './PollList';
import { CreatePollModal } from './CreatePollModal';
import { db } from '@/lib/firebase/config';
import { collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, increment, onSnapshot, deleteDoc } from 'firebase/firestore';
import { Poll } from './types';

function RightPanel() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVote, setUserVote] = useState<{ [key: string]: number | null }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isConfirmDelete, setIsConfirmDelete] = useState<string | null>(null);
  const auth = getAuth();
  const user = auth.currentUser;

  const allowedUser = 'eBql2EJ7WdZsbH4rCJzhEf5TZm83';
  const allowedEmail = 'phamhoa2@msu.edu';

  // Check if the current user is allowed
  const isUserAllowed = user?.uid === allowedUser && user?.email === allowedEmail;

useEffect(() => {
    const fetchPollVotes = async () => {
      try {
        const updatedPolls = await Promise.all(polls.map(async (poll) => {
          const pollRef = doc(db, 'polls', poll.id);
  
          let totalVotes = 0;
          const totalVotesArray = await Promise.all(poll.options.map(async (_, index) => {
            const optionRef = doc(pollRef, 'options', `${index}`);
            const optionDoc = await getDoc(optionRef);
            return optionDoc.data()?.votes || 0;
          }));
  
          totalVotes = totalVotesArray.reduce((sum, votes) => sum + votes, 0);
  
          const optionsWithPercentages = poll.options.map((option, index) => ({
            ...option,
            votes: totalVotesArray[index],
            percentage: totalVotes > 0 ? (totalVotesArray[index] / totalVotes) * 100 : 0,
          }));
  
          return { ...poll, options: optionsWithPercentages };
        }));
  
        setPolls(updatedPolls);
      } catch (error) {
        console.error('Error fetching poll votes:', error);
      }
    };
  
    fetchPollVotes();
  }, [polls]);  // Trigger the effect when `polls` is updated or on page load

    // Fetch polls from Firebase
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'polls'), (snapshot) => {
          const fetchedPolls = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              question: data.question,
              options: data.options,
            } as Poll;
          });
          setPolls(fetchedPolls);
        });
    
        return () => unsubscribe();
      }, []);

  const getPollsWithVoteCounts = async () => {
      const updatedPolls = await Promise.all(polls.map(async (poll) => {
        const pollRef = doc(db, 'polls', poll.id);
        
        let totalVotes = 0;
        
        // Retrieve votes directly from options
        const totalVotesArray = await Promise.all(poll.options.map(async (_, index) => {
          const optionRef = doc(pollRef, 'options', `${index}`);
          const optionDoc = await getDoc(optionRef);
          return optionDoc.data()?.votes || 0;
        }));
        
        totalVotes = totalVotesArray.reduce((sum, votes) => sum + votes, 0);
        
        const optionsWithPercentages = poll.options.map((option, index) => ({
          ...option,
          votes: totalVotesArray[index],
          percentage: totalVotes > 0 ? (totalVotesArray[index] / totalVotes) * 100 : 0,
        }));
        
        return { ...poll, options: optionsWithPercentages };
      }));
      
      setPolls(updatedPolls);
    };

  return (
    <div className="w-72 bg-home-divider pt-7 flex flex-col items-center space-y-4 pr-2">
      {isUserAllowed && (
        <button
        onClick={() => setIsModalOpen((prev) => !prev)}
        className="w-68 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
      >
        Create Poll
      </button>
      )}
        {isModalOpen && (
        <CreatePollModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          setPolls={setPolls}
        />
      )}
      <PollList
        polls={polls}
        userVote={userVote}
        setUserVote={setUserVote}
        getPollsWithVoteCounts={getPollsWithVoteCounts}
        isUserAllowed={isUserAllowed}
        user={user}
      />
    </div>
  );
}

export default RightPanel;
