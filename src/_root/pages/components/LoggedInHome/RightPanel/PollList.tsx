import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Poll } from './types';
import { collection, doc, updateDoc, increment, deleteDoc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface PollListProps {
  polls: Poll[];
  userVote: { [key: string]: number | null };
  setUserVote: (vote: any) => void;
  getPollsWithVoteCounts: () => void;
  isUserAllowed: boolean;
  user: any;
}

export const PollList: React.FC<PollListProps> = ({
  polls,
  userVote,
  setUserVote,
  getPollsWithVoteCounts,
  isUserAllowed,
  user,
}) => {
  const [isVoting, setIsVoting] = useState<{ [key: string]: boolean }>({}); // Track voting status
  const [isConfirmDelete, setIsConfirmDelete] = useState<string | null>(null);
  const [userVotesFromDB, setUserVotesFromDB] = useState<{ [pollId: string]: number | null }>({});

  // Fetch user votes once on mount or user change
  useEffect(() => {
    const fetchUserVotes = async () => {
      if (!user) return;
      const userVotes: { [pollId: string]: number | null } = {};

      // For each poll, check if the user has voted
      for (const poll of polls) {
        for (let i = 0; i < poll.options.length; i++) {
          const votedCollectionRef = collection(db, 'polls', poll.id, `voted${i}`);
          const querySnapshot = await getDocs(votedCollectionRef);
          const hasVoted = querySnapshot.docs.some((doc) => doc.id === user.uid);

          if (hasVoted) {
            userVotes[poll.id] = i;
            break; // User can only vote for one option per poll
          }
        }
      }

      setUserVotesFromDB(userVotes); // Store user votes in state
    };

    fetchUserVotes();
  }, [polls, user]);

  // Memoize poll data for better performance
  const pollsWithVotes = useMemo(() => {
    return polls.map((poll) => {
      const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
      const optionsWithPercentages = poll.options.map((option) => ({
        ...option,
        percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0, // Round to whole number
      }));
      return { ...poll, totalVotes, options: optionsWithPercentages };
    });
  }, [polls]);
  

  // Efficient updateVote logic
  const updateVote = useCallback(async (pollRef: any, optionIndex: number, incrementValue: number) => {
    const optionRef = doc(pollRef, 'options', `${optionIndex}`);
    await updateDoc(optionRef, { votes: increment(incrementValue) });

    const votedCollectionRef = collection(pollRef, `voted${optionIndex}`);
    const userVoteRef = doc(votedCollectionRef, user.uid);

    if (incrementValue === 1) {
      await setDoc(userVoteRef, { userId: user.uid }); // Add user vote if it's a new vote
    } else {
      await deleteDoc(userVoteRef); // Remove user vote if it's a cancellation
    }
  }, [user]);

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!user) return alert('Please log in to vote!');
    if (isVoting[pollId]) return; // Prevent double voting

    setIsVoting((prev) => ({ ...prev, [pollId]: true })); // Lock voting for this poll

    const pollRef = doc(db, 'polls', pollId);
    const previousVoteIndex = userVotesFromDB[pollId]; // Get previous vote from DB state

    try {
      // If the user voted on a different option previously, remove their old vote
      if (previousVoteIndex !== null && previousVoteIndex !== undefined && previousVoteIndex !== optionIndex) {
        await updateVote(pollRef, previousVoteIndex, -1); // Remove previous vote
      }

      // If the user is voting for the same option again, remove their vote
      const newVoteCount = previousVoteIndex === optionIndex ? -1 : 1;
      await updateVote(pollRef, optionIndex, newVoteCount); // Update the new vote count

      // Update the userVote state to reflect the new vote
      setUserVote((prevVotes: { [key: string]: number | null }) => ({
        ...prevVotes,
        [pollId]: previousVoteIndex === optionIndex ? null : optionIndex, // Remove vote if same option is selected again
      }));

      await getPollsWithVoteCounts(); // Refresh poll data
    } finally {
      setIsVoting((prev) => ({ ...prev, [pollId]: false })); // Unlock voting after database is updated
    }
  };

  // Handle poll deletion
  const handleDeletePoll = async (pollId: string) => {
    const pollRef = doc(db, 'polls', pollId);
    await deleteDoc(pollRef);
    setIsConfirmDelete(null);
    getPollsWithVoteCounts();
    window.location.reload(); // Reload the page to reflect the deletion
  };

  return (
    <div className="flex-col space-y-4">
      {pollsWithVotes.map((poll) => (
        <div key={poll.id} className="w-72 bg-home-divider flex flex-col items-center space-y-4">
          <div className="w-68 border border-slate-200 rounded-lg bg-white pt-1 pl-5 pr-5 pb-3">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1 mb-4 mt-2">
                <p className="text-sm">Question from</p>
                <p className="font-bold text-sm">Ricefield</p>
              </div>
              {isUserAllowed && (
                <button onClick={() => setIsConfirmDelete(poll.id)} className="text-2xl">
                  x
                </button>
              )}
              {isConfirmDelete === poll.id && (
                <div className="absolute top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <p>Are you sure you want to delete this poll?</p>
                    <div className="flex justify-around mt-4">
                      <button
                        onClick={() => handleDeletePoll(poll.id)}
                        className="bg-rose-500 text-white py-1 px-4 rounded"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setIsConfirmDelete(null)}
                        className="bg-gray-300 py-1 px-4 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xl font-bold leading-5">{poll.question}</p>

            <div className="w-full mt-4 flex-col space-y-1">
              {poll.options.map((option, index) => {
                const isSelected = userVotesFromDB[poll.id] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleVote(poll.id, index)}
                    className={`w-full mb-2 text-left rounded-full overflow-hidden border ${isSelected ? 'ring ring-primary-500' : ''}`}
                    style={{
                      background: `linear-gradient(to right, #FFD700 ${option.percentage}%, #ffffff ${option.percentage}%)`,
                    }}
                    disabled={isVoting[poll.id]} // Disable button while voting
                  >
                    <div className="flex justify-between items-center px-4 py-2">
                      <span className="text-base text-black font-semibold"
                      style={{
                        maxWidth: '75%',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                      >{option.option}</span>
                      <span className="text-sm text-black flex justify-center items-center">{option.percentage}%</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* <div className="text-sm text-gray-600">
              Total Votes: <span className="font-medium">{poll.totalVotes}</span>
            </div> */}
          </div>
        </div>
      ))}
    </div>
  );
};
